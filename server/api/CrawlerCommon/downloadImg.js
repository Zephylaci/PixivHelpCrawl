/**
*  下载模块 v 0.1
*  功能：根据url下载文件到指定文件夹 
*        
**/
const request = require('../../../tool/customRequest.js');
const fs = require('fs');
const handleUrl = require('url');

var pixivAbout = require('../../../config')['pixivConfig'];
var pathConfig = require('../../../config')['pathConfig'];
var checkImg = require('../ImgControler/checkImg.js');

var events = require('events');
var emitter = new events.EventEmitter();

//if (!fs.existsSync(pathConfig.downloadPath)) fs.mkdirSync(pathConfig.downloadPath);

var wait = 30000;
var waitTimer = null;



function downLoadMethod (url,upPath){

    var urlObj = handleUrl.parse(url);  
    var fileName = urlObj.path.slice(urlObj.path.lastIndexOf('/'));
    var imgPath = pathConfig.downloadPath+fileName;
    if(upPath){
        imgPath = upPath+fileName;
    }
   

    var promise = new Promise((resolve,reject)=>{
      var Option ={
        mainDownloadEnd:resolve,
        headers:pixivAbout.headers,
        url:url,
        fileName:fileName,
        imgPath:imgPath,
        runNum:1
      } 
      if(checkImg(imgPath)){
        console.log('downLoadImg:文件 '+fileName+' 存在且已经下载完全.');
        emitter.emit('downOver',Option);
      }else{
        downMethod(Option);
      }


    });
    return promise; 
}

function downMethod(Option){
    if(waitTimer!=null){
        global.clearTimeout(waitTimer);
        waitTimer = null;
    }
    if(Option.runNum===1){
        wait = 5000;
    }

    var fileName = Option.fileName;
  	var imgPath = Option.imgPath;
    var requresOpt = {
        url:Option.url,
        headers:Option.headers
    }
    var stream = fs.createWriteStream(Option.imgPath);
    var downRequest= request(requresOpt);
    downRequest.catch(()=>{
        console.log('downLoadImg:文件 '+fileName+'下载失败，发生错误'); 
        emitter.emit('tryAgain',Option);
    });
    var pipe = downRequest.pipe(stream);
    pipe.on('error', e => {
        console.log('downLoadImg:文件 '+fileName+'下载失败，发生错误：',e); 
        emitter.emit('tryAgain',Option);

    });
    pipe.on('finish',()=>{
        if(checkImg(imgPath)){
            console.log('downLoadImg:文件 '+fileName+'下载完成！下载次数：'+Option.runNum);
            emitter.emit('downOver',Option);
        }else{
            console.log('downLoadImg:文件 '+fileName+'下载失败，文件不完全');
            emitter.emit('tryAgain',Option);

        }

    });
}
emitter.on('downOver',(Option)=>{
   Option.mainDownloadEnd(Option);
});

emitter.on('tryAgain',(Option)=>{
   console.log('downLoadImg：进入重试流程，等待时间，',wait/1000,'s');

   if(Option.runNum<4){
       if(waitTimer===null){
            waitTimer = global.setTimeout(()=>{
                Option.runNum ++;
                console.log('downLoadImg:文件 '+Option.fileName+'尝试第：'+Option.runNum+'次重下');
                downMethod(Option);

                wait=wait+wait;
            },wait);
       }else{
        console.log('downLoadImg:文件 '+Option.fileName+'已经创建等待任务');
       }

   }else{
        console.log('downLoadImg:文件下载失败，已尝试：'+Option.runNum+'次重下');
        Option.downState = 'faill'
        Option.mainDownloadEnd(Option);
   }
  
});
module.exports = downLoadMethod;