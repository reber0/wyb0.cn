---
draft: false
date: 2016-05-12 15:27:14
title: 使用 theHarvester 得到邮箱
description: 
categories:
  - Pentest
tags:
  - tools
---

### 0x00 软件
```
使用theHarvester搜集邮箱
使用dnsenum得到邮箱服务器域名
使用nmap查看端口开启情况
使用Hydra进行弱口令猜解
```

### 0x01 设置Shadowsocks为全局模式:
![设置SS为全局代理](/img/post/SS.png)

### 0x02 得到邮箱
可在[theHarvester](https://github.com/laramies/theHarvester)下载theHarvester，得到邮箱后做成字典user.txt
![查看theHarvester的帮助信息](/img/post/theHarvester_help.png)
![得到邮箱1](/img/post/theHarvester_getemail1.png)
![得到邮箱2](/img/post/theHarvester_getemail2.png)

### 0x03 得到邮箱服务器域名
![dnsenum得到邮箱服务器域名](/img/post/dnsenum.png)

### 0x04 nmap确认端口开启
![nmap确认邮箱服务器在运行](/img/post/nmap_-p.png)

### 0x05 Hydra爆密码
![hydra猜解密码](/img/post/hydra1.png)
![hydra猜解到密码](/img/post/hydra2.png)

### 0x06 尝试登陆
![尝试登陆](/img/post/sign_in.png)
