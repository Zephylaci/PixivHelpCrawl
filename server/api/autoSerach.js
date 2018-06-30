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
      safeMode:'safe',
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
       var mode ='&mode=safe'; 
      if(common.safeMode==='unSafe'){
          mode = '';
      }
      
      var page = common.page;
     
      var url = `https://www.pixiv.net/search.php?s_mode=s_tag${mode}&word=${mainKey}&p=${page}`;
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
    common.safeMode = parame.safeMode || 'safe';
    common.runlimit = 1;
    common.page = 1;
    common.resultData.resultItem = [];
    common.resultData.relatedTags = [];
    var resultData = common.resultData;
    var state = new Promise((resolve,reject)=>{
      mainObj.common.end=resolve;
    });
    console.log(`autoSerach msg:读取关键字 ${common.strKey} 开始,预计读取:${common.limit}页,保留收藏数:${common.bookmarkCountLimit}以上的数据`)
    controlStep();
    await state
    //排序
    var resultItem = resultData.resultItem;
    resultItem = resultItem.sort((first,Second)=>{
        return Second.bookmarkCount - first.bookmarkCount 
    });
    if(resultItem.length===0){
        var onDataItem = {
            illustTitle:'没有读取到数据',
            url:'https://i.pximg.net/c/240x240/img-master/img/2018/06/28/03/19/37/69432554_p0_master1200.jpg' //先随便给个占位图
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
         console.log(`autoSerach msg:读取关键字 ${common.strKey} 中,将读取第:${common.page}页`)  
        // if(common.runlimit>common.limit){
        //     common.runlimit = common.limit;
        // }
        // while(common.runNum< common.runlimit){
        //     common.runNum++;
        //     oneStep();
        // }
        oneStep();
    }else{
        if(common.runNum<=0){
          emitter.emit('AllOver');
        }
    }

}

emitter.on('AllOver',function(){
    var common = mainObj.common;
    common.end();
    console.log(`autoSerach msg:读取关键字 ${common.strKey} 结束,共读取了:${(common.page-1)}页`);
    mainObj.common.end=function(){
        console.log('autoSerach:不符合预期的结束调用')
    }
});

function oneStep(){
    var promise = mainObj.getData();
    var common = mainObj.common;
    promise.then((data)=>{
        if(data.items.length === 0){
             emitter.emit('AllOver');
            return;
        }
        if(common.resultData.relatedTags.length===0){
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