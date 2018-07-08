const request = require('request');

const mainConfig = require('../config/');
const pixivConfig = mainConfig.pixivConfig




function customRequest(opt){
    let url = opt.url;
    let successFun = opt.success || null;

    
    let  requestOpt = {
          method:'GET'
    }
    let keyHashMap ={
        url:'url',
        type:'method',
        data:'form',
        headers:'headers',
        jar:'jar',
        encoding:'encoding'
    }
    //遍历生成请求方法
    for(key in opt){
        var item = opt[key];
        var setKey = keyHashMap[key];
        if(typeof setKey ==='string'){
            requestOpt[setKey] = item;
        }
    }
    if(mainConfig.linkProxy.useLinkProxy===true){
        requestOpt['proxy']=mainConfig.linkProxy.linkProxyAddr;
    }
    
    let mainRequest = {};
    let promise = new Promise((resolve,reject)=>{
        function responseFun(error, response, data){
            if(!error && response.statusCode == 200){
                //success
                if(typeof successFun === 'function'){
                    successFun(response,data)
                }

                resolve({
                    response:response,
                    content:data
                });
            }else{
                 reject({
                     code:'500',
                     content:data
                 });
            }
        }
        
        mainRequest = request(requestOpt,responseFun) 
       
        mainRequest.on('error',function(err){
            console.log('link url:',url,' fail');
            console.log('error:',err)
            reject();
        });    
    });
    
    promise.pipe=function(stream){
        return mainRequest.pipe(stream);
    }
    promise.catch((err)=>{
        console.log('link url:',url,' fail');
        console.log('error:',err)
    });
    return promise
}

customRequest.__proto__ = request;




module.exports=customRequest