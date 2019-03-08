

/**
 *  进程管理
 */

import { getProcessOptType } from "../type/processHandle";
import { processHandleItemClass } from "../service/class/processHandleItem";
import { logger, loggerErr } from "./logger";


const processStorage = new Map();


/**
 * 创建一个进程管理对象
 */
export function createProcessItem({
    processName,
    processAddr,
    waitTime = 120000
}: getProcessOptType) {
    let processHandleItem = new processHandleItemClass({
        processAddr,
        processName,
        waitTime,
    })
    return processHandleItem;
}

export function getProcessItem({
    processName,
    processAddr,
    waitTime = 120000,
}: getProcessOptType) {
    let processHandleItem: processHandleItemClass = processStorage.get(processName);
    try {
        if (!processHandleItem) {
            processHandleItem = createProcessItem({
                processAddr,
                processName,
                waitTime,
            })
            processStorage.set(processName, processHandleItem);
        }

    } catch (e) {
        loggerErr.error('processHandle:创建失败！');
        loggerErr.error(e);
        
        return null;
    }

    return processHandleItem;
}

