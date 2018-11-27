
const pixivSearch = require('../service/pixivSearch.js');
const methodMap = {
    init:({
        clientSocket={},
    })=>{
       let keyList = pixivSearch.getList();
       let result = [];
       keyList.forEach((planKey)=>{
           let item = {};
           item.planKey = planKey;
           item.state = pixivSearch.getStateByKey(planKey);
           result.push(item);
       });
       clientSocket.local.emit('addList',{
           contents:result
       })
    },
    makeSeachPlan:({
        clientSocket={},
        data={},
    })=>{
        let {
            strKey="",
            isSafe=false,
            cashPreview=false,
            startPage=1,
            endPage=2,
            bookmarkCountLimit=100,
        } = data;

        if(typeof isSafe==='string'){
            isSafe=isSafe==='false'?false:true;
            cashPreview=cashPreview==='false'?false:true;
        }
        if(startPage>endPage){
            endPage = startPage
        }
        let planRes = pixivSearch.makePlan({
            strKey,
            isSafe,
            cashPreview,
            startPage,
            endPage,
            bookmarkCountLimit
        });
        let planKey = planRes.planKey;
        let state = pixivSearch.getStateByKey(planKey);
        let result = [
            {
                planKey,
                state,

            }
        ];
        clientSocket.local.emit('addList',{
            contents:result,
            change:planKey
        });
        let watchObj = pixivSearch.watchChange(planKey);

        watchObj.change=()=>{      
            var result = {
                planKey,
                state:pixivSearch.getStateByKey(planKey)
            }
            clientSocket.local.emit('changeState',{
                contents:result
            });
            
        }
    }
}
//每次进入的回掉
function handle (clientSocket){
    console.log('socke content:',clientSocket.id);
    clientSocket.on('disconnect', function(){
        console.log('user disconnected',this.id);
    });
    clientSocket.on('doSearch',(req)=>{
       let metod = methodMap[req.method];
       metod({
         clientSocket:this,
         data:req.data
       })
       
    });
}

module.exports = handle