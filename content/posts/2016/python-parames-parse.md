---
draft: false
date: 2016-08-16 15:10:44
title: Python 命令行参数解析
description: 
categories:
  - Python
tags:
  - python
  - module
---

### 0x00 argparse 模块
参考 [https://docs.python.org/zh-cn/3.7/library/argparse.html](https://docs.python.org/zh-cn/3.7/library/argparse.html?_blank)

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse

class Parser(object):
    """Parser"""
    def __init__(self):
        super(Parser, self).__init__()
        self.service_type_list = [
            "ssh","telnet","ftp",
            "mysql","mssql","oracle","pgsql","redis"
        ]
        self.log_level = ["debug", "info", "warning", "error", "critical"]
        self.example = """Example:
                          \r  python3 {} -s ssh -i 123.123.123.123
                          \r  python3 {} -s ssh -i 123.123.123.123/24 -l root -p 123456"""

    def parser(self):
        parser = argparse.ArgumentParser(
            formatter_class=argparse.RawDescriptionHelpFormatter,#使 example 可以换行
            add_help=True,
            # description = "常见服务口令爆破",
            )
        parser.epilog = self.example.format(parser.prog,parser.prog)
        parser.add_argument("-i", dest="host", type=str, 
                            help="Target ip")
        parser.add_argument("-iL", dest="host_file", type=str, 
                            help="Target file name, one ip per line")
        parser.add_argument("-l", dest="user", type=str, 
                            help="username")
        parser.add_argument("-p", dest="pwd", type=str, 
                            help="password")
        parser.add_argument("-lp", dest="user_pwd_file", type=str, 
                            help="user_pwd file, example: username:password")
        parser.add_argument("-L", dest="user_file", type=str, 
                            help="username file")
        parser.add_argument("-P", dest="pwd_file", type=str, 
                            help="password file")
        parser.add_argument("--port", dest="port", type=int, 
                            help="Target port")
        parser.add_argument("-s", dest="service_type", type=str, required=True, 
                            choices=self.service_type_list, help="Service type")
        parser.add_argument("-t", dest="thread_num", type=int, default=10, 
                            help="The number of threads, default is 10 threads")
        parser.add_argument("-T", dest="timeout", type=int, default=10, 
                            help="Timeout, default is 10s")
        parser.add_argument("-v", dest="log_level", type=str, default="info", 
                            choices=self.log_level, help="Log Level, default is 'info'")

        # args = parser.parse_args()
        # parser.print_help()

        return parser

    @staticmethod
    def init():
        parser = Parser().parser()
        return parser


if __name__ == "__main__":
    parser = Parser().init()
    args = parser.parse_args()
    parser.print_help()
```

### 0x02 运行

```
➜  python3 tmp.py
usage: tmp.py [-h] [-i HOST] [-iL HOST_FILE] [-l USER] [-p PWD]
              [-lp USER_PWD_FILE] [-L USER_FILE] [-P PWD_FILE] [--port PORT]
              -s {ssh,telnet,ftp,mysql,mssql,oracle,pgsql,redis}
              [-t THREAD_NUM] [-T TIMEOUT]
              [-v {debug,info,warning,error,critical}]
tmp.py: error: the following arguments are required: -s
```
```
➜  python3 tmp.py -s ssh
usage: tmp.py [-h] [-i HOST] [-iL HOST_FILE] [-l USER] [-p PWD]
              [-lp USER_PWD_FILE] [-L USER_FILE] [-P PWD_FILE] [--port PORT]
              -s {ssh,telnet,ftp,mysql,mssql,oracle,pgsql,redis}
              [-t THREAD_NUM] [-T TIMEOUT]
              [-v {debug,info,warning,error,critical}]

optional arguments:
  -h, --help            show this help message and exit
  -i HOST               Target ip
  -iL HOST_FILE         Target file name, one ip per line
  -l USER               username
  -p PWD                password
  -lp USER_PWD_FILE     user_pwd file, example: username:password
  -L USER_FILE          username file
  -P PWD_FILE           password file
  --port PORT           Target port
  -s {ssh,telnet,ftp,mysql,mssql,oracle,pgsql,redis}
                        Service type
  -t THREAD_NUM         The number of threads, default is 10 threads
  -T TIMEOUT            Timeout, default is 10s
  -v {debug,info,warning,error,critical}
                        Log Level, default is 'info'

Example:
  python3 tmp.py -s ssh -i 123.123.123.123
  python3 tmp.py -s ssh -i 123.123.123.123/24 -l root -p 123456
```
