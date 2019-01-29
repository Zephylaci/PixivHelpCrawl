export interface concurrentCommonInter {
    runStat:string;
    promise:any;
    linkList:Array<any>;
    waitList:Array<any>;
    processList:Array<any>;
    idNum:number;
    runNum:number;
    limitRunNum:number;
    mainResult:Array<any>;
    queryOver?:Function;
}
    
/**
 *  queryName   输出用的名字
 *  step        单步操作通常为async函数
 *  processPath  fork的地址和step至少存在一个
 */ 
export interface concurrentPrivateInter {
    queryName: string;
    step?:Function;
    processPath?:string;
}