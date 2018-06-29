/**
*  搜索模块 v 0.1
*  功能：搜索制定TAG或者名称获得相关信息
*  未完成      
**/

var getPixivData = require('./getPixivData.js');
var StringTool = require('./../../tool/s16.js');
var events = require('events');
var emitter = new events.EventEmitter();
var mainObj = {
  common:{
      page:1,
      runNum:0,
      runlimit:1,
      limit:10,
      run:false,
      end:()=>{},
      resultData:{
          resultItem:[],
          relatedTags:[]
      },
      strKey:"",
      bookmarkCountLimit:200
  },
  getData:()=>{
      var common = mainObj.common;
      var strKey = mainObj.common.strKey;
      var mainKey = encodeURI(strKey);
      var page = common.page;
      var url = `https://www.pixiv.net/search.php?s_mode=s_tag&mode=safe&word=${mainKey}&p=${page}`;
      var fakeCtx={
          request:{
              body:{
                  Url:StringTool.strToHexCharCode(url)
              }
          }
      }
    common.page++;
    return getPixivData.contrl(fakeCtx)
  
  },
  contrl: async (ctx, next) => {
    ctx.body = {
      code: 200,
      content:'为啥没有返回值..'
    }
    var common = mainObj.common;
    var parame = ctx.request.body;
    common.strKey = parame.searchStr;
    common.limit = Number(parame.handleLimit);
    common.bookmarkCountLimit =Number(parame.showLimit);
    common.runlimit = 1;
    common.page = 1;
    common.resultData.resultItem = [];
    var resultData = common.resultData;
    var state = new Promise((resolve,reject)=>{
      mainObj.common.end=resolve;
    });
    controlStep();
    await state
    //排序
    var resultItem = resultData.resultItem;
    resultItem = resultItem.sort((first,Second)=>{
        return Second.bookmarkCount - first.bookmarkCount 
    });
    if(resultItem.length===0){
        var onDataItem = {
            illustId:'没有读取到数据',
            illustTitle:'请换个关键字',
            bookmarkCount:'或者降低收藏数限制'
        }
        resultItem.push(onDataItem);
    }
     //为了保持与首页数据的一致性..
    ctx.body.content = JSON.stringify({relatedTags:resultData.relatedTags,contents:resultItem});
    return resultItem;
  }
}
emitter.on('oneOver',controlStep);
function controlStep(){
    var common = mainObj.common;
    if(common.page<=common.limit){  
        if(common.runlimit>common.limit){
            common.runlimit = common.limit;
        }
        while(common.runNum< common.runlimit){
            common.runNum++;
            oneStep();
        }
    }else{
        if(common.runNum<=0){
          mainObj.common.end();
        }
    }

}
function controlStep(){
    mainObj.common.end();
    mainObj.common.end=function(){
        console.log('autoSerach:重复结束')
    }
}
function oneStep(){
    var promise = mainObj.getData();
    var common = mainObj.common;
    promise.then((data)=>{
        console.log(data);
        if(data.items.length === 0){
             emitter.emit('AllOver');
            return;
        }
        if(common.resultData.relatedTags===[]){
            common.resultData.relatedTags = data.relatedTags;
        }
        var originItem = data.items;
        for(var i = 0;i<originItem.length;i++){
            var item = originItem[i];
            if(item.bookmarkCount>common.bookmarkCountLimit){
                common.resultData.resultItem.push(item);
            }
        }
         common.runNum--;
        emitter.emit('oneOver');
    });
  
}


module.exports = mainObj;