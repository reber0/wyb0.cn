---
draft: false
date: 2017-10-28 13:58:29
title: 中间件安全配置
description: Apache、Tomcat、Nginx 等中间件的安全配置
categories:
  - Server
tags:
  - server
---

### 0x00 Apache
* 服务器安全配置

```
#查看服务器运行权限
$ ps aux|grep apache|grep -v grep
$ sudo lsof -i:80
COMMAND    PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
apache2   1377     root    4u  IPv6  12596      0t0  TCP *:http (LISTEN)
apache2  21121 www-data    4u  IPv6  12596      0t0  TCP *:http (LISTEN)
apache2  21122 www-data    4u  IPv6  12596      0t0  TCP *:http (LISTEN)
apache2  21123 www-data    4u  IPv6  12596      0t0  TCP *:http (LISTEN)
apache2  21124 www-data    4u  IPv6  12596      0t0  TCP *:http (LISTEN)
apache2  21125 www-data    4u  IPv6  12596      0t0  TCP *:http (LISTEN)
apache2  24800 www-data    4u  IPv6  12596      0t0  TCP *:http (LISTEN)
apache2 127488 www-data    4u  IPv6  12596      0t0  TCP *:http (LISTEN)

第一行是Apache主进程，以root权限运行的，因为Apache的Web端口是80或443，而在Ubuntu(Linux)中开启小于1024的端口需要root权限，所以主进程必须以root权限运行。
第二行起为Apache子进程，其执行用户为www-data，www-data是Ubuntu中运行Web服务的默认用户，权限较低。

Windows中Apache安装完成后默认是administrator权限，所以需要降权，创建一个用户Apache，用户组为Guests，然后将Apache目录下的日志的可写权限赋给Guests账户。
```
```
#目录及文件权限
修改配置文件，vim /etc/apache2/apache2.conf解决目录遍历漏洞
#Options Indexes FollowSymLinks
Options FollowSymLinks

或者使用chmod进行权限限制也可以,比如使用chmod o-r flag.txt命令将www-data的读权限去掉

windows也可以通过配置文件或者权限的设置达到上面设置的效果
```
```
#错误重定向一
$ sudo vim /etc/apache2/apache2.conf
<Directory /var/www/>
        Options Indexes FollowSymLinks
        #AllowOverride None
        AllowOverride All #设置如此
        Require all granted
</Directory>
$ cat .htaccess
ErrorDocument 404 /404.html

#错误重定向二
$ sudo vim /etc/apache2/apache2.conf
LoadModule rewrite_module modules/mod_rewrite.so #去掉前面的注释符
$ sudo a2enmod rewrite #开启跳转
$ cat .htaccess
ErrorDocument 404 /404.html
RewriteEngine on
RewriteRule "ttt\.html$" aa.html
```
```
#隐藏apache版本号
$ sudo vim /etc/apache2/conf-available/security.conf
ServerTokens Prod
ServerSignature Off

#隐藏php版本号
$ sudo vim /etc/php5/apache2/php.ini
expose_php =  Off
```
```
#禁止执行脚本
$ vim /etc/apache2/apache2.conf
<Directory /var/www/html/upload/> #禁止执行php
    php_flag engine off
</Directory>
```

* Apache日志格式

vim /etc/apache2/apache2.conf
```
#access.log格式
LogFormat "%v:%p %h %l %u %t \"%r\" %>s %O \"%{Referer}i\" \"%{User-Agent}i\"" vhost_combined
LogFormat "%h %l %u %t \"%r\" %>s %O \"%{Referer}i\" \"%{User-Agent}i\"" combined
LogFormat "%h %l %u %t \"%r\" %>s %O" common
LogFormat "%{Referer}i -> %U" referer
LogFormat "%{User-agent}i" agent

#第一行是虚拟主机日志格式
#第二行是组合日志格式(Combined Log Format)
#第三行是通用日志格式(Common Log Format)
```
```
#access.log日志示例
192.168.228.1 - - [22/Sep/2017:05:26:41 -0700] "GET /flag.txt HTTP/1.1" 403 515 "-" "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0"

远端主机：192.168.228.1
远端登录名：-
远程用户名：-
访问时间：[22/Sep/2017:05:26:41 -0700]
HTTP请求：GET /flag.txt HTTP/1.1
HTTP状态码：403
发送的字节数：515
Referer：-
User-Agent："Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0"
```
```
#error.log
路径一般为：/var/log/apache2/error.log，notice级别的消息总是会被记录下来，而不能被屏蔽。
日志格式：[日期和时间] [错误等级] 错误消息
```

### 0x01 Tomcat
* 服务器安全配置

```
#运行权限
Linux中Tomcat的运行权限与Tomcat的启动账户有关，比如以root用户启动，那获取的webshell就也是root权限
Windows权限控制需要进行账户配置，新建一个Tomcat用户，并归属于Guests组，再将账户设置为服务登录账户

webapps为Web站点目录，将其中文件上传的文件夹设置为不可执行。

#服务器后台管理，配置强口令
$ vim /usr/local/tomcat/conf/tomcat-users.xml
  <role rolename="manager-gui"/>
  <user username="tomcat" password="sdkF!ieW~nk/sXfs" roles="manager-gui"/>
#或者说删除默认应用
即除了webapps下的ROOT目录，其他的都删除
然后就是在ROOT文件夹下除了WEB-INF和META-INF外的文件都删除了
```

