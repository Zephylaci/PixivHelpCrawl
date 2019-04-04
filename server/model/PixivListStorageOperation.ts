import { queryBean } from "../type/bean/resultBean";
import { getInsertOpt, getSqlite, getFindOpt } from "../dataBaseControl/sqliteControl";
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
