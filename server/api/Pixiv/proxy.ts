import  Router from 'koa-router';
import { gotImgInstance } from '../../utils/gotPixivImg';
import { parseTarget, getTargetCash, saveGotImgStream } from '../../service/pixivImgProxy';

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
