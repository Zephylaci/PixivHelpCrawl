/**
 * TODO: 重写为操作sqllite
*/
// import * as fs from 'fs';
// import { redisControl } from '../model/redisControl';


// const cashPath = 'client/cash/';
// function getPreViewState({
//     needState=['count','totalSize','firstCreat']
// }){
//    let stateMethodMap = {
//        'count':({
//            fileList=[],
//            result,
//        })=>{
//            result.count=fileList.length;
//        },
//        'totalSize':({
//            result
//        })=>{
//            function getSize({size=0},result){
//                 if(typeof size ==='number'){
//                     result.totalSize+= size;
//                 }
                
//            }
//            result.totalSize = 0;
//            handleList.push(getSize);
//        },
//        'firstCreat':({
//            result
//        })=>{
//            function checkCreatTime({
//                ctimeMs=0
//            },result){
//                if(ctimeMs<result.firstCreat){
//                    result.firstCreat = ctimeMs;
//                }
//            }
//            result.firstCreat=Infinity;
//            handleList.push(checkCreatTime);
//        }
//    }
//    let {fileList,handleListFun}=  fileListHandle();
//    let result ={};
//    let handleList = [];
//    needState.forEach((key)=>{
//        stateMethodMap[key]({
//            fileList,
//            result,
//        });
//    })
//    if(handleList.length!==0){
//         result = handleListFun({
//             result,
//             handleList
//         });
//    }
//    return result;
// }
// async function getRedisState(){
//     let result = {
//         totalCount:0,
//     }
//    await redisListHandle({
//        result,
//        handleFun:async ({result,key})=>{
        
//            let getCount = await redisControl.HLEN(key);
//            result.totalCount+=getCount;
//        }
//    });

//     return {
//         totalCount:result.totalCount
//     }
// }
// async function makeViewDelList({
//     beforeTime=-Infinity,
//     checkUse=false,
// }){
//     let {fileList,handleListFun}=  fileListHandle();
//     let result:any = {
//         count:fileList.length,
//         delList:[]
//     };
   
//     function makeDelList({
//         ctimeMs=0,
//         path,
//     },result){
//         if(ctimeMs<beforeTime){
//             result.delList.push(path)
//         }
//     }
//     var handleList = [makeDelList]
//     result = handleListFun({
//         result,
//         handleList
//     });
//     if(checkUse===true){
//         let redisResult = {
//             allCashItem:[]
//         }
//         await redisListHandle({
//             result:redisResult,
//             handleFun:async ({result,key})=>{
                
//                 let values:any = await redisControl.HVALS(key);
//                 values.forEach((itemStr)=>{
//                     let item = JSON.parse(itemStr);
//                     result.allCashItem = result.allCashItem.concat(item.contents);
//                 });

//             }
//         });

//         let delList = result.delList;
//         let imgMap = {};
//         redisResult.allCashItem.forEach((item)=>{
//             let needUrl = 'client'+item.url;
//              imgMap[needUrl] = true
//         })
//         delList = delList.filter((imgPath)=>{
//             return !imgMap[imgPath]
//         });
//         result.delList = delList;
//     }

    
//     return result

// }
// async function makeRedisDelList({
//     beforeTime=-Infinity
// }){
//     let result = {
//         delList:[],
//         delCount:0
//     }
//    await redisListHandle({
//        result,
//        handleFun:async ({result,key})=>{

//            let item = {
//                hkey:key,
//                keys:[],
//            }
//            let getList:any = await redisControl.HKEYS(key);
//            getList.forEach((key)=>{
//                let dateStr = key.slice(0,4)+'-'+key.slice(4,6)+'-'+key.slice(6,8);

//                if(new Date(dateStr).getTime()<beforeTime){
//                   item.keys.push(key);
                  
//                }
//            })

//            if(item.keys.length!==0){
//                result.delList.push(item);
//                result.delCount+=item.keys.length;
//            }

//        }
//    });

//     return result
   
// }
// async function redisListHandle({
//     result={},
//     handleFun,
// }){
//     let keyList:any = await redisControl.KEYS();
//     if(keyList.length===0){
//         return 0;
//     }
//     let needKey = {
//         daily:true,
//         rookie:true,
//         weekly:true,
//         male:true,
//         daily_r18:true,
//         weekly_r18:true,
//         male_r18:true,
//     }
    
//     for(let key in needKey){
  
//         if(keyList.indexOf(key)!==-1){

//             await handleFun({result,key});

//         }  
//     }

//     return result
// }

// function fileListHandle() {
//     let fileList = fs.readdirSync(cashPath, {
//         encoding: 'utf8'
//     });
//     return {
//         fileList: fileList,
//         handleListFun: ({ 
//             result = {},
//             handleList = [] }) => {
//                 fileList.forEach((fileName) => {
//                 let path = cashPath + fileName
//                 let fileState:any = fs.statSync(path);
//                 fileState.path = path;
//                 handleList.forEach((handleFun) => {
//                     handleFun(fileState,result);
//                 });
//             });
//             return result;
//         }
//     }
// }
// async function delViewForlist(delList){
//     delList.forEach((imgPath)=>{
//         fs.unlinkSync(imgPath);
//     })

// }

// async function delRedisDataForList(delList){
//     for(let item of delList){
//         await redisControl.HDEL(item)
//     }
// }
// export default{
//     getPreViewState,
//     getRedisState,
//     makeViewDelList,
//     makeRedisDelList,
//     delViewForlist,
//     delRedisDataForList,
// }