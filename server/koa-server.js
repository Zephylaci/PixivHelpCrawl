const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')

const KoaRouter = require('koa-router')()
const apiRouter = require('./router/api-routers.js')
const static = require('koa-static');
const path = require('path');

var mainConfig = require('../config/index.js')
var pathConfig = mainConfig['pathConfig']
var makeRouterList = require('./utils/makeRouterList.js');

const {loggerShow,loggerErr} = require('./utils/logger');

onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())

//app.use(logger())



// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  loggerShow.info(`${ctx.method} ${ctx.url} - ${ms}ms - ${ctx.status}`)
});
KoaRouter.use('/api',makeRouterList(apiRouter).routes()); 

app.use(KoaRouter.routes()); // 将api路由规则挂载到Koa上。
// 读取前端文件
app.use(static(path.resolve(pathConfig.webPath))); 
// error-handling
app.on('error', (err, ctx) => {
  loggerErr.error('server error', err, ctx)
});

module.exports = app

