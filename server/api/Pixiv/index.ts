// 路由设置
import * as Router from 'koa-router';
import ranking from './ranking';
import search from './search';
import proxy from './proxy';

const main = new Router();
main.prefix('/pixiv');
main.use(ranking);
main.use(search);
main.use(proxy);

export default main.routes();
