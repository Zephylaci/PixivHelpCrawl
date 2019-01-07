const pixivAbout = require('../config/')['pixivConfig']


const fs = require('fs');
const events = require('events');
const emitter = new events.EventEmitter();
const request = require('./utils/customRequest.js');
const cheerio = require('cheerio');
const {loggerShow,loggerErr} = require('./utils/logger');

const main={
    start:function(){
        if(main.state===false&&main.loginIng===false){
            login(pixivAbout.form);
        }else{
            loggerShow.info("Login：登陆完成或者正在登陆中");
        }
        return emitter;
    },
    state:false,
    loginIng:false
}
if(main.state===false){
    login(pixivAbout.form);
}
/**
 * 登陆控制
 * param form 表单对象
 * return string  cookies
 */
function login(form){
    main.loginIng = true;
    //如果存在cookie文件则直接读取，不存在则登陆写入
    loggerShow.info('Login:模拟登陆获取Cookie流程 开始')
    fs.exists(pixivAbout.cookieAbout.path,function(exists){
      if(exists){
        fs.readFile(pixivAbout.cookieAbout.path,"utf-8",function(err,data){
          if(err){
            throw err;
          }
          else{
            pixivAbout.cookieAbout.cookies = data
            emitter.emit("getCookieOver");
          }
        });
      }
      //模拟登陆并写入cookie文件
      else{
            //获取post_key
            request({
                url:'https://accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index'
            }).then((opt)=>{
                let data = opt.content;
                let response = opt.response;
                var matches = data.match(/postKey":"([^"]*)"/);
                if(matches){
                  var postKey = matches[1];
                  form.post_key = postKey;
                  //执行登录操作
                  doLogin(form, response.headers["set-cookie"].join());
                }else{
                    loggerErr.warn('Login：postKey格式错误')
                }
    
            });

        };
      });   
};
/**
 * 登录操作
 * form 表单数据
 * cookie 进入登录页面时的默认cookie
 */
function doLogin(form, cookie) {
  const querystring = require("querystring");
  
  var postData = querystring.stringify(form);

  var headers = {
      "Content-Type": "application/x-www-form-urlencoded",
     "Content-Length": postData.length,
      "Accept": "text/html, application/xhtml+xml, *",
      "Accept-Language": "zh-CN",
     "Cache-Control": "no-cache",
      "Connection": "Keep-Alive",
      "Host": "accounts.pixiv.net",
     "Referer": "https://accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index",
      "User-Agent": "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; BOIE9;ZHCN)",
      "Cookie": cookie 
    }
  
  request({
        url:"https://accounts.pixiv.net/api/login?lang=zh",
        type:'POST',
        data:postData,
        headers:headers,
        success:function(res,data){
            if(typeof data === 'string'){
                 var data = JSON.parse(data);
            } 
           
        
            if(data.error===false){
                var headers = res.headers;
                var cookies = headers["set-cookie"] || [];
                fs.writeFile(pixivAbout.cookieAbout.path, cookies.join(), function (err) {
                if (err) {
                  loggerErr.error('Login:写入cookie失败',err)
                  throw err;
                }
              });
                
               
            }else{
                loggerErr.error('Login:模拟登陆失败',decodeURI(data.message) );
            }
        }
    
    }).catch((err)=>{
        loggerErr.error('Login:模拟登陆失败',err);
    })
// const https = require("https");
//  var options = {
//    host: "accounts.pixiv.net",
//    path: "/api/login?lang=zh",
//    method: "post",
//    headers: {
//      "Content-Type": "application/x-www-form-urlencoded",
//      "Content-Length": postData.length,
//      "Accept": "text/html, application/xhtml+xml, */*",
//      "Accept-Language": "zh-CN",
//      "Cache-Control": "no-cache",
//      "Connection": "Keep-Alive",
//      "Host": "accounts.pixiv.net",
//      "Referer": "https://accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index",
//      "User-Agent": "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; BOIE9;ZHCN)",
//      "Cookie": cookie 
//    }
//  };
//  var req = https.request(options,
//    function (res) {
//      res.setEncoding("utf8");
//
//      var headers = res.headers;
//      var cookies = headers["set-cookie"] || [];
//      fs.writeFile(pixivAbout.cookieAbout.path, cookies.join(), function (err) {
//        if (err) {
//          throw err;
//        }
//        else {          
//          pixivAbout.cookieAbout.cookies = cookies.join();
//          emitter.emit("getCookieOver");
//        }
//      });
//      res.on("data",
//        function (data) {
//          console.log('Login:',data);
//        });
//      res.on("err",
//        function (err) {
//          console.log('Login:登陆错误',err);
//          throw -1;
//        });
//    });
//  req.write(postData);
//  req.end();


}


emitter.on("getCookieOver",function(){
    var cookies = pixivAbout.cookieAbout.cookies;
 
    main.state = true;
    loggerShow.info('Login:模拟登陆获取Cookie流程 结束');
    return;
    var url = 'https://www.pixiv.net/ranking.php?format=json&mode=daily&p=1';
    var j = request.jar(); 
    var rcookie = request.cookie(cookies); 
    j.setCookie(rcookie, url); //设置cookie
    console.log("Login：获取列表开始");
    request(
        {
          url: url,
          headers: pixivAbout.headers,
          jar:j
        },
        function(err,res,body){
          if(res && res.statusCode == 200){
            var html = body;
            $ = cheerio.load(html, {
                decodeEntities: false
            });
            $('.ranking-items-container section ._layout-thumbnail img').map((i,el)=>{
                var onItem = $(el);
                console.log(onItem.attr('data-src'));

            })

          }
        }
      );
});
