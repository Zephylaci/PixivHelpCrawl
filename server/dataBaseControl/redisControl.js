const env = require('../../config/index.js')['redisConfig'];
const redis = require('redis');
//var redisStore = require('koa-redis');

//var options = {client: client,db:1};
//var store = redisStore(options);
var main = {
  client: "",
  autoClose:null,
  wait:120000, //两分钟没有请求自动断开
  deal: (params) => {
    global.clearTimeout(main.autoClose);
    main.autoClose = null;
    main.checkLink();
    return method[params.type](params.contents)
  },
  delayQuit: () => {
    if(main.autoClose===null){
      main.autoClose = setTimeout(()=>{
        if(main.client.ready===true){
           main.end();
           var state = main.client.ready;
          console.log(new Date().toLocaleTimeString(), 'redis连接关闭连接，当前连接状态:',state);
        }else{
          var state = main.client;
          console.log(new Date().toLocaleTimeString(), '未预料的关闭请求:',state);
        } 
        
        if(main.autoClose!=null){
            global.clearTimeout(main.autoClose);
            main.autoClose = null;
        }

       
      },main.wait)
    }

  },
  checkLink:()=>{
    if(main.client.ready===false||main.client.ready===undefined){
     var linkOpt = {
        host:env.host,
        port:env.port,
        password:env.passwd
     }
      main.client = redis.createClient(linkOpt);
      main.client.on("error", function (err) {
        console.log("Error :" + err);
      });
      console.log(new Date().toLocaleTimeString(), 'redis连接');
      if(main.autoClose!==null){
        global.clearTimeout(main.autoClose);
        main.autoClose = null;
      }
    }else{
      console.log(new Date().toLocaleTimeString(), 'redis 连接保持');
    }
  },
  end:function(){
      if(main.client.ready===true){
          main.client.quit();
          global.clearTimeout(main.autoClose);
          main.autoClose = null;
           console.log(new Date().toLocaleTimeString(), 'redis连接主动关闭');
      }else{
          console.log(new Date().toLocaleTimeString(), 'redis连接 已经关闭:');
      }
  }

}
var method = {
  HMSET:(setItem) =>{
    let mainKey = setItem.mainHash;
    let key = setItem.key;
    
    let ctl = main.client;
    if(!mainKey){
        console.log('redisControl:HMSET ERROR 请传入主键');
        return
    }
      var promise = new Promise((resolve, reject) => {
        ctl.exists(mainKey,function(err,replies){
            if(err){
                  reject();
                  console.log('redisControl:HMSET ERROR :',err);
            }
                function hmsetCallBack(err,replies){
                      if (err) {
                        reject();
                        console.log(new Date().toLocaleTimeString(), 'hmset出错:',err);
                        return;
                      }
                      console.log(new Date().toLocaleTimeString(), 'hmset完成:',mainKey,key===mainKey?"":key);
                      resolve();
                }
                let dataContent = setItem.data;
            if(replies===0){
                if(key){
                         dataContent[key] = JSON.stringify({
                            contents:dataContent['contents']
                         });
                         delete dataContent['contents'];
                }else{
                    for(indexKey in dataContent){
                        let item = dataContent[indexKey];
                            if(typeof item ==='object'){
                                dataContent[indexKey] = JSON.stringify(dataContent[indexKey]);
                            }
                    }
                }
    
                ctl.HMSET(mainKey,dataContent,hmsetCallBack);
            }else{

                ctl.HSET(mainKey,key,JSON.stringify(dataContent),hmsetCallBack);
            }
        });
    });
    main.delayQuit();
    return promise
  },
  HMGET:(getItem)=>{
      let mainKey = getItem.mainKey;
      let key = getItem.key;
      
       let ctl = main.client;
        var promise = new Promise((resolve, reject) => {
            ctl.exists(mainKey,function(err,replies){
                if(err){
                      reject();
                      console.log('redisControl:HMSET ERROR :',err);
                }
                    function hmsetCallBack(err,replies){
                          if (err) {
                            reject();
                            console.log(new Date().toLocaleTimeString(), 'hmget出错:',err);
                            return;
                          }
                          console.log(new Date().toLocaleTimeString(), 'hmget完成:',mainKey,key);
                          resolve(replies);
                    }
                if(replies===1){
        
                    ctl.HMGET(mainKey,key,hmsetCallBack);
                }else{
                   resolve(null) 
                }
            });
        });
     main.delayQuit();
    return promise
  },
  setValue: (setItem) => {
    //以Url Id 为关键字存储每条信息
    var client = main.client;
    mainKey = setItem.urlId.toString();
    delete setItem.urlId //避免重复写入

    client.hmset(mainKey, setItem, (err, res) => {
      main.delayQuit();
      if (err) {
        console.log(new Date().toLocaleTimeString(), 'hmset出错:',err);
        return;
      }
      console.log(new Date().toLocaleTimeString(), 'hmset完成:',mainKey);
    });

  },
  ChekValue: async (url) => {
    var client = main.client;
    var getIdreg = /[^0-9]/ig //提取字符串中的数字...复习完正则后再改，现在先这样
    var urlId = url.replace(getIdreg, "");
    var result = null;
    // 以Url Id 为关键字检索，存在则返回。
    var linkEnd = () => { };
    var promise = new Promise((resolve, reject) => {
      linkEnd = resolve
      client.HGETALL(urlId, (err, res) => {
        main.delayQuit();  
        
        if (err) {
          console.log(new Date().toLocaleTimeString(), 'HGETALL出错:',err);
          result = [];
        }else{
          console.log(new Date().toLocaleTimeString(), 'HGETALL读取成功:',urlId);
          result = res;
        }
        linkEnd(result);
      
      });
    });
    await promise;
    
    return promise
  }
}

module.exports = main;