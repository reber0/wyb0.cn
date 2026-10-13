---
draft: false
date: 2017-08-18 18:05:43
title: Docker 之 Dockerfile
description: Dockerfile 中写的是一条条指令，你可以通过 Dockerfile 更简单的构造自己的环境
categories:
  - Linux
tags:
  - docker
---

操作系统：macOS Sierra 10.12.6   
Docker版本：Docker version 18.09.0, build 4d60db4

### 0x00 Dockerfile
```
Dockerfile里面其实是一条条的指令，Docker会把Dockerfile的指令翻译为linux命令，
每一条指令都会创建一个镜像，下一条指令将在这个镜像的基础上进行修改操作后再生成一个镜像。
让你可以对下载好的镜像进行一些操作(比如安装软件、向镜像复制文件等)，从而构造定制化的镜像。
```

### 0x01 Dockerfile基本指令
```bash
FROM <image name>：指定新的镜像基于什么创建(可以尝试使用alpine:latest和debian:jessie)
MAINTAINER <author name>：设置该镜像的作者
COPY <source> <dest>：复制文件，dest要以 / 结尾
WORKDIR /path/to/workdir：相当于切换目录，对RUN、CMD、和ENTRYPOINT生效
RUN <command>：在shell执行命令
EXPOSE port1 port2：容器运行时监听的端口
CMD：容器默认的执行命令，Dockerfile只允许使用一次CMD命令(使用数组)
ENTRYPOINT：类似于CMD，Dockerfile只允许使用一次(使用数组)
ENV <key> <value>：设置环境变量
USER <uid>：镜像正在运行时设置一个uid，即设定启动容器的用户，默认为root
VOLUME ['/data']：授权访问从容器内到主机的目录
```

CMD与ENTRYPOINT的区别：
```bash
#docker run ubuntu:test会执行/bin/echo 'this is test'
CMD ['/bin/echo','this is test']

#docker run ubuntu:test会执行/bin/echo 'entrypoint test'，会输出'entrypoint test'
ENTRYPOINT ['/bin/echo','entrypoint test']

#docker run ubuntu:test init即执行/etc/init.d/mysql init，CMD中的默认参数会被覆盖
ENTRYPOINT ['/etc/init.d/mysql']
CMD ["reinit"]#CMD中的值会作为ENTRYPOINT的默认参数
```

### 0x02 实例
```bash
reber@wyb:~$ tree range
range
├── Dockerfile
└── src
    ├── init.sh
    ├── privileges.sql
    ├── range.zip
    └── sources.list

1 directory, 5 files
```

* Dockerfile

```bash
reber@wyb:~/range$ cat Dockerfile
FROM ubuntu:14.04
MAINTAINER reber <1070018473@qq.com>

COPY ./src /data
WORKDIR /data
RUN chmod +x init.sh
RUN cp sources.list /etc/apt/sources.list && apt-get update && apt-get upgrade -y
RUN apt-get install -y apache2 mysql-server mysql-client php5
RUN apt-get install -y php5-gd php5-mysql libapache2-mod-php5 libapache2-mod-auth-mysql
RUN apt-get clean

RUN apt-get install -y zip
RUN set -x \
    && unzip -x /data/range.zip -d /var/www/html \
    && chmod 777 /var/www/html/range/upload/uploads \
    && chmod 777 /var/www/html/range/xss_platform/upload

WORKDIR /var/www/html
EXPOSE 80

CMD ["/data/init.sh"]
```

* src/privileges.sql

```sql
reber@wyb:~/range$ cat src/privileges.sql
use mysql;
UPDATE user SET password=PASSWORD('root') where USER='root';
FLUSH PRIVILEGES;
```

* src/sources.list

```bash
reber@wyb:~/range$ cat src/sources.list
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

* src/init.sh

```bash
reber@wyb:~/range$ cat src/init.sh
#!/bin/bash
set -x

echo 'start mysql'
find /var/lib/mysql -type f -exec touch {} \; && /etc/init.d/mysql start
sleep 3

echo 'import rtest.sql'
mysql < /var/www/html/range/rtest.sql
sleep 3

echo 'set password'
mysql < /data/privileges.sql

find /var/lib/mysql -type f -exec touch {} \; && /etc/init.d/mysql restart
/etc/init.d/apache2 restart

echo 'set success'

/usr/bin/tail -f /dev/null
```

### 0x03 构建镜像
```bash
#构建镜像
reber@wyb:~/range$ docker build -t range:v1.0 .

#运行容器，并将容器的80端口转到宿主机的8888端口
reber@wyb:~/range$ docker run -itd --name range_test -p 8888:80 range:v1.0
```
运行时mysql没有启动，进容器查看日志如下：
```ini
root@d31d5d70fd29:/var/www/html# cat /var/log/mysql/error.log|grep 'ERROR'
ERROR: 1064  You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'ALTER TABLE user ADD column Show_view_priv enum('N','Y') CHARACTER SET utf8 NOT ' at line 1
190110  5:04:54 [ERROR] Aborting
ERROR: 1050  Table 'plugin' already exists
190110  5:04:58 [ERROR] Aborting
190110  5:05:50 [ERROR] Can't open the mysql.plugin table. Please run mysql_upgrade to create it.
190110  5:05:51 [ERROR] Fatal error: Can't open and lock privilege tables: Got error 140 from storage engine
```
解决方案：  
在启动mysql的语句前执行 ```"find /var/lib/mysql -type f -exec touch {} \;"``` (init.sh中已经加了)  
参考：[https://github.com/docker/for-linux/issues/72](https://github.com/docker/for-linux/issues/72?_blank)和[https://github.com/parsa-epfl/cloudsuite/pull/99](https://github.com/parsa-epfl/cloudsuite/pull/99?_blank)

重新build容器，查看log，启动成功
![](/img/post/20190110-141535.png)

### 0x04 注意事项
* 使用缓存

因为每条指令都会创建一个镜像，若一个镜像已经存在的话则不会重新执行指令创建新镜像，而是直接使用。  
为有效的利用已存在的镜像，应保持Dockerfile的一致性，尽量在末尾修改，比如说前几行都如下设置：
```
FROM ubuntu:14.04

MAINTAINER reber <1070018473@qq.com>

RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sourse.list
RUN apt-get update
RUN apt-get upgrade -y #尽量不要upgrade
```

* 使用标签

始终使用-t参数给镜像打标签：docker build -t ubuntu:range1 .

* 公开端口

Docker镜像应该能在任何主机上运行，所以不要通过Dockerfile映射公有端口，只映射私有端口：EXPOSE 80

* CMD与ENTRYPOINT

应该使用数组语法，两者可以结合使用
```
ENTRYPOINT ["/init.sh"] #docker run的参数将传递给init.sh
CMD ["--help"] #若没有参数传递则显示帮助文档
```