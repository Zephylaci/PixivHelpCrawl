const request = require('../../tool/customRequest.js');


var mainObj={
    postProxy: async (ctx, trueUrl) => {
            var requestData=ctx.request.body;
            var promise = request({
              type: 'POST',
              url: trueUrl,
              data: requestData
            });
            await promise.then(function (response) {
              ctx.status = 200;
              ctx.body =  response.data;
            }).catch(function (error) {
              console.log(error);
              ctx.status = 500;
              ctx.body = 'error';
            });
        
      }
  } 
     

  module.exports=mainObj