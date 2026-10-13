---
draft: false
date: 2016-07-28 22:42:58
title: 敏感信息泄露
description: 
categories:
  - Pentest
tags:
  - 信息泄露
---

### 0x00 软件敏感信息
```
* 操作系统版本
    可用namp扫描得知
* 中间件的类型、版本
    http返回头
    404报错页面
    使用工具(如whatweb)
* Web程序(cms类型及版本、敏感文件)
    可用whatweb、cms_identify
```

### 0x01 Web敏感信息
```
* phpinfo()信息泄露
    http://[ip]/test.php和http://[ip]/phpinfo.php
* 测试页面泄露在外网
    test.cgi、phpinfo.php、info.php等
* 编辑器备份文件泄露在外网
    http://[ip]/.test.php.swp
    http://[ip]/test.php.bak
    http://[ip]/test.jsp.old
    http://[ip]/cgi~
    常见编辑器备份后缀
* 版本管理工具(如git)文件信息泄露
    http://[ip]/.git/config
    http://[ip]/CVS/Entriesp
    http://[ip]/.svn/entriesp
* HTTP认证泄露漏洞
    http://[ip]/basic/index.php
    Web目录开启了HTTP Basic认证，但未限制IP，导致可暴力破解账号、密码
* 管理后台地址泄露
    http://[ip]/login.php
    http://[ip]/admin.php
    http://[ip]/manager.php
    http://[ip]/admin_login.php
* 泄露员工邮箱、分机号码
    泄露邮箱及分机号码可被社工，也可生成字典
* 错误页面暴漏信息
    mysql错误、php错误、暴漏cms版本等
* 探针文件
* robots.txt
* phpMyAdmin
* 网站源码备份文件(www.rar/sitename.tar.gz/web/zip等)
* 其他
```

### 0x02 网络信息泄露
```
* DNS域传送漏洞
* 运维监控系统弱口令、网络拓扑泄露
    zabbix弱口令、zabbix sql注入等
```

### 0x03 第三方软件应用
```
* github上源码、数据库、邮箱密码泄露
    搜类似：smtp 163 password关键字
* 百度网盘被员工不小心上传敏感文件
* QQ群被员工不小心上传敏感文件
```

### 0x04 敏感信息搜集工具
```
https://github.com/ring04h/weakﬁlescan
https://github.com/lijiejie/BBScan
whatweb
dnsenum
github
```

### 0x05 示例
![敏感信息泄露](/img/post/sensitive_information_leakage.png)
