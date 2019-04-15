/**
*  获得榜单信息
*  功能：根据前端数据返回榜单数据
*  未完成：是否过滤不可配置      
**/
import { cashConfig} from '../../../config/index';
import { handlePixivHotListClass } from "../../service/handlePixivHotList";
import { filterTag } from '../../utils/pixivTagFilter';



var mainObj = {
	contrl: async (ctx, next) => {
		var resultArr = [];
		let upData = ctx.request.body;

		var upUseCash = upData.useCash;
		var upTime = upData.date;
		var upType = upData.type;

		let {filter,startPage,endPage} = upData
		let filterTagOpt:filterTag = null;
		if(filter){
			 filterTagOpt =  new filterTag();
		}
		if (endPage < startPage) {
			ctx.body.contents = '参数错误';
			return
		}
		var useCash = cashConfig.useCash && upUseCash ? true : false;

		let mainQuery = new handlePixivHotListClass({
			getType: upType, //获取的类型（不能为null）
			getDate: upTime, //指定的时间(不能为null)
			startPage: startPage,  //开始读取的页数
			endPage: endPage,   //结束读取的页数
		})
		if (useCash) {
			resultArr = await mainQuery.queryStartWithCash();
		} else {
			resultArr = await mainQuery.queryStartNoCash();
		}
		if(filterTagOpt){
			if(filterTagOpt.over!==true){
				await filterTagOpt.over
			}
			resultArr = filterTagOpt.listFilter(resultArr)
			console.log(resultArr.length)
		}
		ctx.body.contents = resultArr;
		if (resultArr.length === 0) {
			ctx.body.code = 201;
			ctx.body.contents = '缓存不存在且读取出错';
		}else{
			ctx.body.code = 200
		}
		return ctx
	}
}



export default mainObj