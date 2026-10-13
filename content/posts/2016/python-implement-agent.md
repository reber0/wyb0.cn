---
draft: false
date: 2016-09-13 11:36:39
title: Python 实现代理
description: 
categories:
  - Python
tags:
  - python
  - 代理
---

### 0x00 帮助信息
![帮助信息](/img/post/python_proxy_help.png)

### 0x01 代码如下
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

'This is a proxy'

__author__ = 'xxx'

import sys
import socket
import threading
import optparse

lock = threading.Lock()

def locker(msg):
    lock.acquire()
    print msg
    lock.release()

def hexdump (src,length=16):#十六进制导出函数
    result = []
    digits = 4 if isinstance(src,unicode) else 2

    for i in xrange(0,len(src),length):
        s = src[i:i+length]
        hexa = b' '.join("[%0*X]" % (digits,ord(x)) for x in s)
        text = b''.join([x if 0x20 <= ord(x) < 0x7F else b'.' for x in s])
        result.append(b"%04X  %-*s  %s" % (i,length*(digits+1),hexa,text))

    print b'\n'.join(result)

def receive_from (connection):
    
    buffer = ""
    
    #我们设置了1秒的超时，这取决于目标的情况，可能需要调整
    connection.settimeout(1)
    try:
        #持续从缓存中读取数据直到没有数据或者超时
        while True:
            data = connection.recv(4096)
            if not data:
                break

            buffer += data
    except:
        pass
        
    return buffer
    
#对目标是远程主机的请求进行修改
def request_handler (buffer):
    #执行包修改
    return buffer

#对目标是本地主机的响应进行修改
def response_handler (buffer):
    #执行包修改
    return buffer

def proxy_handler (client_socket,remote_host,remote_port,receive_first):
    #连接远程主机
    remote_socket = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    remote_socket.connect((remote_host,remote_port))

    #如果必要从远程主机接收数据
    if receive_first:
        remote_buffer = receive_from(remote_socket)
        if len(remote_buffer):
            print "\n[==>] Received %d bytes from remote." % len(remote_buffer)
            # hexdump(remote_buffer)
        
        #发送给我们的相应处理
        remote_buffer = response_handler(remote_buffer)
        #若我们有数据传递给本地客户端，发送它
        if len(remote_buffer):
            print "[<==] Sending %d bytes to localhost.\n" % len(remote_buffer)
            client_socket.send(remote_buffer)
    
    #现在我们从本地循环读取数据，发送给远程主机和本地主机
    while True:
        #从本地读取数据
        local_buffer = receive_from(client_socket)
        if len(local_buffer):
            print "\n[==>] Received %d bytes from localhost." % len(local_buffer)
            # hexdump(local_buffer)
            #发送给我们的本地请求
            local_buffer = request_handler(local_buffer)
            #发送给远程主机
            remote_socket.send(local_buffer)
            print "[==>] Sent to remote."

        #接收响应的数据
        remote_buffer = receive_from(remote_socket)
        if len(remote_buffer):
            print "\n[<==] Received %d bytes from remote." % len(remote_buffer)
            # hexdump(remote_buffer)
            #发送数据到响应处理函数
            remote_buffer = response_handler(remote_buffer)
            #将响应发送给本地socket
            client_socket.send(remote_buffer)
            print "[==>] Sent to localhost."

        #若两边都没有数据，关闭连接
        if not len(local_buffer) or not len(remote_buffer):
            client_socket.close()
            remote_socket.close()
            print "[*] No more data. Closing connections."
            break

def server_loop(local_host,local_port,remote_host,remote_port,receive_first):

    server = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    try:
        server.bind((local_host,local_port))
    except:
        print "[!!] Failed to listen on %s:%d" % (local_host,local_port)
        print "[!!] Check for other listening sockets or correct permisssions."
        sys.exit(0)
    print "[*] Listening on %s:%d......" % (local_host,local_port)
    server.listen(5)

    while True:
        client_socket,addr = server.accept()
        
        #打印本地连接信息
        print "\n[==>] Received incoming connection from %s:%d" % (addr[0],addr[1])

        #开启一个线程与远程主机通信
        proxy_thread = threading.Thread(target=proxy_handler,args=(client_socket,remote_host,remote_port,receive_first))
        proxy_thread.start()

def main ():
    parser = optparse.OptionParser()
    parser.add_option('--lh', '--localhost', dest='localhost',default='127.0.0.1',
        type='string', help='Localhost.')
    parser.add_option('--lp', '--localport', dest='localport',default=8888,
        type='int', help='Localport.')
    parser.add_option('--rh', '--remotehost', dest='remotehost', default='127.0.0.1',
        type='string', help='Remotehost.')
    parser.add_option('--rp', '--remoteport', dest='remoteport', default=8080, 
        type='int', help='Remoteport.')
    parser.add_option('--rf', '--receivefirst', dest='receive_first', default=False,
        action='store_true',help='Connection before send and receive data.')

    (options, args) = parser.parse_args()

    #设置本地监听参数
    if options.localhost:
        local_host = options.localhost
    if options.localport:
        local_port = options.localport
    
    #设置远程目标
    if options.remotehost:
        remote_host = options.remotehost
    if options.remoteport:
        remote_port = options.remoteport

    receive_first = options.receive_first

    # print local_host,local_port,remote_host,remote_port,receive_first

    #现在设置好我们的监听socket
    server_loop(local_host,local_port,remote_host,remote_port,receive_first)

main()
```

### 0x02 效果图
![效果图](/img/post/python_proxy_result.png)
