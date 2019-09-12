import { getSqlite, getInsertOpt, getFindOpt } from "../dataBaseControl/sqliteControl";
import { queryBean } from "../type/bean/resultBean";
import { loggerErr } from "../utils/logger";




export async function addFilterTag(tagName: string) {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();

    let insertOpt = getInsertOpt({
        tableName: 'pixiv_TagsfilterList',
        range: {
            tagName,
        }
    });
    await sqlLiteClient.run(insertOpt)
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('addFilterTag error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });

    return queryResult
}

export async function getFilterList() {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();
    let getOpt = getFindOpt({
        tableName: 'pixiv_TagsfilterList',
        range: false,
        getValue: ['tagname']
    });
    await sqlLiteClient.all(getOpt)
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