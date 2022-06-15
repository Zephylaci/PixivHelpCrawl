import { resolve } from 'path';
import { logger, loggerErr, loggerRes } from '../../utils/logger';
import { retryWarp, StackHandler } from '../../utils/tool';
import PixivApp from './PixivApp';
const pixivClient = new PixivApp({
    refreshToken: 'CDgynshlniOTugd3ZkNHCBd9mEeUuO4gvewNIX7eroc'
});

const originFetch = pixivClient.fetch.bind(pixivClient);

// 大概1分钟两百次
const LimitStorage = {
    num: 0,
    first: null,
    timer: null,
    wait: null
};
const cycle = 60 * 1000;
pixivClient.fetch = StackHandler.warpQuery(
    retryWarp(originFetch, {
        retryLimit: 4,
        baseWait: 5000,
        retryLog: function (fn, error) {
            //  接口提示速率限制就等一个周期
            if (error.response.status === 403) {
                if (LimitStorage.wait === null) {
                    loggerRes.info('limitFn: Rate Limit retry create');
                    LimitStorage.wait = new Promise(resolve => {
                        setTimeout(() => {
                            resolve(null);
                            LimitStorage.wait = null;
                            loggerRes.info('limitFn: Rate Limit retry clear');
                        }, cycle);
                    });
                }
            }
            loggerErr.warn(
                `fetch Error: ${error.config.url} - ${error.config.method} - ${JSON.stringify(
                    error.config.params
                )} ${error.response.status} - ${
                    error.response.statusText
                } \n - response data: ${JSON.stringify(error.response.data)}`
            );
            // ${error.response.status} - ${error.response.statusText} \n ${JSON.stringify(
            //     error.response.headers,
            //     null,
            //     4
            // )} \n
        },
        before: async function () {
            if (LimitStorage.timer === null) {
                LimitStorage.timer = setTimeout(() => {
                    LimitStorage.num = 0;
                    LimitStorage.timer = null;
                    LimitStorage.first = null;
                }, cycle);
                LimitStorage.num = 1;
                LimitStorage.first = new Date().getTime();
                return;
            }
            // 存在其它的limit
            if (LimitStorage.wait) {
                loggerRes.info('limitFn: Rate Limit wait');
                await LimitStorage.wait;
                const wait = ((Math.random() * 10000) | 0) + 5000;
                await new Promise(resolve => setTimeout(resolve, wait));
                return;
            }

            // 根据单位时间请求次数限制
            const nowTime = new Date().getTime();
            LimitStorage.num++;
            const diffTime = nowTime - LimitStorage.first;
            if (diffTime > 5000 && diffTime / cycle < LimitStorage.num / 140) {
                const wait = ((Math.random() * 10000) | 0) + 20000;
                loggerRes.info('limitFn: Rate Limit', diffTime, LimitStorage.num, 'wait:', wait);
                LimitStorage.wait = new Promise(resolve => setTimeout(resolve, wait));
                await LimitStorage.wait;
                LimitStorage.wait = null;
            }
        }
    }),
    {
        key: 'pixivClientFetch',
        limit: 6,
        makeCashKey: function (target, options) {
            return `${target}-${JSON.stringify(options)}`;
        }
    }
);

export default pixivClient;
