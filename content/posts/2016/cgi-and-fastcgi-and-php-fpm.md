---
draft: false
date: 2016-08-02 10:45:14
title: CGI 与 FastCGI 与 PHP-FPM
description: 
categories:
  - PHP
tags:
  - cgi
---

### 0x01 CGI协议
中间件在收到请求时会去找php解析器处理，cgi是规定了要传递哪些数据(比如url、header、post数据等)的协议

### 0x02 FastCGI
服务端收到请求时会启动对应的cgi程序(如php-cgi)，即php的解析器，php解析器会解析php.ini文件、初始化执行环境，然后执行请求，每次都是这样，性能比较低

fastcgi是cgi的升级版，它会启动一个master解析php.ini、初始化执行环节，然后启动多个worker直接依次处理多个web server的连接，不用每次都解析php.ini等

### 0x03 FastCGI工作流程
一般情况下，FastCGI的整个工作流程是这样的：

1. Web Server启动时载入FastCGI进程管理器（IIS ISAPI或Apache Module)
2. FastCGI进程管理器自身初始化，启动多个CGI解释器进程(可见多个php-cgi)并等待WebServer的连接。
3. 当客户端请求到达Web Server时，FastCGI进程管理器选择并连接到一个CGI解释器。 Web server将CGI环境变量和标准输入发送到FastCGI子进程php-cgi。
4. FastCGI子进程完成处理后将标准输出和错误信息从同一连接返回Web Server。当FastCGI子进程关闭连接时，请求便告处理完成。FastCGI子进程接着等待并处理来自FastCGI进程管理器(运行在Web Server中)的下一个连接。在CGI模式中，php-cgi在此便退出了。

### 0x04 PHP-FPM
* php-fpm就是fastcgi的实现，是一个php fastcgi进程管理器
* php-fpm在php5.2之后默认添加
* 千万不要把fastcgi端口对公网暴露