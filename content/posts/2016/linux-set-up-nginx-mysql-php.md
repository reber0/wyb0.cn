---
draft: false
date: 2016-06-17 22:41:50
title: Linux 下搭建 Nginx+MySQL+PHP
description: 
categories:
  - Server
tags:
  - server
---

安装环境为：CentOS-6.5-x86_64-minimal

### 0x00 准备工作
```
首先执行：
    sudo yum groupinstall "Development tools"
安装make：
    yum -y install gcc automake autoconf libtool make
安装g++：
    yum install gcc gcc-c++
```

### 0x01 安装mysql和php
```sh
sudo yum install mysql mysql-server mysql-devel
sudo yum install php php-devel
sudo yum install php-gd php-mysql php-fpm
```

### 0x02 安装依赖
1. 安装pcre、pcre-devel  
sudo yum install pcre pcre-devel

2. 安装zlib、zlib-devel  
sudo yum install zlib zlib-devel

3. 安装ssl  
sudo yum install openssl openssl-devel

### 0x03 安装Nginx
可在http://nginx.org/download/nginx-1.9.9.tar.gz 下载
![下载nginx安装包](/img/post/download_nginx.png)
```sh
#Ubuntu中需要依赖：libpcre3 libpcre3-dev zlib1g-dev libssl-dev build-essential
[reber@WYB nginx-1.9.9]$ ./configure
[reber@WYB nginx-1.9.9]$ make
[reber@WYB nginx-1.9.9]$ sudo make install
```

### 0x04 启动与关闭nginx
```sh
# 开启服务：
[reber@WYB nginx-1.9.9]$ sudo /usr/local/nginx/sbin/nginx
# 关闭服务：
[reber@WYB nginx-1.9.9]$ killall nginx
```
![访问nginx.png](/img/post/visit_nginx.png)

### 0x05 配置nginx支持php
[reber@WYB nginx-1.9.9]$ killall nginx  
[reber@WYB nginx-1.9.9]$ vim /usr/local/nginx/conf/nginx.conf

```
location / {
    root   html;
    index  index.html index.htm index.php;
}

location ~ \.php$ {
    root           html;
    fastcgi_pass   127.0.0.1:9000;
    fastcgi_index  index.php;
    fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    include        fastcgi_params;
}
```
```sh
[reber@WYB nginx-1.9.9]$ sudo service php-fpm start
[reber@WYB nginx-1.9.9]$ sudo /usr/local/nginx/sbin/nginx
```
![访问nginx的phpinfo.php](/img/post/visit_nginx_phpinfo.png)