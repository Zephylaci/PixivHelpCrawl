// 路由设置
import Router from 'koa-router';
import ranking from './ranking';
import search from './search';
import proxy from './proxy';
import tags from './tags';
import authors from './authors';
import images from './images';

const main = new Router();
main.prefix('/pixiv');
main.use(ranking);
main.use(search);
main.use(proxy);
main.use(tags);
main.use(images);
main.use(authors);

export default main.routes();
