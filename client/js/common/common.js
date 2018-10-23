/*
*  页面需要
*  从inserConfig 中挂到COMMON上的routerConfig
*  行为:COMMON中挂上pageHandle,mainPage
*  变更说明：
*   原本是打算在这里载入jq,mdui基本组件，碍于性能，去掉了。
*/
// 模拟3g fast 载入
// 不动态载入是2.86s
// 部分动态串行是4.85s
// 全动态串行是6.85
// 全动态并行（无法直接运行） 4s左右
(function () {
    //需要的
    var routerConfig = window.COMMON.routerConfig;

    function pageHandle(callback = function () {
        console.log(this); //this指向新对象

        this.checkOver = true
    }) {
        this.checkOver = false;
        this.callback = callback
    }
    pageHandle.prototype = {};
    var menthd = pageHandle.prototype

    menthd.InsertMethod = function ({ //检查是否载入过对应资源
        js = [],
        css = [],
        needUnit = [],
    }, jsInsertType = 'async', callback = this.callback.bind(this)) {
        if (needUnit.length != 0) {
            // routerConfig.UNIT 组件库配置
            var mainJs = js;
            var syncJs = [];
            var syncCss = css; //实际上css都是sync的只是为了命名统一
            for (var i = 0, l = needUnit.length; i < l; i++) {
                var unitKey = needUnit[i];
                syncJs = syncJs.concat(routerConfig.UNIT[unitKey].js);
                syncCss = routerConfig.UNIT[unitKey].css.concat(syncCss);
            }
            delete i, l;
            //Unit,及MainCss并行载入后再载入自身元素提高载入效率
            this.InsertMethod({
                js: syncJs,
                css: syncCss,
            }, 'sync', () => {
                this.InsertMethod({
                    js: mainJs
                })
            });
            return

        }

        //js
        var scriptContent = document.getElementsByTagName("body").item(0);
        var i = 0, last = js.length - 1;;
        function makeScript(i, overFun) {
            var jsScript = document.createElement("script");
            jsScript.setAttribute("type", "text/javascript");
            jsScript.onload = jsScript.onreadystatechange = function () { //Attach handlers for all browsers
                this.onload = this.onreadystatechange = null;
                if (typeof overFun === 'function') {
                    overFun(i);
                }
            }
            jsScript.setAttribute("src", js[i]);
            scriptContent.appendChild(jsScript);
        }

        if (jsInsertType === 'async') {
            //串行
            makeScript(i, (i) => {
                if (i !== last) {
                    
                    makeScript(++i);
                } else if (typeof (callback) == "function") {
                    callback();
                    delete i;
                }
            });
        } else if (jsInsertType === 'sync') {
            //并行
            
            for (i = i, l = js.length; i < l; i++) {
                makeScript(i, (i) => {
                    if (i === last && typeof (callback) == "function") {
                        callback();
                    }
                })
            }
            delete i, l;
        }




        var cssContent = document.getElementsByTagName("head").item(0);
        function makeCssLink(i) {
            cssLink = document.createElement("link");
            cssLink.setAttribute("rel", "stylesheet");
            cssLink.setAttribute("href", css[i]);
            cssContent.appendChild(cssLink);
        }
        //css 并行载入
        for (var i = 0, l = css.length; i < l; i++) {
            makeCssLink(i)
        }


    }



    var mainPage = new pageHandle();
    //暴露出去的
    window.COMMON.mainPage = mainPage;
    window.COMMON.pageHandle= pageHandle;
    //第一次加载
    mainPage.InsertMethod(routerConfig.dailyList);
    //https://www.jb51.net/article/91132.htm
}(window))

