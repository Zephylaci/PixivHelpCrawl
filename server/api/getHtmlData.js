var cheerio = require('cheerio');
var http = require('https');
var request = require('request');
var fs = require('fs');

var pixivAbout = require('../../config/')['pixivConfig'];
var events = require('events');
var emitter = new events.EventEmitter();

var mainObj={
  common:{
    state:null,
    html:''
  },
  start:(opt)=>{
    var url = opt.url;
    if(!url){
        console.error('getHtmlData Error：需要参数Url');
        return;
    }
    var state = new Promise((resolve,reject)=>{
      mainObj.end=resolve;
    });
      console.log('getHtmlData Msg:Link '+url);
      //后面这里调整成可以配置的
      if(url.indexOf('pixiv')!=-1){
          mainObj.method['request'](url);
      }else{
          mainObj.method['get'](url);
      }
      //先写死
      return state;
  },
  end:()=>{}
}
mainObj.method={
    get:httpGet,
    request:requestHtml
}

emitter.on("getHtmlOver",()=>{
    mainObj.end(mainObj.common.html);
});
function httpGet(url){
    http.get(url, function(res) {
        var html = '';
        res.on('data', function(data) {
            html += data;
        });
        //将解析结果传
        res.on('end', function() {
            console.log('getHtmlData Msg: httpGet'+url+' 读取结束');
            mainObj.common.html = html;
            emitter.emit("getHtmlOver");
        });
    }).on('error',(e)=>{
        console.error('error:'+e.message);
    });
   return html;
}
function requestHtml(url){

    //这里可以做一个单例
    fs.exists(pixivAbout.cookieAbout.path,function(exists){
      if(exists){
        fs.readFile(pixivAbout.cookieAbout.path,"utf-8",function(err,data){
          if(err){
            throw err;
          }
          else{
            pixivAbout.cookieAbout.cookies = data
            emitter.emit("getCookieOver",url);
          }
        });
     }});
   
}
     
emitter.on('getCookieOver',(url)=>{
    var cookies = pixivAbout.cookieAbout.cookies;
    var headers = pixivAbout.headers;
    //先写死
    var j = request.jar(); 
    var rcookie = request.cookie(cookies); 

    j.setCookie(rcookie, url); //设置cookie

    request(
        {
            url: url,
            headers: headers,
            jar:j
        },
        function(err,res,body){
            if(err){
                console.log("getHtmlData Msg：requestHtml "+url+"失败");
                console.log("getHtmlData error: "+err);
                return;
            }
            if(res && res.statusCode == 200){
                console.log("getHtmlData Msg：requestHtml "+url+"读取结束");
                var html = body;
                mainObj.common.html= html; 
                emitter.emit("getHtmlOver");
            }else{
                console.log("getHtmlData Msg：requestHtml "+url+"错误的返回信息");
                console.log("getHtmlData Msg：res "+res);
                
            }

        }
    );
});


module.exports=mainObj