---
draft: false
date: 2016-09-21 17:37:33
title: SqlmapApi 常用方法封装
description: 
categories:
  - Pentest
tags:
  - tools
---

### 0x00 代码如下
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import threading
import requests
import json
from time import sleep

class Sqli(threading.Thread):
    """docstring for AutoSqli"""
    def __init__(self, server, target, data='', referer='', cookie=''):
        threading.Thread.__init__(self)
        self.server = server[0:-1] if server[-1]=='/' else server
        self.target = target
        self.data = data
        self.referer = referer
        self.cookie = cookie
        self.taskid = ''
        self.data

    def new_task(self):
        url = "{}/task/new".format(self.server)
        self.taskid = json.loads(requests.get(url).text)['taskid']
        if len(self.taskid)>0:
            print "Create new task,taskid is: %s" % self.taskid
            return True
        return False

    def set_option(self):
        headers = {'Content-Type': 'application/json'}
        option = {"options": {
                    "smart": True,
                    }
                 }
        url = "{}/option/{}/set".format(self.server,self.taskid)
        resp = requests.post(url, data=json.dumps(option), headers=headers)
        return json.loads(resp.text)['success']

    def start_scan(self):
        headers = {'Content-Type': 'application/json'}
        payload = {
            'url': self.target,
            'data': self.data,
            'cookie': self.cookie,
            'referer': self.referer
        }
        url = "{}/scan/{}/start".format(self.server,self.taskid)
        t = json.loads(requests.post(url,data=json.dumps(payload),headers=headers).text)
        if len(str(t['engineid'])) > 0 and t['success']:
            print "[%s] Start scan" % self.taskid
            return True
        return False

    def get_status(self):
        url = "{}/scan/{}/status".format(self.server,self.taskid)
        status = json.loads(requests.get(url).text)['status']
        if status == 'running':
            return 'running'
        elif status == 'terminated':
            return 'terminated'
        else:
            return 'error'

    def get_data(self):
        url = "{}/scan/{}/data".format(self.server,self.taskid)
        data = json.loads(requests.get(url).text)['data']
        if len(data) == 0:
            print '[] not injection:\t' + self.target
        else:
            print '=======> injection:\t' + self.target
            self.data = data

    def delete_task(self):
        url = "{}/task/{}/delete".format(self.server,self.taskid)
        if json.loads(requests.get(url).text)['success']:
            print "[%s] Delete task" % self.taskid
            return True
        return False

    def write_to_file(self,msg):
        with open('result.txt','a+') as f:
            f.write(json.dumps(msg)+'\n\n')

    def run(self):
        try:
            if not self.new_task():
                return False
            self.set_option()
            if not self.start_scan():
                return False
            while True:
                if self.get_status() == 'running':
                    sleep(10)
                elif self.get_status() == 'terminated':
                    break
                else:
                    break
            self.get_data()
            self.write_to_file(self.data)
            self.delete_task()
        except Exception, e:
            print e

if __name__ == '__main__':
    server = 'http://127.0.0.1:8775'
    target = 'http://192.168.188.134/sqli/Less-1/?id=1'
    sqli = Sqli(server, target)
    sqli.start()
    sqli.join()
```
