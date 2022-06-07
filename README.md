# pixiv

# 原图存储方案
作用：下载任务管理和图片保存
1、storageImage 表与 Images 1-1 对应
    信息：
        1、本地的地址，用静态服务托管，字符串数组，只有1个则数组内容为1
        2、导出的次数
        3、下载的次数
        4、状态：0 创建任务 1 下载中 2 下载完成 3 确认？  -1 本地删除 此是本地地址为空
        5、md5 

scp pi@192.168.10.103:/home/pi/NodeProject/pixivDisk/db/production.db ./db/development.db