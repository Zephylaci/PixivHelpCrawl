var url = 'https://www.pixiv.net/ranking.php?format=json&mode=daily&p=2';
const request = require('../tool/customRequest.js');

const axios = require('axios');

function requireTest(url){
    var promies = new Promise((resovle,rej)=>{
         start = new Date().getTime();;
        console.log('start',start)
        request({
            url:url
        }).then((data)=>{
            console.log(data);
            resovle();
        })
    })
    return promies;

}

function axiosTest(url){
    var promies = new Promise((resovle,rej)=>{
         start = new Date().getTime();;
        console.log('start',start)
        var axiosPromise = axios({
            method: 'get',
            url: url
          });
          axiosPromise.then((res)=>{
            console.log(res);
            resovle();
          })
    })
    return promies;

}
requireTest(url).then((body)=>{
    end = new Date().getTime();
    
   console.log(end-start)
})

//const env = require('../config/index.js')['redisConfig'];
//const redis = require('redis');
//
//    var client = {};
//    var linkOpt = {
//        host:env.host,
//        port:env.port,
//        password:env.passwd
//    }
//    
//    client = redis.createClient(linkOpt);
//    
//    client.on("error", function (err) {
//        console.log("Error " + err);
//    });
//    var result = null
//
//    client.HSET("test2",'testValue',JSON.stringify({test:1}),function(err,replies){
//      if(err){
//          console.log(err);
//      }
//      console.log(replies);
//         
//    });
//
//
//
//function makePromise(createObj){
//    let commond = createObj.commond;
//    let callback = createObj.callback;
//    
//}




