var dailyListObject = {
    common: {
        result: {
            contents: [] //前端分页用得数组
        },//返回值,
        closure: {
            timer: null,
            over: true,
            wait: 3000
        }
    },
    DomEventBind: function () {
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
                    dailyListObject.showList(0, length - 1);
                }, 800)
            }
        });

        $('#showContent').on('click', '.img-item', function () {
            $(this).find('.mdui-card').toggleClass('active');
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
                var creatHtml = dailyListObject.createShowHtml({
                    showData: res.contents
                });
                dailyListObject.addToShowContent(creatHtml);
                dailyListObject.common.result.contents = res.contents;
                dailyListObject.activeLoad();

            });

        });
    },
    createShowHtml: function ({
        showData,
        showItem = ['url', 'title', 'illust_id'],
        startNum = 0,
        endNum = 12
    }) {

        var itemListHtml = "";

        //保证一次读取12个
        var endNum = endNum > showData.length ? showData.length : endNum;
        if (Object.prototype.toString.call(showData) === "[object Array]") {

            for (var i = startNum; i < endNum; i++) {
                var strItems = [];
                for (var j = 0; j < showItem.length; j++) {
                    var str = showData[i][showItem[j]];
                    if (str) {
                        strItems.push(str)
                    } else {
                        strItems.push('无数据');
                    }
                }

                var itemHtml = `<div class="img-item">
                                            <div class="mdui-card" data-id="${strItems[2]}">
                                                <div class="mdui-card-media">
                                                    <img src="${strItems[0]}">
                                                </div>
                                                <div class="mdui-card-actions normal-infoItem">
                                                    <span class="mdui-ripple text-title">${strItems[1]}</span>
                                                    <span class="mdui-ripple text-id">id:${strItems[2]}</span>
                                                </div>
                                            </div>
                                        </div>`;
                itemListHtml = itemListHtml + itemHtml;
            }
        }
        var content = `<div class="item-list">${itemListHtml}</div>`;
        return content;
    },
    showList: function (start, end, showItem = ['url', 'title', 'illust_id']) {
        var $container = $('.item-list');
        var have = Number($container.find('.img-item').length);
        var common = dailyListObject.common;
        var closureObj = dailyListObject.common.closure;
        var opt = {
            showData: common.result.contents,
            showItem: showItem,
            startNum: start || have,
            endNum: end || have + 12 > common.result.contents.length ? common.result.contents.length : have + 12
        }

        if (end) {
            opt.endNum = end
        }


        if (opt.startNum === opt.endNum) {
            var loaderEnd = $('#loaderEnd').html();
            if (loaderEnd) {
                $(window).scroll(function () { });
            } else {
                $container.parent().append('<div id="loaderEnd">加载完成</div>');
                closureObj.over = true;
                dailyListObject.closureOver();
                $(window).scroll(function () { });
            }

            return;
        }

        var htmlString = dailyListObject.createShowHtml(opt);
        dailyListObject.appendToShowContent(htmlString);
    },
    activeLoad: function (showItem) {

        if ($('#loaderEnd')[0]) {
            $('#loaderEnd').remove();
        }
        var closureObj = dailyListObject.common.closure;
        $(window).scroll(function () {
            var scrollTop = $(this).scrollTop();
            var scrollHeight = $(document).height();
            var windowHeight = $(this).height();
            if (scrollTop + windowHeight == scrollHeight) {
                if (closureObj.timer != null || closureObj.over === false) {
                    return
                }
                closureObj.over = false
                dailyListObject.closureSet();
                dailyListObject.showList();

            }
        })
    },
    addToShowContent: function (htmlString, content = '.item-list') {
        var listContentDom = $(content);
        var listDom = $(htmlString);
        var closureObj = dailyListObject.common.closure;

        if (listContentDom[0]) {
            listContentDom.remove();

        }

        listDom.css('display', 'none');
        $('#showContent').prepend(listDom);
        var $container = $(content);


        imagesLoaded($container, function () {
            listDom.css('display', 'block');
            $container.masonry({
                isAnimated: true,
                //columnWidth: 450,
                isFitWidth: true     // 自适应宽度
            });
            closureObj.over = true;
            dailyListObject.closureOver();
            $.loadingConturl.removeLoading();
        });

    },
    appendToShowContent: function appendToShowContent(htmlString, content = '.item-list') {
        var listContentDom = $(content);
        var listDom = $(htmlString);
        var closureObj = dailyListObject.common.closure;

        $.loadingConturl.appendLoading();
        listDom.find('.img-item').css('display', 'none');
        listHtml = $(listDom.html());
        listContentDom.append(listHtml);


        imagesLoaded(listContentDom, function () {
            listHtml.css('display', 'block');
            $.loadingConturl.removeLoading();
            if (listContentDom.data('masonry')) {
                listContentDom.masonry('appended', listHtml);
            } else {
                listContentDom.masonry({
                    isAnimated: true,
                    //columnWidth: 450,
                    isFitWidth: true     // 自适应宽度
                });
            }

            closureObj.over = true
            dailyListObject.closureOver();

        });
    },
    closureSet: function () {
        var closureObj = dailyListObject.common.closure;
        if (closureObj.timer === null) {
            closureObj.timer = setTimeout(() => {
                dailyListObject.closureOver();
            }, closureObj.wait)
        }
    },
    closureOver: function () {
        var closureObj = dailyListObject.common.closure;
        if (closureObj.timer !== null) {
            clearTimeout(closureObj.timer);
            closureObj.timer = null;
        }
    }
}

$(function () {
    dailyListObject.DomEventBind();
});


