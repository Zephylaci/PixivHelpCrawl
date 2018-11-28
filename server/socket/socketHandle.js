const doSearch = require('./doSearchMethod.js');
const controlCrawler = require('./controlCrawlerMethod.js');





//每次进入的回掉
function handle (clientSocket){
    console.log('socke content:',clientSocket.id);
    clientSocket.on('disconnect', function(){
        console.log('user disconnected',this.id);
    });
    clientSocket.on('doSearch',(req)=>{
       let metod = doSearch[req.method];
       metod({
         clientSocket:this,
         data:req.data
       })
       
    });
    clientSocket.on('controlCrawler',(req)=>{
        let metod = controlCrawler[req.method];
        metod({
            clientSocket:this,
            data:req.data
        })
    });
}

module.exports = handle