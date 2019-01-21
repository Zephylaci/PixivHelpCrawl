import {redisConfig as env} from '../../config/index.js';
import * as redis from 'redis';
//var redisStore = require('koa-redis');
//var options = {client: client,db:1};
//var store = redisStore(options);
let {loggerErr,loggerShow} = require('../utils/logger')
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
        loggerErr.warn('redisLink: redis连接 超时');
        if (main.client.ready === true) {       
          main.end();
          var state = main.client.ready;
        } else {
          var state = main.client;
          loggerErr.warn('redisLink:  redis连接 未预料的关闭请求:', state);
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
        loggerErr.error("redisLink: Error" + err);
      });
      loggerShow.info("redisLink: redis连接");
      if (main.autoClose !== null) {
        global.clearTimeout(main.autoClose);
        main.autoClose = null;
      }
    }
  },
  end: function () {
    if (main.client.ready === true) {
      main.client.quit();
      global.clearTimeout(main.autoClose);
      main.autoClose = null;
      loggerShow.info("redisLink: redis连接 主动关闭");
    } else {
      loggerShow.warn("redisLink: redis连接 已经关闭");
      
    }
  }

}


module.exports = main;