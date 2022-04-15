import * as Koa from 'koa';
import * as json from 'koa-json';
import * as onerror from 'koa-onerror';
import * as bodyparser from 'koa-bodyparser';
import * as staticServer from 'koa-static-server';
import * as gzip from 'koa-compress';
import apiRouter from '../router/api-routers';

const mainConfig = require('../../config/index');
const pathConfig = mainConfig['pathConfig'];

import { loggerShow, loggerErr, loggerRes } from '../utils/logger';
import generalResult from '../middleware/generalResult';

const app = new Koa();

onerror(app);
app.use(
    gzip({
        filter: function (content_type) {
            return /(javascript|text)/i.test(content_type);
        },
        threshold: 2048,
        flush: require('zlib').Z_SYNC_FLUSH
    })
);

app.use(
    bodyparser({
        enableTypes: ['json', 'form', 'text']
    })
);
app.use(json());

// logger
app.use(async (ctx, next) => {
    const start = new Date().getTime();
    generalResult(ctx);
    await next();
    const ms = new Date().getTime() - start;

    loggerRes.info(`${ctx.method} ${ctx.url} - ${ms}ms - ${ctx.status}`);
});

app.use(apiRouter);

// 读取前端文件
app.use(
    staticServer({
        rootDir: pathConfig.webPath,
        rootPath: '/'
    })
);

// error-handling
app.on('error', (err, ctx) => {
    loggerErr.error('server error', err, ctx);
});

export default app;