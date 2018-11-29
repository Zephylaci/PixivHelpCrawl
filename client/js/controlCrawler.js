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
            var preViewState = controlCrawlerObject.common.preViewState;
            for(var key in result){
                preViewState[key] = result[key];
            }
        });
        socket.on('controlCrawler-changeRedisState',function(res){
            var result = res.contents; //{count}
            var RedisState = controlCrawlerObject.common.RedisState;
            for(var key in result){
                RedisState[key] = result[key];
            }
        });
        socket.on('controlCrawler-delViewCheck',function(res){
            var result = res.contents;
            var filterDialogDom = `<div class="mdui-dialog" >
                            <div class="mdui-dialog-content">
                                <p>是否确定删除 ${result.beforeTime} 之前的 ${result.delCount} 张预览图？</p>
                                <P>当前总预览图数量: ${result.conut}</p>
                            </div>
                            <div class="mdui-dialog-actions">
                                <button class="mdui-btn mdui-ripple" mdui-dialog-close>取消
                                </button>
                                <button class="mdui-btn mdui-ripple" mdui-dialog-confirm>确定
                                </button>
                            </div>
                         </div>`;
            var filterDialog =  $.makeConfirm({
                htmlStr:filterDialogDom,
                confirm:function () {
                      socket.emit('controlCrawler',{method:'delPlane',data:{planKey:result.planKey,type:'confirm'}})  
                },
                cancel:function(){
                      socket.emit('controlCrawler',{method:'delPlane',data:{planKey:result.planKey,type:'cancel'}}) 
                }
            });
            filterDialog.open();
        });
        socket.on('controlCrawler-delRedisCheck',function(res){
            var result = res.contents;
            var filterDialogDom = `<div class="mdui-dialog" >
                            <div class="mdui-dialog-content">
                                <p>是否确定删除 ${result.beforeTime} 之前的 ${result.delCount} 条 榜单缓存数据？</p>
   
                            </div>
                            <div class="mdui-dialog-actions">
                                <button class="mdui-btn mdui-ripple" mdui-dialog-close>取消
                                </button>
                                <button class="mdui-btn mdui-ripple" mdui-dialog-confirm>确定
                                </button>
                            </div>
                         </div>`;
            var filterDialog =  $.makeConfirm({
                htmlStr:filterDialogDom,
                confirm:function () {
                      socket.emit('controlCrawler',{method:'delPlane',data:{planKey:result.planKey,type:'confirm'}})  
                },
                cancel:function(){
                      socket.emit('controlCrawler',{method:'delPlane',data:{planKey:result.planKey,type:'cancel'}}) 
                }
            });
            filterDialog.open();
        });
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
        
        $('#delRedisData').click(function(){
             let date = $("#delBeforeDate").val();
             socket.emit('controlCrawler',{
                 method:'delRedisData',
                 data:{
                     beforeTime:date
                 }}
             );
            mdui.snackbar({
                message: '检查redis信息，并等待确认',
                position: 'top'
            });
        });
        
        $('#delUnusePreView').click(function(){
             let date = $("#delBeforeDate").val();
             socket.emit('controlCrawler',{
                 method:'delUnusePreView',
                 data:{
                     beforeTime:date
                 }}
             );
            mdui.snackbar({
                message: '检查图片信息，并等待确认',
                position: 'top'
            });
        })
        
        
        $("#delBeforeDate").val(new Date(new Date() - (86400000*7)).toLocaleDateString());
        $("#delBeforeDate").flatpickr();
        
    }
}