/**
*  数据过滤 v 0.1
*  功能：1、过滤不需要的数据条数
*       2、过滤不需要的数据项目
*     
* 传入：Object,
*  filterType: 过滤类型（String）
*  sourceData: Object或Array
*  judgeTag  条数过滤规则（一个数组）可选
*  needDataKey 需要的项目的键(一个数组) 可选 
*  callback（可选） 
**/
var fs = require('fs');

function Astraea(opt){
    var filterType = opt.filterType;
    var defJudgeTag = [];

    if(fs.existsSync('./config/filter')){
        var defJudgeTagstr = fs.readFileSync('./config/filter','utf-8');
        defJudgeTag = defJudgeTagstr.split(',');
    }

    opt.judgeTag = defJudgeTag ||opt.judgeTag;
      
    opt.needDataKey = 'All' || opt.needDataKey;
    opt.resultData = {};
    if(filterType==='Ordinary'){
        return opt.sourceData;
    }
    var result = Astraea.Scales[filterType](opt);
   return result;
}
Astraea.Scales={
    Convenient:(opt)=>{
        var needContainsData = [];
        var sourceData = opt.sourceData;
        var sourceArry = sourceData.contents;
        
        var needDataKey = opt.needDataKey;
        var judgeTag = opt.judgeTag;
        if(Object.prototype.toString.call(sourceArry) === "[object Array]"){
            if(Object.prototype.toString.call(needDataKey)=== "[object Array]"){
                for(var i = 0;i<sourceArry.length;i++){
                    var item = sourceArry[i];
                    var need = true;
                    for(var j = 0;j<judgeTag.length;j++){
                        var tagStr = item.tags.toString();
                        if(tagStr.indexOf(judgeTag[i])!=-1){
                            need = false;
                        }
                    }
                    if(need===false){
                       continue;
                    }
                    var needItem = {};
                    
                    for(var k=0;k<needDataKey.length;k++){
                        needItem[needDataKey[i]] = item[needDataKey[i]]
                    }
                    needContainsData.push(needItem);
                }
            }else{
              for(var i = 0;i<sourceArry.length;i++){
                    var item = sourceArry[i];
                    var need = true;
                    var tagsStr = item.tags.toString();
                    for(var j = 0;j<judgeTag.length;j++){
                        if(tagsStr.indexOf(judgeTag[j])!=-1){
                            need = false;
                            break;
                        }
                    }
                    if(need===false){
                       continue;
                    }
                    needContainsData.push(item);
                }
               
            }

            opt.resultData = needContainsData;
            return opt;
        }else{
            console.log('Astraea:Convenient传入数据类型不正确！')
            return opt.sourceData;
        }
    }
}
module.exports=Astraea;