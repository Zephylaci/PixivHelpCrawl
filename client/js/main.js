var common = {};
//节流函数 （不是很有意义）
function debouceJudge(delay){
    var delay = delay;
    var time = null;
    return{
        judge: ()=>{

            if(!time){
                time = setTimeout(()=>{
                    time = null;

                },delay);
                return true;
            }else{
                return false;
            }
        },
        over:()=>{
            clearTimeout(time);
            time = null;
        }
    }
}
    var wait = debouceJudge(5000);
//动态加载函数
function activeLoad(showItem){
    var showItem = showItem || ['url','title','illust_id','bookmarkCount','tags'];
    $(window).scroll(function(){  
        var scrollTop = $(this).scrollTop();var scrollHeight = $(document).height();var windowHeight = $(this).height();
        if(scrollTop + windowHeight == scrollHeight){

            if(!wait.judge()){
                return;
            }
            var $container = $('.show-reel');
            var have =Number($container.find('.agile-gallery-grid').length) ;
            var opt={
                showList:common.result.contents,
                showItem:showItem,
                startNum:have,
                endNum:have+12>common.result.contents.length ?common.result.contents.length : have+12
            }
            
            if(opt.startNum===opt.endNum){
            var loaderEnd = $('#loaderEnd').html();
                if(loaderEnd){
                    $(window).scroll(function(){});
                }else{
                    $container.parent().append('<div id="loaderEnd">加载完成</div>');
                     $(window).scroll(function(){});
                }
                
                return;
            }
            var html =   $($(createShowHtml(opt)).html());
            html=$(html).attr('visibility','hidden');
            $container.append(html);
            showLoading($container.parent());
            imagesLoaded($container,function(){
                $container.masonry('appended',html);
                $('#loaderContent').hide();
                wait.over();
            })
            
        }  
    })  
}
//展示一个载入中的div
function showLoading(showContain){
        if( $('#loaderContent').html()){
            $('#loaderContent').show();
        }else{
            var load=` 
            <div id="loaderContent">
                <div class="pswp__preloader__icn">
                    <div class="pswp__preloader__cut">
                        <div class="pswp__preloader__donut"></div>
                        </div>
                    </div>
                </div>
            </div>`
            showContain.append(load);
        }
}
 /*               
* 下载所有的绑定事件
* 传的数据是读取到的所有的数据，与是否展示在页面上无关。
*/
$('#downloadAll').click(function(){
    var list = [];
    var length = common.result.contents.length;
    if(length===0){
        alert('请先预览')
        return;
    }
    //数据兼容
    var keyWorld = 'illust_id';
    if(!common.result.contents[0][keyWorld]){
        keyWorld = 'illustId'
    }
    for(var i=0;i<length;i++){
        var item = {illust_id:common.result.contents[i][keyWorld]};
        list.push(item);
    }
    var downList = JSON.stringify(list);
    var upData ={downList:downList};

    postData(upData,'/api/download').success((data)=>{
        alert(data.content);
    });
    
});
 /*               
* 下载选中中图片的绑定事件
* 传的数据是带'active'的项目。
*/
$('#downloadChecked').click(function(){
    var list = [];
    var checkList = $('#resultContent .active');
    for(var i =0;i<checkList.length;i++){
        var dom = $(checkList[i]);
        var item = {illust_id:dom.data('id')};
        list.push(item);
        dom.removeClass('active');
    }
    var downList = JSON.stringify(list);
    var upData ={downList:downList};

    postData(upData,'/api/download').success((data)=>{
        alert(data.content);
    });
    
});
 /*               
* 预览的绑定事件
* 
*/
$('#subAndShow').click(function(){
    var type = $('#getType .typeBtn.active').data('type');

    var pageInput = $('input[name=page]:checked');
    $('#resultContent').html(' ');
    showLoading($('#resultContent'));
    var filter =  $('input[name=filter]:checked').val();
    if(filter){
        filter='filter';
    }else{
        filter='noFilter';
    }
    if(pageInput.length>1){
         //有且只会有两页
        var urlStr_1 = `http://www.pixiv.net/ranking.php?format=json&${type}&p=1`;
        var upUrl_1 = strToHexCharCode(urlStr_1);
        var upData_1 ={Url:upUrl_1,Filter:filter};

        var urlStr_2 = `http://www.pixiv.net/ranking.php?format=json&${type}&p=2`;
        var upUrl_2 = strToHexCharCode(urlStr_2);
        var upData_2 ={Url:upUrl_2,Filter:filter};
        //回调金子塔
        postData(upData_1,'/api/getPixivData').success((data)=>{
            var handledData_1 = dataHandle(data);
            postData(upData_2,'/api/getPixivData').success((data)=>{
                var handledData_2 = dataHandle(data);
                common.result = handledData_1.result;
                common.result.contents = common.result.contents.concat(handledData_2.result.contents);
                showDataMethod(handledData_1.showData);
                activeLoad();            
            }); 
        });  
    }else{
        var page=pageInput.val();
        var urlStr = `http://www.pixiv.net/ranking.php?format=json&${type}&p=${page}`;
        var upUrl = strToHexCharCode(urlStr);
        var upData ={Url:upUrl,Filter:filter};

        postData(upData,'/api/getPixivData').success((data)=>{
            var handledData = dataHandle(data);
            common.result = handledData.result;
            showDataMethod(handledData.showData);
            activeLoad(); 
        });  
    }
});
 /*               
* 顶部搜索的绑定事件
* 
*/
$('#searchAndShow').click(function(){
    var searchType = $('input[name=searchType]:checked');
    if(searchType.length!=0){
        var upData={};
        var safeMode =  $('input[name=safeMode]:checked').val();
        if(safeMode){
            safeMode='safe';
        }else{
            safeMode='unSafe';
        }
        upData.searchStr = $('#mainSearch').find('input').val(); 
        upData.handleLimit = $('input[name=handleLimit]').val();
        upData.showLimit =  $('input[name=showLimit]').val();
        upData.safeMode =safeMode; 
        $('#resultContent').html('');
        showLoading($('#resultContent'));
        postData(upData,'/api/autoSerach').success((data)=>{
            var showItem = ['url','illustTitle','illustId','bookmarkCount','tags'];
            var handledData = dataHandle(data,showItem);
            common.result = handledData.result;
            showDataMethod(handledData.showData);
            activeLoad(showItem); 
        });  
    }else{
        alert('请先输入');
    }
});
function showDataMethod(showData){
    $(showData).attr('visibility','hidden');
    $('#resultContent').html(showData);
    var $container = $('.show-reel');
    imagesLoaded($container,function() {
        $container.masonry({  
            isAnimated: true,  
            //columnWidth: 450,       
            isFitWidth: true     // 自适应宽度  
        }); 
        $('#loaderContent').hide();
    });
}
//预览的数据处理
function dataHandle(data,showItem){
    var result = data.content;
    var showData =  result;
    var showItem =showItem ||['url','title','illust_id','bookmarkCount','tags'] ;
    try{
        result = JSON.parse(result);
        console.log(result);
    }catch(err){
        console.error('不标准的返回值！')
        result = result;
    }
    if(Object.prototype.toString.call(result.contents)==="[object Array]"){
        var opt={
            showList:result.contents,
            showItem:showItem,
            endNum:12
        }
        showData=createShowHtml(opt);
    } 
    return {
        showData:showData,
        result:result
    };       
    }
