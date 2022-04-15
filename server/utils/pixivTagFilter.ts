import { singleClassHelp } from "./tool";
import { addFilterTag, getFilterList } from "../model/PixivTagsFilterLIstOperation";


/**
 * tags 过滤器
 *  1、生成一个单例，初始化的时候创建一次
 *  2、之后添加的时候同步添加数据库和这里做持久化
 *  3、如果之后内存占用成为问题则提供超时和主动释放的逻辑
 */
class filterTagBase {
    private filterSet: Set<string>
    constructor() {
        this.filterSet = new Set();
        this.initSet();
    }
    listFilter(imgList: Array<any>) {
        return imgList.filter(item => {
            for (let tag of item.tags) {
                if (this.notSave(tag)) {
                    return false
                }
            }
            return true
        });
    }
    addFilterTagName(tagName: string) {
        this.filterSet.add(tagName)
        addFilterTag(tagName);
    }
    //FIXME: 正常应该有方式阻塞，等待这里查询数据库完成，但是没有找到好的方法，使用单例使这个问题最小化
    private initSet() {
        getFilterList().then(queryResult => {
            if (queryResult.retState == 1 && Array.isArray(queryResult.result)) {
                queryResult.result.forEach(item => {
                    this.filterSet.add(item.tagName)
                });
            }
        });
    }
    private notSave(tagName: string) {
        return this.filterSet.has(tagName);
    }
}

export const filterTag = singleClassHelp(filterTagBase)