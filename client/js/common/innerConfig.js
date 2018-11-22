/*
 *  页面引用的配置
 *  行为：COMMON中挂上routerConfig
 */
(function(){
    var routerConfig ={
        COOMON:{ //所有页面都要用的公用js css
            js:[ //注释掉是因为默认读到这应该已经有了
                //  "https://cdnjs.cloudflare.com/ajax/libs/mdui/0.4.1/js/mdui.min.js", 
                //  "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.1/jquery.min.js", 
                "js/unit/imagesloaded.min.js",        
                "./js/index.js",
            ], 
            css:[
                "./css/index.css"
                // "https://cdnjs.cloudflare.com/ajax/libs/mdui/0.4.1/css/mdui.min.css",
                
            ],
            needUnit:["masonryLayouts"],
        },
        UNIT:{ //三方组件
            timePick:{
                js:[
                    //"https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.0/flatpickr.min.js",
                    //"https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.0/l10n/zh.js",
					"js/unit/flatpickr/flatpick.min.js",
					"js/unit/flatpickr/zh.js"
                ],
                css:[
                    //"https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.0/flatpickr.min.css",
                	"js/unit/flatpickr/flatpickr.min.css"
				],
            },
            masonryLayouts:{
                js:[
                    //"https://cdnjs.cloudflare.com/ajax/libs/masonry/4.2.1/masonry.pkgd.min.js",
					"js/unit/masonry.pkgd.min.js"
                ],
                css:[],
            }
            
        },
        dailyList:{ //右侧导航用的id dailyList
            inner:'innerHtml/dailyList.html', //引用的html地址
            path:'', //使用的url地址
            js:[
				// https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/4.1.4/imagesloaded.min.js 
                "./js/dailyList.js",
            ], //需要引用的独有js文件
            css:[
                
            ], //需要引用的独有css文件
            needUnit:["timePick"],//需要的三方组件
        },
        doSearch:{ //右侧导航用的id dailyList
            inner:'innerHtml/doSearch.html', //引用的html地址
            path:'', //使用的url地址
            js:[
               
                "./js/doSearch.js",
            ], //需要引用的独有js文件
            css:[
                
            ], //需要引用的独有css文件
            needUnit:[],//需要的三方组件
        },
    }
    if(!window.COMMON){
        window.COMMON={};
    }
    window.COMMON.routerConfig=routerConfig;
}(window))
