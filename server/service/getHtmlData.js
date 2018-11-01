
const servicePath = '../';
const manPath = '../../';
const requireMehod = require(servicePath + 'router/refPath.js');

const request = requireMehod('request');
const fs = requireMehod('fs');
const events = requireMehod('events');

const pixivAbout = require(manPath + 'config')['pixivConfig'];
const emitter = new events.EventEmitter();
emitter.on("getHtmlOver", () => {
    mainObj.end({
        code: 200,
        data: mainObj.common.html
    });
});
emitter.on("getHtmlFaile", () => {
    mainObj.end({
        code: -1,
        data: '获取HTML失败，请检查网络连接或登陆状态'
    });
});
emitter.on("getHtmlReject", (err) => {
    mainObj.end(err);
});
var mainObj = {
    common: {
        state: null,
        html: ''
    },
    start: (opt) => {
        var url = opt.url;
        if (!url) {
            console.error('getHtmlData Error：需要参数Url');
            return;
        }
        var state = new Promise((resolve, reject) => {
            mainObj.end = resolve;
            mainObj.err = reject;
        });
        state.catch((err) => {
            console.log(err);
        })
        console.log('getHtmlData Msg:Link ' + url);
        requestHtml(url)
        //先写死
        return state;
    },
    end: () => { },
    err: () => { }
}




function requestHtml(url) {
    if (!pixivAbout.cookieAbout.cookies) {
        fs.exists(pixivAbout.cookieAbout.path, function (exists) {
            if (exists) {
                fs.readFile(pixivAbout.cookieAbout.path, "utf-8", function (err, data) {
                    if (err) {
                        emitter.emit("getHtmlFaile");
                        console.log('getHtmlData Error: Cokie文件读取失败 ');
                    }
                    else {
                        pixivAbout.cookieAbout.cookies = data
                        emitter.emit("getCookieOver", url);
                    }
                });
            }
        });
    } else {
        emitter.emit("getCookieOver", url);
    }


}

emitter.on('getCookieOver', (url) => {
    var cookies = pixivAbout.cookieAbout.cookies;
    var headers = pixivAbout.headers;
    //设置cookie
    var j = request.jar();
    var rcookie = request.cookie(cookies);
    j.setCookie(rcookie, url);
    var mainQuery = request(
        {
            url: url,
            headers: headers,
            jar: j,
            success: function (res, body) {
                if (res.statusCode == 200) {
                    console.log("getHtmlData Msg：requestHtml " + url + "读取结束");
                    var html = body;
                    mainObj.common.html = html;
                    emitter.emit("getHtmlOver");
                } else {
                    console.log("getHtmlData Msg：requestHtml " + url + "错误的返回信息");
                    console.log("getHtmlData Error：res :", res);
                    emitter.emit("getHtmlFaile");
                }

            }
        }
    )
    mainQuery.catch((err) => {
        emitter.emit("getHtmlReject", err);
    })
});


module.exports = mainObj
