// 路由设置
import * as Router from 'koa-router';
import { resultBean } from '../type/bean/resultBean';
import pixivClient from '../module/pixiv-api/index';

const main = new Router();
main.get('/hello', async function (ctx) {
    ctx.body = new resultBean({
        code: 200,
        contents: pixivClient.authInfo(),
        text: ''
    });
});

export default main.routes();