function postData(upData,url){
    var promise = $.ajax({
        type:'POST',
        url:url,
        data:upData,
        dataType:'json'
    }); 
    return  promise; 
}

function createShowHtml(opt){
    var showData = opt.showList;
    var showItem = opt.showItem;
    var itemListHtml = "";
    var startNum = 0;  
    if(opt.startNum){
        startNum=opt.startNum
    }
    var endNum =  opt.endNum>showData.length?showData.length : opt.endNum ;
    if(Object.prototype.toString.call(showData)==="[object Array]"){

        for(var i=startNum;i<endNum;i++){ 
            var strItems = [];
            for(var j =0;j<showItem.length;j++){
                var str  = showData[i][showItem[j]];
                if(str){
                    strItems.push(str)
                }else{
                    strItems.push('无数据');
                }
            }
            
            var itemHtml = 
                `<div class="col-md-3 agile-gallery-grid" >
                <div class="agile-gallery mb5"data-id="${strItems[2]}" data-tags="${strItems[4].toString()}">
                    <a href="javascript:void(0);"  class="lsb-preview"  >
                        <img src="${strItems[0]}" alt="">
                    </a>
                </div>
                <div class="mb5">
                    <div class="text-left">
                        <span>${strItems[1]}</span>
                    </div>
                    <div class="text-right">
                        <span>图片Id：${strItems[2]}</span>
                    </div>
                    <div class="clearfix"> </div>
                </div>
                <div class="">
                    <div class="text-left">
                        <!-- <span>浏览:</span> -->
                    </div>
                    <div class="text-right">
                        <span>收藏:${strItems[3]}</span>
                    </div>
                    <div class="clearfix"> </div>
                </div>
            </div>`

                itemListHtml=itemListHtml+itemHtml;
        }
    }
    var content = `<div class="show-reel">${itemListHtml}</div>`;
    return content;
}

    
//选择图片
$('#resultContent').on('click','.agile-gallery',function(){
    $(this).toggleClass('active');
    console.log($(this).data('tags'));
        
});

