
import * as fs from 'fs';

let {logger,loggerErr,loggerShow} = require('../utils/logger')
import { pixivConfig as pixivAbout } from '../../config';
import customRequest from '../utils/customRequest';

export class getPixivHtmlClass {
    constructor() {
    }
    start(opt) {
        var url = opt.url;
        if (!url) {
            loggerErr.error('getHtmlData Error：需要参数Url');
            return;
        }
        let queryObj:any = this;
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
        loggerShow.info('getHtmlData Msg:Link ' + url);
        queryObj.requestHtml(url).then(({response={statusCode:500},content=''}={}) => {
            if (response.statusCode == 200) {
                loggerShow.info("getHtmlData Msg：requestHtml " + url + "读取结束");
                queryObj.end({
                    code: 200,
                    data: content
                });
            } else {
                loggerShow.error("getHtmlData Msg：requestHtml " + url + "错误的返回信息");
                loggerErr.error(response);
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
        var j = customRequest.jar();
        var rcookie = customRequest.cookie(cookies);
        j.setCookie(rcookie, url);
        var mainQuery = customRequest(
            {
                url: url,
                headers: headers,
                jar: j,
            }
        )

        return mainQuery
    }
}



