

/**
 *  进程管理
 */

import { getProcessOptType } from "../type/processHandle";
import { processHandleItemClass } from "../service/class/processHandleItem";


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
    if (!processHandleItem) {
        processHandleItem = createProcessItem({
            processAddr,
            processName,
            waitTime,
        })
        processStorage.set(processName, processHandleItem);
    }
    return processHandleItem;
}
