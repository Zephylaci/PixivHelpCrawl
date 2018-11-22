var handleShowContent = {
    common: {
        result: {
            contents: [] //前端分页用得数组
        },//返回值,
        closure: {
            timer: null,
            over: true,
            wait: 3000
        },
    },
    init:function(){
        handleShowContent.common.result = [];
        handleShowContent.closureOver;
        handleShowContent.DomEventBind();
    },
    initList:function(listArr){
        var creatHtml = handleShowContent.createShowHtml({
            showData: listArr
        });
        handleShowContent.addToShowContent(creatHtml);
        handleShowContent.common.result.contents = listArr;
        handleShowContent.activeLoad();
    },
    DomEventBind: function () {
        $('#showContent').on('click', '.img-item', function () {
            $(this).find('.mdui-card').toggleClass('active');
        });
        var filterDialogDom = `<div class="mdui-dialog" >
                            <div class="mdui-dialog-content">
                                <p>是否将该图片从预览结果中去除，并将选中的tag添加进过滤器中？
                                </p>
                                <ul class="mdui-list">
                                    <li >
                                        <label class="mdui-checkbox">
                                            <input type="checkbox"/>
                                            <i class="mdui-checkbox-icon"></i>
                                            a 
                                        </label>
                                    </li>
                                </ul>
                            </div>
                            <div class="mdui-dialog-actions">
                                <button class="mdui-btn mdui-ripple" mdui-dialog-close>取消
                                </button>
                                <button class="mdui-btn mdui-ripple" mdui-dialog-confirm>确定
                                </button>
                            </div>
                         </div>`
        var filterDialog = new mdui.Dialog(filterDialogDom);
        filterDialog.$dialog[0].addEventListener('confirm.mdui.dialog', function () {
            //弹窗的确认回调
            var checkedArr = $(this).find('.mdui-list input:checked');
            var tags = [];
            checkedArr.map((index, dom) => {
                var tag = $(dom).data('tag');
                tags.push(tag);
            });
            var upData = { tags: tags };
            if (tags.length !== 0) {
                $.postData(upData, '/api/addFilter');
            }
            // filterDialog.nowHandle[0].outerHTML="";
            var content = $('.item-list');
            content.masonry('remove', filterDialog.nowHandle).masonry('layout');
        });

        $('#showContent').on('click', '.hover-show[data-event=ruleout]', function () {
            var domContent = $(this).parents('.img-item');
            var tagsArr = domContent.data('tags').split(',');
            var liDom = '';
            tagsArr.forEach((tag) => {

                liDom += `<li >
                            <label class="mdui-checkbox">
                            <input type="checkbox"  data-tag="${tag}"/>
                            <i class="mdui-checkbox-icon"></i>
                            ${tag}
                            </label>
                        </li>`
            })
            $(filterDialog.$dialog[0]).find('.mdui-list').html(liDom);
            filterDialog.open();
            filterDialog.nowHandle = domContent;
            return false;
        });
    },
    
    createShowHtml: function ({
        showData,
        showItem = ['url', 'title', 'illust_id','tags'],
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

                var itemHtml = `<div class="img-item" data-tags="${strItems[3]}">
                                            <div class="mdui-card" data-id="${strItems[2]}">
                                                <div class="mdui-card-media">
                                                    <div class="mdui-card-menu hover-show" data-event="ruleout">
                                                        <span class="mdui-btn mdui-btn-icon mdui-text-color-white"><i class="mdui-icon material-icons">close</i></span>
                                                    </div>
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
    showList: function (start, end, showItem = ['url', 'title', 'illust_id','tags']) {
        console.log('in');
        var $container = $('.item-list');
        var have = Number($container.find('.img-item').length);
        var common = handleShowContent.common;
        var closureObj = handleShowContent.common.closure;
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
                handleShowContent.closureOver();
                $(window).scroll(function () { });
            }

            return;
        }

        var htmlString = handleShowContent.createShowHtml(opt);
        handleShowContent.appendToShowContent(htmlString);
    },
    activeLoad: function (showItem) {

        if ($('#loaderEnd')[0]) {
            $('#loaderEnd').remove();
        }

        var closureObj = handleShowContent.common.closure;
        $(window).scroll(function () {
            
            var scrollTop = $(this).scrollTop();
            var scrollHeight = $(document).height();
            var windowHeight = $(this).height();
            if (scrollTop + windowHeight >= scrollHeight) {
                if (closureObj.timer != null || closureObj.over === false) {
                    return
                }
                closureObj.over = false
                handleShowContent.closureSet();
                handleShowContent.showList();

            }
        })
    },
    addToShowContent: function (htmlString, content = '.item-list') {
        var listContentDom = $(content);
        var listDom = $(htmlString);
        var closureObj = handleShowContent.common.closure;

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
            handleShowContent.closureOver();
            $.loadingConturl.removeLoading();
        });

    },
    appendToShowContent: function appendToShowContent(htmlString, content = '.item-list') {
        var listContentDom = $(content);
        var listDom = $(htmlString);
        var closureObj = handleShowContent.common.closure;

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
            handleShowContent.closureOver();

        });
    },
    closureSet: function () {
        var closureObj = handleShowContent.common.closure;
        if (closureObj.timer === null) {
            closureObj.timer = setTimeout(() => {
                handleShowContent.closureOver();
            }, closureObj.wait)
        }
    },
    closureOver: function () {
        var closureObj = handleShowContent.common.closure;
        if (closureObj.timer !== null) {
            clearTimeout(closureObj.timer);
            closureObj.timer = null;
        }
    }
}