// 路由设置
import Router from 'koa-router';
import { resultBean } from '../type/bean/resultBean';
import pixivClient from '../module/pixiv-api/index';
import { PassThrough, Transform } from 'stream';

const main = new Router();
main.get('/hello', async function (ctx) {
    // search_target: partial_match_for_tags标签部分一致; exact_match_for_tags标签完全一致; title_and_caption标题说明文
    // sort: date_desc按更新顺序; date_asc按旧到新顺序
    // duration: within_last_day最近1天; within_last_week最近一周; within_last_month最近1个月
    // 只能查1年的，如果不带结束日期，默认查近1年
    // startDate: 起始查找时间
    // endDate:结束时间

    // userId 无效

    // const res = await pixivClient.searchIllust();

    const res = await pixivClient.illustRanking({
        date: '2022-07-12',
        mode: 'week_r18g'
    } as any);

    // 大多数筛选条件都无效
    // const res = await pixivClient.userIllusts(4035090, {
    //     sort: 'date_asc',
    //     startDate:'2022-07-01'
    // });

    ctx.body = new resultBean({
        code: 200,
        contents: res,
        text: ''
    });
});

main.post('/log', async function (ctx) {
    const params: any = ctx.request.body;
    ctx.body = null;
    console.log('check log:', params);
});

class SSEStream extends Transform {
    id = 1;
    constructor() {
        super({
            writableObjectMode: true
        });
    }

    _transform({ data, type = 'message', id, ...other }, _encoding, done) {
        if (!id) {
            id = this.id++;
        }
        data = data ? { ...data, ...other } : { ...other };
        this.push(`id: ${id}\n`);
        this.push(`event: ${type}\n`);
        this.push(`data: ${JSON.stringify(data)}\n\n`);
        done();
    }
}

main.get('/ping', async function (ctx) {
    // 超时时间设置
    // ctx.request.socket.setTimeout(0);
    // 优化吞吐量
    // ctx.req.socket.setNoDelay(true);
    // 设置保持连接探测
    // ctx.req.socket.setKeepAlive(true);

    ctx.set({
        'Content-Type': 'text/event-stream',
        // 不加no-transform的话可能会在转发时被压缩
        'Cache-Control': 'no-cache, no-transform',
        // 不走反向代理的缓存
        'X-Accel-Buffering': 'no',
        Connection: 'keep-alive'
    });

    const stream = new PassThrough();
    const interval = setInterval(() => {
        // \n 单条信息换行 \n\n 单条信息结束
        // 指定信息的id
        stream.write(`id: 1\n`);
        // 指定信息的类型（type）
        stream.write(`event: message\n`);
        // 实际响应的数据
        stream.write(`data: {"time":"${new Date().getTime()}"}\n\n`);
    }, 1000);
    stream.on('close', () => {
        clearInterval(interval);
    });

    ctx.status = 200;
    ctx.body = stream;
});

main.get('/pingSub', async function (ctx) {
    ctx.set({
        'Content-Type': 'text/event-stream',
        // 不加no-transform的话可能会在转发时被压缩
        'Cache-Control': 'no-cache, no-transform',
        // 不走反向代理的缓存
        'X-Accel-Buffering': 'no',
        Connection: 'keep-alive'
    });

    const stream = new SSEStream();
    const interval = setInterval(() => {
        stream.write({
            time: new Date().getTime()
        });

        stream.write({
            type: 'other',
            data: {
                a: 1,
                b: 2,
                c: 3
            }
        });
    }, 1000);
    stream.on('close', () => {
        clearInterval(interval);
    });

    ctx.status = 200;
    ctx.body = stream;
});

export default main.routes();
