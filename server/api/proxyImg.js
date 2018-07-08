var pathConfig = require('../../config/')['pathConfig'];
var pixivAbout = require('../../config/')['pixivConfig'];
var StringTool = require('./../../tool/main.js')['StringTool'];
var URL = require('url');
const request = require('../../tool/customRequest.js');


var mainObj={
    contrl: async (ctx, next) => {
        var Url = ctx.url;
        var key = URL.parse(Url,true).query;
        var getUrl = StringTool.hexCharCodeToStr(key.url);
        console.log(getUrl);

        var requresOpt = {
            url:getUrl,
            headers:pixivAbout.headers,
            encoding:null,
            success:function(response, imgBuffer){
                    if (response.statusCode == 200) {
                        //获取到的图片信息转存
                        ctx['content-length']=response.caseless.dict['content-length'];
                        ctx.type= 'image/jpg';
                        ctx.body = imgBuffer;
                    }
                }
        }

        var promise =  request(requresOpt);

       await promise
        // ctx.type= 'image/jpg'
        // ctx.body=ctx.req.pipe(request(requresOpt));

        


    //     var result = null;
    //     var promise = new Promise((resolve,reject)=>{
    //         request(requresOpt,function(error, response, imgBuffer){
    //             if (!error && response.statusCode == 200) {
    //                 result = imgBuffer;
    //                 resolve();
    //             }
    //         });
    //       });

    //    await promise;
   
      }
  } 
//   getUrl = 'https://i.pximg.net/img-original/img/2018/09/03/12/00/28/70522275_p0.png';
//   var requresOpt = {
//     url:getUrl,
//     headers:pixivAbout.headers,
//     encoding:null
// }       

//        request(requresOpt,function(error, response, imgBuffer){
//                 console.log('getLength',new Date().getTime());
//                 if (!error && response.statusCode == 200) {
//                     console.log('over',new Date().getTime());
//                     result = imgBuffer;
//                     console.log(result.toString().length);
//                 }

//             });      

  module.exports=mainObj