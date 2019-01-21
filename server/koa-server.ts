import * as Koa from 'koa'
const app = new Koa()
import * as json from 'koa-json'
import * as onerror from 'koa-onerror'
import * as bodyparser from 'koa-bodyparser'
import * as KoaRouterBase from'koa-router'
import * as apiRouter from './router/api-routers.js'
import * as koaStatic from 'koa-static';
import * as path from 'path';

var mainConfig = require('../config/index.js')
var pathConfig = mainConfig['pathConfig']
var makeRouterList = require('./utils/makeRouterList');

import {loggerShow,loggerErr, loggerRes} from './utils/logger';
const KoaRouter = KoaRouterBase();
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())

//app.use(logger())



// logger
app.use(async (ctx, next) => {
  const start = new Date().getTime();
  await next()
  const ms = new Date().getTime() - start
  
  loggerRes.info(`${ctx.method} ${ctx.url} - ${ms}ms - ${ctx.status}`)
});
KoaRouter.use('/api',makeRouterList(apiRouter).routes()); 

app.use(KoaRouter.routes()); // 将api路由规则挂载到Koa上。
// 读取前端文件
app.use(koaStatic(path.resolve(pathConfig.webPath))); 
// error-handling
app.on('error', (err, ctx) => {
  loggerErr.error('server error', err, ctx)
});

export default app
