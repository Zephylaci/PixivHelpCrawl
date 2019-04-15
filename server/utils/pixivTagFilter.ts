/**
 * tags 过滤器
 */
export class filterTag {
    private filterSet:Set<string>
    over:any
    constructor (){
        this.filterSet = new Set();
        this.over = this.initSet();
    }
    listFilter(imgList:Array<any>){
        return imgList.filter(item=>{
            for(let tag of item.tags){
               if(this.doNotKeep(tag)){
                   return false
               } 
            }
            return true
        })
    }
    private async initSet (){
        //查询数据库
        
        //将值生成Map对象挂上去

        return true
    }
    private doNotKeep (tagName:string){
        return this.filterSet.has(tagName);
    }
}
