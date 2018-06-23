var pixivAbout = require('../config/')['pixivConfig']


var fs = require('fs');
var events = require('events');
var emitter = new events.EventEmitter();
var request = require('request');
var cheerio = require('cheerio');

var main={
    start:function(){
        if(main.state===false&&main.loginIng===false){
            login(pixivAbout.form);
        }else{
            console.log("Login：登陆完成或者正在登陆中");
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
    fs.exists(pixivAbout.cookieAbout.path,function(exists){
      if(exists){
        console.log("Login：读取cookie文件");
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
        console.log("Login：获取Cookie文件开始");
        //获取post_key
        request('https://accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index', function (error, response, body) {
          if(error){
             console.log("Login：获取postKey失败");
             console.log("Login error：",error);
          }
          if (!error && response.statusCode == 200) {
            console.log('Login：postKey读取成功')
            var matches = body.match(/postKey":"([^"]*)"/);
            if(matches){
              var postKey = matches[1];
              console.log('Login:postKey:',postKey);
              form.post_key = postKey;
              //执行登录操作
              console.log('Login：模拟登陆开始')
              doLogin(form, response.headers["set-cookie"].join());
            }else{
                console.log('Login：postKey格式错误')
            }
          } else{
            console.log('Login：postKey读取失败')
          }
        });
      }
    });
};
/**
 * 登录操作
 * form 表单数据
 * cookie 进入登录页面时的默认cookie
 */
function doLogin(form, cookie) {
  var https = require("https");
  var querystring = require("querystring");

  var postData = querystring.stringify(form);

  var options = {
    host: "accounts.pixiv.net",
    path: "/api/login?lang=zh",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length,
      "Accept": "text/html, application/xhtml+xml, */*",
      "Accept-Language": "zh-CN",
      "Cache-Control": "no-cache",
      "Connection": "Keep-Alive",
      "Host": "accounts.pixiv.net",
      "Referer": "https://accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index",
      "User-Agent": "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; BOIE9;ZHCN)",
      "Cookie": cookie 
    }
  };
  var req = https.request(options,
    function (res) {
      res.setEncoding("utf8");
      var headers = res.headers;
      var cookies = headers["set-cookie"] || [];
      fs.writeFile(pixivAbout.cookieAbout.path, cookies.join(), function (err) {
        if (err) {
          console.log("Login：获取cookie失败");
          throw err;
        }
        else {          
          pixivAbout.cookieAbout.cookies = cookies.join();
          emitter.emit("getCookieOver");
        }
      });
      res.on("data",
        function (data) {
          console.log('Login:',data);
        });
      res.on("err",
        function (err) {
          console.log('Login:登陆错误',err);
          throw -1;
        });
    });
  req.write(postData);
  req.end();

}


emitter.on("getCookieOver",function(){
    var cookies = pixivAbout.cookieAbout.cookies;
 
    main.state = true;
    console.log('Login:模拟登陆获取Cookie流程结束');
    return;
    var url = 'http://www.pixiv.net/ranking.php?format=json&mode=daily&p=1';
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
