---
draft: false
date: 2018-12-15 22:51:04
title: 使用 docker-compose 构造 LAMP 环境
description: 使用 docker-compose 构造 LAMP 环境，其中 mysql 数据、mysql 配置文件、网站文件均为持久化存储。
categories:
  - Linux
tags:
  - docker
---

### 0x00 实现功能
使用docker-compose构造LAMP环境，其中mysql数据库、mysql配置文件、网站文件均持久化存储到本机。

apache、php通过Dockerfile构造，Dockerfile拉取ubuntu镜像，然后安装apache2和php。

mysql的话通过docker的links连接mysql:5.5这个镜像当作数据库。

具体文件参见：[https://github.com/reber0/docker_env](https://github.com/reber0/docker_env?_blank)

### 0x01 文件构造
```
➜  tree apache
apache
├── Dockerfile
├── conf
│   └── my.cnf
├── docker-compose.yml
├── mysql
├── src
│   ├── init.sh
│   └── sources.list
└── web
    └── index.php

4 directories, 6 files
```

### 0x02 docker-compose.yml
```
version: '3'
services:
  apache:
    image: ubuntu:apache #镜像名为ubuntu，tag为apache
    container_name: apache #运行后生成的容器名字为apache
    build: . #使用当前路径下的Dockerfile构造镜像
    ports:
      - "81:80"
    volumes:
      - ./www:/var/www/html
    links:
      - mymysql
    environment: #设置环境变量
      - TZ=Asia/Shanghai #设定时区
    restart: always #容器重启策略：当容器终止退出后，总是重启容器，默认策略。
  mymysql:
    image: mysql:5.5 #拉取mysql:5.5
    container_name: mysql
    ports:
      - "3307:3306"
    volumes:
      - ./mysql:/var/lib/mysql
      - ./conf/my.cnf:/etc/mysql/my.cnf
    environment:
      - MYSQL_ROOT_PASSWORD=root #mysql密码为root
      - TZ=Asia/Shanghai
```

### 0x03 Dockerfile
```bash
FROM ubuntu:14.04.4
MAINTAINER reber <1070018473@qq.com>

COPY ./src /data
WORKDIR /data
RUN chmod +x init.sh
RUN cp sources.list /etc/apt/sources.list && apt-get update
RUN apt-get install -y apache2
RUN apt-get install -y php5 php5-gd php5-mysql libapache2-mod-php5 libapache2-mod-auth-mysql

WORKDIR /var/www/html

CMD ["/data/init.sh"]
#ENTRYPOINT ["tail","-f","/dev/null"]
```

### 0x04 conf/my.cnf
```
[client]
port            = 3306
socket          = /var/run/mysqld/mysqld.sock
default-character-set=utf8

[mysqld]
user            = mysql
port            = 3306
datadir         = /var/lib/mysql
skip-host-cache
skip-name-resolve
character-set-server=utf8
init_connect='SET NAMES utf8'

[mysql]
default-character-set=utf8

!includedir /etc/mysql/conf.d/
```

### 0x05 src/sources.list
```
deb http://debian.ustc.edu.cn/ubuntu/ trusty main restricted universe multiverse
deb http://debian.ustc.edu.cn/ubuntu/ trusty-security main restricted universe multiverse
deb http://debian.ustc.edu.cn/ubuntu/ trusty-updates main restricted universe multiverse
deb http://debian.ustc.edu.cn/ubuntu/ trusty-proposed main restricted universe multiverse
deb http://debian.ustc.edu.cn/ubuntu/ trusty-backports main restricted universe multiverse
deb-src http://debian.ustc.edu.cn/ubuntu/ trusty main restricted universe multiverse
deb-src http://debian.ustc.edu.cn/ubuntu/ trusty-security main restricted universe multiverse
deb-src http://debian.ustc.edu.cn/ubuntu/ trusty-updates main restricted universe multiverse
deb-src http://debian.ustc.edu.cn/ubuntu/ trusty-proposed main restricted universe multiverse
deb-src http://debian.ustc.edu.cn/ubuntu/ trusty-backports main restricted universe multiverse
```

### 0x06 src/init.sh
```bash
#!/bin/bash

service apache2 restart
tail -f /dev/null
```

### 0x07 www/index.php
```
<?php
    //因为使用了links，所以在apache这个容器中可以直接用"mymysql"字符连接数据库，使用links后的
    //效果可以理解为(实际上没有)在apache这个容器的hosts文件中添加了"mymysql"字符到mysql容器的ip的映射
    $link = mysql_connect("mymysql", "root", "root");
    if(!$link)
        die('Could not connect: ' . mysql_error());
    else
        echo "Successfully connect to the mysql.";
    mysql_close($link);
?>
```

### 0x08 启动后访问
![80](/img/post/20181215-231620.png)
