/*
 榜单缓存表
 id:唯一标识id 自增
 listFromDate: text 哪一天的数据 
 listType: text 榜单类型
 result: text 接口返回值
*/
CREATE TABLE IF NOT EXISTS listStorage (
	listId INTEGER PRIMARY KEY NOT NULL,
	listFromDate VARCHAR(255) NOT NULL,
	listType VARCHAR(255) NOT NULL,
	listPage SMALLINT NOT NULL, 
	result VARCHAR(255) NOT NULL
);
