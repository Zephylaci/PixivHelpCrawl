const controlCash = require('../service/controlCash.js');
let delPlanStore={};

const methodMap = {
    init:({
        clientSocket={},
    })=>{
       let result = controlCash.getPreViewState(['count','totalSize','firstCreat']);
        result.totalSize = Math.ceil(result.totalSize/1048576);
        result.firstCreat = new Date(result.firstCreat).toLocaleString();
        clientSocket.local.emit('controlCrawler-changePreViewState',{
            contents:result
        });
        controlCash.getRedisState().then((res)=>{
            console.log(res);
            var result = {
                count:res.totalCount
            }
            clientSocket.local.emit('controlCrawler-changeRedisState',{
                contents:result
            });
        });
        
    },
    delPreView:({
         clientSocket={},
         data={},
    })=>{
       let beforeTimeDate = new Date(data.beforeTime).getTime();

       let result =  controlCash.makeViewDelList({
            beforeTime:beforeTimeDate
        });
        let planKey = new Date().getTime();
        clientSocket.local.emit('controlCrawler-delCheck',{
            contents:{
                planKey,
                conut:result.count,
                delCount:result.delCount,
                beforeTime:data.beforeTime
            }
        });
    }
}
module.exports = methodMap