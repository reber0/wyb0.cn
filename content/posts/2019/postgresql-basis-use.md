---
date: 2019-08-23 16:27:12
title: PostgreSQL 简单使用
description: PostgreSQL 简单使用
categories:
  - Database
tags:
  - postgre
---


### 0x00 安装
```
➜  brew install postgresql
➜  echo 'export PATH="/usr/local/Cellar/postgresql/11.4/bin:$PATH"' >> ~/.zshrc
➜  source ~/.zshrc
-- 初始化数据库
➜  initdb /usr/local/var/postgres
➜  pg_ctl -D /usr/local/var/postgres -l /usr/local/var/log/postgres.log start
```

### 0x01 简单操作
* 常用操作命令

```
reber=# \password #设置当前登录用户的密码
reber=# \password [user_name] #设置其他用户的密码
reber=# \l #列出所有数据库
reber=# \du #列出所有用户
reber=# \c [database_name] #连接数据库
reber=# \d #列出当前数据库的所有表
reber=# \d [table_name] #列出表结构
reber=# \conninfo #列出当前数据库和连接的信息
```

* 连接数据库

```bash
➜  psql postgres #初始化数据库后会生成默认的数据库 postgres
psql (11.4)
Type "help" for help.

postgres=# \l #查看当前数据库情况
                              List of databases
   Name    | Owner | Encoding |   Collate   |    Ctype    | Access privileges
-----------+-------+----------+-------------+-------------+-------------------
 postgres  | reber | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 |
 template0 | reber | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =c/reber         +
           |       |          |             |             | reber=CTc/reber
 template1 | reber | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =c/reber         +
           |       |          |             |             | reber=CTc/reber
(4 rows)

postgres=# \du #查看当前用户
                                   List of roles
 Role name |                         Attributes                         | Member of
-----------+------------------------------------------------------------+-----------
 reber     | Superuser, Create role, Create DB, Replication, Bypass RLS | {}

postgres=# \c
You are now connected to database "postgres" as user "reber".
postgres=# \password
Enter new password:
Enter it again:
postgres-# \q
```

* 修改配置文件改端口

vim /usr/local/var/postgres/postgresql.conf
```
port = 55432
```

* 修改配置文件使密码生效(METHOD 改为 md5)

vim /usr/local/var/postgres/pg_hba.conf
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     md5
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     md5
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5
```

然后重启 pg_ctl -D /usr/local/var/postgres -l /usr/local/var/log/postgres.log restart

再次登录就会要求输入密码
```
➜  psql -d postgres -p 55432
Password for user reber:
psql (12.3)
Type "help" for help.

postgres=#
```

* 创建新用户

```
postgres=# create user reber0ask with password '3eRa1kBg95D7';
CREATE ROLE
postgres=# \du
                                   List of roles
 Role name |                         Attributes                         | Member of
-----------+------------------------------------------------------------+-----------
 reber     | Superuser, Create role, Create DB, Replication, Bypass RLS | {}
 reber0ask |                                                            | {}

postgres=#
```

* 为新用户创建新数据库

```
postgres=# create database rscan owner reber0ask;
CREATE DATABASE
postgres=# \l
                                List of databases
   Name    |   Owner   | Encoding |   Collate   |    Ctype    | Access privileges
-----------+-----------+----------+-------------+-------------+-------------------
 postgres  | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 |
 rscan     | reber0ask | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 |
 template0 | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =c/reber         +
           |           |          |             |             | reber=CTc/reber
 template1 | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =c/reber         +
           |           |          |             |             | reber=CTc/reber
(4 rows)

postgres=#
```

* 将新数据库的所有权限都给用户

```
postgres=# grant all privileges on database rscan to reber0ask;
GRANT
postgres=# \l
 postgres  | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 |
 rscan     | reber0ask | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =Tc/reber0ask          +
           |           |          |             |             | reber0ask=CTc/reber0ask
 template0 | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =c/reber               +
           |           |          |             |             | reber=CTc/reber
 template1 | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =c/reber               +
           |           |          |             |             | reber=CTc/reber

postgres=#
```

* 给用户创建数据库的属性

```
postgres=# alter role reber0ask createdb;
ALTER ROLE
postgres=# \du
                                   List of roles
 Role name |                         Attributes                         | Member of
-----------+------------------------------------------------------------+-----------
 reber     | Superuser, Create role, Create DB, Replication, Bypass RLS | {}
 reber0ask | Create DB                                                  | {}

postgres=#
```

### 0x02 以指定用户登陆并创建表

```
➜  psql -d rscan -U reber0ask -h 127.0.0.1 -p 55432
Password for user reber0ask:
psql (11.4)
Type "help" for help.

rscan=> \l
                                List of databases
   Name    |   Owner   | Encoding |   Collate   |    Ctype    | Access privileges
