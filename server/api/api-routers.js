// 路由设置
var KoaRouter = require('koa-router')();
var getPixivData = require('./getPixivData.js');
var autoSerach = require('./autoSerach.js');
var downloadControl = require('./downloadControl.js');

KoaRouter.post('/getPixivData',getPixivData.contrl) //getPixivData接受post调用
KoaRouter.post('/autoSerach',autoSerach.contrl) //autoSerach接受post调用
KoaRouter.post('/download',downloadControl.contrl) //autoSerach接受post调用

module.exports = KoaRouter;