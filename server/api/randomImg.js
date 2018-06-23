var fs = require('fs');
var pathConfig = require('../../config/')['pathConfig'];

var mainObj={
    contrl: async (ctx, next) => {
        var imgName = '69406763_p0.png';
        var imgPath = pathConfig.downloadPath;
        var promise = new Promise((resolve,reject)=>{
            fs.readdir(imgPath,function(err,files){
                var length = files.length;
                var getIndex = Math.round(Math.random()* (length-1))
                imgName = files[getIndex]
                resolve();
            });
          });
        await promise
        ctx.type= 'image/jpg'
        var result =  fs.readFileSync(`${imgPath}/${imgName}`)
        ctx.body = result;
      }
  } 

  module.exports=mainObj