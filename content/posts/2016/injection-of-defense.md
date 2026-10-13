---
draft: false
date: 2016-06-25 10:25:11
title: SQL 注入之防御
description: 
categories:
  - Pentest
tags:
  - SQL注入
---

### 0x00 要做的事
也就是找到注入点然后修复

### 0x01 防御方法

* 使用预编译语句绑定变量(比如php的mysqli、pdo)
```php
    <?php
        //预编译
        $mysqli = new mysqli("localhost","root","123456","share");
        $mysqli->query("set names utf8");
        $sql = "INSERT INTO test (name,sex,age) VALUE(?,?,?)";
        $s = $mysqli->prepare($sql);
        //绑定参数
        $name = "Tom";
        $sex = "M";
        $age = 23;
        $s->bind_param("ssi",$name,$sex,$age);//ssi的意思是字符、字符、整型
        //执行
        $result = $s->execute();
        var_dump($result);
        $s->close();
    ?>
```

* 使用存储过程(这里以SQLServer举例)

```
--如果存在名为get_student_msg(相当于函数)的存储过程则删除
IF EXISTS (SELECT name FROM sysobjects WHERE name='get_student_msg' AND type='p')
    DROP PROCEDURE get_student_msg

CREATE PROCEDURE get_student_msg --创建存储过程
    @name VARCHAR(20) --声明全局变量
AS
    BEGIN
        SELECT * from info
        WHERE name=@name
    END
GO

--创建好存储过程后在其他地方直接使用函数并传参就行了
EXEC get_student_msg 'xiaoli'
```

* 使用转义函数  
如：addslashes()和mysql_real_escape_string()  
在php.ini设置auto_prepend_file自动在脚本执行前在首部加载文件  
```php
<?php
    //简单过滤
    $filter = array(&$_GET,&$_POST,&$_COOKIE);
    foreach ($filter as $key => $value){
        foreach ($value as $k => $v){
            $filter[$key][$k] = mysql_real_escape_string($v);
        }
    }
?>
```

* 检查数据类型  
    * 使用(int)或settype()等将数字等进行强制转换，对邮箱、日期等也进行检查

* 使用框架、为数据库合理分配权限等
