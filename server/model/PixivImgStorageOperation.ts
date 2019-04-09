import { queryBean } from "../type/bean/resultBean";
import { getInsertOpt, getSqlite, getFindOpt, getDelOpt } from "../dataBaseControl/sqliteControl";
import { loggerErr } from "../utils/logger";
import { insertImgOptType, getImgOptType } from "../type";

export async function insertImgStorage(insertImgOpt:insertImgOptType) {
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();

    let insertOpt = getInsertOpt({
        tableName: 'pixiv_imgStorage',
        range: insertImgOpt
    });
    await sqlLiteClient.run(insertOpt)
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('insertImgStorage error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });

    return queryResult
}

export async function getImgDetail({
    getImgOpt,
    getValue= ['imgId','imgTitle','imgName','imgTags']
}:{
    getImgOpt:getImgOptType
    getValue?:Array<string>
}){
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();
    let getOpt = getFindOpt({
        tableName: 'pixiv_imgStorage',
        range: getImgOpt,
        getValue: getValue
    });
    await sqlLiteClient.get(getOpt)
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('getImgDetail error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });
    return queryResult
}

export async function delImgDetail(delImgOpt){
    let sqlLiteClient = await getSqlite();
    let queryResult = new queryBean();
    let delOpt = getDelOpt({
        tableName: 'pixiv_imgStorage',
        range: delImgOpt
    });
    await sqlLiteClient.run(delOpt)
        .then((resBean: queryBean) => {
            queryResult = resBean;
        })
        .catch((err) => {
            loggerErr.error('delImgDetail error:', err);
            queryResult.retState = -1;
            queryResult.errMsg = err;
        });
    return queryResult
}

