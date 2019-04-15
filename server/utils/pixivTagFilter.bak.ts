import * as fs from 'fs';
import {loggerShow,loggerErr,logger} from './logger';
//过滤器
const needFilter = new Set();
function makeSet(){
    if(fs.existsSync('./config/filter')){
        let needFilterTagStr = fs.readFileSync('./config/filter','utf-8');
        needFilterTagStr = needFilterTagStr.replace(/\n/g,',');
        let needFilterTagArr = needFilterTagStr.split(',').filter((item)=>{return item});
        needFilterTagArr.forEach((item)=>{
            needFilter.add(item);
        });
    }else{
        loggerShow.warn('Filter: 没有读取到规则配置');
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
function addTags(tagsArr){
    let addTags = [];
    tagsArr.forEach((tag)=>{
       if(!isExiseInFilterList(tag)){
           addTags.push(tag);
       } 
    });
    var newTagsStr = addTags.toString();
    if(addTags.length<=0){
        loggerShow.warn('Filter: 没有需要添加的tag',newTagsStr);
        return
    }
    
    try{
        fs.appendFileSync('./config/filter','\n'+newTagsStr);
    }catch(err){
        loggerErr.error('Filter: 写入规则文件失败 err:',err);
    }
    logger.info('Filter: 写入过滤规则:',newTagsStr);
    addTags.forEach((item)=>{
        needFilter.add(item);
    });
}

export default {
    judgeItem,
    addTags
};