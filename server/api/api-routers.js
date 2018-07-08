// 路由设置
var getPixivData = require('./getPixivData.js');
var getPixivHotList = require('./getPixivHotList.js');
var autoSerach = require('./autoSerach.js');
var downloadControl = require('./downloadControl.js');
var randomImg = require('./randomImg.js');
var proxyImg = require('./proxyImg.js');



var routerConfig = {
        getPixivData:{
            type:'post',
            contrl:getPixivData.contrl
        },
        getPixivHotList:{
            type:'post',
            contrl:getPixivHotList.contrl
        },
        autoSerach:{
            type:'post',
            contrl:autoSerach.contrl
        },
        download:{
            type:'post',
            contrl:downloadControl.contrl
        },
        randomImg:{
            type:'get',
            contrl:randomImg.contrl
        },
        proxyImg:{
            type:'get',
            contrl:proxyImg.contrl
        }
    }

module.exports =  routerConfig 