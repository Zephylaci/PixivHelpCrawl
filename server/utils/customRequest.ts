import * as request from 'request';
import {logger,loggerErr,loggerShow}  from '../utils/logger';
import {linkProxy} from '../../config';
let customRequest:request = function(opt){
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
    for(let key in opt){
        var item = opt[key];
        var setKey = keyHashMap[key];
        if(typeof setKey ==='string'){
            requestOpt[setKey] = item;
        }
    }
    if(linkProxy.useLinkProxy===true){
        requestOpt['proxy']=linkProxy.linkProxyAddr;
    }
    /**
     * TODO 根据具体类型重写  
     */
    let mainRequest:any = {};
    let promise:any = new Promise((resolve,reject)=>{
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
        
        mainRequest= request(requestOpt,responseFun) 
       
        mainRequest.on('error',function(err){
            loggerShow.error('link url:',url,' fail');
            loggerShow.error('error:',err)
            reject();
        });    
    });
    
    promise.pipe=function(stream){
        return mainRequest.pipe(stream);
    }
    promise.catch((err)=>{
        loggerShow.error('link url:',url,' fail');
        loggerShow.error('error:',err)
    });
    return promise
}

customRequest.__proto__ = request;

export default customRequest