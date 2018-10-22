(function () {

    if (routerConfig) {
        function pageHandle(callback = function () {
            console.log(this); //这里的this是window
            //TODO this指向新对象，修改结束状态
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
        },jsInsertType = 'async',callback = this.callback.bind(this)) {
            if (needUnit.length != 0) {
                // routerConfig.UNIT 组件库配置
                var mainJs= js;
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
                    js:syncJs,
                    css:syncCss,
                },'sync',()=>{
                    this.InsertMethod({
                        js:mainJs
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
                    this.parentNode.removeChild(this); //js运行载入后可以删除
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
                        makeScript(i++);
                    } else if (typeof (callback) == "function") {
                        callback();
                        delete i;
                    }
                });
            } else if(jsInsertType==='sync'){
                //并行
				for ( i = i, l = js.length; i < l; i++) {
					makeScript(i,(i) => {
						if (i === last&&typeof (callback) == "function") {
							callback();
						}
					})
				}
                delete i,l;
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

        mainPage.InsertMethod(routerConfig.dailyList);

    }
    //https://www.jb51.net/article/91132.htm
}(window))

