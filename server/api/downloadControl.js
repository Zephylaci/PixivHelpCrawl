
var cp = require('child_process');

function resetCommon(){
    mainObj.common.runStat=false;
    mainObj.common.over=false;
    mainObj.common.dataList=[];
    mainObj.common.runNum=0;
    mainObj.common.limitRunNum=5;

}

var mainObj = {
    common:{
        runStat:false,
        over:false,
        dataList:[],
        runNum:0,
        limitRunNum:5
    },
    contrl: async (ctx, next) => {
    ctx.body = {
      code: 200,
      content:'为啥没有返回值..'
    }
    //这里可以重构
      var common = mainObj.common;
       console.log(ctx.request.body);     
     var data = JSON.parse(ctx.request.body.downList);
      if(common.runStat===false){
          if(data.length!=0){
             common.runStat=true;
            mainObj.common.dataList=data;
            ctx.body.content = '本次云端下载已开始'
            controlStep();  
          }else{
            ctx.body.content = '云端已就绪'  
          }
      }else{
          if(common.over===true){
            resetCommon();
            if(data.length!=0){
                common.runStat = true;
                common.dataList=data;
                ctx.body.content = '上次提交云端已下载完成，且本次下载已开始';
                controlStep();
            }else{
                ctx.body.content = '上次提交云端已下载完成，下次可以提交新的数据下载';
            }

          }else{
                if(data.length!=0){
                    var data = JSON.parse(ctx.request.body.downList);
                    common.dataList=common.dataList.concat(data);
                    ctx.body.content = '云端下载中，且已将本次提交添加至队列';
                    controlStep();
                }else{
                    ctx.body.content = '云端下载中'
                }              
          }
      } 
  }
}
function controlStep(){
    var common = mainObj.common;
    var  downList = mainObj.common.dataList;
    if(common.dataList.length<common.limitRunNum){
        common.limitRunNum=common.dataList.length;
    }
    //  console.log(common.dataList.length,common.runNum,common.limitRunNum);
    if(common.dataList.length!=0&&common.limitRunNum!=0){

        while(common.runNum<common.limitRunNum){
                common.runNum++;
                oneStep();
            }
        }else{
            if(common.runNum===0){
                 common.over = true;
                 console.log('downloadControl:整体下载完成，云端空闲');
                 if(processList.length!==0){
                     var length = processList.length;
                     for(var i = 0;i<length;i++){
                         var childProcess = processList.shift(); 
                         childProcess.disconnect();
                         console.log('downloadControl:释放 childe_process');
                     }
                 }
                 console.log('downloadControl:process释放执行完成')

            }
        }
   
}
//线程池
var processList = [];
var imgIdNum = 0;
function oneStep(){
    var common = mainObj.common;
    var item = common.dataList.shift();
    var imgId = item.illust_id;
    console.log('downloadControl:内部Id：',imgIdNum,'ImgId:',imgId,'下载开始');
   
    var downChild = makeprocess(imgId);

    function childFun(parames){
        var imgId = parames.imgId;
        var imgIdNum = parames.imgIdNum;
        var StringTool = require('./../../tool/s16.js');
        var getPixivData = require('./getPixivData.js');
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
            .then(()=>{
            process.send(parames);
       })
    }
    var callBackStr = childFun.toString();
    var opt = {
        parames:{
            imgId:imgId,
            imgIdNum:imgIdNum
        },
        callBackStr:callBackStr
    }
    downChild.send(opt);
    imgIdNum++
    //去子进程中执行的函数

}

function makeprocess(imgId){
   

    if(processList.length===0){
        var downChild = cp.fork('./server/api/downChild.js',{
           silent:true
        });
        downChild.on('message',(parames)=>{
            console.log('downloadControl:内部Id：',parames.imgIdNum,'ImgId:',parames.imgId,'下载结束');
            var common = mainObj.common
            common.runNum --;
            if(common.dataList.length===0&&common.runNum===0){
                downChild.disconnect();
            }else{
                if(processList.length>common.limitRunNum){
                    downChild.disconnect();
                }else{
                    processList.push(downChild); 
                }     
            }
            controlStep();
        });
        downChild.on('close',(code)=>{
           console.log('downloadControl:','downChild子进程close，剩余空闲process:',processList.length);
        });

        downChild.on('disconnect',()=>{
           console.log('downloadControl:','downChild子进程disconnect，剩余空闲process:',processList.length);
        });
        return downChild;
    }else{
        return processList.shift();
    }

}
module.exports = mainObj;