// 路由设置
var getPixivData = require('./PixivCrawler/getPixivData.js');
var getPixivHotList = require('./PixivCrawler/getPixivHotList.js');
var autoSerach = require('./PixivCrawler/autoSerach.js');
var downloadControl = require('./PixivCrawler/downloadControl.js');
var randomImg = require('./ImgControler/randomImg.js');
var proxyImg = require('./ImgControler/proxyImg.js');



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