const servicePath = '../../'
const downloadImg = require('../downloadImg.js');


const getPixivData = require('../getPixivData.js');
process.on('message', (opt)=>{

    childFun(opt); 
});
let tryGet = 1;
let wait = 5000;
function childFun(parames){
    let imgId = parames.imgId;

    let queryUrl = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${imgId}`;

    getPixivData.contrl(queryUrl)
        .then((res) => {
            tryGet = 1;
   
            parames.resultData = res;
            let downUrl = res.urls.original;
            if (downUrl){
                downloadImg(downUrl).then((dres) => {
                    parames.resultData.fileName = dres.fileName;
                    parames.resultData.imgPath = dres.imgPath;
                    process.send(parames);
                })
            }

        }).catch((err) => {
            console.log('downChild：进入重试流程，等待时间，', wait / 1000, 's');
            if (tryGet < 5) {
                console.log(parames,err);
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