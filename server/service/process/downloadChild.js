import * as downloadImg from '../downloadImg.js';
var tryGet = 1;
var wait = 5000;
let {logger,loggerErr,loggerShow} = require('../../utils/logger')

process.on('message', (url) => {
    childFun(url)
});
var path = 'client/cash';
function childFun(url) {
    var downUrl = url;
    var opt = {};
    downloadImg(downUrl, path).then((dres) => {
        tryGet = 1;
        
        opt.fileName = dres.fileName;
        opt.imgPath = dres.imgPath;
        process.send(opt);
    }).catch((err) => {
        loggerErr.error('cashChild: error',err);
        loggerShow.info('cashChild：进入重试流程，等待时间，', wait / 1000, 's');
        if (tryGet < 5) {
            setTimeout(() => {
                childFun(downUrl)
            }, wait)
            tryGet++
            wait += wait;
        } else {
            tryGet = 1;
            opt.downState = 'faill';
            process.send(opt);
        }

    });
}