var controlCrawlerObject = {
    common: {
        component:{
            mainContent:null,
        },
        preViewState:{
            count:0,
            totalSize:0,
            firstCreat:0,
        },
        RedisState:{
            count:0,
        }
    },
    init:function(){

        var mainContent = controlCrawlerObject.common.component.mainContent
        if(mainContent){
            $('#main-content').html(mainContent);
            controlCrawlerObject.DomEventBind();
            return 
        }
        var routerConfig = window.COMMON.routerConfig;
        $.get(routerConfig.controlCrawler.inner).then((html)=>{
            controlCrawlerObject.common.component.mainContent = html;
            $('#main-content').html(html);
            controlCrawlerObject.bindDate();
            controlCrawlerObject.socketInit();
            controlCrawlerObject.DomEventBind();
            handleShowContent.init();
        });
    },
    bindDate:function(){
        var watchPreViewState = controlCrawlerObject.common.preViewState;
        for(var key in watchPreViewState){
            watchPreViewState['_'+key]=watchPreViewState[key];
            bindStateData(watchPreViewState,key,'PreViewState');
        }
        var watchRedisState = controlCrawlerObject.common.RedisState;
        for(var key in watchRedisState){
            watchRedisState['_'+key]=watchRedisState[key];
            bindStateData(watchRedisState,key,'RedisState');
        }
        function bindStateData(watchStateData,key,elementId){
            Object.defineProperty(watchStateData,key,{
                get:function () { 
                    return watchStateData['_'+key];
                },
                set:function (val) { 
                    watchStateData['_'+key]=val;
                    $('#'+elementId+' span[data-watchId='+key+']').text(val);
                },
                enumerable:true,
                configurable:true
            });
        }
    },
    socketInit:function(){
        var socket = SOCKETLINK;
        socket.on('controlCrawler-changePreViewState',function(res){
            var result = res.contents; //{count,PreViewState}
            console.log(result);
            var preViewState = controlCrawlerObject.common.preViewState;
            for(var key in result){
                preViewState[key] = result[key];
            }
        });
        socket.on('controlCrawler-changeRedisState',function(res){
            var result = res.contents; //{count}
            console.log(result);
            var RedisState = controlCrawlerObject.common.RedisState;
            for(var key in result){
                RedisState[key] = result[key];
            }
        });
        socket.on('controlCrawler-delCheck',function(res){
            var result = res.contents;
            console.log(result);
        })
    },
    DomEventBind:function(){
        window.COMMON.now = 'controlCrawler';
        
        var socket = SOCKETLINK;
        socket.emit('controlCrawler',{method:'init'});
        $('#delPreView').click(function(){
             let date = $("#delBeforeDate").val();
             socket.emit('controlCrawler',{
                 method:'delPreView',
                 data:{
                     beforeTime:date
                 }}
             );
            mdui.snackbar({
                message: '检查图片信息，并等待确认',
                position: 'top'
            });
        });
        $("#delBeforeDate").val(new Date(new Date() - (86400000*7)).toLocaleDateString());
        $("#delBeforeDate").flatpickr();
    }
}