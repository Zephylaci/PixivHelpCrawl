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

/**
 * 创建process管理对象的参数
 * processAddr 为fork的文件相对class文件夹的地址
 */
export type getProcessOptType={
    processName: string;
    processAddr: string;
    waitTime?: number;
}

/**
 * sqlHandle common
 */
export type sqlHandleCommonType ={
    db:any;
    state:string;
}
/**
 * sqlHandle mehod(sqlLiteOpt)
 */
export type sqliteOptType = {
    sqlString:string;
    range?:any;
}