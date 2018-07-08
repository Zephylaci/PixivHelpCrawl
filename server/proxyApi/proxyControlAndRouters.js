const proxyMain = require('./proxyMain.js')
var KoaRouter = require('koa-router')();
const request = require('../../tool/customRequest.js');

var routerConfig={
    
}
//api 代理逻辑 
async function checkProxy (ctx, next){
  //ctx.request.method=='POST'
  if(ctx.request.url.indexOf('getPixivData')!=-1){
    var trueUrl = mainConfig.proxyApi+ctx.request.url;
    var requestData=ctx.request.body;
    var promise = request({
      type: 'POST',
      url: trueUrl,
      data: requestData
    });
    await promise.then(function (response) {
      ctx.status = 200;
      ctx.body =  response.data;
    }).catch(function (error) {
      console.log(error);
      ctx.status = 404;
      ctx.body = 'error';
    });

  }else{
    await next();
  }
  
}

module.exports = routerConfig;