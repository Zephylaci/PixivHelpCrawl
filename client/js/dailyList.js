var dailyListObject = {
    common: {
        component:{
            mainContent:null,
        }
    },
    init:function(){
        
        var mainContent = dailyListObject.common.component.mainContent
        if(mainContent){
            $('#main-content').html(mainContent);
            dailyListObject.DomEventBind();
            handleShowContent.init();
            return 
        }
        var routerConfig = window.COMMON.routerConfig;
        $.get(routerConfig.dailyList.inner).then((html)=>{
            dailyListObject.common.component.mainContent = html;
            $('#main-content').html(html);
            dailyListObject.DomEventBind();
            handleShowContent.init();
        });
    },
    DomEventBind: function () {
        window.COMMON.now = 'dailyList';


        $("#queryDate").val(new Date(new Date() - 86400000).toLocaleDateString())
        $("#queryDate").flatpickr();
         
        $('#dailyControl').on('click', '#getType>span', function () {
            $('#dailyControl').find('#getType>span').removeClass('active');
            $(this).addClass('active');
        });
        

        $('#dailyControl').on('click', '#searchImg', function () {
            var type = $('#getType span.active').data('type');
            if (!type) {
                mdui.snackbar({
                    message: '请选择榜单类型',
                    position: 'top'
                });
                return
            }
            $('#showContent').html('');
            $.loadingConturl.appendLoading();
            var date = $('#queryDate').val();
            var filter = $('input[name=filter]:checked').val();
            var useCash = $('input[name=useCash]:checked').val();
            var startPage = $('#startPage').val();
            var endPage = $('#endPage').val();


            var upData = {
                filter: filter,
                useCash: useCash,
                type: type,
                date: date,
                startPage: startPage,
                endPage: endPage
            };
            for (key in upData) {
                if (typeof upData[key] === 'undefinde') {
                    upData[key] = false;
                }
            }

            $.postData(upData, '/api/getPixivHotList').success(function (res) {
                handleShowContent.initList(res.contents);
            });

        });
    },
    
}



