# pixiv

# 原图存储方案

作用：下载任务管理和图片保存
1、storageImage 表与 Images 1-1 对应
信息：
1、本地的地址，用静态服务托管，字符串数组，只有 1 个则数组内容为 1
2、导出的次数
3、下载的次数
4、状态：0 创建任务 1 下载中 2 下载完成 3 确认？ -1 本地删除 此是本地地址为空
5、md5

# 数据字典

作用： 1.分类 2.快捷筛选配置

id
name
type
value

scp pi@192.168.10.103:/home/pi/NodeProject/pixivDisk/db/production.db ./db/development.db

yarn build && rm ./dist.tar -rf &&tar -cvf ./dist.tar ./dist/ && scp ./dist.tar pi@192.168.10.103:/home/pi/NodeProject/pixivDisk/dist.tar