* 服务器访问限制
    * 隐藏版本信息
    ```
    $ cd /opt/tomcat/lib
    $ jar -xvf catalina.jar #生成META-INF和org文件夹
    $ vim org/apache/catalina/util/ServerInfo.properties #编辑配置文件，去掉版本信息
    $ jar uvf catalina.jar org/apache/catalina/util/ServerInfo.properties #将修改后的文件压回jar包
    $ cd ../bin/
    $ ./startup.sh
    ```

    * 禁止列目录
    ```
    vim /opt/tomcat/conf/web.xml #设置为false即可，默认就是false
        <init-param>
            <param-name>listings</param-name>
            <param-value>false</param-value>
        </init-param>
    ```

* 服务日志

```
启用日志（默认就是开启的）：vim /opt/tomcat/conf/server.xml
<Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
       prefix="localhost_access_log" suffix=".txt"
       pattern="%h %l %u %t &quot;%r&quot; %s %b" />

$ ll /opt/tomcat/logs
localhost.2017-09-29.log：程序异常没有被捕获的时候抛出的地方
catalina.2017-09-29.log：程序的输出，tomcat的运行日志
manager.2017-09-29.log：manager项目专有的
host-manager.2017-09-29.log：manager项目专有的
localhost_access_log.2017-09-29.txt：访问日志记录

日志有以下7个级别：
SEVERE > WARNING > INFO > CONFIG > FINE > FINER > FINEST 

$ vim conf/logging.properties #修改日志级别
1catalina.org.apache.juli.AsyncFileHandler.level = FINE
```

### 0x02 Nginx
* 隐藏版本号

```
$ vim /usr/local/nginx/conf/nginx.conf
http {
    include       mime.types;
    default_type  application/octet-stream;

    server_tokens off; #隐藏版本号
```

* 伪造中间件类型和版本号

```
伪造中间件类型，修改源码然后安装：
$ vim src/http/ngx_http_header_filter_module.c #修改第49行
static char ngx_http_server_string[] = "Server: nginx" CRLF;

伪造版本号，修改源码然后安装：
$ vim nginx-1.9.9/src/core/nginx.h
#define nginx_version      1009009
#define NGINX_VERSION      "1.9.9"
#define NGINX_VER          "nginx/“ NGINX_VERSION

修改fastcgi.conf
$ vim /usr/local/nginx/conf/fastcgi.conf #修改第17行
fastcgi_param  SERVER_SOFTWARE    nginx/$nginx_version;
```

* 防止钓鱼和XSS

```
$ vim /usr/local/nginx/conf/nginx.conf
    server {
        listen       80;
        server_name  localhost;

        add_header X-Frame-Options SAMEORIGIN; #在头部添加X-Frame-Options防止被Frame
        add_header X-XSS-Protection "1; mode=block"; #防御XSS

DENY：浏览器拒绝当前页面加载任何Frame页面
SAMEORIGIN：frame页面的地址只能为同源域名下的页面
ALLOW-FROM：origin为允许frame加载的页面地址
```

* CRLF注入

```
案例一：
location /sectest {
  return 302 https://$host$uri; #应将$uri或者$document_uri改为$request_uri
}

案例二：
location / {
    rewrite ^ https://$host/$uri;
}

案例三：
server {
    listen 80 default;

    location ~ /v1/((?<action>[^.]*)\.json)?$ {
        add_header X-Action $action;
        return 200 "OK";
    }
}
```

* alias导致的任意文件读取

```
location /files { #把/files改为/files/即可修复
  alias /home/;
}

当访问http://joychou.me/files/x.txt，即访问服务器上的/home/x.txt文件
当访问http://joychou.me/files../etc/passwd时就读取了passwd文件了
```

* 反向代理中的SSRF

```
反向代理语法：proxy_pass http://ip:port/uri/;
当ip可控时那么反向代理的机器会对该ip发起http请求，即可造成SSRF。
这种场景多出现在云WAF、CDN、高防DDOS等网络产品。
```

* add_header重定义

```
如果location区块有add_header，那么以location为准。
如果location没有add_header，则继承Http和server块的add_header内容。
```


#### Reference(侵删)：
* [http://mp.weixin.qq.com/s?__biz=MjM5MTYxNjQxOA==&mid=2652844866&idx=1&sn=7c1d2879e7ad5ef662cccf8fb7663846](http://mp.weixin.qq.com/s?__biz=MjM5MTYxNjQxOA==&mid=2652844866&idx=1&sn=7c1d2879e7ad5ef662cccf8fb7663846)
* [http://mp.weixin.qq.com/s?__biz=MjM5MTYxNjQxOA==&mid=2652845014&idx=1&sn=c6221031b486bbe84de6986c67b76fbc](http://mp.weixin.qq.com/s?__biz=MjM5MTYxNjQxOA==&mid=2652845014&idx=1&sn=c6221031b486bbe84de6986c67b76fbc)
* [http://mp.weixin.qq.com/s/768Jx-lBShb-OsiMgg-48A](http://mp.weixin.qq.com/s/768Jx-lBShb-OsiMgg-48A)
* [http://mp.weixin.qq.com/s/QhB-PYpOik_PVdm3F7LIJw](http://mp.weixin.qq.com/s/QhB-PYpOik_PVdm3F7LIJw)
