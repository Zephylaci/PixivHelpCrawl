const downloadThread = require('../api/CrawlerCommon/downloadThread.js');
const config = require('../../config/index.js')
var downList = [
    'https://i.pximg.net/c/240x480/img-master/img/2018/10/11/00/00/04/71123116_p0_master1200.jpg',
    'https://i.pximg.net/c/240x480/img-master/img/2018/10/12/00/30/42/71138282_p0_master1200.jpg',
]
var downTest = new downloadThread({
    path:'client/cash'
})
downTest.downList(downList);
