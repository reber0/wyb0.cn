---
draft: false
date: 2017-02-07 10:49:38
title: 301 重定向
description: 
categories:
  - Other
tags:
  - 重定向
---


### 0x00 目的
```
由于博客更换了域名，原来百度收录的都成了死链，所以做一下301重定向
我使用的是github搭建的博客，都是html的文件，先把html文件都上传到自己的服务器上，
修改dns使原域名指向服务器，让百度收录的链接都能够访问，然后设置301

服务器环境：Ubuntu 14.04.5、Apache2
```

### 0x01 开启rewrite模块
```
$ sudo a2enmod rewrite
```

### 0x02 根目录下新建.htaccess：
```
Options +FollowSymLinks
RewriteEngine on
RewriteRule ^(.*)$ http://wyb0.com/$1 [L,R=301]  # 这里换上新域名
```

### 0x03 修改配置文件
```
# AllowOverride None 改为AllowOverride All

$ sudo vim /etc/apache2/apache2.conf
<Directory /var/www/>
    Options FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

### 0x04 重启Apache
```
$ sudo /etc/init.d/apache2 restart
```
