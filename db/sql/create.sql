/*
 榜单缓存表
 id:唯一标识id 自增
 listFromDate: text 哪一天的数据 
 listType: text 榜单类型
 result: text 接口返回值
*/
CREATE TABLE IF NOT EXISTS pixiv_listStorage (
	listId INTEGER PRIMARY KEY NOT NULL,
	listFromDate VARCHAR(255) NOT NULL,
	listType VARCHAR(255) NOT NULL,
	listPage SMALLINT NOT NULL, 
	result VARCHAR(255) NOT NULL
);

/*
 下载过的图片的信息保存
 imgId:唯一标识id 取p站图片id
 imgTitle   p站标题 
 imgName:   图片的名称，带后缀  
 tagName:   标签名称      p站来源通常为日文 
 romaji     罗马音        
 tagTrans   翻译          如果有 源取json对象中的en 
*/
CREATE TABLE IF NOT EXISTS pixiv_imgStorage (
	imgId INTEGER PRIMARY KEY NOT NULL,
	imgTitle VARCHAR(255) NOT NULL,
	imgName VARCHAR(255) NOT NULL,
	imgTags VARCHAR(255) NOT null
);
