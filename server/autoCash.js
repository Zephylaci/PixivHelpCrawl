const redisConfig = require('../config/index.js')['redisConfig'];
const autoCash = redisConfig['autoCash'];
if(redisConfig.useCash===false||autoCash.enable===false){
    return
}


const events = require('events');
const cp = require('child_process');
let emitter = new events.EventEmitter();

var timePlan = null; //定时器
var cashOver = false;
//程序入口
makePlan();

emitter.on('startCash',startCash);
emitter.on('makePlan',makePlan);




function startCash(){
    //开始缓存
    let plan = autoCash.plan;
    let deep = autoCash.deep;
    let linkList = makeLinkList(plan,deep);

    let checkOver = global.setTimeout(function(){
        console.log('autoCash：15分钟经过，缓存过程超时');
        var existProcess= processMain.allCreate;
        var length = existProcess.length;
        for(var i = 0;i<length;i++){
            var process = existProcess.shift();
           if(process.connected===true){
               process.kill();
           }
        }
        console.log('autoCash：清空子线程30S后重新启动缓存过程');
        global.setTimeout(function(){
             startCash();
        },30000)

    },900000)

    let processMain = {
        linkList:linkList,
        allCreate:[], //方便清空
        processList:[], //线程池
        limitNum:2, //并发限制
        runNum:0, //正在运行的
        controlStep:function(){
            let linkList = processMain.linkList;

            
            if(linkList.length<processMain.limitNum){
                processMain.limitNum =linkList.length;
                if(linkList.length>0){
                    processMain.runNum++;
                    processMain.oneStep();
                }

            }
             console.log('Start缓存过程状态：队列中：',processMain.linkList.length,'运行中:',processMain.runNum,'限制数：',processMain.limitNum);
            if(processMain.linkList.length!=0&&processMain.limitNum!=0){
                while(processMain.runNum<processMain.limitNum){
                        processMain.runNum++;
                        processMain.oneStep();
                    }
                }else{
                    if(processMain.runNum===0){
                        if(linkList.length===0){
                            console.log('autoCash:缓存完毕！');
                            let processList=processMain.processList;

                            if(processList.length!==0){
                                var length = processMain.processList.length;
                                for(var i = 0;i<length;i++){
                                    var childProcess = processList.shift(); 
                                    childProcess.disconnect();
                                    console.log('autoCash:释放 childe_process');
                                }
                            }
                            //清楚检查函数
                            processMain.allCreate = [];
                            global.clearTimeout(checkOver);
                            checkOver=null;
                            cashOver = true;
                              emitter.emit("makePlan");
                            console.log('autoCash:process释放执行完成')
                        }else{
                            console.log('autoCash: 单次提交完成，开始下一次缓存');
                            linkList = linkList.shift();
                            processMain.runNum++;
                            processMain.limitNum=3;
                            processMain.oneStep();
                        }
                    }
            }
            
        },
        oneStep:function(){
            var url = processMain.linkList.shift();
            console.log(`autoCash: ${url} 缓存开始`);
           
            var downChild = processMain.makeprocess();
        
            var opt = {
                url:url
            }
            downChild.send(opt);
        },
        makeprocess:function(){
            let  processList=processMain.processList
            if(processList.length===0){
                var downChild = cp.fork('./server/service/process/cashChild.js',{
                   silent:true
                });
                
                
                processMain.allCreate.push(downChild);

                downChild.on('message',(parames)=>{
                    console.log(`autoCash process: ${parames.url} 缓存过程结束`);
                    processMain.runNum --;
                    console.log('END缓存过程状态：','队列中：',processMain.linkList.length ,'运行中:',processMain.runNum)
                    if(processMain.linkList.length===0&&processMain.runNum===0){
                        downChild.disconnect();
                    }else{
                        if(processMain.processList.length>processMain.limitNum){
                            downChild.disconnect();
                        }else{
                            processList.push(downChild); 
                        }     
                    }
                    processMain.controlStep();
                });
                downChild.on('close',(code)=>{
                   console.log('autoCash process:','downChild子进程close，剩余空闲process:',processMain.processList.length);
                });
        
                downChild.on('disconnect',()=>{
                   console.log('autoCash:','downChild子进程disconnect，剩余空闲process:',processMain.processList.length);
                });
                return downChild;
            }else{
                return processList.shift();
            }
        }
    }
    
    processMain.controlStep();
    
    function makeLinkList(plan,deep){
        var linkList = [];
        for(var i=0;i<plan.length;i++){
            for(var j=1;j<=deep;j++){
                let type = plan[i];
                let page = j;
                let baseUrl = `https://www.pixiv.net/ranking.php?format=json&${type}&p=${page}`;
                linkList.push(baseUrl);
            }
        }
        
        return linkList
    }
}

function makePlan(){
	if(timePlan!=null){
		return;
	}
    let runDateConfig = autoCash.runDate.split(':');
    let now=new Date().getTime();
    let runDeate = new Date().setHours(Number(runDateConfig[0]),Number(runDateConfig[1]),Number(runDateConfig[2]));
    let wait = runDeate-now;
    console.log('autoCash makePlan in wait:',wait)
    if(wait<0){
        if(cashOver===false){
            global.setTimeout(()=>{
                emitter.emit("startCash");
            },2000);
        }
        wait+=86400000
    }

	timePlan = global.setTimeout(function(){
		timePlan = null;
		cashOver = false;
		emitter.emit("startCash");
	},wait);
}





