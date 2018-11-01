
const mysqlPoolCtl = require('../dataBaseControl/mysqlLink.js');
const sqlStringTool = mysqlPoolCtl.getSqlStringMethod();
let mysqlPool = null;

function order(sql) {
    if (mysqlPool === null) {
        mysqlPool = mysqlPoolCtl.getMysqlPool();
    }

    let promise = new Promise((resolve, reject) => {
        let runList = [];
        if (Array.isArray(sql)) {
            runList = sql
        } else {
            runList.push(sql);
        }
        mysqlPool.getConnection(function (err, connection) {
            if (err) {
                console.log('mySql Err:Pool getConnection Error;')
                console.log(err);
                reject('sql Err');
                return;
            }
            // 使用返回的链接
            var resultList = [];
            queryHandle(connection);
            function queryHandle(connection) {
                var sqlString = runList.shift();
                connection.query(sqlString, function (error, results, fields) {
                    if (error) {
                        console.log('mySql Err:Pool query Error;')
                        console.log(error);
                        reject('sql Err');
                        return;
                    }
                    resultList.push(results);

                    if (runList.length > 0) {
                        queryHandle(connection);
                    } else {
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
}

let makeSqlString = {
    getSearchSqlString: (opt) => {
        var sql = 'SELECT ?? FROM ?? ';
        var keySqlStr = '';
        inserts = [opt.getValue, opt.tableName];
        if (typeof opt.getValue === 'string') {
            sql = `SELECT ${opt.getValue} FROM ??`;
            inserts = [opt.tableName]
        }
        if (typeof opt.key === 'object') {
            sql = sql + 'WHERE ?';
            keySqlStr = makeSqlString.objToSqlString(opt.key);
            inserts.push(keySqlStr);
        } else if (typeof opt.key === 'string') {
            sql = 'SELECT ?? FROM ?? WHERE ' + opt.key;
        }

        sql = sqlStringTool.format(sql, inserts);
        return sql;
    },
    getInsertSqlString: (opt) => {
        var sql = 'INSERT INTO ??(??) VALUE (?)';
        var keyArr = [];
        var valueArr = [];
        var insertOpt = opt.insertOpt;
        for (key in insertOpt) {
            keyArr.push(key);
            valueArr.push(insertOpt[key]);
        }
        var inserts = [opt.tableName, keyArr, valueArr];
        sql = sqlStringTool.format(sql, inserts);
        return sql;
    },
    getUpDataSqlString: (opt) => {
        var sql = 'UPDATE ?? SET ? WHERE ?';
        var keySqlStr = makeSqlString.objToSqlString(opt.key);
        var valueSqlStr = makeSqlString.objToSqlString(opt.value);
        var inserts = [opt.tableName, valueSqlStr, keySqlStr];
        return sql = sqlStringTool.format(sql, inserts);
    },
    objToSqlString: (obj) => {
        return {
            toSqlString: function () {
                return sqlStringTool.escape(this._insertObj)
            },
            _insertObj: obj
        }
    },
    formatSqlString: sqlStringTool.format
}


module.exports = {
    order: order,
    makeSqlString: makeSqlString
}