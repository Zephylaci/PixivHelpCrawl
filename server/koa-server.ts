import * as Koa from 'koa'
const app = new Koa()
import * as json from 'koa-json'
import * as onerror from 'koa-onerror'
import * as bodyparser from 'koa-bodyparser'
import * as KoaRouterBase from'koa-router'
import * as koaStatic from 'koa-static';
import * as path from 'path';

var mainConfig = require('../config/index')
var pathConfig = mainConfig['pathConfig']


import {loggerShow,loggerErr, loggerRes} from './utils/logger';
import { makeRouterList } from './utils/makeRouterList';
import { routerConfig } from './router/api-routers';
import generalResult from './middleware/generalResult';
const KoaRouter = KoaRouterBase();
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())


// logger
app.use(async (ctx, next) => {
  const start = new Date().getTime();
  generalResult(ctx);
  await next()
  const ms = new Date().getTime() - start
  
  loggerRes.info(`${ctx.method} ${ctx.url} - ${ms}ms - ${ctx.status}`)
});
KoaRouter.use('/api',makeRouterList(routerConfig).routes()); 

app.use(KoaRouter.routes()); // 将api路由规则挂载到Koa上。
// 读取前端文件
app.use(koaStatic(path.resolve(pathConfig.webPath))); 
// error-handling
app.on('error', (err, ctx) => {
  loggerErr.error('server error', err, ctx)
});

export default app
