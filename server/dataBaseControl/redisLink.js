const env = require('../../config/index.js')['redisConfig'];
const redis = require('redis');
//var redisStore = require('koa-redis');

//var options = {client: client,db:1};
//var store = redisStore(options);
var main = {
  client: null,
  autoClose: null,
  wait: 120000, //两分钟没有请求自动断开
  deal: (params) => {
    global.clearTimeout(main.autoClose);
    main.autoClose = null;
    main.checkLink();
    return main.client;
  },
  delayQuit: () => {
    if (main.autoClose === null) {
      main.autoClose = setTimeout(() => {
        if (main.client.ready === true) {
          main.end();
          var state = main.client.ready;
          console.log(new Date().toLocaleTimeString(), 'redis连接关闭连接，当前连接状态:', state);
        } else {
          var state = main.client;
          console.log(new Date().toLocaleTimeString(), '未预料的关闭请求:', state);
        }

        if (main.autoClose != null) {
          global.clearTimeout(main.autoClose);
          main.autoClose = null;
        }


      }, main.wait)
    }

  },
  checkLink: () => {
    if (main.client === null || main.client.ready === false || main.client.ready === undefined) {
      var linkOpt = {
        host: env.host,
        port: env.port,
        password: env.passwd
      }
      main.client = redis.createClient(linkOpt);
      main.client.on("error", function (err) {
        console.log("Error :" + err);
      });
      console.log(new Date().toLocaleTimeString(), 'redis连接');
      if (main.autoClose !== null) {
        global.clearTimeout(main.autoClose);
        main.autoClose = null;
      }
    } else {
      console.log(new Date().toLocaleTimeString(), 'redis 连接保持');
    }
  },
  end: function () {
    if (main.client.ready === true) {
      main.client.quit();
      global.clearTimeout(main.autoClose);
      main.autoClose = null;
      console.log(new Date().toLocaleTimeString(), 'redis连接主动关闭');
    } else {
      console.log(new Date().toLocaleTimeString(), 'redis连接 已经关闭:');
    }
  }

}


module.exports = main;