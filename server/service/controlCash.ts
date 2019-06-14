/****
 * TODO: 必要的信息输出
 */
import * as fs from 'fs';
import { pathConfig } from '../../config'
import { getlistCashCount, getlistCashAll, getlistCashIdBeforeDate, delListCashFromId } from '../model/PixivListStorageOperation';
import { parse, join } from 'path';
import { fromatDate } from '../utils/tool';

const cashPath = pathConfig.cashPath;

/**
 * 从文件系统获整体信息
 *
 * @param {*} {
 *     needState = ['count', 'totalSize', 'firstCreat']
 * }
 * @returns
 */
function getPreViewState({
    needState = ['count', 'totalSize', 'firstCreat']
}) {
    let stateMethodMap = {
        'count': ({
            fileList = [],
            result,
        }) => {
            result.count = fileList.length;
        },
        'totalSize': ({
            result
        }) => {
            function getSize({ size = 0 }, result) {
                if (typeof size === 'number') {
                    result.totalSize += size;
                }

            }
            result.totalSize = 0;
            handleList.push(getSize);
        },
        'firstCreat': ({
            result
        }) => {
            function checkCreatTime({
                ctimeMs = 0
            }, result) {
                if (ctimeMs < result.firstCreat) {
                    result.firstCreat = ctimeMs;
                }
            }
            result.firstCreat = Infinity;
            handleList.push(checkCreatTime);
        }
    }
    let { fileList, handleListFun } = fileListHandle();
    let result = {};
    let handleList = [];
    needState.forEach((key) => {
        stateMethodMap[key]({
            fileList,
            result,
        });
    })
    if (handleList.length !== 0) {
        result = handleListFun({
            result,
            handleList
        });
    }
    return result;
}
/**
 * 从数据库获得总数
 *
 * @returns
 */
async function getCountFromSqlite() {
    let count = 0;
    let res = await getlistCashCount();
    if (res.retState == 1 && res.result.count) {
        count = res.result.count;
    }
    return {
        totalCount: count
    }
}

/**
 * 创建需要被删除的缓存文件信息
 * @param {*} {
 *     beforeTime = -Infinity,
 *     checkUse = false,
 * }
 * @returns
 */
async function makeViewDelList({
    beforeTime = -Infinity,
    checkUse = false,
}) {
    let { fileList, handleListFun } = fileListHandle();
    let result: any = {
        count: fileList.length,
        delList: []
    };

    function makeDelList({
        ctimeMs = 0,
        path,
    }, result) {
        if (ctimeMs < beforeTime) {
            result.delList.push(path)
        }
    }
    var handleList = [makeDelList]
    result = handleListFun({
        result,
        handleList
    });
    //检查是否被缓存数据引用
    if (checkUse === true) {
        let redisResult = {
            allCashItem: []
        }
        let res = await getlistCashAll();
        if (res.retState == 1) {
            res.result.forEach(element => {
                let item = JSON.parse(element.resJson);
                redisResult.allCashItem = redisResult.allCashItem.concat(item.contents);
            });
        }

        let delList = result.delList;
        let imgMap = {};
        redisResult.allCashItem.forEach((item) => {
            let state = parse(item.url);
            let needImg = state.base;
            imgMap[needImg] = true
        })
        delList = delList.filter((imgPath) => {
            let state = parse(imgPath);
            let hasImg = state.base;
            return !imgMap[hasImg]
        });
        result.delList = delList;
    }
    return result

}

/**
 *  创建需要被删除的数据库中的列表项
 *
 * @param {*} {
 *     beforeTime = -Infinity
 * }
 * @returns
 */
async function makeDelListFromSqlite({
    beforeTime = -Infinity
}) {
    let result = {
        delList: [],
        delCount: 0
    }
    let date = fromatDate(beforeTime)
    let res = await getlistCashIdBeforeDate(date);
    if (res.retState == 1) {
        result.delCount = res.result.length;
        result.delList = res.result;
    }
    return result
}

/**
 * 读取所有缓存文件信息
 *
 * @returns
 */
function fileListHandle() {
    //FIXME: 确保通过相对路径读取文件
    let fileList = fs.readdirSync(cashPath, {
        encoding: 'utf8'
    });

    return {
        fileList: fileList,
        handleListFun: ({
            result = {},
            handleList = [] }) => {
            fileList.forEach((fileName) => {
                //同上

                let path = join(cashPath, fileName);
                let fileState: any = fs.statSync(path);
                fileState.path = path;
                handleList.forEach((handleFun) => {
                    handleFun(fileState, result);
                });
            });
            return result;
        }
    }
}
async function delViewForlist(delList) {
    delList.forEach((imgPath) => {
        fs.unlinkSync(imgPath);
    })

}
/**
 * 
 * 从数据库中删除
 * @param {*} delList
 */
async function delListFromSqlite(delList) {
    for (let listId of delList) {
        await delListCashFromId(listId)
    }
    //TODO: sqlite 操作
}
export default {
    getPreViewState,
    getCountFromSqlite,
    makeViewDelList,
    makeDelListFromSqlite,
    delViewForlist,
    delListFromSqlite,
}