---
draft: false
date: 2016-09-20 14:50:59
title: Python 爆破 zip 压缩包
description: 
categories:
  - Pentest
  - Python
tags:
  - 爆破
  - python
---

### 0x00 代码
多线程爆破加密的zip压缩包
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import optparse
import zipfile
import threading
import Queue

queue = Queue.Queue()
lock = threading.Lock()
result = ''

def load_pwd(filename):
    for line in open(filename,'r'):
        if line:
            queue.put(line.strip())

def bruter(zipname,queue):
    global result
    zFile = zipfile.ZipFile(zipname)
    while not queue.empty():
        password = queue.get()
        try:
            zFile.extractall(pwd=password) # 解压
            lock.acquire()
            print "[Ok] password is: %s" % password
            lock.release()
            result = password
        except:
            lock.acquire()
            print "[Error] password not is: %s" % password
            lock.release()
        queue.task_done()

def main():
    parser = optparse.OptionParser()
    parser.add_option('-f', '--file', dest='zipfile',
        type='string', help='Target zip file.')
    parser.add_option('-p', '--pfile', dest='pwdfile',default='pass.txt',
        type='string', help='Password file.')
    parser.add_option('-t', '--thread_num', dest='thread_num',default=60,
        type='int', help='Thread number.')

    (options, args) = parser.parse_args()

    if options.zipfile and options.pwdfile:
        load_pwd(options.pwdfile)
    else:
        parser.print_help()
        sys.exit(0)

    threads = []
    for x in range(options.thread_num):
        t = threading.Thread(target=bruter,args=(options.zipfile,queue,))
        t.setDaemon(True)
        t.start()
    queue.join()
    print "result is: %s" % result

if __name__ == '__main__':
    main()
```