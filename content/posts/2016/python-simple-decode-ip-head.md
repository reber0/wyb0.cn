---
draft: false
date: 2016-07-03 20:06:39
title: Python 简单解码 IP 头
description: 
categories:
  - Python
tags:
  - python
---

### 0x00 解码IP头
Windows上运行时要以管理员身份运行  
代码可以解码IP头统计通信信息并保存到文本，同时统计数量
```python
#!/usr/bin/env python
#-*- coding:utf-8 -*-

import socket
import os
import sys
import time
import struct 
from ctypes import *

host = "10.22.114.114"

tcp_num = 0
udp_num = 0
icmp_num = 0

class IP(Structure):
    _fields_ = [
        ("ihl",         c_ubyte,4),
        ("version",     c_ubyte,4),
        ("tos",         c_ubyte),
        ("len",         c_ushort),
        ("id",          c_ushort),
        ("offset",      c_ushort),
        ("ttl",         c_ubyte),
        ("protocol_num",c_ubyte),
        ("sum",         c_ushort),
        ("src",         c_ulong),
        ("dst",         c_ulong)
    ]

    def __new__ (self,socket_buffer=None):
        return self.from_buffer_copy(socket_buffer)

    def __init__ (self,socket_buffer=None):
        self.protocol_map = {1:"ICMP",6:"TCP",17:"UDP"}
        
        self.src_address = socket.inet_ntoa(struct.pack("<L",self.src))
        self.dst_address = socket.inet_ntoa(struct.pack("<L",self.dst))
        try:
            self.protocol = self.protocol_map[self.protocol_num]
        except:
            self.protocol = str(self.protocol_num)

if os.name == "nt":
    socket_protocol = socket.IPPROTO_IP
else:
    socket_protocol = socket.IPPROTO_ICMP

sniffer = socket.socket(socket.AF_INET,socket.SOCK_RAW,socket_protocol)

sniffer.bind((host,0))
sniffer.setsockopt(socket.IPPROTO_IP,socket.IP_HDRINCL,1)

if os.name == "nt":
    sniffer.ioctl(socket.SIO_RCVALL,socket.RCVALL_ON)

try:
    while True:
        raw_buffer = sniffer.recvfrom(65565)[0]

        ip_header = IP(raw_buffer[0:32])
        msg = "Protocol: %-5s %-15s -> %s" % (ip_header.protocol,ip_header.src_address,ip_header.dst_address)
        if ip_header.protocol == "TCP":
            tcp_num = tcp_num + 1
        elif ip_header.protocol == "UDP":
            udp_num = udp_num + 1
        elif ip_header.protocol == "ICMP":
            icmp_num = icmp_num + 1
        num = "TCP:%d\tUDP:%d\tICMP:%d" % (tcp_num,udp_num,icmp_num)
        # print num
        with open("data.txt","a+") as f:
            f.write(msg+"\n")
        sys.stdout.write(num+"\r")
        sys.stdout.flush()
        time.sleep(0.5)
        print
#CTRL-C
except KeyboardInterrupt:
    if os.name == "nt":
        sniffer.ioctl(socket.SIO_RCVALL,socket.RCVALL_OFF)
```

### 0x01 结果
![程序运行信息](/img/post/ip_decoding_run_msg.png)

![保存的数据](/img/post/ip_decoding_data.png)
