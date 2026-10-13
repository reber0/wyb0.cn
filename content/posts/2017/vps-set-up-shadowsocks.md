---
draft: false
date: 2017-03-10 10:34:40
title: 在 vps 上搭建 Shadowsocks
description: 
categories:
  - Linux
tags:
  - server
---


![某科学的超电磁炮](/img/anime/anime005.jpg)

### 0x01 安装与配置
环境：Ubuntu 14.04.1 LTS
```bash
reber@localhost:~$ sudo apt-get update
reber@localhost:~$ python --version
Python 2.7.6
reber@localhost:~$ sudo apt-get install python-gevent python-pip
reber@localhost:~$ sudo pip install shadowsocks
reber@localhost:~$ vim /home/reber/shadowsocks.json
    {
        "server":"服务器 IP 地址", # 服务器 IP (IPv4/IPv6)
        "server_port":8388, # 监听的服务器端口
        "local_address": "127.0.0.1", # 本地监听的 IP 地址
        "local_port":1080, # 本地端端口
        "password":"mypassword", # 密码
        #"port_password":
        #{
        #    "40001": "password1",
        #    "40002": "password2",
        #    "40003": "password3"
        #},
        #"_comment":
        #{
        #    "40001": "xiaoming",
        #    "40002": "lilei",
        #    "40003": "mike"
        #}
        "timeout":300, # 超时时间（秒）
        "method":"aes-256-cfb", # 加密方式
        # 若Linux内核在3.7+，可开启fast_open降低延迟
        # 开启方法：echo 3 > /proc/sys/net/ipv4/tcp_fastopen
        "fast_open": false, 
        "workers": 1 # works数量，默认为 1
    }
reber@localhost:~$ sudo apt-get install python-m2crypto
```

### 0x02 服务端启动
```
# 前台运行
reber@localhost:~$ sudo ssserver -c /home/reber/shadowsocks.json
# 后台运行
reber@localhost:~$ sudo nohup ssserver -c /home/reber/shadowsocks.json > /dev/null 2>&1 &
# 关闭服务
reber@localhost:~$ sudo killall ssserver 
```

#### 0x03 本地使用
> 添加如下配置
![使用Shadowsocks](/img/post/use_ss.png)
