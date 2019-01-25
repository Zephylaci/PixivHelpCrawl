import { fork, ChildProcess } from "child_process";
import { join } from "path";
import { loggerShow, loggerErr, logger } from "../../utils/logger";
import { getProcessOptType } from "../../type/processHandle";

const itemPrivateMethod = {
    crateProcess: (processAddr, processHandleItem: processHandleItemClass) => {
        let Process = fork(join(__dirname, processAddr), [], {
            silent: true
        });
        Process.once('exit', (code, signal) => {
            loggerShow.info(`${processHandleItem.COMMON.processName}: pid:${Process.pid} 断开, Code: ${code} Signal ${signal}`);
            processHandleItem.COMMON.state = 'close';
            processHandleItem.COMMON.Porcess = null;
        })
        loggerShow.info(`${processHandleItem.COMMON.processName}: pid:${Process.pid} 创建`);
        processHandleItem.COMMON.Porcess = Process;
        return Process;
    },
    overHandle: (typeItem: string, processHandleItem: processHandleItemClass) => {
        let me = processHandleItem;
        let typeMethod = {
            'wait': () => {
                if (me.COMMON.timer) {
                    clearTimeout(me.COMMON.timer);
                    me.COMMON.timer = null;
                }
            },
            'set': () => {
                if (me.COMMON.timer === null) {
                    me.COMMON.timer = setTimeout(() => {
                        clearTimeout(me.COMMON.timer);
                        me.COMMON.timer = null;
                        me.close();
                    }, me.COMMON.waitTime)
                }
            }
        }
        typeMethod[typeItem]();
    },
    dealWait: (processHandleItem: processHandleItemClass) => {
        let waitIten = processHandleItem.COMMON.waitList.shift();
        itemPrivateMethod.dealPromise({
            processHandleItem: processHandleItem,
            resolve: waitIten.resolve,
            reject: waitIten.reject,
            message: waitIten.message
        })
    },
    dealPromise: <messageType>({
        processHandleItem,
        resolve,
        reject,
        message
    }: {
        processHandleItem: processHandleItemClass;
        resolve: Function;
        reject: Function;
        message: messageType;
    }) => {
        let Process = processHandleItem.COMMON.Porcess;

        if (!Process) {
            Process = itemPrivateMethod.crateProcess(processHandleItem.COMMON.processAddr, processHandleItem);
        }
        processHandleItem.COMMON.state = 'work'
        Process.send(message);
        let errorCalback = (err) => {
            loggerErr.error(err);
            reject(err);
            processHandleItem.COMMON.state = 'faile'
            processHandleItem.close();
        }
        Process.once('message', (res) => {
            resolve(res);
            Process.off('error', errorCalback);
            if (processHandleItem.COMMON.waitList.length !== 0) {
                itemPrivateMethod.dealWait(processHandleItem);
            } else {
                processHandleItem.COMMON.state = 'wait'
                itemPrivateMethod.overHandle('set', processHandleItem);
            }

        });
        Process.once('error', errorCalback)
    }
}

export class processHandleItemClass {
    COMMON: {
        Porcess: ChildProcess;
        processAddr: string;
        processName: string;
        state: string;
        waitList: Array<any>;
        waitTime: number;
        timer: any;
    }
    constructor({
        processAddr,
        processName,
        waitTime,
    }:getProcessOptType) {

        this.COMMON = {
            Porcess: null,
            processAddr,
            processName,
            state: 'wait',
            waitList: [],
            waitTime,
            timer: null
        }
    }
    /**
     * @param message 要发给子进程处理的参数
     */
    send<messageType>(message: messageType) {
        let me = this;
        itemPrivateMethod.overHandle('set', me);
        let COMMON = this.COMMON;
        let resolve, reject;
        let promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        let state = COMMON.state
        if (state === 'wait') {

            itemPrivateMethod.dealPromise({
                processHandleItem: me,
                resolve,
                reject,
                message
            });
        } else if (state === 'work') {
            let waitIten = {
                resolve,
                reject,
                message
            }
            COMMON.waitList.push(waitIten);
        } else {
            itemPrivateMethod.crateProcess(COMMON.processAddr, me);
            itemPrivateMethod.dealPromise({
                processHandleItem: me,
                resolve,
                reject,
                message
            });
        }

        return promise
    }

    close() {
        let me = this;
        let { state, Porcess, processName } = me.COMMON;
        if (state !== 'work' && Porcess) {
            loggerShow.info(`${processName}: 即将断开`);
            me.COMMON.state = 'disconnect';
            itemPrivateMethod.overHandle('wait',me);
            Porcess.disconnect();
        }
    }
}