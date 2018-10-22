/*
 *  页面引用的配置
 * 
 */
(function(){
    var routerConfig ={
        COOMON:{ //所有页面都要用的公用js css
            js:[ //注释掉是因为默认读到这应该已经有了
                //  "https://cdnjs.cloudflare.com/ajax/libs/mdui/0.4.1/js/mdui.min.js", 
                //  "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.1/jquery.min.js", 
                //  "./js/common/tool.js",
            
            ], 
            css:[
                // "https://cdnjs.cloudflare.com/ajax/libs/mdui/0.4.1/css/mdui.min.css",
                
            ],
        },
        UNIT:{ //三方组件
            timePick:{
                js:[
                    "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.0/flatpickr.min.js",
                     "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.0/l10n/zh.js",
                ],
                css:[
                    "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.0/flatpickr.min.css",
                ],
            },
            masonryLayouts:{
                js:[
                    "https://cdnjs.cloudflare.com/ajax/libs/masonry/4.2.1/masonry.pkgd.min.js",
                    "https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/4.1.4/imagesloaded.min.js"
                ],
                css:[],
            }
            
        },
        dailyList:{ //右侧导航用的id dailyList
            inner:'', //引用的html地址
            path:'', //使用的url地址
            js:[
                "./js/index.js"
            ], //需要引用的独有js文件
            css:[
                "./css/index.css"
            ], //需要引用的独有css文件
            needUnit:["timePick","masonryLayouts"],//需要的三方组件
        },
        
    }
    window.routerConfig=routerConfig;
}(window))
