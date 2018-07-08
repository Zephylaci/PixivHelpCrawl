
const cp = require('child_process');
const judgePath = require('path');
const mySqlCtl = require('../dataBaseControl/mysqlControl.js');

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
        waitList:[],
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
                    common.waitList.push(data);
                    ctx.body.content = '云端下载中，且已将本次提交添加至队列';
                   // controlStep();
                }else{
                    ctx.body.content = '云端下载中'
                }              
          }
      } 
  },
  downImgInsertSql:downImgInsertSql
}
function downImgInsertSql(downData){
        var cashInfo = downData;
         
         var fileName =cashInfo.fileName;
         //保存图片信息和tags到数据库
         //filName 与imgPath由 下载的参数提供
         let imgId = Date.now();
         let imgTitle = cashInfo.illustTitle;
         let imgName = fileName;
         let imgOrigin = 'PiGetPixiv';
         let imgTruePath = judgePath.join(__dirname+'../../.'+cashInfo.imgPath);
         let imgPath ='/download'+fileName;
         let authorName = cashInfo.userName;
         
        var imgInsertSql={
        		type:'insert',
        		tableName:'imgStorage',
        		insertOpt:{
        			imgId:imgId,
        			imgTitle:imgTitle,
        			imgName:imgName,
        			imgOrigin:imgOrigin,
        			imgTruePath:imgTruePath,
        			imgPath:imgPath
        		}
    	   }
    	   var sqlOpt = [];

            sqlOpt.push(imgInsertSql);

    	  sqlOpt = makeTagSqlOpt(cashInfo.tags.tags,sqlOpt)
    	   function makeTagSqlOpt(tagsArr,sqlOpt){
               var length = tagsArr.length<=4?tagsArr.length:4;
            
    	       for(var i = 0;i<length;i++){
    	           let targItem = tagsArr[i];
    	           var tagInsertSql = {
                   		type:'insert',
                		tableName:'pixivTages',
                		insertOpt:{
                			tagName:targItem.tag,
                			romaji:targItem.romaji,
                			imgTitle:imgTitle,
                            authorName: authorName,
                            authorId: cashInfo.userId,
                			imgName:imgName
    
                		}
    	           }
      	           if(typeof targItem.translation!="undefined"){
    	             tagInsertSql.insertOpt.tagTrans=JSON.stringify(targItem.translation)
    	           }
    	           sqlOpt.push(tagInsertSql)
    	       }
    	       return sqlOpt
    	   }
          var judgeSqlOpt = {
        		type:'search',
        		getValue:['imgId'],
        		tableName:'imgStorage',
        		key:{imgName:imgName}
        	}
        	var sqlResult = '';
        	 mySqlCtl.contrl(judgeSqlOpt)
        	 .then((res)=>{
        		if(res.length===0){
               		//不存在才写入
            		 mySqlCtl.contrl(sqlOpt)
            		 .then((res)=>{
                        console.log(fileName,'相关信息数据库写入完成');
                	}); 
        	   }else{
        	       console.log(`getPixivData : ${fileName} 数据库中已存在信息,不重复写入`);
        	   }
        	});
    
}
function controlStep(){
    var common = mainObj.common;

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
                if(common.waitList.length===0){
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
                }else{
                    console.log('downloadControl:单次提交完成，开始下载等待队列中的数据');
                    common.dataList = common.waitList.shift();
                    common.runNum++;
                    common.limitRunNum=5;
                    oneStep();
                }
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


    var opt = {
        imgId:imgId,
        imgIdNum:imgIdNum
    }
    downChild.send(opt);
    imgIdNum++
    //去子进程中执行的函数

}

function makeprocess(imgId){
   

    if(processList.length===0){
        var downChild = cp.fork('./server/api/downChild.js',{
           //silent:true
        });
        downChild.on('message',(parames)=>{
            console.log('downloadControl:内部Id：',parames.imgIdNum,'ImgId:',parames.imgId,'下载结束');
            //写入数据库
            //以后可以写错误处理
            if(parames.downState!='faill'){
                downImgInsertSql(parames.resultData);
            }

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