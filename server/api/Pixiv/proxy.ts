import * as Router from 'koa-router';
import got from 'got';
import * as httpsProxyAgent from 'https-proxy-agent';
import * as fs from 'fs-extra';
import * as Path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { pathConfig } from '../../../config';
import { gotImgInstance } from '../../utils/gotPixivImg';
import { parseTarget, getTargetCash, saveGotImgStream } from '../../service/pixivImgProxy';

const BasePath = pathConfig.cashPath;
fs.ensureDirSync(BasePath);
const pipeline = promisify(stream.pipeline);

const baseUrl = 'https://i.pximg.net/';
let instance = got.extend({
    prefixUrl: baseUrl,
    headers: {
        Referer: 'http://www.pixiv.net',
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
    },
    agent: {
        https: httpsProxyAgent('http://192.168.10.106:8118')
    }
});

const main = new Router();

main.get('/proxy/:target*', async function (ctx) {
    const { target } = ctx.params;
    const info = parseTarget(target);
    const cash = getTargetCash(info);

    if (cash) {
        ctx.set('content-type', 'image');
        ctx.body = cash;
    } else {
        ctx.body = gotImgInstance.stream(target, { throwHttpErrors: false });
    }
});

main.get('/proxy-save/:target*', async function (ctx) {
    const { target } = ctx.params;

    const info = parseTarget(target);
    const cash = getTargetCash(info);

    if (cash) {
        ctx.set('content-type', 'image');
        ctx.body = cash;
    } else {
        const readStream = gotImgInstance.stream(target, { throwHttpErrors: false });
        saveGotImgStream({
            readStream,
            path: info.targetPath
        });

        ctx.body = readStream;
    }
});

export default main.routes();
