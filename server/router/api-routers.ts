import * as Router from 'koa-router';
import Hello from '../api/hello';
import Pixiv from '../api/Pixiv/index';
const router = new Router();
router.prefix('/api');

router.use(Hello);
router.use(Pixiv);
export default router.routes();
