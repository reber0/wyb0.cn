---
draft: false
date: 2016-06-24 15:32:34
title: SQL 注入之宽字节注入(MySQL)
description: 
categories:
  - Pentest
tags:
  - SQL注入
---

### 0x00 应用场景
在注入时通常会使用单引号、双引号等特殊字符。在应用中，通常为了安全，开发者会开启php的magic_quotes_gpc，或者使用addslashes、mysql_real_escape_string等函数对客户端传入的参数进行过滤，则注入的单引号或双引号就会被```"\"```转义，但是，如果服务端的数据库使用的是GB2312、GBK、GB18030等宽字节的编码时，则依然会造成注入。

### 0x01 测试代码
```
<?php
    $conn = mysql_connect('localhost','root','root');
    mysql_select_db('messages',$conn);

    if (isset($_GET['id'])) {
        $id = addslashes($_GET['id']); //转义id
        $sql = "select * from msg where id='$id';";
        echo $sql."<br />";

        $result = mysql_query($sql);
        $rows = @mysql_fetch_assoc($result);
        if ($rows) {
            echo '<table align="left" border="1">';
            foreach ($rows as $key => $value) {
                echo '<tr align="lift" height="30">';
                echo '<td>'.$key.'----'.$value.'</td>';
                echo '</tr>';            
            }
            echo '</table>';
        } else {
            echo mysql_error();
        }
    } else {
        echo "please input id.";
    }
?>
```
![单引号被转义](/img/post/injection_of_wide_byte_addslashes.png)

### 0x02 宽字节注入原理
```ini
当MySQL使用的是GBK编码时，0xbf5c会被当做一个字符(双字节字符)，其中5c是"\"

当注入语句为http://127.0.0.1/test.php?id=2%bf'时
在数据库中bf会和转义符"\"形成一个双字节字符"縗"，从而单引号逃逸
```
![转义符被bf吃掉](/img/post/injection_of_wide_byte_bf.png)
![单引号逃逸后查询user](/img/post/injection_of_wide_byte_user.png)
