---
draft: false
date: 2016-02-03 12:44:38
title: Python 的线程
description: 
categories:
  - Python
tags:
  - python
  - thread
---

Python的参数传递其实传递的是对象，当传递可变对象(列表、队列)时相当于引用传递，可以修改对象的原始值，当传递不可变对象(字符串、整型)时就相当于传值，不能直接修改原始对象。

### 0x00 单线程
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

from time import time,ctime,sleep

def music(arg):
    for x in range(2):
        print "I'm listening to %s. %s" % (arg,ctime())
        sleep(1)
def movie(arg):
    for x in range(2):
        print "I'm watching %s. %s" % (arg,ctime())
        sleep(5)

if __name__ == '__main__':
    start = int(time())
    music(u'我')
    movie(u'可是')
    print "All over time:%s" % ctime()
    print "Used time:%d" % int(time()-start)
```
![单线程](/img/post/thread_single.png)

### 0x01 多线程
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import requests
import threading
from time import time,ctime,sleep


INDEX = 0

def http_get(sites):
    global INDEX
    while INDEX < len(sites):
        url = sites[INDEX]
        INDEX += 1
        resp = requests.get(url, timeout=3)
        resp.encoding = resp.apparent_encoding
        title = re.search(r'<title>(.*?)</title>', resp.text).group(1)
        print "URL:%-30sTitle:%s" % (url, title)

sites = [
    "http://www.baidu.com",
    "http://www.qq.com",
    "http://www.github.com",
    "http://www.jingyingba.com",
]

if __name__ == '__main__':
    start = int(time())
    
    threads = []
    for i in range(0, 3):
        t = threading.Thread(target=http_get, args=(sites,))
        threads.append(t)
    for t in threads:
        #t.setDaemon(True) #设为守护线程,主线程结束后不管子线程是否完成,立即结束
        t.start()
    for t in threads:
        t.join() #主线程阻塞，等待子线程完成
        
    print "Used time:%d" % int(time() - start)
```
![多线程](/img/post/thread_multithreading.png)

### 0x02 线程同步
使用多线程时若线程共用一个资源则可能导致线程竞争问题，可以通过互斥锁和队列来解决

* 线程竞争

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import requests
import threading
from time import time,ctime,sleep

num = 0

def test():
    global num
    sleep(1)
    num = num+1
    msg = 'Number: ' + str(num)
    print msg

if __name__ == '__main__':
    start = int(time())
    
    threads = []
    for i in range(0, 20):
        t = threading.Thread(target=test)
        threads.append(t)
    for t in threads:
        t.setDaemon(True)
        t.start()
    for t in threads:
        t.join()
        
    print "Used time:%d" % int(time() - start)
```
![线程竞争1](/img/post/thread_compete1.png)

![线程竞争2](/img/post/thread_compete2.png)

* 互斥锁

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
使用步骤：
1. 创建互斥锁 mutex = threading.Lock()
2. 锁定 mutex.acquire([timeout])
3. 释放 mutex.release()
"""

import re
import requests
import threading
from time import time,ctime,sleep

num = 0
mutex = threading.Lock()

def test():
    global num
    sleep(0.5)

    mutex.acquire() #这里存在线程竞争，设置互斥锁
    num = num+1
    mutex.release()

    msg = 'set num to '+str(num)
    mutex.acquire() #输出有可能错乱，还是线程竞争问题
    print msg
    mutex.release()

if __name__ == '__main__':
    start = int(time())

    threads = []
    for i in range(0, 20):
        t = threading.Thread(target=test)
        threads.append(t)
    for t in threads:
        t.setDaemon(True)
        t.start()
    for t in threads:
        t.join()

    print "Total use time %d" % int(time() - start)
```
![互斥锁同步](/img/post/thread_mutex.png)

* 队列(推荐)

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import random
import Queue
import requests
import threading
from time import time,ctime,sleep

queue = Queue.Queue()

for i in xrange(1,20+1):
    queue.put(i) #put一次队列里的任务数就加1

def test(queue):
    while not queue.empty():
        sleep(random.random()) #随机生成的一个实数，它在(0,1)范围内
        i = queue.get()
        print i
        queue.task_done()

if __name__ == '__main__':
    start = int(time())

    threads = []
    for x in range(0, 20):
        t = threading.Thread(target=test, args=(queue,))
        threads.append(t)
    for t in threads:
        t.setDaemon(True)
        t.start()
    queue.join() #等待队列里的任务数为0，即队列为空任务完成

    print "Total use time %d" % int(time() - start)
```
![队列解决线程竞争问题](/img/post/thread_queue.png)

### 0x03 多线程与类与队列
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
使用步骤：
1. 继承线程类 threading.Thread
2. 重写线程类的__init__方法
3. 重写线程类的run方法
4. 继承类每实例化一次就创建一个线程

__init__方法一般接收外部参数并存放到实例变量
实例化对象调用start()方法后运行了run()方法
"""

import re
import random
import Queue
import requests
import threading
from time import time,ctime,sleep

hosts = [
    "http://www.baidu.com",
    "http://www.qq.com",
    "http://www.github.com",
    "http://www.jingyingba.com"
]

queue = Queue.Queue()

class ThreadTest(threading.Thread):
    "docstring for ThreadTest"
    def __init__(self, queue):
        threading.Thread.__init__(self)
        self.queue = queue

    def run(self):
        while not self.queue.empty():
            host = self.queue.get()
            resp = requests.get(host)
            resp.encoding = resp.apparent_encoding
            title = re.search(r'<title>(.*?)</title>',resp.text,re.I).group(1)
            print "URL:%-30sTitle:%s" % (host, title)
            self.queue.task_done()

def main():
    for host in hosts:
        queue.put(host)

    for x in xrange(1,4):
        t = ThreadTest(queue)
        t.setDaemon(True)
        t.start()
    queue.join()

if __name__ == '__main__':
    start = time()
    main()
    print "Total use time %d" % int(time() - start)
```
![使用多线程和类和队列](/img/post/thread_multithreading_queue_class.png)
