var getPixivData = require('./getPixivData.js');
var StringTool = require('./../../tool/s16.js');
process.on('message', (url)=>{
    if(url){
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
            process.send(url);
        })

    }
})