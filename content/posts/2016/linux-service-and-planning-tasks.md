---
draft: false
date: 2016-04-19 10:03:07
title: Linux 之服务和计划任务
description: 
categories:
  - Linux
tags:
  - linux
---

### 0x00 服务：
在后台运行的软件就叫服务，参数一般为：start/stop/restart

* apache启动后默认降权
```
service httpd start实际调用的是/etc/init.d/httpd这个shell脚本
而/etc/init.d是软连接文件夹，实际在/etc/rc.d/init.d
[wyb@localhost ~]$ ls -al /etc/init.d
lrwxrwxrwx. 1 root root 11 Apr 11 02:54 /etc/init.d -> rc.d/init.d
```

* 添加服务  
将脚本放在/etc/init.d/下即可
    
* 若要自启则
```
chkconfig --list   //查看chk管理的自启动项
chkconfig --add httpd	添加到chk管理里面
chkconfig --del httpd   将httpd移出chk管理
chkcofnig --level 35 httpd on  init的345将开启
chkcofnig --level 345 httpd off
/etc/rc.d/rc3.d和rc5.d里将有httpd
```

### 0x01 计划任务
系统启动时将有一个脚本将cron服务开启，启动后cron命令会搜索全局型配置文件/etc/crontab和位于/var/spool/corn目录下以用户名命名的文件

cron每分钟醒来依次查看当前是否有需要运行的命令，最小单位就是分钟

任务格式：分(0-59) 时 日 月 周(0-6) 命令
    
* 添加任务第一种方法

```
crontab -e	//任何权限都可以运行这个命令，针对某个用户

[wyb@localhost spool]$ crontab -e   //进入编辑，实际是写入到/var/spool/cron/username这个文件中
no crontab for wyb - using an empty one
*/1 * * * * date >> /tmp/date.txt   //每一分钟都向date.txt写入
1 * * * * date >> /tmp/date1.txt		//在第一分钟时将数据写入
~
~
~
"/tmp/crontab.T8sDqC" 1L, 34C written
crontab: installing new crontab
[wyb@localhost spool]$ sudo ls /var/spool/cron/
wyb
[wyb@localhost spool]$ sudo cat /var/spool/cron/wyb
*/1 * * * * date >> /tmp/date.txt
1 * * * * date >> /tmp/date1.txt
[wyb@localhost spool]$ 
```

* 添加任务第二种方法

```
编辑/etc/crontab文件    //要具有root权限，针对系统任务
vim /etc/crontab会以root权限执行，不推荐使用
01 * * * *　用户名　命令 date >> /tmp/date2.txt在每个小时的第一分钟执行
```

* 查看用户任务

```
[wyb@localhost tmp]$ sudo cat /var/spool/cron/wyb   //用户的计划任务
*/1 * * * * date >> /tmp/date.txt
[wyb@localhost tmp]$ sudo tail -8 /etc/crontab   //系统计划任务
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
*/1 * * * * wyb date >> /tmp/wyb.txt
[wyb@localhost tmp]$ crontab -l   //只能显示普通用户定义的任务
*/1 * * * * date >> /tmp/date.txt
[wyb@localhost tmp]$ crontab -r   //移除用户所有计划任务，不能移除系统定的计划任务，即不能移除在/etc/crontab中的任务
[wyb@localhost tmp]$ crontab -l
no crontab for wyb
[wyb@localhost tmp]$ sudo tail -8 /etc/crontab 
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
*/1 * * * * wyb date >> /tmp/wyb.txt
```
