//TODO 这里和getPixivImgOrigin几乎一样，可以抽象
//当前因为是简单的拉过来的，变量命名上可能不太合乎语义

const getPixivData = require('./getPixivData.js');


//模拟线程
class Process {
    constructor(id, downLoadObj) {
        this.id = id;
        this.downLoadObj = downLoadObj
    }
    send({
        imgId = '',
        id = -1,
    }) {
        let queryUrl = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${imgId}`;
        let _downChild = this;
        let getMonomers = new getPixivData.MonomersClass();
        getMonomers.contrl(queryUrl).then((res) => {
            let downUrl = res.urls.original;
            _downChild.queryOver({
                id: id,
                imgId: imgId,
                url: downUrl,
            });
        }).catch((err) => {
            console.log(err)
        });
    }
    queryOver(parames) {
        console.log('getPixivImgOrigin:内部Id：', parames.id, 'imgId:', parames.imgId, 'url:', parames.url, '下载结束');
        let downLoadObj = this.downLoadObj;
        let common = downLoadObj.common;
        let processList = common.processList;
        common.downRes.push(parames)
        common.runNum--;
        if (common.linkList.length === 0 && common.runNum === 0) {
            //downChild.disconnect();
        } else {
            if (processList.length > common.limitRunNum) {
                //downChild.disconnect();
            } else {
                processList.push(this);
            }
        }
        downLoadObj.controlStep();
    }
    disconnect(){
        console.log('process:',this.id,'will disconnect');
        delete this.downLoadObj
    }
}




class getPixivImgOriginal {
    constructor(limitRunNum = 5) {
        this.common = {
            runStat: false,
            promise: null,
            linkList: [],
            waitList: [],
            processList: [], //线程池
            idNum: 0, //方便输出的Id
            runNum: 0,
            limitRunNum: limitRunNum,
            downRes: [],
            downOver: null
        }
        this.DEFALUT = {
            runStat: false,
            promise: null,
            linkList: [], //需要查询的
            waitList: [], //后续添加需要查询
            processList: [], //线程池
            idNum: 0, //方便输出的Id
            runNum: 0, //当前正在运行的数量
            limitRunNum: limitRunNum, //限制运行的数量
            downRes: [], //缓存所有下载完后的返回值
            downOver: null //下载完成执行,如果存在
        }
    }
    downList(listArr) {
        let downLoadObj = this;
        let common = downLoadObj.common;
        if (common.runStat === false) {
            common.runStat = true
            common.linkList = listArr
            downLoadObj.controlStep();
            console.log('getPixivImgOrigin:查询开始')
        } else {
            common.waitList = common.waitList.concat(listArr);
            console.log('getPixivImgOrigin:添加等待队列:', listArr)
        }
    }
    overControl() {
        let downLoadObj = this;
        let common = downLoadObj.common;
        if (common.runStat) {
            if (common.promise === null) {
                var promise = new Promise((resolve, reject) => {
                    common.downOver = (downRes) => {
                        //后处理
                        console.log(JSON.stringify(downRes));
                        resolve(downRes);
                    };
                });
                return promise;
            }
            return common.promise
        }
        return true;
    }
    showState() {
        let downLoadObj = this;
        let common = downLoadObj.common;
        console.log(common)
        return JSON.stringify(common)
    }
    resetCommon() {
        //这里需要换一个深拷贝实现
        var defalut = JSON.stringify(this.DEFALUT);
        this.common = JSON.parse(defalut);
    }

    controlStep() {
        let downLoadObj = this;
        let common = downLoadObj.common;
        let linkList = common.linkList;


        if (linkList.length < common.limitRunNum) {
            common.limitRunNum = linkList.length;
            if (linkList.length > 0) {
                common.runNum++;
                downLoadObj.oneStep();
            }

        }

        if (common.linkList.length != 0 && common.limitRunNum != 0) {
            while (common.runNum < common.limitRunNum) {
                common.runNum++;
                downLoadObj.oneStep();
            }
        } else {
            if (common.runNum === 0) {
                if (linkList.length === 0) {
                    console.log('getPixivImgOrigin:当前列表处理完毕！');
                    //这里检查 waitList是否为空，不为空则重启继续
                    //暂时放放

                    let processList = common.processList;
                    if (processList.length !== 0) {
                        var length = common.processList.length;
                        for (var i = 0; i < length; i++) {
                            var childProcess = processList.shift();
                            childProcess.disconnect();
                            console.log('autoCash:释放 childe_process');
                        }
                    }
                    if (typeof common.downOver === 'function') {
                        common.downOver(common.downRes);
                    }
                    downLoadObj.resetCommon()

                }
            }
        }
        console.log('getPixivImgOrigin 下载对象：队列中：', common.linkList.length, '运行中:', common.runNum, '限制数：', common.limitRunNum);

    }

    oneStep() {
        let downLoadObj = this;
        let common = downLoadObj.common;
        var item = common.linkList.shift();
        var id = common.idNum

        console.log('getPixivImgOrigin:内部Id：', id, 'item:', item, '下载开始');

        var downChild = new Process(id, downLoadObj);


        var opt = {
            imgId: item.illust_id,
            id: id,
        }
        downChild.send(opt);

        common.idNum++
    }

    makeprocess(id) {
        let downLoadObj = this;
        let common = downLoadObj.common;
        let processList = common.processList

        if (processList.length === 0) {
            let downChild = new Process(id, downLoadObj);

            return downChild;
        } else {
            return processList.shift();
        }
    }
}
module.exports = getPixivImgOriginal
// function childFun(parames) {
//     let imgId = parames.imgId;

//     let queryUrl = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${imgId}`;

//     getPixivData.contrl(queryUrl)
//         .then((res) => {
//             tryGet = 1;

//             parames.resultData = res;
//             let downUrl = res.urls.original;
//             if (downUrl) {
//                 downloadImg(downUrl).then((dres) => {
//                     parames.resultData.fileName = dres.fileName;
//                     parames.resultData.imgPath = dres.imgPath;
//                     process.send(parames);
//                 })
//             }

//         }).catch((err) => {
//             console.log('downChild：进入重试流程，等待时间，', wait / 1000, 's');
//             if (tryGet < 5) {
//                 console.log(parames, err);
//                 setTimeout(() => {
//                     childFun(parames)
//                 }, wait)
//                 tryGet++
//                 wait += wait;
//             } else {
//                 tryGet = 1;

//                 parames.downState = 'faill';
//                 process.send(parames);
//             }

//         });
// }