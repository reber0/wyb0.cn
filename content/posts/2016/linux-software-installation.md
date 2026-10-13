---
draft: false
date: 2016-04-19 19:07:07
title: Linux 之软件的安装
description: 
categories:
  - Linux
tags:
  - linux
---

Linux上的软件安装可以分为三种方式：

### 0x00 yum安装
```
yum基于RPM包管理，一次性安装所有依赖包，提供了查找、安装、删除一个、一组
至全部软件包的命令，配置文件在/etc/yum.repos.d/下
主要命令：
yum install gcc g++
yum remove wget
yum list installed //显示已经安装过的软件
yum list   //显示所有可以安装的包
```


```
[wyb@localhost ~]$ wget -h  //验证有没有安装wget
-bash: /usr/bin/wget: No such file or directory
[wyb@localhost ~]$ sudo yum search wget  //通过yum查找wget，看有没有这个软件包
Loaded plugins: fastestmirror, refresh-packagekit, security
Loading mirror speeds from cached hostfile
 * base: mirrors.yun-idc.com
 * extras: mirrors.pubyun.com
 * updates: mirrors.yun-idc.com
============================== N/S Matched: wget ===============================
wget.x86_64 : A utility for retrieving files using the HTTP or FTP protocols

  Name and summary matches only, use "search all" for everything.
[wyb@localhost ~]$ sudo yum deplist wget  //列出安装包的依赖项
Loaded plugins: fastestmirror, refresh-packagekit, security
Loading mirror speeds from cached hostfile
 * base: mirrors.yun-idc.com
 * extras: mirrors.pubyun.com
 * updates: mirrors.yun-idc.com
Finding dependencies: 
package: wget.x86_64 1.12-5.el6_6.1
  dependency: libssl.so.10()(64bit)
   provider: openssl.x86_64 1.0.1e-42.el6
   provider: openssl.x86_64 1.0.1e-42.el6_7.1
   provider: openssl.x86_64 1.0.1e-42.el6_7.2
   provider: openssl.x86_64 1.0.1e-42.el6_7.4
[wyb@localhost ~]$ sudo yum install wget  //安装一个或两个软件包
Loaded plugins: fastestmirror, refresh-packagekit, security
Loading mirror speeds from cached hostfile
 * base: mirrors.yun-idc.com
 * extras: mirrors.pubyun.com
 * updates: mirrors.yun-idc.com
Setting up Install Process
Resolving Dependencies
--> Running transaction check
---> Package wget.x86_64 0:1.12-5.el6_6.1 will be installed
--> Finished Dependency Resolution
[wyb@localhost ~]$ sudo yum remove wget   //移除wget
[sudo] password for wyb: 
Loaded plugins: fastestmirror, refresh-packagekit, security
Setting up Remove Process
Resolving Dependencies
--> Running transaction check
---> Package wget.x86_64 0:1.12-5.el6_6.1 will be erased
--> Finished Dependency Resolution
```

### 0x01 rpm安装
分为：二进制包和源代码包  
二进制包可直接安装，源码包会由rpm自动编译、安装，安装包常以src、rpm做为后缀

* 主要参数

```
-ivh *.rpm  安装并显示安装进度
-Uvh *.rpm	升级软件包
-qpl *.rpm	查看rpm软件包内的包含的文件，显示安装后文件释放的绝对路径
-qpi *.rpm	列出rpm软件包的描述信息

-qa 查找所有通过rpm安装的软件
-qf /etc/httpd/conf/httpd.conf  查找文件属于那个安装包
-va 检验软件包有没有丢失信息
-e 软件名    移除软件包
```

* 用rpm安装软件

```bash
[wyb@localhost ~]$ wget http://192.168.1.7/wget-1.12-5.el6_6.1.x86_64.rpm   //使用wget下载软件
--2016-04-18 04:31:27--  http://192.168.1.7/wget-1.12-5.el6_6.1.x86_64.rpm
Connecting to 192.168.1.7:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 494884 (483K) [application/x-rpm]
Saving to: 鈝get-1.12-5.el6_6.1.x86_64.rpm?

100%[======================================>] 494,884     1006K/s   in 0.5s    

2016-04-18 04:31:27 (1006 KB/s) - 鈝get-1.12-5.el6_6.1.x86_64.rpm鈙aved [494884/494884]
```

* 案例

```
[wyb@localhost ~]$ ls
wget-1.12-5.el6_6.1.x86_64.rpm
[wyb@localhost ~]$ sudo rpm -ivh wget-1.12-5.el6_6.1.x86_64.rpm     //安装wget
Preparing...                ########################################### [100%]
   1:wget                   ########################################### [100%]
[wyb@localhost ~]$ sudo rpm -qpl wget-1.12-5.el6_6.1.x86_64.rpm     //查看软件包内的内容
/etc/wgetrc
/usr/bin/wget
/usr/share/doc/wget-1.12
/usr/share/doc/wget-1.12/AUTHORS
/usr/share/doc/wget-1.12/COPYING
/usr/share/doc/wget-1.12/MAILING-LIST
/usr/share/doc/wget-1.12/NEWS
/usr/share/doc/wget-1.12/README
/usr/share/doc/wget-1.12/sample.wgetrc
/usr/share/info/wget.info.gz
/usr/share/locale/be/LC_MESSAGES/wget.mo
/usr/share/locale/bg/LC_MESSAGES/wget.mo
[wyb@localhost ~]$ sudo rpm -qpi wget-1.12-5.el6_6.1.x86_64.rpm     //列出包的描述信息
Name        : wget                         Relocations: (not relocatable)
Version     : 1.12                              Vendor: CentOS
Release     : 5.el6_6.1                     Build Date: Thu 30 Oct 2014 10:22:02 AM PDT
Install Date: (not installed)               Build Host: c6b8.bsys.dev.centos.org
Group       : Applications/Internet         Source RPM: wget-1.12-5.el6_6.1.src.
[wyb@localhost ~]$ rpm -qa |grep wget  //-qa查看所有安装的软件，用grep筛选出来，看有没有安装wget
wget-1.12-5.el6_6.1.x86_64
[wyb@localhost ~]$ which wget
/usr/bin/wget
[wyb@localhost ~]$ sudo rpm -qf /usr/bin/wget   //查看wget这个文件属于那个软件
wget-1.12-5.el6_6.1.x86_64
[wyb@localhost ~]$ sudo rpm -e wget     //写在软件wget
[wyb@localhost ~]$ wget -h
-bash: /usr/bin/wget: No such file or directory
```

### 0x02 源码安装
$ sudo yum groupinstall "Development tools"  //如果你源码安装软件就需要安装这个
```
源代码安装软件：
1、./configure，对系统进行检测然后生成makefile，为下一步的编译做准备
./configure -prefix=/usr软件将安装在/usr下面，可执行文件则会安装在/usr/bin,默认安装在/usr/local/bin
2、make，这一步就是编译，大多数的源码包都经过这一步进行编译，这时软件已经可以用了，不过要通过全路径来执行
实际上它不是编译工具，其实是一个构建工具
3、make install 进行安装，一般你要拥有root权限，因为要向系统写入东西，相当与配环境变量、将二进制文件拷贝到/usr/local/bin下面
4、make clean将由make产生的过程文件清除
```
