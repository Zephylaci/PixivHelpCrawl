import { queryBean } from "../type/bean/resultBean";
import { getInsertOpt, getSqlite, getFindOpt, getDelOpt } from "../dataBaseControl/sqliteControl";
import { loggerErr } from "../utils/logger";
import { insertListType, getListType } from "../type";



export async function insertListCash(insertListOpt: insertListType) {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();

    let insertOpt = getInsertOpt({
        tableName: 'pixiv_listStorage',
        range: insertListOpt
    });
    await sqlLiteClient.run(insertOpt)
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('insertListCash error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });

    return queryResult
}
export async function getListCash(getListOpt: getListType) {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();

    let getOpt = getFindOpt({
        tableName: 'pixiv_listStorage',
        range: getListOpt,
        getValue: ['result']
    });
    await sqlLiteClient.get(getOpt)
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('insertListCash error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });

    return queryResult
}
export async function delListCashFromId(listId: number) {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();

    let getOpt = getDelOpt({
        tableName: 'pixiv_listStorage',
        range: {
            listId
        },
    });
    await sqlLiteClient.run(getOpt)
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('insertListCash error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });

    return queryResult
}
//TODO: 生成sql的方法封装起来

export async function getlistCashCount() {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();

    await sqlLiteClient.get('SELECT count(1) AS count FROM pixiv_listStorage')
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('insertListCash error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });

    return queryResult;
}


export async function getlistCashAll() {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();

    await sqlLiteClient.all('SELECT result AS resJson FROM pixiv_listStorage')
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('insertListCash error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });

    return queryResult;
}

export async function getlistCashIdBeforeDate(date: string) {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();

    await sqlLiteClient.all(`SELECT listId FROM pixiv_listStorage WHERE listFromDate < '${date}'`)
        .then((resBean: queryBean) => {
            resBean.result = resBean.result.map(item => {
                return item.listId
            })
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('insertListCash error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });

    return queryResult;
}