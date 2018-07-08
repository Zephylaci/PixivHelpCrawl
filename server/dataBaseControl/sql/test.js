const mysql  = require('mysql');
const mysqlInfo = require('../../config/index.js')['mysqlConfig'];

var connection = mysql.createConnection(mysqlInfo);

var resultBody = {};
await currency(sqlOpt).then((res)=>{
	resultBody=res;
});
function objToSqlString(obj){
	return {
		toSqlString:function(){
			return mysql.escape(this._insertObj)
		},
		_insertObj:obj
	}
}

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});
/*
 todoList todoList表
 id 唯一标示
 sort 排序，展示顺序越小越优先，同级的话按先后顺序算
 state 状态 0 创建  1完成 2不展示
 content 内容
 createTime 创建时间
 completeTime 完成时间
*/
function insert(){
	var sql = 'INSERT INTO ??(??) VALUE (?)';
	var now = new Date().getTime();
	var opt={
		sort:1,
		state:1,
		content:'test5',
		createTime:now
	}
	var keyArr=[];
	var valueArr=[];
	for(key in opt){
		keyArr.push(key);
		valueArr.push(opt[key]);
	}
	var inserts = ['todoList',keyArr,valueArr];
	sql = mysql.format(sql, inserts);
}
function deleteSql(){
	var opt={
		content:'test1'
	}
	var sql = 'delete from ?? where ?;'
	var inserts = ['todoList',objToSqlString(opt)];
	sql = mysql.format(sql, inserts);

	console.log(sql);
}
function upData(){
	var sql = 'UPDATE ?? SET ? WHERE ?';
	var now = new Date().getTime();
	var opt={
		state:2,
		completeTime:now
	}
	var key = {
		id:1
	}

	var inserts = ['todoList',objToSqlString(opt),objToSqlString(key)];
	sql = mysql.format(sql, inserts);
}
/*var sql = 'SELECT * FROM todoList'


connection.query(sql, function (error, results, fields) {
  if (error) throw error;

  console.log(results);
});
connection.end();
*/
const mySqlCtl = require('./main.js');
var sqlOpt = {
	type:'search',
	getValue:['id','sort','state','content'],
	tableName:'todoList',
	key:{state:'!2'}
}

mySqlCtl.contrl(sqlOpt).then((res)=>{
	console.log(res);
});














