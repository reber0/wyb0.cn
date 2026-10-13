---
draft: false
date: 2016-06-02 13:21:49
title: PHP 之 MySQL 常用函数
description: 
categories:
  - PHP
  - Database
tags:
  - php
  - mysql
---

### 0x00 处理函数
1. mysql_connect(server,user,pwd,newlink,clientflag)  
连接服务器的函数,成功则返回MySQL标识，失败则返回FALSE

2. mysql_select_db(database,connection)  
选择数据库的函数，成功则返回true，失败则返回false

3. mysql_query(query,connection)  
执行一条查询，返回一个资源标识符(结果集)，如果查询执行不正确则返回FALSE

4. mysql_num_rows(data)和mysql_num_fields(data)  
函数分别返回结果集中行和列的数目(禁对SELECT语句有效),结果集从 mysql_query()的调用中得到

5. mysql_fetch_assoc(data)  
从结果集中取得一行作为关联数组，若没有更多行则返回false

6. mysql_fetch_row(data)  
从结果集中取得一行作为索引数组，若没有更多行则返回false

7. mysql_error(connection)  
返回上一个MySQL函数的错误文本，如果没有出错则返回''(空字符串)

8. mysql_affected_rows(link_identifier)  
返回前一次MySQL操作(增删改)所影响的记录行数,失败则返回-1

9. mysql_insert_id(connection)  
返回上一步INSERT操作产生的 ID。如果上一查询没有产生AUTO_INCREMENT的ID，则mysql_insert_id()返回 0。

10. mysql_data_seek(data,row)  
结果集data从mysql_query()的调用中得到,行指针移动到指定的行号，接着调用 mysql_fetch_row() 将返回那一行。如果成功则返回 true，失败则返回 false

### 0x01 例子
```php
<?php
	$server = "127.0.0.1";
    $dbname = "massage";
    $user = "msg";
    $pass = "123456"

	$conn = mysql_connect($server,$user,$pass) or die('连接服务器失败:'.mysql_error());
	mysql_query("set names 'utf8'");//设置数据库输出编码
	mysql_select_db($dbname,$conn) or die(mysql_error($conn)); //选择数据库

	$sql = "select username,password from user";   //构造sql语句
	$result = mysql_query($sql);  //执行sql语句，返回结果集

	$num = mysql_num_rows($result);//返回执行结果的行数
	echo "<br />结果的行数:{$num}<br />";

	while ($row = mysql_fetch_assoc($result)) {
		echo $row[id].":".$row[username]."<br />";
	}

	$sql = "insert into user(username,password) values('3333','mm3333')";
	mysql_query($sql);
    echo "受影响行数：".mysql_affected_rows()."最后一次插入的id为：".mysql_insert_id();

	mysql_free_result($result);  //释放结果内存
	mysql_close($conn);  //关闭非持久的MySQL连接
?>
```