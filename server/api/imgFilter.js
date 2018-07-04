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
      

    opt.resultData = {};
    if(filterType==='Ordinary'){
        return opt.sourceData;
    }
    var result = Astraea.Scales[filterType](opt);
   return result;
}
Astraea.Scales={
    Publice:{
    
    },
    Convenient:(opt)=>{
        var needContainsData = [];
        var sourceData = opt.sourceData;
        var sourceArry = sourceData.contents;
        
        var needDataKey = opt.needDataKey;
        var judgeTag = opt.judgeTag;
        
        if(Object.prototype.toString.call(sourceArry) === "[object Array]"){
              Astraea.Scales.Publice.judgeTag = judgeTag;
            opt.resultData = sourceArry.filter(Astraea.Scales.Judge);
            return opt;
        }else{
            console.log('Astraea:Convenient传入数据类型不正确！')
            return opt.sourceData;
        }
    },
    Judge:function(item){
        var Publice =  Astraea.Scales.Publice;
        var tageStr = item.tags.toString();
        for(var i = 0;i<Publice.judgeTag.length;i++){
            if(tageStr.indexOf(Publice.judgeTag[i])!==-1){
                return false;
            }
        }
        return true;
    }
}
module.exports=Astraea;