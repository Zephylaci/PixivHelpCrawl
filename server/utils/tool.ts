import { loggerErr } from './logger';
/****
 * 传入一个class劫持其new方法，生成一个单例类
 */

export const singleClassHelp = function <T>(needSingleClass: T): T {
    let instance;
    let handler = {
        construct(target, args) {
            if (!instance) {
                instance = new (<any>needSingleClass)(...args);
            }
            return instance;
        }
    };
    return new Proxy(needSingleClass, handler);
};

export const formatDate = function (time, format = 'YYYY-MM-DD') {
    let date = new Date(time);
    var args = {
        'M+': date.getMonth() + 1,
        'D+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
        S: date.getMilliseconds()
    };
    if (/(Y+)/.test(format))
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var i in args) {
        var n = args[i];
        if (new RegExp('(' + i + ')').test(format))
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ? n : ('00' + n).substr(('' + n).length)
            );
    }
    return format;
};

const sortKey = {
    // 升序 (从低到高)
    ascend: 'ASC',
    // 降序（从高到低）
    descend: 'DESC'
};

export function parseSorter(sort: Array<{ field; order }>) {
    return sort
        .map(({ field, order }) => {
            if (field && order && sortKey[order]) {
                return [field, sortKey[order]];
            }
            return null;
        })
        .filter(item => item);
}

/**
 * 缓存队列，避免并发问题
 *      排队添加，避免重复添加
 *      获取正在排队的数据
 *
 * 自定义队列名称
 * 自定义队列缓存规则
 * 函数包装即用
 */

/** 可以限制并发和重复的 */
export const StackHandler = {
    Storage: {},
    warpQuery: <T>(fn: Function & T, { key, name = undefined, limit = 1, makeCashKey = null }) => {
        if (!StackHandler.Storage[key]) {
            StackHandler.Storage[key] = {
                stack: [],
                running: [],
                id: 0
            };
        }
        const targetFn = (...args) => {
            return new Promise(resolve => {
                const StorageItem = StackHandler.Storage[key];
                const item = {
                    params: args,
                    id: null,
                    running: null,
                    resolves: [resolve]
                };
                if (typeof makeCashKey === 'function') {
                    item.id = makeCashKey(...args);
                } else {
                    item.id = ++StorageItem.id;
                }
                function callback() {
                    const StorageItem = StackHandler.Storage[key];
                    StorageItem.running = StorageItem.running.filter(
                        queryItem => queryItem.running != null
                    );
                    while (StorageItem.stack.length !== 0 && StorageItem.running.length < limit) {
                        const queryItem = StorageItem.stack.shift();
                        const { params } = queryItem;
                        StorageItem.running.push(queryItem);
                        queryItem.running = fn(...params)
                            .then(_res => {
                                queryItem.running = null;
                                queryItem.resolves.forEach(_resolve => {
                                    _resolve(_res);
                                });
                                callback();
                                return _res;
                            })
                            .catch(error => {
                                // 避免卡死
                                loggerErr.error('StackHandler Error', name || key, error);
                                queryItem.resolves.forEach(_resolve => {
                                    _resolve(null);
                                });
                            })
                            .finally(() => {
                                queryItem.running = null;
                                callback();
                            });
                    }
                }

                let cashItem = StorageItem.stack.find(({ id }) => id === item.id);
                if (!cashItem) {
                    cashItem = StorageItem.running.find(({ id }) => id === item.id);
                    if (cashItem && cashItem.running === null) {
                        cashItem = null;
                    }
                }

                if (!cashItem) {
                    StorageItem.stack.push(item);
                } else {
                    cashItem.resolves.push(...item.resolves);
                    loggerErr.warn('StackHandler filter:', name || key, item);
                }

                if (StorageItem.stack.length !== 0 && StorageItem.running.length < limit) {
                    callback();
                }
            });
        };
        return (targetFn as unknown) as T;
    }
};

/** 只限制重复的 */
// TODO: catch 参照上面的
export const LockHandler = {
    Storage: {},
    warpQuery: (fn, { key, makeCashKey = null }) => {
        if (!StackHandler.Storage[key]) {
            StackHandler.Storage[key] = {
                stack: new Map(),
                id: 0
            };
        }
        return (...args) => {
            return new Promise(resolve => {
                const StorageItem = StackHandler.Storage[key];
                const item = {
                    params: args,
                    running: null,
                    id: null,
                    resolves: [resolve]
                };
                if (typeof makeCashKey === 'function') {
                    item.id = makeCashKey(...args);
                } else {
                    item.id = ++StorageItem.id;
                }

                const cashItem = StorageItem.stack.get(item.id);
                if (!cashItem) {
                    item.running = fn(...args).then(res => {
                        StorageItem.stack.delete(item.id);
                        item.resolves.forEach(resolveItem => {
                            resolveItem(res);
                        });
                        return res;
                    });
                    StorageItem.stack.set(item.id, item);
                } else {
                    cashItem.resolves.push(...item.resolves);
                    loggerErr.warn('StackHandler filter:', key, item.id || item);
                }
            });
        };
    }
};

export function retryWarp<T>(
    fn: T & Function,
    {
        retryLimit = 3,
        retryLog = (fn, error) => {
            loggerErr.warn('retryWarp :', fn, error);
        },
        baseWait = 3000,
        before = null,
        onlyBeforeInRetry = false
    } = {}
) {
    return (((...args) => {
        let retryNum = 0;
        return new Promise(async (resolve, reject) => {
            function catchCallback(error) {
                if (typeof retryLog === 'function') {
                    retryLog(fn, error);
                }
                if (retryNum < retryLimit) {
                    let realWait = baseWait * retryNum;
                    setTimeout(async () => {
                        if (typeof before === 'function') {
                            await before(...args);
                        }
                        fn(...args)
                            .then(resolve)
                            .catch(catchCallback);
                    }, ((Math.random() * baseWait) | 0) + realWait);
                    retryNum++;
                } else {
                    loggerErr.error('retryWarp :', fn, error);
                    reject();
                }
            }
            if (onlyBeforeInRetry === false && typeof before === 'function') {
                await before(...args);
            }
            fn(...args)
                .then(resolve)
                .catch(catchCallback);
        });
    }) as unknown) as T;
}

/**
 * Test
 */
// async function queryTest(i) {
//     await new Promise(res => {
//         setTimeout(res, Math.random() * 2000);
//     });
//     return i;
// }
// const queryTest2 = StackHandler.warpQuery(queryTest, {
//     key: 'queryTest',
//     limit: 3,
//     makeCashKey: i => i
// });
// const queryTest2 = LockHandler.warpQuery(queryTest, { key: 'queryTest', makeCashKey: i => i });
// let promise = [];
// for (let i = 0; i < 10; i++) {
//     promise.push(
//         queryTest2(i).then(res => {
//             console.log('check:', i, res);
//         })
//     );
// }
// promise.push(
//     queryTest2(1).then(res => {
//         console.log('check 2:', 1, res);
//     })
// );

// promise.push(
//     queryTest2(2).then(res => {
//         console.log('check 2:', 2, res);
//     })
// );

// Promise.all(promise).then(res => {
//     queryTest2(2).then(res => {
//         console.log('check 3:', 2, res);
//     });
// });
