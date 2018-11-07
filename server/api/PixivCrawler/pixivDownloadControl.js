
const servicePath = '../../';
const manPath = '../../../';
const requireMehod = require(servicePath + 'router/refPath.js');

const getPixivImgOriginal = require(servicePath+'service/getPixivImgOriginal.js');


function resetCommon() {
    mainObj.common.runStat = false;
    mainObj.common.over = false;
    mainObj.common.dataList = [];
    mainObj.common.runNum = 0;
    mainObj.common.limitRunNum = 5;

}

var mainObj = {
    common: {
        runStat: false,
        over: false,
        dataList: [],
        waitList: [],
        runNum: 0,
        limitRunNum: 5
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
                mainObj.common.dataList = data;
                ctx.body.content = '本次云端下载已开始'
                controlStep();
            } else {
                ctx.body.content = '云端已就绪'
            }
        } else {
            if (common.over === true) {
                resetCommon();
                if (data.length != 0) {
                    common.runStat = true;
                    common.dataList = data;
                    ctx.body.content = '上次提交云端已下载完成，且本次下载已开始';
                    controlStep();
                } else {
                    ctx.body.content = '上次提交云端已下载完成，下次可以提交新的数据下载';
                }

            } else {
                if (data.length != 0) {
                    var data = JSON.parse(ctx.request.body.downList);
                    common.waitList.push(data);
                    ctx.body.content = '云端下载中，且已将本次提交添加至队列';
                    // controlStep();
                } else {
                    ctx.body.content = '云端下载中'
                }
            }
        }
    }
}

function controlStep() {
    var common = mainObj.common;
    getPixivImgOriginal.downList(common.dataList).then((res)=>{
        console.log('over',res);
        common.runStat = false;
    });


}
module.exports = mainObj;