const downloadImg = require('../downloadImg.js');
var tryGet = 1;
var wait = 5000;

process.on('message', (opt) => {
    childFun(opt)
});
function childFun(opt) {
    var downUrl = opt.url;
    var path = opt.path;
    downloadImg(downUrl, path).then((dres) => {
        tryGet = 1;

        opt.fileName = dres.fileName;
        opt.imgPath = dres.imgPath;
        process.send(opt);
    }).catch((err) => {
        console.log('cashChild：进入重试流程，等待时间，', wait / 1000, 's');
        if (tryGet < 5) {
            setTimeout(() => {
                childFun(parames)
            }, wait)
            tryGet++
            wait += wait;
        } else {
            tryGet = 1;

            parames.downState = 'faill';
            process.send(parames);
        }

    });
}