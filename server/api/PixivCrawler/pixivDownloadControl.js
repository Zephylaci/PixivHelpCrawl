
const servicePath = '../../';

const getPixivImgOriginal = require(servicePath + 'service/getPixivImgOriginal.js');



var mainObj = {
    common: {
        runStat: false,
    },
    contrl: async (ctx, next) => {
        ctx.body = {
            code: 200,
            content: '为啥没有返回值..'
        }
        //这里可以重构
        var common = mainObj.common;
        console.log(ctx.request.body);
        var data = JSON.parse(ctx.request.body.downList);
        if (common.runStat === false) {
            if (data.length != 0) {
                common.runStat = true;
                ctx.body.content = '本次云端下载已开始'
                queryStart(data);
            } else {
                ctx.body.content = '云端已就绪'
            }
        } else {
            if (data.length != 0) {
                getPixivImgOriginal.addList(data);
                ctx.body.content = '云端下载中，且已将本次提交添加至队列';
            } else {
                ctx.body.content = '云端下载中'
            }
        }
    }
}


function queryStart(queryList) {
    getPixivImgOriginal.downList(queryList).then((res) => {
        mainObj.common.runStat = false;
    });
}

module.exports = mainObj;