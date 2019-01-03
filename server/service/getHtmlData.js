
const servicePath = '../';
const manPath = '../../';
const requireMehod = require(servicePath + 'router/refPath.js');

const request = requireMehod('request');
const fs = requireMehod('fs');


const pixivAbout = require(manPath + 'config')['pixivConfig'];

class getPixivHtmlClass {
    constructor() {
    }
    start(opt) {
        var url = opt.url;
        if (!url) {
            console.error('getHtmlData Error：需要参数Url');
            return;
        }
        let queryObj = this;
        var state = new Promise((resolve, reject) => {
            queryObj.end = resolve;
            queryObj.err = reject;
        });
        state.catch((err) => {
            queryObj.end({
                code: 500,
                data: null
            });
        })
        console.log('getHtmlData Msg:Link ' + url);
        queryObj.requestHtml(url).then(({response={statusCode:500},content=''}={}) => {
            if (response.statusCode == 200) {
                console.log("getHtmlData Msg：requestHtml " + url + "读取结束");
                queryObj.end({
                    code: 200,
                    data: content
                });
            } else {
                console.log("getHtmlData Msg：requestHtml " + url + "错误的返回信息");
                console.log("getHtmlData Error：res :", res);
            }
        }).catch((err)=>{
            queryObj.end({
                code: 500,
                data: null
            });
        })
        return state;
    }
    requestHtml(url) {
        if (pixivAbout.cookieAbout.cookies === null) {
            var exists = fs.existsSync(pixivAbout.cookieAbout.path);
            if (exists) {
                var data = fs.readFileSync(pixivAbout.cookieAbout.path, "utf-8")
                pixivAbout.cookieAbout.cookies = data;
            }
        }

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
            }
        )

        return mainQuery
    }
}



module.exports = {
    getPixivHtmlClass
}
