---
draft: false
date: 2018-12-25 23:34:56
title: Oracle 数据库简单使用
description: 
categories:
  - Database
tags:
  - oracle
---

### 0x00 关于Oracle
* 完整的Oracle数据库通常由两部分组成：Oracle数据库和数据库实例。
* 数据库是一系列物理文件的集合（数据文件，控制文件，联机日志，参数文件等）
* Oracle数据库实例则是一组Oracle后台进程/线程以及在服务器分配的共享内存区
* 关于部分视图
    * ```DBA/ALL/USER/V_$/GV_$/SESSION/INDEX```开头的绝大部分都是视图
    * DBA_TABLES意为DBA拥有的或可以访问的所有的关系表。
    * ALL_TABLES意为某一用户拥有的或有权限访问的所有的关系表。
    * USER_TABLES意为某一用户所拥有的所有的关系表。
    * 当某一用户本身就为数据库DBA时，DBA_TABLES与ALL_TABLES等价。
    * ```DBA_TABLES >= ALL_TABLES >= USER_TABLES```

### 0x01 关于实例
* 在启动Oracle数据库服务器时，实际上是在服务器的内存中创建一个Oracle实例（即在服务器内存中分配共享内存并创建相关的后台内存）
* 我们访问Oracle都是访问一个实例，通过Oracle数据库实例来访问和控制磁盘中的数据文件
* Oracle实例如果关联了数据库文件，就是可以访问的，如果没有，就会得到实例不可用的错误
* 实例名指的是用于响应某个数据库操作的数据库管理系统的名称，它同时也叫SID，连接数据库时就会用到这个SID，如：jdbc:oracle:thin:@localhost:1521:orcl（orcl就为数据库实例名）

### 0x02 关于表空间(可以理解为mysql中的数据库)
* Oracle数据库是通过表空间来存储物理表的，一个数据库实例可以有N个表空间，一个表空间下可以有N张表。
* 用户和表空间是多对多的关系，但是一般创建用户时会指定一个默认表空间。
* 表空间是数据库中最大的逻辑单位，一个表空间可以包含多个数据文件，而一个数据文件只能隶属一个表空间。

