/**
 * 创建process管理对象的参数
 * processAddr 为fork的文件相对class文件夹的地址
 */
export type getProcessOptType={
    processName: string;
    processAddr: string;
    waitTime?: number;
}