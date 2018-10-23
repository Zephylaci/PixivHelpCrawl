const servicePath = '../';
const manPath = '../../';
// const StringTool = require(servicePath+'utils/main.js')['StringTool'];
// const getHtmlData = require(servicePath+'service/getHtmlData.js');
// const imgFilter = require(servicePath+'utils/imgFilter.js')
// const cheerio = require('cheerio');
// const request = require(servicePath+'utils/customRequest.js');

const requireMehod = require(servicePath+'router/refPath.js');
requireMehod('getPixivData');



var mainObj = {
  contrl: async (ctx, next) => {
    ctx.body = {
      code: 200
    }
    //代理逻辑
    var mainConfig = require(manPath+'config');
    if(mainConfig.proxyApi){
        var trueUrl = mainConfig.proxyApi+'/api/getPixivData';
        console.log(trueUrl);
        var requestData=ctx.request.body;
        var promise = request({
            type: 'POST',
            url: trueUrl,
            data: requestData
        });
        var result = null
        await promise.then(function (response) {
            ctx.status = 200;
            ctx.body =  response.data;
            result = response.data;
        }).catch(function (error) {
            console.log(error);
            ctx.status = 404;
            ctx.body = 'error';
        });
        return result
    }
    //代理逻辑结束

    var upUrl =StringTool.hexCharCodeToStr(ctx.request.body.Url);
    var filter = ctx.request.body.Filter|| true;
    
    var opt = {
        url:upUrl
    }
    var getHtmlPromise =  getHtmlData.start(opt);

    getHtmlPromise.then((getResult)=>{

        if(getResult.code===200){
           var handleOpt={
               upUrl:upUrl,
               info:getResult.data,
               filter:filter
           }

           result=Trial(handleOpt);
        }else{
           ctx.body.code = -1;
           result = getResult.data
        }
    })
    getHtmlPromise.catch((err)=>{
        result = err;
     })
    await getHtmlPromise


    ctx.body.content = result;
    return result;
    
  }
}

var Trial = Norn();
/**
* upUrl 读取到的url 不同的url进不同的处理过程
* info getHtmlData返回的数据，可能是json也可能是Html
* 
**/
function Norn(){
    var Alignment = ['Convenient','Monomers','Insight','Ordinary'] //执行优先顺序
    return function(handleOpt){
            var Public = Norn.Scales.Public;
            var result = ""

            Public.upUrl = handleOpt.upUrl;
            Public.info = handleOpt.info;
            Public.filter = handleOpt.filter;

            
            var Method = Norn.Scales;
            var i = 0;
            runMethod(i);
            function runMethod(i){
                result=Method[Alignment[i]]();
                if((result ==='next')){
                    i++;
                    runMethod(i);
                }
            }
            return result;
/*            for(var i =0;i<Alignment.length;i++){
                result=Method[Alignment[i]]();      
                if(!(result ==='next')){
                    return result;
                }
            }  */         
           
        }
}
/*
* 几种处理模式
* Public:公共变量 common
* Ordinary:平凡的 针对首页的处理模式，很多页面也能用
* Insight:洞察 针对搜索返回页
* Monomers:单体 针对单id返回页
* Convenient:不需要 不需要处理，针对json返回
*/
Norn.Scales={
    Public : {
          upUrl:'',
          $:'',
          info:''
        },
    Convenient: ()=>{
        var Public = Norn.Scales.Public;
        var upUrl = Public.upUrl;

        var info = Public.info;

        if(upUrl.indexOf('format=json')!=-1){
            if(typeof info ==="string"){
                //linux兼容
                info = JSON.parse(Public.info)
            }
            
            var opt = {
                filterType:'Convenient',
                sourceData:info
            }
            if(Public.filter==true){
                var result = imgFilter(opt);
                info.contents = result.resultData;
            }
                //2018/7/28 p站缩略图403对策
                var resArr = info.contents;
                for(var i = 0;i<resArr.length;i++){
                    var url = resArr[i].url;
                    var proxyUrl = '/api/proxyImg?url='+StringTool.strToHexCharCode(url);
                    resArr[i].originUrl = url;
                    resArr[i].url= proxyUrl;
                    
                }

            return JSON.stringify(info);
        }else{
            var info = Public.info;
            Public.$ = cheerio.load(info,{
                decodeEntities: false
            });
            return 'next';
        }
    },
    Monomers:()=>{
        var Public = Norn.Scales.Public;
        var upUrl = Public.upUrl;
        var $ = Public.$;
        if(upUrl.indexOf('illust_id')!=-1){
            var result = $('head').html();
            var cashInfo = null
            if(result){
                var authorReg = new RegExp( '.*,"name":"|","image":.*');
                var objReg = new RegExp( '.*,preload:|,user.*');
                var strobj ='var illustInfo = '+result.split(objReg)[1] +'}';
                eval(strobj);        
                //illustInfo.authorName = result.split(authorReg)[1];
     
                 cashInfo = illustInfo.illust;
                var mainKey = '';
                for(key in cashInfo){
                    mainKey = key;
                    cashInfo=cashInfo[key];      
                }
    
            }


            return cashInfo;

        }else{
            
            return 'next';
        }
    },
    Insight:()=>{
        var Public = Norn.Scales.Public;
        var upUrl = Public.upUrl;
        var $ = Public.$
        
        if(upUrl.indexOf('search.php')!=-1){
            return $('#js-mount-point-search-result-list').data();
        }else{
            return 'next';
        }
    },
    Ordinary:()=>{

      var Public = Norn.Scales.Public;
      var $ = Public.$;
      var css = $('link');
      var result = $('#wrapper');
      result.find('script').remove();
      result.append(css);
      return result.html();
    }
}

Norn.Trial = function(type){

}

module.exports = mainObj;