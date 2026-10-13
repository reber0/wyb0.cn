---
draft: false
date: 2016-08-12 08:39:35
title: Linux 下虚拟主机搭建多站点
description: 
categories:
  - Server
tags:
  - server
---

环境：CentOS-6.5-x86_64-minimal

### 0x00 搭建LAMP
* 安装Apache
    ```
    yum install httpd
    ```

* 安装MySQL
    * yum install mysql mysql-server
    * 设置数据库
    ```
    [reber@localhost conf]$ sudo mysql_secure_installation
    # 更新root密码：
    [reber@localhost conf]$ mysql -uroot –p
    mysql> use mysql;
    mysql> update user set password=password('123456') where user='root';
    mysql> flush privileges;  //不想重启mysql就使新密码生效就需要运行此命令刷新
    mysql> insert into mysql.user(Host,User,Password) values("localhost","blog",password("123456"));
    # mysql> detele form mysql.user where User='blog' and Host='localhost';  //这步可以删除用户
    mysql> flush privileges;  //刷新
    mysql> create database db_blog;
    Query OK, 1 row affected (0.00 sec)
    # 授权用户"blog"拥有db_blog数据库的所有权限
    mysql> grant all privileges on db_blog.* to blog@localhost identified by '666666';
    mysql> flush privileges;  //刷新
    [reber@localhost conf]$ mysql –ublog –p  //此时就需要用666666登陆数据库db_blog
    ```

* 安装PHP  
```
$ yum install php php-mysql php-gd php-imap php-ldap php-mbstring php-odbc php-pear php-xml php-xmlrpc
```

* 验证AMP搭建成功  
```
[reber@localhost html]$ echo "<?php phpinfo();?>" >> index.php
```
![测试lamp环境](/img/post/linux_virtual_host_test.png)

### 0x01 设置虚拟主机
[reber@localhost html]$ sudo vim /etc/httpd/conf/httpd.conf
![设置端口](/img/post/linux_virtual_host_set_port.png)
![设置虚拟主机](/img/post/linux_virtual_host_set_virtualhost.png)
![设置虚拟主机](/img/post/linux_virtual_host_add_file.png)

### 0x02 修改本地windows的hosts文件，进行测试
![设置虚拟主机](/img/post/linux_virtual_host_change_hosts.png)
![测试虚拟主机](/img/post/linux_virtual_host_visit_site.png)

### 0x03 搭建WordPress
* 下载WordPress并设置
```
$ cd /var/www/blog
$ sudo wget https://cn.wordpress.org/wordpress-4.5-zh_CN.tar.gz
$ tar -zxvf wordpress-4.5-zh_CN.tar.gz
$ chown –R  apache:apache  wordpress-4.5
$ mv /var/www/blog/wordpress-4.5/* ../
$ rm -rf wordpress-4.5
```

* 安装WordPress
![安装WordPress1](/img/post/linux_virtual_host_install_wordpress1.png)
![安装WordPress2](/img/post/linux_virtual_host_install_wordpress2.png)

### 0x04 登陆后台写博客
![后台登陆](/img/post/linux_virtual_host_login_background.png)
![添加文章](/img/post/linux_virtual_host_add_article.png)
