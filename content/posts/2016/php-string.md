---
draft: false
date: 2016-05-21 23:16:28
title: PHP 之字符串
description: 
categories:
  - PHP
tags:
  - php
---

### 0x00 特点
1. 字符串可以使用数组的处理函数操作，但并不是真正的数组
2. 双引号中的变量用{}括起来，因为字符串中若遇到$符号，解析器会尽可能多的获取后面的字符以组成一个合法的变量名
```php
<?php
        $lamp = array('os' => 'Linux', 'webserver' => 'Apache', 'db' => 'Mysql', 'language' => 'PHP');
        
        echo "A OS is $lamp[os].";  // ok
        echo "A OS is $lamp['os'].";  // false
        echo "A OS is {$lamp['os']}.";  //ok
        echo "A OS is {$lamp[os]}.";  // ok

        echo "This square is $square->width meters broad."; //ok
        echo "This square is $square->width meters broad."; //ok
        echo "This square is $square->width meters broad."; //ok
?>
```

### 0x01 常用字符串输出函数

> |函数名|功能描述|
|:--------|:-------|
|echo     |输出字符串|
|print()  |输出一个或多个字符串|
|die()    |输出一条消息，并退出当前脚本|
|printf() |输出格式化字符串|
|sprintf()|把格式化字符串写入到一个变量中|


### 0x02 函数echo()
输出一个或多个字符串  
void echo(string arg1 [,string ...])

### 0x03 函数print()
功能和echo()一样，它有返回值，若成功则返回1,否则返回0

### 0x04 函数die()
该函数是exit()函数的别名  
若参数为字符串，则函数会在推出前输出它  
若参数为整数(0~254)，则值会被用作推出状态

### 0x05 函数printf()
输出格式化的字符串，和C语言中同名的函数用法一样  
第一个参数为必选项，是规定的字符串及如何格式化其中的变量  
可以有多个可选参数，是规定插入到第一个参数的格式化字符串中对应%符号处的参数

### 0x06 函数sprintf()
用法和Printf()类似，但他并不是输出字符串，而是格式化的字符串以返回值的形式写入到一个变量中

***

### 0x07 常用字符串格式化函数
    ltrim()：从字符串左删除空格或其他预定义字符串
    rtrim()：从字符串的末端开始删除空白字符串或其它预定义字符
    trim()：从字符串的两端删除空白字符和其他预定字符

    strtolower()：把字符串转换为小写
    strtoupper()：把字符串转换为大写
    ucfirst()：把字符串中的首字符转为大写
    ucwords():把字符串中每个单词的首自负转换为大写

    nl2br()：在字符串的每个新行之前插入HTML换行符
    htmlentities()：把字符转换为HTML实体
    htmlspecialchars()：把一些预定义的字符转换为HTML实体
    Stripslashes()：删除由addcslashes()函数添加的反斜杠
    number_format()：能过千位分组来格式化数字
    strip_tags()：剥去HTML,XML以及PHP的标签

    strrev()：反转字符串
    str_pad()：把字符串填充为新的长度
    md5()：将一个字符串进行MD5计算

### 0x08 过滤字符
ltrim()、rtrim()、trim()  
第一个参数为待处理字符串，为必选项  
第二个参数是可选项，用于指定希望取出的字符，默认为：  
" "：空格  
"\0"：NULL  
"\t"：制表符  
"\n"：新行  
"\r"：回车
```php
<?php
    $str = "123 This is a test ..."; //测试的字符串
    echo ltrim($str,"0..9"); //过滤左侧的数字，输出This is a test ...
    echo rtrim($str,"."); //过滤右侧所有".",输出123 This is a test
    echo trim $str,"0..9 A..Z ."; //过滤掉字符串两端的数字和大写字母还有".",输出:his is a test
?>
```

### 0x09 大小写转换
strtolower()：把字符串转换为小写  
strtoupper()：把字符串转换为大写  
ucfirst()：把字符串中的首字符转为大写  
ucwords():把字符串中每个单词的首自负转换为大写
```php
<?php
    $lamp = "lamp is composed of Linux、Apache、MySQL and PHP";
    echo strtolower($lamp);
    //输出：lamp is composed of linux apache mysql and php
    echo strtoupper($lamp);
    //输出：LAMP IS CONPOSED OF LINUX、APACHE MYSQL AND PHP
    echo ucfirst($lamp);
    //输出：Lamp is composed of Linux、Apache MySQL and PHP
    echo ucwords($lamp);
    //输出：Lamp Is Composed Of Linux、Apache、MySQL And PHP
?>
```

### 0x0A 函数nl2br()
在字符串中的每个新行"\n"之前插入HTML换行符"`<br />`"
```php
<?php
    echo nl2br("One line.\nAnother line.");
    // 在“\n”前加上"<br />"标记
    /*输出以下两行结果
    One line.<br/>
    Another line.
    */
?>
```

### 0x0B 函数htmlspecialchars()
第一个参数是带有HTML标记待处理的字符串  
第二个参数用来决定引号的转换方式  
string htmlspecialchars(string string [,int quote\_style[,string charset]])  
将HTML标记中的以下特殊字符转换成HTML实体：

> |特殊字符|HTML实体|
|:------|:------|
|&(和号)|`&amp;`|
|"(双引号)|`&quot;`|
|'(单引号)|`&#309;`|
|<(小于)|`&lt;`|
|>(大于)|`&gt;`|

```php
<html>
<body>
    <?php
        $str = "<B>WebServer:</B> & 'Linux' & 'Apache'";
        //将有HTML标记和单引号的字符串
        echo htmlspecialchars($str,ENT_COMPAT);
        //转换为HTML标记和转换双引号
        echo "<br>\n";
        echo htmlspecialchars($str,ENT_QUOTES);
        //转换HTML标记和转换两种引号
        echo "<br>\n";
        echo htmlspecialchars($str,ENT_NOQUOTES);
        //转换HTML标记和不对引号转换
        echo "<br>\n";
    ?>
</body>
</html>
```