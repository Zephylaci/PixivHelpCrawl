//SELECT ANY_VALUE(id),imgDescribe,origin,path from imgStorage group by path,origin,imgDescribe;
const sqlCtl = require('../mysqlControl.js')
	limit = 'LIMIT 5,5';
 var sqlBase = `SELECT ANY_VALUE(id),ANY_VALUE(imgDescribe),origin,path from imgStorage group by path,origin ${limit}`
/*
 var sqlOpt={
	type:'sqlString',
	sql:sqlBase
}*/
 		var sqlOpt = {
			type:'search',
			getValue:'count(1)',
			tableName:'imgStorage'
		}
sqlCtl.contrl(sqlOpt).then((res)=>{
	console.log(res)
});