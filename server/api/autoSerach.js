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
      resultItem:[],
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
    common.resultItem = [];
    var state = new Promise((resolve,reject)=>{
      mainObj.common.end=resolve;
    });
    controlStep();
    await state
    //为了保持与首页数据的一致性..
    //排序
    common.resultItem = common.resultItem.sort((first,Second)=>{
        return Second.bookmarkCount - first.bookmarkCount 
    });
    ctx.body.content = JSON.stringify({contents:common.resultItem});
    return common.resultItem;
  }
}
emitter.on('oneOver',controlStep);
function controlStep(){
    var common = mainObj.common;
    console.log(common.page,common.limit)
    if(common.page<=common.limit){  
        console.log(common.page,common.limit,common.runNum,common.runlimit)
        if(common.runlimit>common.limit){
            common.runlimit = common.limit;
        }
         console.log(common.page,common.limit,common.runNum,common.runlimit)
        while(common.runNum< common.runlimit){
            common.runNum++;
            oneStep();
        }
    }else{
        console.log(common.runNum);
        if(common.runNum<=0){
          mainObj.common.end();
        }
    }

}
function oneStep(){
    var promise = mainObj.getData();
    var common = mainObj.common;
    promise.then((data)=>{
        console.log('in');
        var originItem = data.items;
        for(var i = 0;i<originItem.length;i++){
            var item = originItem[i];
            if(item.bookmarkCount>common.bookmarkCountLimit){
                common.resultItem.push(item);
            }
        }
         common.runNum--;
        emitter.emit('oneOver');
    });
  
}


module.exports = mainObj;