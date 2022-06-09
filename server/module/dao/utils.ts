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
    warpQuery: (fn, { key, makeCashKey = null }) => {
        if (!StackHandler[key]) {
            StackHandler[key] = {
                stack: [],
                running: null,
                id: 0
            };
        }
        return (...args) => {
            return new Promise(resolve => {
                const item = {
                    params: args,
                    id: null,
                    resolves: [resolve]
                };
                if (typeof makeCashKey === 'function') {
                    item.id = makeCashKey(...args);
                } else {
                    item.id = ++StackHandler[key].id;
                }
                function callback(res) {
                    if (StackHandler[key].stack.length === 0) {
                        StackHandler[key].running = null;
                    } else {
                        const queryItem = StackHandler[key].stack.shift();
                        const { params } = queryItem;
                        StackHandler[key].running = queryItem;
                        fn(...params).then(_res => {
                            queryItem.resolves.forEach(_resolve => {
                                _resolve(_res);
                            });
                            callback(res);
                            return res;
                        });
                    }
                    return res;
                }
                const cashItem = StackHandler[key].stack.find(({ id }) => id === item.id);
                if (!cashItem) {
                    if (StackHandler[key].running && StackHandler[key].running.id === item.id) {
                        StackHandler[key].resolves.push(...item.resolves);
                        loggerErr.warn('StackHandler filter:', key, item);
                    } else {
                        StackHandler[key].stack.push(item);
                    }
                } else {
                    cashItem.resolves.push(...item.resolves);
                    loggerErr.warn('StackHandler filter:', key, item);
                }

                if (StackHandler[key].running === null) {
                    callback({ id: 0 });
                }
            });
        };
    }
};

export const LockHandler = {
    Storage: {},
    warpQuery: (fn, { key, makeCashKey = null }) => {
        if (!StackHandler[key]) {
            StackHandler[key] = {
                stack: new Map(),
                id: 0
            };
        }
        return (...args) => {
            return new Promise(resolve => {
                const item = {
                    params: args,
                    running: null,
                    id: null,
                    resolves: [resolve]
                };
                if (typeof makeCashKey === 'function') {
                    item.id = makeCashKey(...args);
                } else {
                    item.id = ++StackHandler[key].id;
                }

                const cashItem = StackHandler[key].stack.get(item.id);
                if (!cashItem) {
                    item.running = fn(...args).then(res => {
                        StackHandler[key].stack.delete(item.id);
                        item.resolves.forEach(resolveItem => {
                            resolveItem(res);
                        });
                        return res;
                    });
                    StackHandler[key].stack.set(item.id, item);
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
// const queryTest2 = StackHandler.warpQuery(queryTest, { key: 'queryTest', makeCashKey: i => i });
// const queryTest2 = LockHandler.warpQuery(queryTest, { key: 'queryTest', makeCashKey: i => i });
// let promise = [];
// for (let i = 0; i < 5; i++) {
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
