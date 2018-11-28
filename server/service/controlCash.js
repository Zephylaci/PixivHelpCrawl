const fs = require('fs');

const servicePath = '../'
const requireMehod = require(servicePath + 'router/refPath.js');
const redisCtl = requireMehod('redisCtl')

const cashPath = 'client/cash/';
function getPreViewState({
    needState=['count','totalSize','firstCreat']
}){
   let stateMethodMap = {
       'count':({
           fileList=[],
           result={}
       })=>{
           result.count=fileList.length;
       },
       'totalSize':({
           result={}
       })=>{
           function getSize({size=0},result){
                if(typeof size ==='number'){
                    result.totalSize+= size;
                }
                
           }
           result.totalSize = 0;
           handleList.push(getSize);
       },
       'firstCreat':({
           result={}
       })=>{
           function checkCreatTime({
               ctimeMs=0
           },result){
               if(ctimeMs<result.firstCreat){
                   result.firstCreat = ctimeMs;
               }
           }
           result.firstCreat=Infinity;
           handleList.push(checkCreatTime);
       }
   }
   let {fileList,handleListFun}=  fileListHandle();
   let result ={};
   let handleList = [];
   needState.forEach((key)=>{
       stateMethodMap[key]({
           fileList,
           result,
       });
   })
   if(handleList.length!==0){
        result = handleListFun({
            result,
            handleList
        });
   }
   return result;
}
async function getRedisState(){
     let keyList = await redisCtl.KEYS();
    if(keyList.length===0){
        return 0;
    }
    let needKey = {
        daily:true,
        rookie:true,
        weekly:true,
        male:true,
        daily_r18:true,
        weekly_r18:true,
        male_r18:true,
    }
    let totalCount = 0;
    for(let key of keyList){
        if(needKey[key]===true){
            let getCount = await redisCtl.HLEN(key);
            totalCount+=getCount;
        }  
    }

    return {
        totalCount
    }
}
function makeViewDelList({
    beforeTime=-Infinity
}){
    let {fileList,handleListFun}=  fileListHandle();
    let result = {
        count:fileList.length,
        delCount:0,
        delList:[]
    };
   
    function makeDelList({
        ctimeMs=0,
        path,
    },result){
        if(ctimeMs<beforeTime){
            result.delCount++;
            result.delList.push(path)
        }
    }
    var handleList = [makeDelList]
    result = handleListFun({
        result,
        handleList
    })
    return result

}
function fileListHandle() {
    let fileList = fs.readdirSync(cashPath, {
        encoding: 'utf8'
    });
    return {
        fileList: fileList,
        handleListFun: ({ 
            result = {},
            handleList = [] }) => {
                fileList.forEach((fileName) => {
                let path = cashPath + fileName
                let fileState = fs.statSync(path);
                fileState.path = path;
                handleList.forEach((handleFun) => {
                    handleFun(fileState,result);
                });
            });
            return result;
        }
    }
}
module.exports= {
    getPreViewState,
    getRedisState,
    makeViewDelList
}