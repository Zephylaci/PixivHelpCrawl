const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const KoaRouter = require('koa-router')()
const apiRouter = require('./api/api-routers.js')
const static = require('koa-static');
const path = require('path');

var pathConfig = require('../config/index.js')['pathConfig']
// const index = require('./routes/index')
//const users = require('./routes/users')



// const ejs = require('ejs');

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
// app.use(require('koa-static')(__dirname + '/public'));


//  app.use(views(__dirname + '/views', {
//    extension: 'ejs'
//  }));
// app.use(views(__dirname + '/views', {
//   map : {html:'ejs'}
// }));

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes

//格式化返回中间件
// const response_formatter = require('./middlewares/response_formatter.js');
// app.use(response_formatter('^/api'));

// //路由前调用,只处理*/api/开头的数据
// app.use(index.routes(), index.allowedMethods())
//app.use(users.routes(), users.allowedMethods())

//api路由配置
// const api = require('./api/routes');
// app.use(api.routes(),api.allowedMethods());
KoaRouter.use('/api', apiRouter.routes());
app.use(KoaRouter.routes()); // 将api路由规则挂载到Koa上。
// 读取前端文件
app.use(static(path.resolve(pathConfig.webPath))); 
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
// 
// require("babel-core/register")({
//   "presets": [
//     ["env", {
//       "targets": {
//         "node": true
//       }
//     }]
//   ]
// });

