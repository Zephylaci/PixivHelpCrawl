
const servicePath = '../';
const manPath = '../../';
const mysqlInfo = require('../../config/index.js')['mysqlConfig'];

const requireMehod = require(servicePath + 'router/refPath.js');

const parsePath = requireMehod('parsePath');
const mySqlCtl = requireMehod('mySqlCtl');

async function downImgInsertSql(downResult) {
    if(!mysqlInfo.useMysql){
        console.log('No Use Mysql');
        return
    }
    let imgName = downResult.fileName;
    if (await judgeIsExist(imgName)) {
        console.log(`getPixivData : ${imgName} 数据库中已存在信息,不重复写入`);
        return;
    }
    let imgId = Date.now();
    let imgTitle = downResult.illustTitle;

    let imgOrigin = 'PiGetPixiv';
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

    const getSqlString = mySqlCtl.makeSqlString;
    let sqlList = [];
    let insertImgSql = getSqlString.getInsertSqlString(imgInsertSqlOpt);
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
                imgName: imgName

            }
        }
        if (typeof targItem.translation != "undefined") {
            tagInsertSqlOpt.insertOpt.tagTrans = JSON.stringify(targItem.translation)
        }
        let inserTagSql = getSqlString.getInsertSqlString(tagInsertSqlOpt);
        sqlList.push(inserTagSql)
    }

    mySqlCtl.order(sqlList)
        .then((res) => {
            console.log(imgName, '相关信息数据库写入完成');
        });

}
async function judgeIsExist(imgName) {

    let searchSqlOpt = {
        getValue: ['imgId'],
        tableName: 'imgStorage',
        key: { imgName: imgName }
    }
    let isExist = false;
    let judgeImgExistSql = mySqlCtl.makeSqlString.getSearchSqlString(searchSqlOpt);
    await mySqlCtl.order(judgeImgExistSql).then((res) => {
        if (res.length !== 0) {
            isExist = true;
        }
    });
    return isExist

}
module.exports = {
    downImgInsertSql: downImgInsertSql
}