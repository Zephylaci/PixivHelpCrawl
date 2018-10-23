const servicePath = '../../'
const downloadImg = require('../downloadImg.js');

const StringTool = require(servicePath+'utils/stringTool.js');
const getPixivData = require('../getPixivData.js');
process.on('message', (opt)=>{

    childFun(opt); 
});
var tryGet = 1;
var wait = 5000;
function childFun(parames){
    var imgId = parames.imgId;
    var imgIdNum = parames.imgIdNum;

    var url = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${imgId}`;
    var upUrl = StringTool.strToHexCharCode(url);
    var fakeCtx={
        request:{
            body:{
                Url:upUrl
            }
        }
    }

    getPixivData.contrl(fakeCtx)
        .then((res) => {
            tryGet = 1;
   
            parames.resultData = res;
            var downUrl = res.urls.original;
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