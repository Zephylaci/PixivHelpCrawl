const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const KoaRouter = require('koa-router')()
const apiRouter = require('./api/api-routers.js')
const proxyRouter = require('./proxyApi/proxyControlAndRouters.js')
const static = require('koa-static');
const path = require('path');

var mainConfig = require('../config/index.js')
var pathConfig = mainConfig['pathConfig']
var makeRouterList = require('../tool/main.js')['makeRouterList'];
onerror(app)




// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())



// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});
//生成api路由相关配置
var routerConfig = apiRouter;
//代理精准替换
if(mainConfig.proxyConfig.useProxy===true&&mainConfig.proxyConfig.accuratProxy===true){
    for(key in proxyRouter){
        if(routerConfig[key]){
            routerConfig[key] = proxyRouter[key]
        }
    }
}
//代理覆盖
else if(mainConfig.proxyConfig.useProxy===true&&mainConfig.proxyConfig.accuratProxy===false){
    routerConfig = proxyRouter
}

KoaRouter.use('/api',makeRouterList(routerConfig).routes()); 

app.use(KoaRouter.routes()); // 将api路由规则挂载到Koa上。
// 读取前端文件
app.use(static(path.resolve(pathConfig.webPath))); 
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

