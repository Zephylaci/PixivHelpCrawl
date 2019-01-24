/* 针对同时多次处理 的抽象
*  提供，依赖child_process和不依赖的两种实现方式
*  TODO 提供超时处理
*/
import {logger,loggerErr,loggerShow} from '../../utils/logger';
import { fork } from 'child_process';

interface concurrentCommonInter {
    runStat:string;
    promise:any;
    linkList:Array<any>;
    waitList:Array<any>;
    processList:Array<any>;
    idNum:number;
    runNum:number;
    limitRunNum:number;
    mainResult:Array<any>;
    queryOver?:Function;
}
    
/**
 *  queryName   输出用的名字
 *  step        单步操作通常为async函数
 *  processPath  fork的地址和step至少存在一个
 */ 
interface concurrentPrivateInter {
    queryName: string;
    step?:Function;
    processPath?:string;
}


export class concurrentHandleClass {
    common:concurrentCommonInter
    DEFALUT:concurrentCommonInter
    privateAttr:concurrentPrivateInter
    /*
     *  同时初始化
     *  TODO:各种回调
     *  以及更具参数来决定是否使用child_process
     *  研究下能不能不写单独的文件来fork 子进程
     */
    /**
     * 创建一个多任务控制对象
     * @param privateAttr 
     * @param limitRunNum 
     */
    constructor(privateAttr:concurrentPrivateInter,limitRunNum = 5) {
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
        this.privateAttr = privateAttr
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
            queryOver:null

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
            loggerShow.info(queryObj.privateAttr.queryName, '运行开始');
            logger.info(queryObj.privateAttr.queryName, '输入: ',listArr.length);
            queryObj.controlStep();

        } else {
            throw queryObj.privateAttr.queryName, '错误的开始时机';
        }
        return queryObj;
    }

    queryAddToWaitList(listArr) {
        let queryObj = this;
        let common = queryObj.common;
        common.waitList = common.waitList.concat(listArr);
        loggerShow.info(queryObj.privateAttr.queryName, ':添加等待队列:', listArr.length);
    }
    /**
     *  获得当前类的promise对象
     */
    //TODO 直接接收回调来做处理
    overControl(opt:{
        success?:Function;
        error?:Function;
    }={}) {
        let queryObj = this;
        let common = queryObj.common;
        if (common.runStat === 'queryIng') {
            if (common.promise === null) {
                var promise = new Promise((resolve, reject) => {
                    common.queryOver = (mainResult) => {
                        //后处理
                        logger.info(queryObj.privateAttr.queryName, '输出: ',mainResult.length);
                        resolve(mainResult);
                    };
                });
                common.promise = promise
            }
            let {success,error} = opt
            if(typeof success ==='function'){
                common.promise.then(success)
            }
            if(typeof error ==='function'){
                common.promise.catch(error);
            }else{
                common.promise.catch((err)=>{
                    loggerErr.error(err);
                });
            }

            return common.promise
        }
        throw 'concurrent 错误的调用'
        
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
                queryObj.oneStep();
            }

        }

        if (common.linkList.length != 0 && common.limitRunNum != 0) {
            while (common.runNum < common.limitRunNum) {
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
        //loggerShow.info(queryObj.privateAttr.queryName, '：队列中:', common.linkList.length, '运行中:', common.runNum, '限制数:', common.limitRunNum);
    }
    /**
     *  单次操作
     */
    oneStep() {
        
        let queryObj = this;
        let common = queryObj.common;

        common.runNum++;

        var queryItem = common.linkList.shift();
        var id = common.idNum

        var queryChild = queryObj.makeprocess(id);
        var opt = {
            queryItem: queryItem,
            tid: id,
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
 * 如果step是个地址，则fork一个进程
 * 如果只是对象则挂在自己身上运行
 * process fork 出的进程
 * */
class Process {
    id:string
    queryObj:concurrentHandleClass
    send: Function
    process?:any
    constructor(id, queryObj) {
        this.id = id;
        this.queryObj = queryObj

        let privateAttr = queryObj.privateAttr;
        if (typeof privateAttr.step === 'function') {
            this.send = async function(sendOpt:{
                queryItem:any;
                tid:number;
            }){
                
                let {queryItem,tid} = sendOpt;
                //loggerShow.info(`sim process: 任务开始！ tid:${tid}`);
                let _queryChild:Process = this;
                let queryObj = _queryChild.queryObj;
                let privateAttr = queryObj.privateAttr;

                let stepRsult = await privateAttr.step(queryItem);
                //loggerShow.info(`sim process: 任务结束！ tid:${tid}`);
                _queryChild.queryOver(stepRsult);
            }
        }else{
            try{
                let process = fork(privateAttr.processPath,[],{
                   silent:true
                });
                process.on('message',this.queryOver.bind(this));
                process.on('close',(code,signal)=>{
                    loggerShow.info(`process : id:${id} 收到关闭信号 ${code},${signal}`);
                });
                process.on('exit',(code,signal)=>{
                    loggerShow.info(`process : id:${id} 已经关闭 ${code},${signal}`);
                });
                this.send = function(sendOpt:{
                    queryItem:any;
                    tid:number;
                }){
                    let {queryItem,tid} = sendOpt;
                    //loggerShow.info(`process: 任务设置！ tid:${tid}`);
                    let _queryChild:Process = this;
                    _queryChild.process.send(queryItem);
                } 
                this.process = process;

            }catch(err){
                loggerErr.error(`concurrentHandle : 错误的创建！${err}`);
                this.send = this.queryOver;
            }
        }
        loggerShow.info(queryObj.privateAttr.queryName, 'process:', this.id, '创建');
    }
    queryOver( queryResult = null) {
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
        if(this.process){
            this.process.disconnect();
        }
        loggerShow.info(queryObj.privateAttr.queryName, 'process:', this.id, '将断开');
        
    }
}

