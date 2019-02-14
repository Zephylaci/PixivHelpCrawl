/* 针对同时多次处理 的抽象
*  提供，依赖child_process和不依赖的两种实现方式
*  
*  TODO 提供超时处理
*/
import {logger,loggerErr,loggerShow} from '../../utils/logger';
import { fork } from 'child_process';
import { concurrentCommonInter, concurrentPrivateInter } from '../../type/concurrentHandle';
import { NoProcessStdout } from '../../../config';


/**
 * concurrentHandleClass 不向外暴露的公用方法
 */
const concurrentHandlePrivateMethod = {
    mainControl: async (queryObj: concurrentHandleClass) => {
        let common = queryObj.common;
        let method = concurrentHandlePrivateMethod;
        let stateMap = {
            nextStep: () => {
                while (common.runNum < common.limitRunNum) {
                    method.oneStep(queryObj).then(()=>{
                        method.mainControl(queryObj);
                    })
                }
            },
            nextList: () => {
                common.linkList=common.waitList;
                common.waitList = [];
                common.limitRunNum = queryObj.DEFALUT.limitRunNum;
                method.mainControl(queryObj);
            },
            taskOver: () => {
                let processList = common.processList;
                if (processList.length !== 0) {
                    var length = common.processList.length;
                    for (var i = 0; i < length; i++) {
                        var childProcess = processList.shift();
                        childProcess.disconnect();
                    }
                }
                //如果运行了控制函数，默认的返回
                if (typeof common.queryOver === 'function') {
                    common.queryOver(common.mainResult);
                }
                loggerShow.info(queryObj.privateAttr.queryName, ' 运行结束');
                method.resetCommon(queryObj);
            },
            noChange: () => {

            }
        }
        let state = method.judgeTask(common);
        stateMap[state]()
    },
    /**
     *  单次操作
     */
    oneStep:(queryObj:concurrentHandleClass)=> {
        
        let common = queryObj.common;

        common.runNum++;

        var queryItem = common.linkList.shift();
        var id = common.idNum

        var queryChild = concurrentHandlePrivateMethod.makeprocess(queryObj);
        var opt = {
            queryItem: queryItem,
            tid: id,
        }
        let stepPromise = queryChild.send(opt);
        common.idNum++
        return stepPromise
    },
    /**
     *  创建子执行对象
     */
    makeprocess:(queryObj:concurrentHandleClass)=>{
        let common = queryObj.common;
        let processList = common.processList
        if (processList.length === 0) {
            let queryChild = new Process(common.idNum, queryObj);
            return queryChild;
        } else {
            return processList.shift();
        }
    },
    /**
     * 检查任务状态
     * 返回字符串：
     *   nextStep :  开始下一个任务
     *   nextList ： 当前列表完成，但是存在等待列表
     *   taskOver ： 所有任务完成
     *   noChange :  不满足上述任何一个条件时返回
     */
    judgeTask: (common: concurrentCommonInter): string => {
        let { linkList } = common
        if (linkList.length < common.limitRunNum) {
            common.limitRunNum = linkList.length;
            if (linkList.length > 0) {
                return 'nextStep'
            }
        }
        if (common.linkList.length != 0 && common.limitRunNum != 0) {
            return 'nextStep'
        } else {
            if (common.runNum === 0 && linkList.length === 0) {

                if (common.waitList.length !== 0) {
                    return 'nextList'
                }else{
                    return 'taskOver'
                }
            }
        }

        return 'noChange'
    },
    resetCommon:(queryObj:concurrentHandleClass)=>{
        let defalut = JSON.stringify(queryObj.DEFALUT);
        queryObj.common = JSON.parse(defalut);
    }
}


export class concurrentHandleClass {
    common:concurrentCommonInter
    DEFALUT:concurrentCommonInter
    privateAttr:concurrentPrivateInter
    /**
     * 创建一个多任务控制对象
     * @param privateAttr 相关的参数
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
     *  任务开始
     */
    queryStart(listArr) {
        let queryObj = this;
        let common = queryObj.common;
        if (common.runStat === 'before') {
            common.runStat = 'queryIng'
            common.linkList = listArr
            loggerShow.info(queryObj.privateAttr.queryName, '运行开始');
            logger.info(queryObj.privateAttr.queryName, '输入: ',listArr.length);
            concurrentHandlePrivateMethod.mainControl(queryObj);

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
    /**
     *  中断
     */
    breakQuery(){
        let queryObj = this;
        let common = queryObj.common; 
        logger.info(`${queryObj.privateAttr.queryName}: 中断`)
        common.linkList=[];
        common.waitList=[]; 
    }
    showState() {
        let queryObj = this;
        let common = queryObj.common;
        loggerShow.info(common)
        return JSON.stringify(common)
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
    stepOver:Function
    process?:any
    constructor(id, queryObj) {
        this.id = id;
        this.queryObj = queryObj

        let privateAttr = queryObj.privateAttr;

        if (typeof privateAttr.step === 'function') {
            this.send = function(sendOpt:{
                queryItem:any;
                tid:number;
            }){

                let {queryItem,tid} = sendOpt;
                //loggerShow.info(`sim process: 任务开始！ tid:${tid}`);
                let _queryChild:Process = this;

                let stepPromise = new Promise((resolve,reject)=>{
                    _queryChild.stepOver=resolve;
                })
                privateAttr.step(queryItem).then((stepRsult)=>{
                    _queryChild.queryOver(stepRsult);
                });
                //loggerShow.info(`sim process: 任务结束！ tid:${tid}`);
                return stepPromise
            }
        }else{
            try{
                let process = fork(privateAttr.processPath,[],{
                   silent:NoProcessStdout
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
                    let stepPromise = new Promise((resolve,reject)=>{
                        _queryChild.stepOver=resolve;
                    })
                    _queryChild.process.send(queryItem);
                    return stepPromise
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

        this.stepOver();
    }
    disconnect() {
        let queryObj = this.queryObj;
        if(this.process){
            this.process.disconnect();
        }
        loggerShow.info(queryObj.privateAttr.queryName, 'process:', this.id, '将断开');
        
    }
}

