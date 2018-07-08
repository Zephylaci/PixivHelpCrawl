SET NAMES utf8mb4;

CREATE DATABASE  IF NOT EXISTS imageAdmin DEFAULT CHARSET=utf8mb4;
use imageAdmin;
/*
 userList 用户表

CREATE TABLE IF NOT EXISTS userList(
	`uid` INT PRIMARY KEY AUTO_INCREMENT,
	`user` VARCHAR(10),
	`password` VARCHAR(255),
	`salt` VARCHAR(255),
	`createTime` BIGINT,
	`lastLoginTime` BIGINT
);

ALTER TABLE userList ADD UNIQUE (user);
*/
/*
 todoList todoList表
 id 唯一标示
 sort 排序，展示顺序越小越优先，同级的话按先后顺序算
 state 状态 0 创建  1完成 2不展示
 content 内容
 createTime 创建时间
 completeTime 完成时间

CREATE TABLE IF NOT EXISTS todoList(
	`id` INT PRIMARY KEY AUTO_INCREMENT,
	`sort` TINYINT,
	`state` TINYINT,
	`content`  VARCHAR(255),
	`createTime` BIGINT,
	`completeTime` BIGINT
);
*/
/*
 imgStorage 图片总表
 imgId:图片唯一标识id 入库的时候存时间戳来作为唯一id
 imgTitle p站标题
 imgName:图片的名称，带后缀
 imgPath:图片可以通过url访问的相对路径
 imgTruePath: 绝对路径
 imgOrigin:图片来源
 imgDescribe 图片描述或注释
*/
CREATE TABLE IF NOT EXISTS imgStorage (
	`imgId` BIGINT PRIMARY KEY ,
	`imgTitle` VARCHAR(60),
	`imgName` VARCHAR(255) UNIQUE,
	`imgPath` VARCHAR(255),
	`imgTruePath` VARCHAR(255),
	`imgOrigin` VARCHAR(255),
	`imgDescribe` VARCHAR(255) DEFAULT null
)CHARACTER SET utf8mb4;

/*
 pixivTages 统计下载图片tag用表
 tagId: 自增数字
 tagName: 标签名称 
 romaji 罗马音
 tagTrans 翻译如果有，存一个JSON 字符串 
 imgTitle p站标题 
 authorName 作者名称
 authorId 作者Id
 imgName: 图片的名称，带后缀
*/

CREATE TABLE IF NOT EXISTS pixivTages(
	`tagId` INT PRIMARY KEY AUTO_INCREMENT ,
	`tagName` VARCHAR(60),
	`romaji`  VARCHAR(60),
    `tagTrans` VARCHAR(255),
	`imgTitle` VARCHAR(60),
	`authorName` VARCHAR(30),
	`authorId` INT,
	`imgName` VARCHAR(255)
);
