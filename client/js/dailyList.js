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
        var inst = new mdui.Drawer('#main-drawer');
        $('#mainDrawerControl').click(function () {
            inst.toggle();
            var list = $('.img-item');
            var length = list.length
            if (length != 0) {
                var content = $('.item-list');
                content.masonry('destroy');
                content.html('');
                $.loadingConturl.appendLoading('.item-list');
                setTimeout(function () {
                    $.loadingConturl.removeLoading('.item-list');
                    handleShowContent.showList(0, length - 1);
                }, 800)
            }
        });

        $('body').on('click', '#cloudDownloadSelect', function () {
            var list = [];
            var checkList = $('#showContent .active');
            for (var i = 0; i < checkList.length; i++) {
                var dom = $(checkList[i]);
                var imgId = dom.data('id');
                list.push(imgId);
                dom.removeClass('active');
            }
            var downList = JSON.stringify(list);
            var upData = { downList: downList };

            $.postData(upData, '/api/download').success((data) => {
                alert(data.content);
            });
        });

        $('body').on('click', '#cloudDownloadAll', function () {
            var list = [];
            var dataList = dailyListObject.common.result.contents;
            for (var i = 0, l = dataList.length; i < l; i++) {
                var item = dataList[i];
                list.push(item.illust_id);
            }
            var downList = JSON.stringify(list);
            var upData = { downList: downList };

            $.postData(upData, '/api/download').success((data) => {
                alert(data.content);
            });
        });

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



