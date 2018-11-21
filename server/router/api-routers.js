// 路由设置
// var getPixivData = require('../api/PixivCrawler/getPixivData.js');
const getPixivHotList = require('../api/PixivCrawler/getPixivHotList.js');
// const autoSerach = require('../api/ixivCrawler/autoSerach.js');
const downloadControl = require('../api/PixivCrawler/pixivDownloadControl.js');
const addFilter = require('../api/PixivCrawler/addFilter.js');

const randomImg = require('../api/ImgControler/randomImg.js');
const proxyImg = require('../api/ImgControler/proxyImg.js');



var routerConfig = {
        // getPixivData:{
        //     type:'post',
        //     contrl:getPixivData.contrl
        // },
        getPixivHotList:{
            type:'post',
            contrl:getPixivHotList.contrl
        },
        addFilter:{
            type:'post',
            contrl:addFilter.contrl
        },
        // autoSerach:{
        //     type:'post',
        //     contrl:autoSerach.contrl
        // },
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