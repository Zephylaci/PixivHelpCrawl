const redisCtl = require('../dataBaseControl/redisLink.js');



function getClient() {
    return redisCtl.deal();
}

const method = {
    HMSET: (setItem) => {
        let mainKey = setItem.mainHash;
        let key = setItem.key;

        let ctl = getClient();
        if (!mainKey) {
            console.log('redisControl:HMSET ERROR 请传入主键');
            return
        }
        var promise = new Promise((resolve, reject) => {
            ctl.exists(mainKey, function (err, replies) {
                if (err) {
                    reject();
                    console.log('redisControl:HMSET ERROR :', err);
                    redisCtl.delayQuit();
                    return 
                }
                function hmsetCallBack(err, replies) {
                    redisCtl.delayQuit();
                    if (err) {
                        reject();
                        console.log(new Date().toLocaleTimeString(), 'hmset出错:', err);
                        return;
                    }
                    console.log(new Date().toLocaleTimeString(), 'hmset完成:', mainKey, key === mainKey ? "" : key);
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
                        for (indexKey in dataContent) {
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
                    console.log('redisControl:HMSET ERROR :', err);
                    redisCtl.delayQuit();
                    return 
                }
                function hmsetCallBack(err, replies) {
                    redisCtl.delayQuit();
                    if (err) {
                        reject();
                        console.log(new Date().toLocaleTimeString(), 'hmget出错:', err);
                        return;
                    }
                    console.log(new Date().toLocaleTimeString(), 'hmget完成:', mainKey, key);
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
                    console.log('redisControl:KEYS ERROR :', err);
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
                console.log(replies);
                if (err) {
                    resolve(0);
                    console.log('redisControl:HDEL ERROR :', err);
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
                    console.log('redisControl:HKEYS ERROR :', err);
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
                    console.log('redisControl:HVALS ERROR :', err);
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
                    console.log('redisControl:KEYS ERROR :', err);
                    return 
                }
                resolve(replies);
               
            });

        });

        return promise
    },
    end: redisCtl.end,
}


module.exports = method;