var doSearchObject = {
    common: {
        stateShow:{
            strKey:'无',
            state:'无',
            count:'0',
            isCashOver:'否'
        },
        socket:null,
        watchTimer:null,
        planList:new Map(),
        component:{
            mainContent:null,
        }
    },
    init:function(){
        var mainContent = doSearchObject.common.component.mainContent
        if(mainContent){
            $('#main-content').html(mainContent);
            doSearchObject.DomEventBind();
            handleShowContent.init();
            return 
        }
        var routerConfig = window.COMMON.routerConfig;
        $.get(routerConfig.doSearch.inner).then((html)=>{
            doSearchObject.common.component.mainContent = html;
            $('#main-content').html(html);
            doSearchObject.socketInit();
            doSearchObject.DomEventBind();
            doSearchObject.bindDate();
            handleShowContent.init();

        });
    },
    bindDate:function(){
            //数据绑定
            var watchStateData = doSearchObject.common.stateShow;
            for(var key in watchStateData){
                watchStateData['_'+key]=watchStateData[key];
                bindStateData(key);
            }
            function bindStateData(key){
                Object.defineProperty(watchStateData,key,{
                    get:function () { 
                        return watchStateData['_'+key];
                    },
                    set:function (val) { 
                        watchStateData['_'+key]=val;
                        $('#stateContent span[data-watchId='+key+']').text(val);
                    },
                    enumerable:true,
                    configurable:true
                });
            }
            var listData = doSearchObject.common.planList;
            refMethod(['set','delete','clear'],listData)
            function refMethod(methodArr,refObj){
                methodArr.forEach((key)=>{
                    bindKey(key)
                });
                function bindKey(key){
                    refObj['_'+key]=refObj[key];
                    refObj[key]=function(){
                        this['_'+key](...arguments);
                        doSearchObject.handleList();
                    }
                }
            }

    },
    socketInit:function(){
        var socket = new io.connect();
        console.log('socket content',socket);
        doSearchObject.common.socket = socket;
        socket.on('addList',function(res){
            var keyArr = res.contents;
            var planList = doSearchObject.common.planList
            keyArr.forEach(function(item,index){
                planList.set(item.planKey,item.state)
            });
            if(res.change){
                $('select.mdui-select').val(res.change);
                $('select.mdui-select').change();
            }
        });
        socket.on('changeState',function(res){
            var resData = res.contents;
            var planList = doSearchObject.common.planList;
            planList.set(resData.planKey,resData.state);
        })
    },
    DomEventBind:function(){
        window.COMMON.now = 'doSearch';
        $('#makePlane').click(function(){
             var upData = {
                 strKey:"",
                 isSafe:false,
                 cashPreview:false,
                 startPage:1,
                 endPage:1,
                 bookmarkCountLimit:100,
             } 
             for(var key in upData){
                 var dom = $('input[data-watchId='+key+']');
                 var checkMethd ={
                     'INPUT':function(dom){
                          var val;
                         if(dom.attr('type') === 'checkbox'){
                             val = dom.prop('checked')
                         }else{
                             val = dom.val();
                         }
                         return val
                     }
                     
                 }
                 var domVal =checkMethd[dom[0].nodeName](dom);
                 if(domVal!=""&&domVal!=undefined){
                    upData[key] = domVal;
                 }
             }
             if(!upData.strKey){
                 mdui.snackbar({
                     message: '请输入关键字',
                     position: 'top'
                 });
                return
             }
            var socket = doSearchObject.common.socket;
            socket.emit('doSearch',{method:'makeSeachPlan',data:upData});
        });
        $('#showPlane').click(function(){
            var nowKey = $('#planList select').val();
            //TODO 验证是否完成
            $.loadingConturl.appendLoading();
            $.postData({planKey:nowKey},'/api/getPlanDetail').success(function(res){
                if(res.code=200){
                    handleShowContent.initList(res.contents);
                }
            })
        })
        $('#deletePlane').click(function(){
            var nowKey = $('#planList select').val(); 
            $.postData({planKey:nowKey},'/api/delPlanItem').success(function(res){
                if(res.code=200){
                    mdui.snackbar({
                        message: res.contents,
                        position: 'top'
                    });
                    var planList = doSearchObject.common.planList;
                    planList.delete(nowKey);
                }
            })
        });
        $('#cashPreview').click(function(){
            var nowKey = $('#planList select').val();
            $.postData({planKey:nowKey},'/api/doCash').success(function(res){
                if(res.code=200){
                    mdui.snackbar({
                        message: res.contents,
                        position: 'top'
                    });
                    doSearchObject.checkPlanState();
                }
            })
        })

        //获取值
        var socket = doSearchObject.common.socket;
        socket.emit('doSearch',{method:'init'});
    
    },
    handleList:function(){
        var planListData = doSearchObject.common.planList;
        var content =  $('#planList');
        doSearchObject.clearTimer();
        if(planListData.size===0){
            content.html('<span>无搜索计划</span>');
            changeClass('info');
            doSearchObject.checkPlanState();
            return;
        }
        
        if(!content.hasClass('select-content')){
             changeClass('select');
              var optionHtml = '';
             planListData.forEach((item,key,index)=>{
                 optionHtml+=`<option value="${key}" >${key}</option>`;
             });
            var selectHtml = ` <select class="mdui-select " >
                 ${optionHtml}       
              </select>`;
              content.html(selectHtml);
              bindSelectDom();
        }else{
           var optionList=content.find('option');
           if(optionList.length===planListData.size){
                doSearchObject.checkPlanState();   
               return;
           }    
           optionList.each((index,item)=>{
               var $item = $(item);
               var key = $(item).val();
               if(!planListData.has(key)){
                   $item.remove();
               }
           });
           var selectContent = content.find('select');
           planListData.forEach((item,key,index)=>{
              if(!selectContent.find(`option[value="${key}"]`)[0]){
                selectContent.append(`<option value="${key}" >${key}</option>`)
              } 
           });
        }
        doSearchObject.checkPlanState();     
        function changeClass(classType){
            if(classType==='info'){
                if(!content.hasClass('process-info')){
                    content.addClass('process-info')
                }
                if(content.hasClass('select-content')){
                    content.removeClass('select-content')
                }
            }else if(classType==='select'){
                if(!content.hasClass('select-content')){
                    content.addClass('select-content')
                }
                if(content.hasClass('process-info')){
                    content.removeClass('process-info')
                }
            }
        }
        function bindSelectDom(){
            content.find('select').change(function(){
                doSearchObject.checkPlanState();
            })
        }
    },
    checkPlanState:function(){
        var nowKey = $('#planList select').val();
        var common = doSearchObject.common;
        var planListData = common.planList;

        if(!nowKey){
            var stateShow =common.stateShow;
            stateShow.strKey='无';
            stateShow.state='无';
            stateShow.count='0';
            stateShow.isCashOver='doNot';
            return
        }

        var nowData = planListData.get(nowKey);
        var {
            strKey='无',
            state='无',
            count='0',
            isCashOver='doNot'
        }=nowData;
        var nowState = {
            strKey,
            state,
            count,
            isCashOver
        }
        for(var key in common.stateShow){
            common.stateShow[key] = nowState[key];
        }
    },
    clearTimer(){
        var watchTimer = doSearchObject.common.watchTimer;
        if(watchTimer!==null){
            clearTimeout(watchTimer);
            watchTimer=null;
        }
    }

}