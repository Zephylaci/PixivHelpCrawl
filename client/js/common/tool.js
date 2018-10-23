/*
* 需要：jq载入后
* 行为：将loadingConturl,postData挂到jq中
*/
$(function(window,$){
        //显示/删除一个加载中的转圈
        var loadingConturl={
            loadingHtml:`<div class="loadingContent" >
                    <div class="mdui-spinner mdui-spinner-colorful"></div>
             </div>
            `,
            appendLoading:function(content='#showContent'){
                loadingConturl.removeLoading();
                var me = loadingConturl;
                $(content).append(me.loadingHtml);
                mdui.mutation();
            },
            removeLoading:function(content='#showContent'){
                $(content+'>.loadingContent').remove();
            }
        }
        //上传函数
        function postData(upData,url){
            var promise = $.ajax({
                type:'POST',
                url:url,
                data:upData,
                dataType:'json'
            }); 
            return  promise; 
        }
        //直接挂到全局
        //window.loadingConturl=loadingConturl
        //挂载到$ 上        
        $.extend({
            loadingConturl:loadingConturl,
            postData:postData,
        })
}(window,$))