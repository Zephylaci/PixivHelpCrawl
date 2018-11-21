const fs = require('fs');

//过滤器
const needFilter = new Set();
function makeSet(){
    if(fs.existsSync('./config/filter')){
        let needFilterTagStr = fs.readFileSync('./config/filter','utf-8');
        let needFilterTagArr = needFilterTagStr.split(',');
        needFilterTagArr.forEach((item)=>{
            needFilter.add(item);
        });
    }else{
        console.log('tagFilter no config');
    }


}
makeSet();
function isExiseInFilterList(tagStr){
    if(needFilter.size===0){
        return null
    }
    return needFilter.has(tagStr)
}
function judgeItem (item){
    let tagArr = item.tags;
    for(let i = 0,l=tagArr.length;i<l;i++){
        let tagStr = tagArr[i];
        if(isExiseInFilterList(tagStr)){
            return true;
        };
    }
    return false;
}

module.exports=judgeItem;