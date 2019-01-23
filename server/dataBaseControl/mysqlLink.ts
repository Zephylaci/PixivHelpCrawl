import * as mysql  from 'mysql';
import {mysqlConfig as mysqlInfo} from '../../config/index';
import { loggerErr } from '../utils/logger';


/*
acquireTimeout:The milliseconds before a timeout occurs during the connection acquisition. This is slightly different from connectTimeout, because acquiring a pool connection does not always involve making a connection. (Default: 10000)
*/
var poolConfig={
	connectionLimit:30,
	host:mysqlInfo.host,
	user:mysqlInfo.user,
    port:mysqlInfo.port,
	password:mysqlInfo.password,
	database:mysqlInfo.database,
	acquireTimeout:mysqlInfo.connectTimeout
}
/*
contrl:
	opt{
		type:'search',
		getValue:'',
		tableName:'',
		key:{uid:1}
	}
*/

const mainObj={
	mysqlPool:null,
	active:false,
	over:false,
	init:()=>{
		var mysqlPool = mysql.createPool(poolConfig)
		mysqlPool.on('acquire', function (connection) {
			//console.log('mySqlMain msg:Connection %d acquired', connection.threadId);
		});
		mysqlPool.on('connection', function (connection) {
		   // console.log('mySqlMain msg:new connection');
		});
		mysqlPool.on('enqueue', function () {
			//console.log('mySqlMain msg:Waiting for available connection slot');
		});
		mysqlPool.on('release', function (connection) {
			//console.log('mySqlMain msg:Connection %d released', connection.threadId);
		});
		mainObj.mysqlPool  = mysqlPool;
		return mysqlPool
	},
	getMysqlPool:function(){
		if(mainObj.mysqlPool===null){
			mainObj.mysqlPool = mainObj.init();
			/**
			 *  对原始方法进行改造，使其可以被安全的关闭
			 */
			mainObj.mysqlPool._getConnection = mainObj.mysqlPool.getConnection
			mainObj.mysqlPool.getConnection = (stepFun)=>{
				mainObj.active=true;
				mainObj.mysqlPool._getConnection((err,connection)=>{
					if(!connection._release){
						connection._release = connection.release;
						connection.release = ()=>{
							connection._release();
							mainObj.active = false;
							if(mainObj.over){
								mainObj.closePool();
							}
						}
					}
					stepFun(err,connection)
				})
			}
		}
		return mainObj.mysqlPool
	},
	getSqlStringMethod:function(){
		let method = {
			format:mysql.format,
			escape:mysql.escape,
		}
		return method;
	},
	closePool:function(){
		if(mainObj.mysqlPool!==null&&!mainObj.active){
			mainObj.mysqlPool.end((err)=>{
				if(err){
					loggerErr.error('pool :end Error',err);
					return 
				}
				mainObj.mysqlPool = null
			});

		}else{
			mainObj.over = true;
		}
	}
}


export default mainObj;