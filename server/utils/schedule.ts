import * as schedule from 'node-schedule';
let runStack = new Map();

//let rule = 'second  minute  hour  day month  dayofweek';



export function setRunEveryDay({
    dateStr='00:00:00',
    task=()=>{}
}){
    
    let rule = 'second minute hour * * *';
    let dateArr = dateStr.split(':');
    let markArr = ['hour','minute','second'];
    rule = replaceRule({
        markArr,
        dateArr,
        rule
    });
    
    let job = schedule.scheduleJob(rule, task);
    runStack.set(markArr,job);
  
    return job
   

}
function replaceRule({
    markArr=[],
    dateArr=[],
    rule='second  minute  hour  day month  dayofweek'
}){
    markArr.forEach((key,index)=>{
        let item = dateArr[index]||'0';
        rule = rule.replace(key,item)
        
    })
    return rule
}

