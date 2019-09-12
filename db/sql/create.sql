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
 imgTags:   标签对象的字符串

*/
CREATE TABLE IF NOT EXISTS pixiv_imgStorage (
	imgId INTEGER PRIMARY KEY NOT NULL,
	imgTitle VARCHAR(255) NOT NULL,
	imgName VARCHAR(255) NOT NULL,
	imgTags VARCHAR(255) NOT null
);
/*
 保存需要过滤的标签名称
 id 自增主键
 tagName 需要过滤的名称
*/
CREATE TABLE IF NOT EXISTS pixiv_TagsfilterList(
	id INTEGER PRIMARY KEY NOT NULL,
	tagName VARCHAR(255)  NOT NULL UNIQUE
);
