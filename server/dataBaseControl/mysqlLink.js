import * as mysql  from 'mysql';
import {mysqlConfig as mysqlInfo} from '../../config/index.js';


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
var mainObj={
	mysqlPool:null,
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
			return mainObj.init();
		}
		return mainObj.mysqlPool
	},
	getSqlStringMethod:function(){
		let method = {
			format:mysql.format,
			escape:mysql.escape,
		}
		return method;
	}
}



module.exports = mainObj;