
const cp = require('child_process');


class makeDownLoadObj {
    constructor({ path = 'client/cash', limitRunNum = 5 }) {
        this.common = {
            runStat: false,
            promise: null,
            linkList: [],
            waitList: [],
            processList: [], //线程池
            idNum: 0, //方便输出的Id
            runNum: 0,
            path: path,
            limitRunNum: limitRunNum,
            downRes: [],
            downOver: null
        }
        this.DEFALUT = {
            runStat: false,
            promise: null,
            linkList: [], //需要下载的
            waitList: [], //后续添加需要下载的 TODO
            processList: [], //线程池
            idNum: 0, //方便输出的imgId
            runNum: 0, //当前正在运行的数量
            path: path,//下载保存到的路径
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
            console.log('downloadThread:下载开始')
        } else {
            common.waitList = common.waitList.concat(listArr);
            console.log('downloadThread:添加等待队列:', listArr)
        }
    }
    overControl() {
        let downLoadObj = this;
        let common = downLoadObj.common;
        if (common.runStat) {
            if (common.promise === null) {
                var promise = new Promise((resolve, reject) => {
                    common.downOver = resolve;
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
                    console.log('downloadThread:当前列表下载完毕！');
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
        console.log('downloadThread 下载对象：队列中：', common.linkList.length, '运行中:', common.runNum, '限制数：', common.limitRunNum);

    }

    oneStep() {
        let downLoadObj = this;
        let common = downLoadObj.common;
        var url = common.linkList.shift();
        var id = common.idNum

        console.log('downloadThread:内部Id：', id, 'url:', url, '下载开始');

        var downChild = downLoadObj.makeprocess(id);


        var opt = {
            url: url,
            id: id,
            path: common.path
        }
        downChild.send(opt);
        common.idNum++
    }
    makeprocess(id) {
        let downLoadObj = this;
        let common = downLoadObj.common;
        let processList = common.processList
        if (processList.length === 0) {
            var downChild = cp.fork('./server/service/process/downloadChild.js', {
                silent:true
            });

            downChild.on('message', (parames) => {
                console.log('downloadThread:内部Id：', parames.id, 'url:', parames.url, '下载结束');

                common.downRes.push(parames)
                common.runNum--;
                if (common.linkList.length === 0 && common.runNum === 0) {
                    downChild.disconnect();
                } else {
                    if (processList.length > common.limitRunNum) {
                        downChild.disconnect();
                    } else {
                        processList.push(downChild);
                    }
                }
                downLoadObj.controlStep();
            });
            downChild.on('close', (code) => {
                console.log('downloadThread:', 'downChild子进程close，剩余空闲process:', processList.length);
            });

            downChild.on('disconnect', () => {
                console.log('downloadThread:', 'downChild子进程disconnect，剩余空闲process:', processList.length);
            });
            return downChild;
        } else {
            return processList.shift();
        }
    }
}

makeDownLoadObj.extend = {
    cashImgHandleSet:(cashImgContents=[]) => {
        let handleFun = (downRes)=>{
            var fileNameMap = {};
            var getIdReg = /\/([0-9]{8,})_/;
            downRes.map((item, index) => {
                var id = getIdReg.exec(item.fileName)[1];
                fileNameMap[id] = item.fileName
            });
            cashImgContents = cashImgContents.map((item, index) => {
                var id = item.illust_id;
                if (fileNameMap[id]) {
                    item['originUrl'] = item['url'];
                    item['url'] = '/cash' + fileNameMap[id];
                }
                return item
            });
        }
        return handleFun
    }
}

module.exports = makeDownLoadObj;