var mainConfig=`
                <h4 class="mb15">预览：</h4>
                    <div class="row mb15" id="getType">
                            <div class="col-md-1">
                                <span data-type="mode=daily"  class="btn btn-lg btn-primary btn-block typeBtn active">日榜</span>
                            </div>
                            <div class="col-md-1">
                                <span data-type="mode=rookie" class="btn btn-lg btn-primary btn-block typeBtn">新人榜</span>
                            </div>
                            <div class="col-md-1">
                                <span  data-type="mode=weekly" class="btn btn-lg btn-primary btn-block typeBtn">周榜</span>
                            </div>
                            <div class="col-md-1">
                                <span  data-type="mode=male" class="btn btn-lg btn-primary btn-block typeBtn">男性日榜</span>
                            </div>
                            <div class="col-md-1">
                                <span data-type="mode=female" class="btn btn-lg btn-primary btn-block typeBtn">女性日榜</span>
                            </div>
                            <div class="col-md-1">
                                <span  data-type="mode=daily_r18" class="btn btn-lg btn-primary btn-block typeBtn">R18日榜</span>
                            </div>
                            <div class="col-md-1">
                                <span  data-type="mode=weekly_r18" class="btn btn-lg btn-primary btn-block typeBtn">R18周榜</span>
                            </div>
                            <div class="col-md-1">
                                <span   data-type="mode=male_r18" class="btn btn-lg btn-primary btn-block typeBtn">R18男性</span>
                            </div>
                        </div>
                        <div class="form-group  mb15">
                            <div class="radio-inline"><label><input type="checkbox" name="page" value="1" checked> 第一页（前50个）</label></div>
                            <div class="radio-inline"><label><input type="checkbox" name="page" value="2"> 第二页（后50个）</label></div>
                            <div class="radio-inline"><label><input type="checkbox" name="filter" value="filter" checked> 是否启用过滤</label></div>
                        </div>
`;
var subConfig=`
        <h4 class="mb15">模式:</h4>
        <div class="form-group  mb15">
            <!-- <div class="radio-inline"><label><input type="radio" name="searchType" data-type="preview" value="1" > 预览</label></div> -->
            <div class="radio-inline"><label><input type="radio" name="searchType" data-type="Analysis" value="2" checked> 排序</label></div>
        </div>
        <h5 class="mb15">参数:</h5>
        <div class="form-group  mb15">  
            <div class="radio-inline"><label>大于（收藏数）</label><input type="input" name="showLimit" value="200" style="width:50px" > </div>
            <div class="radio-inline"><label>共爬取页数（排序多少页得）</label><input type="input" value="1" name="handleLimit"  style="width:50px"> </div>
            <div class="radio-inline"><label><input type="checkbox" name="safeMode" value="safe" checked> Safe Mode</label></div> 
        </div>
`;
$('#configPanel').html(mainConfig);
    $('#backIndexModel').hide();
//顶部切换
$('#mainSearch input').focus(function(){
    if($('input[name=searchType]:checked').length===0){
        $('#backIndexModel').show();
        $('#subAndShow').hide();
        $('#configPanel').html(subConfig);
    }
});
 $('#backIndexModel').click(function(){
    $('#subAndShow').show();
    $('#configPanel').html(mainConfig);
    $('#backIndexModel').hide();
});
$('#configPanel').on('click','#getType .typeBtn',function(){
    $('#configPanel').find('#getType .typeBtn').removeClass('active');
    $(this).addClass('active');
});

function strToHexCharCode(str) {
    if(str === "")
        return "";
    var hexCharCode = [];
    hexCharCode.push("0x"); 
    for(var i = 0; i < str.length; i++) {
        hexCharCode.push((str.charCodeAt(i)).toString(16));
    }
    return hexCharCode.join("");
}