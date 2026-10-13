---
draft: false
date: 2016-06-21 22:30:18
title: SQL 注入之联合查询(MySQL)
description: 
categories:
  - Pentest
tags:
  - SQL注入
---

### 0x00 前提
要用联合查询进行注入则：页面必须有显示位

### 0x01 联合查询
union可合并两个或多个select语句的结果集，前提是两个select必有相同列、且各列的数据类型也相同

### 0x02 注入步骤
1. 找到注入点得到闭合字符
![找到注入点得到闭合字符](/img/post/sqli1_get_closed_character.png)
![确认闭合字符](/img/post/sqli1_check_closed_character.png)

2. 判断数据库类型
![判断数据库类型](/img/post/sqli1_get_type_of_db.png)

3. 猜解列数，得到显示位(从数据库中查询出来的数据有些会显示在页面中，显示的位置就是显示位)
![猜解列数](/img/post/sqli1_order_by.png)
![得到显示位](/img/post/sqli1_get_display_point.png)

4. 得到基本信息(数据库名、版本、数据库版本等)
![得到基础信息](/img/post/sqli1_get_base_msg.png)

5. 得到数据库
![得到数据库个数](/img/post/sqli1_get_db_num.png)
![得到数据库名](/img/post/sqli1_get_db_name.png)

6. 得到security数据库的表名
![得到security数据库的表名](/img/post/sqli1_get_table_name.png)

7. 猜解列名
![得到表列名](/img/post/sqli1_get_column_name.png)

8. 猜解数据
![同时得到用户名和密码](/img/post/sqli1_get_column_value.png)
