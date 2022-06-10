import { loggerErr } from '../../utils/logger';
import { getDbControl } from './index';

export async function makeImageParamsFromRule({ queryParams, rule }) {
    const ctx = await getDbControl();
    const Tags = ctx.model('Tags');
    const Author = ctx.model('Author');

    let result = queryParams;
    if (rule.imageAttr) {
        result = {
            ...queryParams,
            ...rule.imageAttr
        };
    }
    if (rule.tagAttr || rule.authorAttr) {
        result.include = [];
        if (rule.tagAttr) {
            result.include.push({
                model: Tags,
                through: { attributes: [] },
                as: 'tags',
                ...rule.tagAttr
            });
        }
        if (rule.authorAttr) {
            result.include.push({
                model: Author,
                as: 'author',
                ...rule.authorAttr
            });
        }
    }

    return result;
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

export const StackHandler = {
    Storage: {},
    warpQuery: (fn, { key, name = undefined, limit = 1, makeCashKey = null }) => {
        if (!StackHandler.Storage[key]) {
            StackHandler.Storage[key] = {
                stack: [],
                running: [],
                id: 0
            };
        }
        return (...args) => {
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
                    if (StorageItem.stack.length !== 0 && StorageItem.running.length < limit) {
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

                if (StorageItem.running.length === 0) {
                    callback();
                }
            });
        };
    }
};

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

export function retryWarp(fn, { retryLimit = 3 } = {}) {
    return (...args) => {
        let retryNum = 0;
        return new Promise((resolve, reject) => {
            function catchCallback(error) {
                loggerErr.warn('retryWarp :', fn, error);
                if (retryNum < retryLimit) {
                    setTimeout(() => {
                        fn(...args)
                            .then(resolve)
                            .catch(catchCallback);
                    }, Math.random() * 5000 + 3000);
                } else {
                    loggerErr.error('retryWarp :', fn, error);
                    reject();
                }
            }
            fn(...args)
                .then(resolve)
                .catch(catchCallback);
        });
    };
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
