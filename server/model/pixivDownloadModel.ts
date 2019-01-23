
import {mysqlConfig as mysqlInfo } from '../../config/index';
import { requireMehod } from "../router/refPath";
import { makeSqlString, mySqlPoolOrder } from './mysqlControl';

const parsePath = requireMehod('parsePath');

let {logger,loggerShow} = require('../utils/logger')
async function downImgInsertSql(downResult:{
    fileName: string;
    illustTitle: string;
    imgPath: string;
    userName: string;
    userId: string;
    tags:any,
} = {
    fileName: '',
    illustTitle: '',
    imgPath: '',
    userName: '',
    userId: '',
    tags: {},
}, imgOriginFrom) {
    if (!mysqlInfo.useMysql) {
        loggerShow.warn('不使用mysql');
        return;
    }
    let imgName = downResult.fileName;
    if (await judgeIsExist(imgName)) {
        loggerShow.info(`getPixivData: ${imgName} 数据库中已存在信息,不重复写入`);
        return;
    }
    let imgId = Date.now();
    let imgTitle = downResult.illustTitle;

    let imgOrigin = imgOriginFrom || 'PiGetPixiv';
    let imgTruePath = parsePath.join(__dirname + '../../.' + downResult.imgPath);
    let imgPath = '/download' + imgName;
    let authorName = downResult.userName;
    //图片本身信息
    let imgInsertSqlOpt = {
        tableName: 'imgStorage',
        insertOpt: {
            imgId: imgId,
            imgTitle: imgTitle,
            imgName: imgName,
            imgOrigin: imgOrigin,
            imgTruePath: imgTruePath,
            imgPath: imgPath
        }
    }

    
    let sqlList = [];
    let insertImgSql = makeSqlString.getInsertSqlString(imgInsertSqlOpt);
    sqlList.push(insertImgSql);
    //图片相关tag信息
    let tagsArr = downResult.tags.tags;
    let length = tagsArr.length <= 4 ? tagsArr.length : 4;
    for (let i = 0; i < length; i++) {
        let targItem = tagsArr[i];
        let tagInsertSqlOpt = {
            tableName: 'pixivTages',
            insertOpt: {
                tagName: targItem.tag,
                romaji: targItem.romaji,
                imgTitle: imgTitle,
                authorName: authorName,
                authorId: downResult.userId,
                imgName: imgName,
                tagTrans:''
            }
        }
        if (typeof targItem.translation != "undefined") {
            tagInsertSqlOpt.insertOpt.tagTrans = JSON.stringify(targItem.translation)
        }
        let inserTagSql = makeSqlString.getInsertSqlString(tagInsertSqlOpt);
        sqlList.push(inserTagSql)
    }

    await mySqlPoolOrder(sqlList)
        .then((res) => {
            logger.info('pixivDownloadModel: ',imgName, '相关信息数据库写入完成');
        });

}
//根据 imgId 查找相对路径
async function searchPath(imgId) {
    if (!mysqlInfo.useMysql) {
        loggerShow.warn('不使用mysql');
        return false;
    }
    let searchSqlOpt = {
        getValue: ['imgPath','imgOrigin'],
        tableName: 'imgStorage',
        key: `imgName like "%${imgId}%"`
    }
    let result = false;
    let judgeImgExistSql = makeSqlString.getSearchSqlString(searchSqlOpt);

    await mySqlPoolOrder(judgeImgExistSql).then((res:any) => {
        if (res.length !== 0) {
            result = res;
        }
    });
    return result

}
//根据imgName查找数据库中是否存在
async function judgeIsExist(imgName) {

    let searchSqlOpt = {
        getValue: ['imgId'],
        tableName: 'imgStorage',
        key: { imgName: imgName }
    }
    let isExist = false;
    let judgeImgExistSql = makeSqlString.getSearchSqlString(searchSqlOpt);
    await mySqlPoolOrder(judgeImgExistSql).then((res:any) => {
        if (res.length !== 0) {
            isExist = true;
        }
    });
    return isExist

}
export let pixivDownloadModel = {
    downImgInsertSql,
    searchPath,
    closePool:mySqlPoolOrder.closePool
}
