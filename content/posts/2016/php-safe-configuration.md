---
draft: false
date: 2016-09-01 08:46:03
title: PHP 安全配置
description: 
categories:
  - PHP
tags:
  - php
---

### 0x00 PHP的配置
PHP的配置文件为php.ini,其中有些项配置不当的话就会造成一些安全问题

### 0x01 远程文件包含

* 涉及配置项
    * allow_url_include
        * 配置为On时允许进行远程文件包含
    * allow_url_fopen
        * 配置为On时允许使用函数fopen、file_put_contents
* 配置方案
    * alllow_url_include = Off
    * allow_url_fopen = Off

### 0x02 关闭错误回显
* 涉及配置项
    * display_errors
        * 配置为On时会显示错误信息
* 配置方案
    * display_errors = Off
    * log_errors = On
    * error_log = /var/log/php_error.log

### 0x03 隐藏php版本
* 涉及配置项
    * expose_php
        * 为Off时会隐藏php版本
* 配置方案
    * expose_php = Off

### 0x04 魔术引号
* 涉及配置项
    * magic_quotes_gpc
        * 过滤get、post、cookie的单引号、双引号、反斜杠、空字符，但不过滤$_SERVER
    * magic_quotes_runtime
        * 对文件或数据库中取出的数据进行过滤，可防止二次注入
* 配置方案
    * 做逻辑判断时需要去掉反斜杠，所以用全局过滤框架做过滤吧

### 0x05 安全模式
* 涉及配置项
    * safe_mode
        * 开启后安全系数提升，但会限制函数使用权限和操作目录文件权限等
* 配置方案
    * 在安全模式下可以使用safe_mode_include_dir = /var/www/common来排除某些文件

### 0x06 目录权限控制
* 涉及配置项
    * open_basedir
        * 开启后可将用户访问范围限定，可防止跨站，但会影响性能
* 配置方案
    * open_basedir = /var/www/web1/:/var/www/web2/  (后面的斜杠不能少)

### 0x07 禁止函数
* 涉及配置项
    * disable_functions
        * 禁止某些命令执行函数和文件操作函数的使用
* 配置方案
    * disable_functions = system,passthru,exec,shell_exec,popen,pcntl_exec,
    proc_open,chdir,chroot,getcwd,readdir,mkdir,copy,file_get_contents,

### 0x08 注册全局变量
* 涉及配置项
    * register_globals
        * 值为On是会开启全局注册变量功能
* 配置方案
    * register_globals = Off