import * as sqlite3 from 'sqlite3';
import { logger, loggerErr, loggerShow } from '../utils/logger'
import { sqlHandleCommonType, sqliteOptType } from '../type';
import { queryBean } from '../type/bean/resultBean';
import { cashConfig } from '../../config';
const dataBaseAddr = cashConfig.dbAddress;
sqlite3.verbose();

const keepLink = {
    timer: null,
    wait: 120000,
    waitStart: function (client: sqlHandle) {
        if (keepLink.timer === null) {
            keepLink.timer = setTimeout(client.close.bind(client), keepLink.wait);
        }
    },
    waitStop: function () {
        if (keepLink.timer !== null) {
            clearTimeout(keepLink.timer);
            keepLink.timer = null;
        }
    }
}

export class sqlHandle {
    common: sqlHandleCommonType;
    prepare:Function;
    constructor() {
        this.common = {
            db: null,
            state: 'before'
        }
    }
    conection() {
        let common = this.common;
        let self = this;
        let linkEnd,linkErr;
        let promise = new Promise((resolve, reject) => {
            linkEnd = resolve;
            linkErr = reject;
        })
        if( common.state==='conection'&&common.db.open){
            keepLink.waitStart(this);
            linkEnd(true);
            return promise
        }
        if( common.state==='linking'){
            return common.db
        }
        
        common.state = 'linking';
        common.db = promise;
        let dbClient = new sqlite3.Database(dataBaseAddr, (err) => {
            if (err) {
                loggerErr.error('sqlite: 数据库初始化失败！');
                common.state = 'fail';
                linkErr(err);
                return
            }
            common.state = 'conection'
            common.db = dbClient;
            self.prepare = common.db.prepare
            loggerShow.info('sqlite open');

            keepLink.waitStart(this);
            linkEnd(true);
        });
        return promise
    }
    //对原本的api进行包装的函数
    private packPromise(opt: {
        method: string;
        args: any;
    }) {
        keepLink.waitStop();
        let { db, state } = this.common;
        let { args, method } = opt;
        let promise = new Promise((resolve, reject) => {
            if (state === 'conection') {
                let resultBean = new queryBean();
                db[method](...args, (err, result) => {
                    
                    if (err) {
                        keepLink.waitStart(this);
                        resultBean.retState = -1;
                        resultBean.errMsg = err;
                        resolve(resultBean);
                        loggerErr.error(`sqlite ${method}: 执行失败！, ${args[0]} ${err}`);
                        return;
                    }

                    resultBean.retState = 1;
                    if (!result) {
                        result = false;
                    }
                    resultBean.result = result;
                    
                    keepLink.waitStart(this);
                    resolve(resultBean);
                });
            } else {
                reject(false)
            }
        })
        return promise
    }
    query(sqlStr: string) {
        return this.packPromise({
            method: 'exec',
            args: [sqlStr]
        });
    }
    run(sqlLiteOpt: sqliteOptType | string) {
        let { sqlString, range } = handlesqlLiteOpt(sqlLiteOpt);
        return this.packPromise({
            method: 'run',
            args: [sqlString, range]
        });
    }
    all(sqlLiteOpt: sqliteOptType | string) {
        let { sqlString, range } = handlesqlLiteOpt(sqlLiteOpt);
        return this.packPromise({
            method: 'all',
            args: [sqlString, range]
        });
    }
    get(sqlLiteOpt: sqliteOptType | string) {
        let { sqlString, range } = handlesqlLiteOpt(sqlLiteOpt);
        return this.packPromise({
            method: 'get',
            args: [sqlString, range]
        });
    }
    close() {
        let common = this.common;
        let promise = new Promise((resolve, reject) => {
            if (common.state === 'conection') {
                common.db.close((err) => {
                    if (err) {
                        loggerErr.error(`sqlite close: 失败！${err}`);
                        common.state = 'unknow'
                        reject(err);
                        return
                    }
                    common.state = 'close';
                    loggerShow.info('sqlite close');
                    resolve(true)
                })
            }
        })
        return promise;
    }
}
// 对传入参数的统一处理
function handlesqlLiteOpt(sqlLiteOpt: sqliteOptType | string) {
    var sqlString: string, range: any = {};
    if (typeof sqlLiteOpt !== 'string') {
        var { sqlString, range } = sqlLiteOpt;
    } else {
        sqlString = sqlLiteOpt;
    }
    return {
        sqlString,
        range
    }
}


export default sqlHandle;

