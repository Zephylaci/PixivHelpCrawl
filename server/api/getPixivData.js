var StringTool = require('./../../tool/s16.js');


var getHtmlData = require('./getHtmlData.js');
var testDown = require('./downloadImg.js')
var imgFilter = require('./imgFilter.js')

var cheerio = require('cheerio');


var mainObj = {
  contrl: async (ctx, next) => {
    ctx.body = {
      code: 200
    }

    // getHtmlData.common.html=""
    // getHtmlData.end();

    var upUrl =StringTool.hexCharCodeToStr(ctx.request.body.Url);
    var filter = ctx.request.body.Filter||'filter';

    var result = "result";
    var opt = {
        url:upUrl
    }

     await getHtmlData.start(opt).then((info)=>{
         var handleOpt={
             upUrl:upUrl,
             info:info,
             filter:filter
         }
         result=Trial(handleOpt);
 
     });
    //单个的存在下载，可以等它下完再返回
    if(result.awaitObj){
        await result.awaitObj;
        delete result.awaitObj;
    }
    
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
    var Alignment = ['Convenient','Monomers','Insight','Ordinary'] //执行顺序
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
            if(Public.filter==='filter'){
                var result = imgFilter(opt);
                info.contents = result.resultData;
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
            var authorReg = new RegExp( '.*,"name":"|","image":.*');
            var objReg = new RegExp( '.*,preload:|,user.*');
            var strobj ='var illustInfo = '+result.split(objReg)[1] +'}';
            eval(strobj);        
            illustInfo.authorName = result.split(authorReg)[1];
            

           var cash = illustInfo.illust;
            var mainKey = '';
            for(key in cash){
                mainKey = key;
                cash=cash[key];      
            }

            var downUrl = cash.urls.original;

             illustInfo.awaitObj=testDown(downUrl).then((fileName)=>{
                 if(fileName!=='fail'){
                     illustInfo.illust[mainKey].urls.original = '/download'+fileName;
                 }  
            });
           
            return illustInfo;

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