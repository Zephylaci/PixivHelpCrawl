
//创建路由表
function makeRouterList(config) {
    const Router = require('koa-router')()
    for (key in config) {
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




module.exports = makeRouterList;