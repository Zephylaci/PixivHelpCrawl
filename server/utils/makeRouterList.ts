import * as BashRouter from 'koa-router';
const Router = BashRouter();
//创建路由表
export function makeRouterList(config) {
    
    for (let key in config) {
        var item = config[key];
        var type = item.type;
        if (type === 'post') {
            Router.post('/' + key, item.contrl)
        } else if (type === 'get') {
            Router.get('/' + key, item.contrl)
        }
    }
    return Router;
}