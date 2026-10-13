---
draft: false
date: 2016-06-18 09:40:06
title: Linux 下搭建 FTP
description: 
categories:
  - Server
tags:
  - server
---


安装环境为：CentOS-6.5-x86_64-minimal

### 0x00 安装
yum install vsftpd

### 0x01 配置
1. 备份  
cp /etc/vsftpd/vsftpd.conf /etc/vsftpd/vsftpd.conf.bak

2. 编辑配置文件
```sh
vim /etc/vsftpd/vsftpd.conf
anonymous_enable=NO	#设定不允许匿名访问
local_enable=YES	#设定本地用户可以访问
chroot_list_enable=YES	#使用户不能离开主目录
xferlog_file=/var/log/vsftpd.log	#设定vsftpd的服务日志
ascii_upload_enable=YES
ascii_download_enable=YES	#设定支持ASCII
pam_service_name=vsftpd	#PAM认证文件名,PAM将根据/etc/pam.d/vsftpd进行认证
# 并在尾部追加：
guest_enable=YES	#设定启用虚拟用户功能。
guest_username=ftp	#指定虚拟用户的宿主用户。-CentOS中已经有内置的ftp用户了
guest_config_dir=/etc/vsftpd/vuser_conf	#设定虚拟用户个人vsftp的配置文件存放路径。存放虚拟用户个性化的配置文件名，和虚拟用户名相同
```

3. 新增chroot\_list并将ftp用户输入进去  
touch /etc/vsftpd/chroot_list  
echo ftp >> /etc/vsftpd/chroot_list

4. 安装Berkeley DB工具用来对虚拟用户认证配置管理：  
yum install db4 db4-utils

5. 创建用户账户文件
```
vim /etc/vsftpd/vuser_passwd.txt
user1	#奇数行是用户名
123456	#偶数行是密码
user2	#奇数行是用户名
666666	#偶数行是密码
user3	#奇数行是用户名
user3	#偶数行是密码
```

6. 用Berkeley DB工具生成认证文件  
db_load -T -t hash -f /etc/vsftpd/vuser_passwd.txt   /etc/vsftpd/vuser_passwd.db

7. 编辑/etc/pam.d/vsftpd，注释掉所有原来内容，添加如下内容：
```
auth required pam_userdb.so db=/etc/vsftpd/vuser_passwd
account required pam_userdb.so db=/etc/vsftpd/vuser_passwd
```

### 0x02 针对每个用户增加个性化配置文件
配置后user1登陆后所在目录就是/var/ftphome了，而user2、user3登陆后还是在默认的/var/ftp/
```
mkdir /etc/vsftpd/vuser_conf/
vim /etc/vsftpd/vuser_conf/user1
local_root=/var/ftphome/   #此目录位置可以修改
write_enable=YES #可写
anon_umask=022 #掩码
anon_world_readable_only=NO
anon_upload_enable=YES
anon_mkdir_write_enable=YES
anon_other_write_enable=YES
创建目录并修改权限：
mkdir /var/ftphome
chmod 777 /var/ftphome
```

### 0x03 启动服务
service vsftpd start  
此时就可以用用户名登陆ftp了(只能终端登录)