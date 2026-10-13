---
draft: false
date: 2016-04-17 20:48:07
title: Linux 之用户和用户组
description: 
categories:
  - Linux
tags:
  - linux
---

### 0x01 新建用户
环境：Ubuntu 14.04.4

* Step1：添加新用户  
useradd -r -m -s /bin/bash 用户名

* Step2:配置新用户密码  
passwd 用户名

* Step3：给新添加的用户增加root权限  
visudo  
然后添加：  
用户名 ALL=(ALL:ALL) ALL

* ctrl+o 保存   ctrl+x 退出


### 0x01 用户组
```
初始组只有一个就是/etc/passwd里gid显示的，有效组可以有多个
```
```
useradd xm   用户xm会默认加到xm组
useradd -g fans xm  将xm的所属组改为fans
useradd -G fans xm  初始组为xm，有效组为fans
```
```
useradd xiaoming
usermod -g fans xiaoming  只有一个初始组，被修改为fans
useradd xm
usermod -G fans xm    xm用户会有两个组，初始组为xm，又添加一个有效组fans
usermod -G fans1 xm    xm用户两个组，初始组为xm，有效组更改为fans1
```
```
用户创建的文件拥有者是初始组
```