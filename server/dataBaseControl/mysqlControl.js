const mysql  = require('mysql');
const mysqlInfo = require('../../config/index.js')['mysqlConfig'];
/*Todo 通过事件在长时间没有链接的时候释放线程池*/
const events = require('events');
var emitter = new events.EventEmitter();

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
	getSet:{
		search:(opt)=>{
			var sql = 'SELECT ?? FROM ?? ';
			var keySqlStr = '';
			inserts = [opt.getValue,opt.tableName];
			if(typeof opt.getValue==='string'){
				sql = `SELECT ${opt.getValue} FROM ??`;
				inserts = [opt.tableName]
			}
			if(typeof opt.key ==='object'){
				sql =sql + 'WHERE ?';
				keySqlStr = mainObj.method.objToSqlString(opt.key);
				inserts.push(keySqlStr);
			}else if(typeof opt.key ==='string'){
				sql = 'SELECT ?? FROM ?? WHERE '+ opt.key;
			}

			sql = mysql.format(sql, inserts);
			return sql;
		},
		insert:(opt)=>{
			var sql = 'INSERT INTO ??(??) VALUE (?)';
				var keyArr=[];
				var valueArr=[];
			var insertOpt = opt.insertOpt;
			for(key in insertOpt){
				keyArr.push(key);
				valueArr.push(insertOpt[key]);
			}
			var inserts = [opt.tableName,keyArr,valueArr];
			sql = mysql.format(sql, inserts);
			return sql;
		},
		upData:(opt)=>{
			var sql = 'UPDATE ?? SET ? WHERE ?';
			var keySqlStr = mainObj.method.objToSqlString(opt.key);
			var valueSqlStr = mainObj.method.objToSqlString(opt.value);
			var inserts = [opt.tableName,valueSqlStr,keySqlStr];
			return sql = mysql.format(sql, inserts);
		},
		sqlString:(opt)=>{
			var sql = opt.sql;
			var parame = opt.parame;
			if(parame){
				sql = mysql.format(sql,parame)
			}
			return sql;
		}
	},
	contrl:(opt)=>{
		if(mainObj.mysqlPool===null){
			mainObj.init();
		}
		var promise = new Promise((resolve,reject)=>{
			var mysqlPool = mainObj.mysqlPool;
			var runList = [];
			if(Array.isArray(opt)){
				for(var i= 0;i<opt.length;i++){
					runList.push(getSqlString(opt[i]));
				}
			}else{
				runList.push(getSqlString(opt));
			}
			function getSqlString(opt){
				var type = opt.type;
				var sqlString = mainObj.getSet[type](opt);
				return sqlString;
			}
			mysqlPool.getConnection(function(err, connection) {
  				if (err){
					console.log('mySql Err:Pool getConnection Error;')
					console.log(err);
					reject('sql Err');
					return;
				}
				// 使用返回的链接
				var resultList = [];
				queryHandle(connection);
				function queryHandle(connection){
					var sqlString = runList.shift();
					connection.query(sqlString, function (error, results, fields) {
						if (error){
							console.log('mySql Err:Pool query Error;')
							console.log(error);
							reject('sql Err');
							return;
						}
						resultList.push(results);
						
						if(runList.length>0){
							queryHandle(connection);
						}else{
							connection.release();
							//全部查询完成
							var res = resultList.length == 1 ? resultList[0] : resultList;
							resolve(res);
						}
					});
				}
			});
		});
		return promise;
	},
	init:()=>{
		var mysqlPool = mysql.createPool(poolConfig)
		mysqlPool.on('acquire', function (connection) {
			console.log('mySqlMain msg:Connection %d acquired', connection.threadId);
		});
		mysqlPool.on('connection', function (connection) {
		    console.log('mySqlMain msg:new connection');
		});
		mysqlPool.on('enqueue', function () {
			console.log('mySqlMain msg:Waiting for available connection slot');
		});
		mysqlPool.on('release', function (connection) {
			console.log('mySqlMain msg:Connection %d released', connection.threadId);
		});
		mainObj.mysqlPool  = mysqlPool;
	},
	method:{
		objToSqlString:(obj)=>{
			return {
						toSqlString:function(){
							return mysql.escape(this._insertObj)
						},
						_insertObj:obj
					}
		}
	}
}


/*	var userId = {user:'zephyru'};
	userIdStr = objToSqlString(userId);
	var sql = 'select * from ?? WHERE ?';
	var inserts = ['userList',userIdStr];
	sql = mysql.format(sql, inserts);
	select *  from userList where `user` = 'zephyru';
	function objToSqlString(obj){
	return {
		toSqlString:function(){
			return mysql.escape(this._insertObj)
		},
		_insertObj:obj
	}
}

*/

module.exports = mainObj;