### 0x03 搭建Oracle环境
使用docker拉取Oracle数据库并且运行
```
[23:36 reber@wyb in ~]
➜  docker pull alexeiled/docker-oracle-xe-11g
[23:36 reber@wyb in ~]
➜  docker run --rm -tid --shm-size=2g -p 1521:1521 -p 8080:8080 alexeiled/docker-oracle-xe-11g
```
然后在[www.oracle.com](https://www.oracle.com/technetwork/database/database-technologies/instant-client/downloads/index.html?_blank)下载链接Oracle的客户端：instantclient-basic-macos、instantclient-sqlplus-macos
```
[15:41 reber@wyb in ~/Downloads]
➜  unzip instantclient-basic-macos.x64-12.2.0.1.0-2.zip
Archive:  instantclient-basic-macos.x64-12.2.0.1.0-2.zip
  inflating: instantclient_12_2/BASIC_README
  inflating: instantclient_12_2/adrci
  inflating: instantclient_12_2/genezi
    linking: instantclient_12_2/libclntsh.dylib  -> libclntsh.dylib.12.1
  inflating: instantclient_12_2/libclntsh.dylib.12.1
  inflating: instantclient_12_2/libclntshcore.dylib.12.1
  inflating: instantclient_12_2/libnnz12.dylib
    linking: instantclient_12_2/libocci.dylib  -> libocci.dylib.12.1
  inflating: instantclient_12_2/libocci.dylib.12.1
  inflating: instantclient_12_2/libociei.dylib
  inflating: instantclient_12_2/libocijdbc12.dylib
  inflating: instantclient_12_2/libons.dylib
  inflating: instantclient_12_2/liboramysql12.dylib
  inflating: instantclient_12_2/ojdbc8.jar
  inflating: instantclient_12_2/uidrvci
  inflating: instantclient_12_2/xstreams.jar
finishing deferred symbolic links:
  instantclient_12_2/libclntsh.dylib -> libclntsh.dylib.12.1
  instantclient_12_2/libocci.dylib -> libocci.dylib.12.1
[15:41 reber@wyb in ~/Downloads]
➜  unzip instantclient-sqlplus-macos.x64-12.2.0.1.0-2.zip
Archive:  instantclient-sqlplus-macos.x64-12.2.0.1.0-2.zip
  inflating: instantclient_12_2/SQLPLUS_README
  inflating: instantclient_12_2/glogin.sql
  inflating: instantclient_12_2/libsqlplus.dylib
  inflating: instantclient_12_2/libsqlplusic.dylib
  inflating: instantclient_12_2/sqlplus
[15:42 reber@wyb in ~/Downloads]
➜  sudo mv instantclient_12_2 /opt/
Password:
[15:42 reber@wyb in ~/Downloads]
➜  ls /opt
RAR                  instantclient_12_2
chromedriver         metasploit-framework
➜  tail -n 5 ~/.zshrc
# oracle sqlplus
export PATH="$PATH:/opt/instantclient_12_2"
```
连接数据库
```
[16:03 reber@wyb in ~/Downloads]
➜  sqlplus system/oracle@127.0.0.1/xe

SQL*Plus: Release 12.2.0.1.0 Production on Tue Dec 25 16:03:25 2018

Copyright (c) 1982, 2017, Oracle.  All rights reserved.

Connected to:
Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production

SQL>
```

### 0x04 表空间操作
* 查看表空间
    ```sql
    --下面的表空间每个用户都默认存在
    SQL> select tablespace_name,status from user_tablespaces;

    TABLESPACE_NAME                STATUS
    ------------------------------ ---------
    SYSTEM                         ONLINE
    SYSAUX                         ONLINE
    UNDOTBS1                       ONLINE
    TEMP                           ONLINE
    USERS                          ONLINE
    ```
* 创建表空间
    ```sql
    --创建数据表空间
    SQL> create tablespace db_test_data --创建一个新的表空间，名字是db_test_data
      2  datafile '/tmp/db_test_data.dbf' --表空间数据文件路径
      3  size 64m --表空间初始大小
      4  autoextend on
      5  next 64m maxsize 2048m
      6  extent management local;

    Tablespace created.

    --创建临时表空间
    SQL> create temporary tablespace db_test_temp
      2  tempfile '/tmp/db_test_temp.dbf'
      3  size 64m
      4  autoextend on
      5  next 64m maxsize 2048m
      6  extent management local;

    Tablespace created.

    -- 再次查看表空间
    SQL> select tablespace_name,status from user_tablespaces;

    TABLESPACE_NAME        STATUS
    ---------------------- ---------
    SYSTEM                 ONLINE
    SYSAUX                 ONLINE
    UNDOTBS1               ONLINE
    TEMP                   ONLINE
    USERS                  ONLINE
    DB_TEST_DATA           ONLINE
    DB_TEST_TEMP           ONLINE

    7 rows selected.
    ```
* 创建用户并指定表空间的映射
    ```sql
    SQL> create user utest identified by ptest
      2  default tablespace db_test_data --默认用户表空间
      3  temporary tablespace db_test_temp; --默认临时表空间

    --dba权限查看用户
    SQL> select username,default_tablespace,temporary_tablespace from dba_users;

    USERNAME             DEFAULT_TABLESPACE   TEMPORARY_TABLESPACE
    -------------------- -------------------- --------------------
    UTEST                DB_TEST_DATA         DB_TEST_TEMP
    SYS                  SYSTEM               TEMP
    ANONYMOUS            SYSAUX               TEMP
    SYSTEM               SYSTEM               TEMP
    APEX_PUBLIC_USER     SYSTEM               TEMP
    APEX_040000          SYSAUX               TEMP
    XS$NULL              SYSTEM               TEMP
    OUTLN                SYSTEM               TEMP
    FLOWS_FILES          SYSAUX               TEMP
    MDSYS                SYSAUX               TEMP
    CTXSYS               SYSAUX               TEMP
    XDB                  SYSAUX               TEMP
    HR                   USERS                TEMP

    13 rows selected.
    ```
* 给用户授予权限(也可以创建有相应权限的角色然后授予角色)
    ```sql
    --赋予用户角色，Oracle有dba、connect、resource这3个角色
    SQL> grant connect,resource to utest;

    Grant succeeded.

    --赋予用户系统权限，有create session,unlimited tablespace,create table,create view,create any index,create sequence,create type等
    SQL> grant create view,create any index to utest;

    Grant succeeded.

    --在db_test_data这个表空间下创建表tuser，不加tablespace db_test_data的话默认创建在SYSTEM这个表空间下
    SQL> create table tuser(
      2  id int not null primary key,
      3  username varchar(10) not null,
      4  password varchar(32) not null
      5  ) tablespace db_test_data;

    Table created.

    --创建的对比的表，这个表在下面不会授权给用户utest
    SQL> create table temp(
      2  id int not null primary key,
      3  tmp varchar(5) not null
      4  ) tablespace db_test_data;

    Table created.

    --查看当前用户在表空间DB_TEST_DATA有权限查看的表，这里的表空间需要大写
    SQL> select table_name,owner from all_tables where tablespace_name='DB_TEST_DATA';
    TABLE_NAME        OWNER
    ----------------- ---------
    TUSER             SYSTEM
    TEMP              SYSTEM

    --赋予用户对象权限，有select,insert,alter,update,delete,index,preferences等
    --这里是赋予utest增删改查SYSTEM的tuser表的权限，如果不赋予的话utest对tuser就没有操作权限
    SQL> grant select,insert,update,delete on tuser to utest;

    Grant succeeded.
    ```

    ```sql
    --删除空的表空间，不包含物理文件
    drop tablespace tablespace_name;
    --删除空的表空间，包含物理文件
    drop tablespace tablespace_name including datafiles;

    --删除非空表空间，不包含物理文件
    drop tablespace tablespace_name including contents;
    --删除非空表空间，包含物理文件
    drop tablespace tablespace_name including contents and datafiles;

    --移除用户角色权限
    revoke connect,resource from utest;
    --撤回用户系统权限
    revoke create view,create any index from utest;
    --撤回用户对象权限
    revoke select,insert,update,delete on tuser from utest;
    --删除用户
    drop user utest cascade;
    ```

### 0x05 切换到用户utest
* 查看相关权限
    ```sql
    --切换用户
    SQL> conn utest/ptest@127.0.0.1/xe
    Connected.

    --查看当前用户的角色
    SQL> select role from session_roles;

    ROLE
    ------------------------------
    CONNECT
    RESOURCE

    --查看当前用户的角色所包含的权限
    SQL> select * from role_sys_privs;

    ROLE             PRIVILEGE            ADM
    ---------------- -------------------- -------
    RESOURCE         CREATE SEQUENCE      NO
    RESOURCE         CREATE TRIGGER       NO
    RESOURCE         CREATE CLUSTER       NO
    RESOURCE         CREATE PROCEDURE     NO
    RESOURCE         CREATE TYPE          NO
    CONNECT          CREATE SESSION       NO
    RESOURCE         CREATE OPERATOR      NO
    RESOURCE         CREATE TABLE         NO
    RESOURCE         CREATE INDEXTYPE     NO

    9 rows selected.

    --当前用户的系统权限
    SQL> select * from user_sys_privs;

    USERNAME        PRIVILEGE                 ADM
    --------------- ------------------------- ----------
    UTEST           CREATE VIEW               NO
    UTEST           UNLIMITED TABLESPACE      NO
    UTEST           CREATE ANY INDEX          NO

    --当前用户的对象权限
    SQL> select grantee,privilege from user_tab_privs;

    GRANTEE          PRIVILEGE
    ---------------- ---------------
    UTEST            UPDATE
    UTEST            SELECT
    UTEST            INSERT
    UTEST            DELETE

    --查看当前用户的全部权限
    SQL> select * from session_privs;

    PRIVILEGE
    ---------------------------
    CREATE SESSION
    UNLIMITED TABLESPACE
    CREATE TABLE
    CREATE CLUSTER
    CREATE ANY INDEX
    CREATE VIEW
    CREATE SEQUENCE
    CREATE PROCEDURE
    CREATE TRIGGER
    CREATE TYPE
    CREATE OPERATOR
    CREATE INDEXTYPE

    12 rows selected.
    ```
* 查看当前用户的表空间
    ```sql
    SQL> select tablespace_name from user_tablespaces;

    TABLESPACE_NAME
    ------------------------------
    SYSTEM
    SYSAUX
    UNDOTBS1
    TEMP
    USERS
    DB_TEST_DATA
    DB_TEST_TEMP

    7 rows selected.

    SQL> select username,default_tablespace,temporary_tablespace from user_users;

    USERNAME      DEFAULT_TABLESPACE     TEMPORARY_TABLESPACE
    ------------- ---------------------- ------------------------
    UTEST         DB_TEST_DATA           DB_TEST_TEMP

    SQL>
    ```
* 表与数据操作
    ```sql
    --创建自己的表，这里没有指定，则用默认表空间DB_TEST_DATA
    SQL> create table tmsg(
      2  id int not null primary key,
      3  title varchar(20) not null,
      4  content varchar(100) not null);

    Table created.

    --再次查看当前用户在表空间DB_TEST_DATA有权限查看的表，tuser表给了权限可以查到，temp表没有给权限所以查不到
    SQL> select table_name,owner from all_tables where tablespace_name='DB_TEST_DATA';
    TABLE_NAME        OWNER
    ----------------- ---------
    TUSER             SYSTEM
    TMSG              UTEST

    --向表tuser插入数据，表是system的，所以需要加system.
    SQL> insert into system.tuser(id,username,password) values(1,'aaa','123456');

    1 row created.

    --向tmsg插入数据，表是当前用户utest的，这里其实也是utest.tmsg，不过默认缺省了utest.
    SQL> insert into tmsg(id,title,content) values(1,'hi','hello,world!');

    1 row created.

    SQL> select * from system.tuser;

        ID  USERNAME     PASSWORD
    ------- ------------ -------------------
          1 aaa          123456

    SQL> select * from tmsg;

        ID  TITLE        CONTENT
    ------- ------------ -------------------
          1 hi           hello,world!

    SQL>
    ```


#### Reference(侵删)：
* [https://www.aliyun.com/jiaocheng/318905.html](https://www.aliyun.com/jiaocheng/318905.html?_blank)
* [https://www.cnblogs.com/jiangxinnju/p/5840420.html](https://www.cnblogs.com/jiangxinnju/p/5840420.html?_blank)
