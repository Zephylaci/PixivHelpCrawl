// 路由设置
// var getPixivData = require('../api/PixivCrawler/getPixivData');
import getPixivHotList from '../api/PixivCrawler/getPixivHotList';
import  customSearch from '../api/PixivCrawler/customSearch';
import  downloadControl from '../api/PixivCrawler/pixivDownloadControl';
import  addFilter from '../api/PixivCrawler/addFilter';

import  randomImg from '../api/ImgControler/randomImg';
import  proxyImg from '../api/ImgControler/proxyImg';



var routerConfig = {
        getPixivHotList:{
            type:'post',
            contrl:getPixivHotList.contrl
        },
        addFilter:{
            type:'post',
            contrl:addFilter.contrl
        },
        makeSeachPlan:{
            type:'post',
            contrl:customSearch.makePlan
        },
        getPlanState:{
            type:'post',
            contrl:customSearch.getState
        },
        getPlanDetail:{
            type:'post',
            contrl:customSearch.getDetail
        },
        getPlanList:{
            type:'get',
            contrl:customSearch.getList
        },
        delPlanItem:{
            type:'post',
            contrl:customSearch.delItem
        },
        doCash:{
            type:'post',
            contrl:customSearch.createPreviewCash
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