-----------+-----------+----------+-------------+-------------+-------------------
 postgres  | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 |
 rscan     | reber0ask | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 |
 template0 | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =c/reber         +
           |           |          |             |             | reber=CTc/reber
 template1 | reber     | UTF8     | zh_CN.UTF-8 | zh_CN.UTF-8 | =c/reber         +
           |           |          |             |             | reber=CTc/reber
(4 rows)

rscan=> create table msg(
rscan(> id serial primary key,
rscan(> title character varying(100),
rscan(> content character varying(2014)
rscan(> );
CREATE TABLE
rscan=> \d
             List of relations
 Schema |    Name    |   Type   |   Owner
--------+------------+----------+-----------
 public | msg        | table    | reber0ask
 public | msg_id_seq | sequence | reber0ask
(2 rows)

rscan=> \d msg;
                                     Table "public.msg"
 Column  |          Type           | Collation | Nullable |             Default
---------+-------------------------+-----------+----------+---------------------------------
 id      | integer                 |           | not null | nextval('msg_id_seq'::regclass)
 title   | character varying(100)  |           |          |
 content | character varying(2014) |           |          |
Indexes:
    "msg_pkey" PRIMARY KEY, btree (id)

rscan=> insert into public.msg(title,content) values('hi','hello world!');
INSERT 0 1
rscan=> select * from msg;
 id | title |   content
----+-------+--------------
  1 | hi    | hello world!
(1 row)
```

### 0x03 导入与导出
* 导出

```
➜  pg_dump -d rscan -U reber0ask -h 127.0.0.1 -p 55432  > rscan.sql
Password:
➜  ls -al rscan.sql
-rw-r--r--@ 1 reber  staff  15045  5 16 20:54 rscan.sql
```

* 导入

```
➜  psql -d rscan -U reber0ask -h 127.0.0.1 -p 55432
Password for user reber0ask:
psql (12.3)
Type "help" for help.

rscan=> \c postgres
You are now connected to database "postgres" as user "reber0ask".
postgres=> drop database rscan;
ERROR:  database "rscan" is being accessed by other users
DETAIL:  There is 1 other session using the database.
postgres=> revoke connect on database rscan from public;
REVOKE
postgres=> select pg_terminate_backend(pg_stat_activity.pid)
postgres-> from pg_stat_activity
postgres-> where pg_stat_activity.datname = 'rscan';
 pg_terminate_backend
----------------------
 t
(1 row)

postgres=> drop database rscan;
DROP DATABASE

postgres=> create database rscan;
CREATE DATABASE

postgres=> \q
➜  psql -d rscan -U reber0ask -h 127.0.0.1 -p 55432 -f rscan.sql
```

### 0x04 允许远程连接数据库
```
➜  vim  /usr/local/var/postgres/postgresql.conf
listen_addresses = '*'
➜  vim  /usr/local/var/postgres/pg_hba.conf
# TYPE  DATABASE  USER  CIDR-ADDRESS  METHOD
host  all  all 0.0.0.0/0 md5
```

### 0x05 python 简单连接
```
#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
@Author: reber
@Mail: reber0ask@qq.com
@Date: 2019-08-23 15:45:21
@LastEditTime: 2019-08-23 16:22:02
'''

import psycopg2
import contextlib
from urllib.parse import urlparse

class PgSQLX(object):
    def __init__(self, pgsql_uri):
        super(PgSQLX, self).__init__()
        self.pgsql_uri = pgsql_uri
        self.pgsql_info = self.pgsql_parse_uri()

    def pgsql_parse_uri(self):
        o = urlparse(self.pgsql_uri)
        host = o.hostname
        port = o.port
        user = o.username
        password = o.password
        database = o.path[1:]

        return {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'database': database,
        }

    @contextlib.contextmanager
    def init(self):
        dbconn = psycopg2.connect(**self.pgsql_info)
        cursor = dbconn.cursor()
        # dbconn = psycopg2.connect(
        #     host = self.pgsql_info.get('host'),
        #     port = self.pgsql_info.get('port'),
        #     user = self.pgsql_info.get('user'),
        #     password = self.pgsql_info.get('password'),
        #     database = self.pgsql_info.get('database'),
        #     )
        # cursor = dbconn.cursor()

        try:
            yield cursor #这里就是with返回的
        finally:
            dbconn.commit()
            cursor.close()
            dbconn.close()

    def query(self, sql, arg=''):
        try:
            with self.init() as cursor:
                if arg:
                    cursor.execute(sql,arg) #返回受影响行数
                else:
                    cursor.execute(sql)
                result = cursor.fetchall() #返回数据格式是[(),()]
                # result = cursor.fetchone() #返回数据格式是()
                return result
        except Exception as e:
            print(sql,str(e))


if __name__ == '__main__':
    pgsql_uri = "postgresql://reber0ask:3eRa1kBg95D7@192.168.3.19:55432/rscan"
    sqlconn = PgSQLX(pgsql_uri)
    result = sqlconn.query("select * from msg where id=%s",(id,))
    print(result)
```
