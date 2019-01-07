/* 针对同时多次处理 的抽象
*  提供，依赖child_process和不依赖的两种实现方式
*/
let {logger,loggerErr,loggerShow} = require('../../utils/logger');

class concurrentHandleClass {
    constructor(limitRunNum = 5) {
        this.common = {
            runStat: 'before',
            promise: null,
            linkList: [],
            waitList: [],
            processList: [], //线程池
            idNum: 0, //方便输出的Id
            runNum: 0,
            limitRunNum: limitRunNum,
            mainResult: [],
        }
        this.DEFALUT = {
            runStat: 'before',
            promise: null,
            linkList: [], //需要查询的
            waitList: [], //后续添加需要查询 
            processList: [], //线程池
            idNum: 0, //方便输出的Id
            runNum: 0, //当前正在运行的数量
            limitRunNum: limitRunNum, //限制运行的数量
            mainResult: [], //所有的返回结果

        }
    }
    /**
     *  初始化
     *  TODO:各种回调
     *  以及更具参数来决定是否使用child_process
     */
    queryInit({
        queryName = 'query',
        step = null, //单次操作 通常是async函数，返回需要的结果值
        stepOver = null, //单次操作结束 TODO
        allStepOver = null, //所有操作结束 TODO

        useChildProcess = false //默认不使用child_process方法 TODO
    }) {
        let queryObj = this;
        //独有属性
        queryObj.privateAttr = {
            queryName: queryName,
            step: step,
            stepOver: stepOver,
            allStepOver: allStepOver
        }
    }
    /**
     *  列表任务开始
     */
    queryStart(listArr) {
        let queryObj = this;
        let common = queryObj.common;
        if (common.runStat === 'before') {
            common.runStat = 'queryIng'
            common.linkList = listArr
            loggerShow.info(queryObj.privateAttr.queryName, '查询开始');
            //日志函数传递
            queryObj.loggerShow = loggerShow;
            queryObj.controlStep();

        } else {
            throw queryObj.privateAttr.queryName, '错误的开始时机';
        }
    }

    queryAddToWaitList(listArr) {
        let queryObj = this;
        let common = queryObj.common;
        common.waitList = common.waitList.concat(listArr);
        loggerShow.info(queryObj.privateAttr.queryName, ':添加等待队列:', listArr);
    }
    /**
     *  获得当前类的promise对象
     */
    overControl() {
        let queryObj = this;
        let common = queryObj.common;
        if (common.runStat) {
            if (common.promise === null) {
                var promise = new Promise((resolve, reject) => {
                    common.queryOver = (mainResult) => {
                        //后处理
                        logger.info(queryObj.privateAttr.queryName, '结果:');
                        logger.info(mainResult);
                        resolve(mainResult);
                    };
                });
                common.promise = promise
                return promise;
            }
            return common.promise
        }
        return common.runStat;
    }
    showState() {
        let queryObj = this;
        let common = queryObj.common;
        loggerShow.info(common)
        return JSON.stringify(common)
    }
    /**
     *  重置整个query对象的状态为初始
     */
    resetCommon() {
        //这里需要换一个深拷贝实现
        var defalut = JSON.stringify(this.DEFALUT);
        this.common = JSON.parse(defalut);
    }
    /**
     *  执行控制
     */
    controlStep() {
        let queryObj = this;
        let common = queryObj.common;
        let linkList = common.linkList;

        if (linkList.length < common.limitRunNum) {
            common.limitRunNum = linkList.length;
            if (linkList.length > 0) {
                common.runNum++;
                queryObj.oneStep();
            }

        }

        if (common.linkList.length != 0 && common.limitRunNum != 0) {
            while (common.runNum < common.limitRunNum) {
                common.runNum++;
                queryObj.oneStep();
            }
        } else {
            if (common.runNum === 0) {
                if (linkList.length === 0) {
                    let processList = common.processList;
                    if (processList.length !== 0) {
                        var length = common.processList.length;
                        for (var i = 0; i < length; i++) {
                            var childProcess = processList.shift();
                            childProcess.disconnect();
                        }
                    }
                    if (common.waitList.length !== 0) {
                        common.linkList = common.waitList;
                        common.waitList = [];
                        common.limitRunNum = queryObj.DEFALUT.limitRunNum;
                        queryObj.controlStep();
                        return
                    }
                    //如果运行了控制函数，默认的返回
                    if (typeof common.queryOver === 'function') {
                        common.queryOver(common.mainResult);
                    }
                    loggerShow.info(queryObj.privateAttr.queryName, ' 运行结束');
                    queryObj.resetCommon();
                }
            }
        }
        loggerShow.info(queryObj.privateAttr.queryName, '：队列中:', common.linkList.length, '运行中:', common.runNum, '限制数:', common.limitRunNum);
    }
    /**
     *  单次操作
     */
    oneStep() {
        let queryObj = this;
        let common = queryObj.common;
        var queryItem = common.linkList.shift();
        var id = common.idNum

        var queryChild = queryObj.makeprocess(id);
        var opt = {
            queryItem: queryItem,
            id: id,
        }
        queryChild.send(opt);

        common.idNum++
    }
    /**
     *  创建子执行对象
     *   TODO 基于child_process的执行对象
     */
    makeprocess(id) {
        let queryObj = this;
        let common = queryObj.common;
        let processList = common.processList

        if (processList.length === 0) {
            let queryChild = new Process(id, queryObj);

            return queryChild;
        } else {
            return processList.shift();
        }
    }
}

/**
 * 模拟线程
 * */
class Process {
    constructor(id, queryObj) {
        this.id = id;
        this.queryObj = queryObj
    }
    async send({
        queryItem = {},
        id = -1,
    }) {
        let _queryChild = this;
        let queryObj = this.queryObj;
        let privateAttr = queryObj.privateAttr;
        if (typeof privateAttr.step === 'function') {
            let stepRsult = await privateAttr.step(queryItem);

            _queryChild.queryOver({
                id: id,
                queryResult: stepRsult
            });
        }

    }
    queryOver({
        id = -1,
        queryResult = null
    }) {
        let queryObj = this.queryObj;
        let common = queryObj.common;
        let processList = common.processList;
        common.mainResult.push(queryResult)
        common.runNum--;
        if (common.linkList.length === 0 && common.runNum === 0) {
            this.disconnect();
        } else {
            if (processList.length > common.limitRunNum) {
                this.disconnect();
            } else {
                processList.push(this);
            }
        }
        queryObj.controlStep();
    }
    disconnect() {
        let queryObj = this.queryObj;
        loggerShow.info(queryObj.privateAttr.queryName, 'process:', this.id, 'will disconnect');
        delete this.queryObj
    }
}
module.exports = concurrentHandleClass
