import redisCtl from '../dataBaseControl/redisLink';

let {logger,loggerErr,loggerShow} = require('../utils/logger')

function getClient() {
    return redisCtl.deal();
}

const method = {
    HMSET: (setItem) => {
        let mainKey = setItem.mainHash;
        let key = setItem.key;

        let ctl = getClient();
        if (!mainKey) {
            loggerShow.warn('redisControl: HMSET ERROR 请传入主键');
            return
        }
        var promise = new Promise((resolve, reject) => {
            ctl.exists(mainKey, function (err, replies) {
                if (err) {
                    reject();
                    loggerErr.error('redisControl: HMSET ERROR :', err);
                    redisCtl.delayQuit();
                    return 
                }
                function hmsetCallBack(err, replies) {
                    redisCtl.delayQuit();
                    if (err) {
                        reject();
                        loggerErr.error('redisControl: hmset出错:', err);
                        return;
                    }
                    logger.info('redisControl: hmset完成:', mainKey, key === mainKey ? "" : key);
                    resolve();
                   
                }
                let dataContent = setItem.data;
                if (replies === 0) {
                    if (key) {
                        dataContent[key] = JSON.stringify({
                            contents: dataContent['contents']
                        });
                        delete dataContent['contents'];
                    } else {
                        for (let indexKey in dataContent) {
                            let item = dataContent[indexKey];
                            if (typeof item === 'object') {
                                dataContent[indexKey] = JSON.stringify(dataContent[indexKey]);
                            }
                        }
                    }

                    ctl.HMSET(mainKey, dataContent, hmsetCallBack);
                } else {

                    ctl.HSET(mainKey, key, JSON.stringify(dataContent), hmsetCallBack);
                }
            });
        });

        return promise
    },
    HMGET: (getItem) => {
        let mainKey = getItem.mainKey;
        let key = getItem.key;

        let ctl = getClient();
        var promise = new Promise((resolve, reject) => {
            ctl.exists(mainKey, function (err, replies) {
                if (err) {
                    reject();
                    loggerErr.error('redisControl:HMSET ERROR :', err);
                    redisCtl.delayQuit();
                    return 
                }
                function hmsetCallBack(err, replies) {
                    redisCtl.delayQuit();
                    if (err) {
                        reject();
                        loggerErr.error('redisControl: hmget出错:', err);
                        return;
                    }
                    resolve(replies);

                    
                }
                if (replies === 1) {

                    ctl.HMGET(mainKey, key, hmsetCallBack);
                } else {
                    resolve(null)
                }


            });
        });

        return promise
    },
    HLEN:(HKEY)=>{
        let ctl = getClient();
        var promise = new Promise((resolve, reject) => {
            ctl.hlen(HKEY, function (err, replies) {
                redisCtl.delayQuit();
                if (err) {
                    resolve(0);
                    loggerErr.error('redisControl: KEYS ERROR :', err);
                    return
                }
                resolve(replies);
            });

        });

        return promise
    },
    HDEL:({
        hkey,
        keys
    })=>{
        let ctl = getClient();
        var promise = new Promise((resolve, reject) => {
            ctl.hdel(hkey,keys,function (err, replies) {
                redisCtl.delayQuit();
                if (err) {
                    resolve(0);
                    loggerErr.error('redisControl: HDEL ERROR :', err);
                    return
                }
                resolve(replies);
            });

        });

        return promise
    },
    HKEYS:(HKEY)=>{
        let ctl = getClient();
        var promise = new Promise((resolve, reject) => {
            ctl.hkeys(HKEY, function (err, replies) {
                redisCtl.delayQuit();
                if (err) {
                    resolve(0);
                    loggerErr.error('redisControl: HKEYS ERROR :', err);
                    return
                }
                resolve(replies);
            });

        });

        return promise
    },
    HVALS:(HKEY)=>{
        let ctl = getClient();
        var promise = new Promise((resolve, reject) => {
            ctl.HVALS(HKEY, function (err, replies) {
                redisCtl.delayQuit();
                if (err) {
                    resolve(0);
                    loggerErr.error('redisControl: HVALS ERROR :', err);
                    return
                }
                resolve(replies);
            });

        });
        return promise
    },
    KEYS:()=>{
        let ctl = getClient();
        var promise = new Promise((resolve, reject) => {
            ctl.keys("*", function (err, replies) {
                 redisCtl.delayQuit();
                if (err) {
                    resolve([]);
                    loggerErr.error('redisControl: KEYS ERROR :', err);
                    return 
                }
                resolve(replies);
               
            });

        });

        return promise
    },
    end: redisCtl.end,
}
export let redisControl = method;
