const doSearchMethod = require('./doSearchMethod.js');
const controlCrawlerMethod = require('./controlCrawlerMethod.js');
const synchronousMethod = require('./synchronousMethod.js')
const {loggerShow} = require('../utils/logger');

const handleConfig=[
    {
       key:'doSearch',
       methodMap:doSearchMethod

    },
    {
       key:'controlCrawler',
       methodMap:controlCrawlerMethod

    },
    {
       key:'synchronous',
       methodMap:synchronousMethod

    }
]
//每次进入的回掉
function handle (clientSocket){
    loggerShow.info('socke content:',clientSocket.id);
    clientSocket.on('disconnect', function(){
        loggerShow.info('user disconnected',this.id);
    });
    maekSocketEvent({
        clientSocket,
        handleConfig,
    })
}

function maekSocketEvent({
    clientSocket,
    handleConfig,
}){
    handleConfig.forEach((item)=>{
        clientSocket.on(item.key,(req)=>{
            let metod = item.methodMap[req.method];
            metod({
                clientSocket:clientSocket,
                data:req.data
            })
        })
    })
}

module.exports = handle