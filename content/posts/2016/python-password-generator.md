---
draft: false
date: 2016-08-29 15:14:57
title: Python 实现密码生成器
description: 
categories:
  - Python
tags:
  - python
---

### 0x00 简介
有时候需要在网上注册许多账号，如果每个账户密码都一样的话，若被别人得知一个密码则所有账户就都沦陷了，若密码不一样则可能会忘记，在这里就用脚本写一个生成密码的工具，只需输入域名和账户名就可以根据key生成不一样的密码，也可以把域名和账户名写入文件，这样你用户名也可以不用记了。。。

### 0x01 代码如下
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import hashlib
import sys
import os
import optparse
import json
import msvcrt

def get_md5(string):
    md5 = hashlib.md5()
    md5.update(string)
    s = md5.hexdigest()
    return s

def get_domain():
    if os.path.exists('account.txt'):
        data = {}
        with open('account.txt', 'r') as f:
            lines = f.readlines()
            for line in lines:
                line = line.split('*')
                data[line[0]] = line[1].strip()
    else:
        pass
    return data

def get_pass():
    pwd = []
    while True:
        nchar = msvcrt.getch()
        if nchar in '\r\n':
            print ''
            break
        elif nchar == '\b': #'\b'是退格
            if pwd:
                del pwd[-1]
                sys.stdout.write('\b \b') #光标退格，输出一个空格，再退格
        else:
            pwd.append(nchar)
            sys.stdout.write('*')
    pwd = ''.join(pwd)
    return pwd

def main():
    if os.path.exists('account.txt'):
        data = get_domain()
        parser = optparse.OptionParser()
        parser.add_option('-u', '--url', dest='url',
                            default=None, type='string',
                            help='domain')
        parser.add_option('-l', '--list', dest='List',
                            default=False, action='store_true',
                            help='show all domain and username')

        (options, args) = parser.parse_args()

        if options.url:
            domain = options.url
            ID = data[domain]
            print "Please input key: ",
            key = get_pass()

            mdomain = get_md5(domain)[0:8]
            mid = get_md5(ID)[8:24]
            mkey = get_md5(key)[16:32]
            pwd = mdomain + mid + mkey
            mpwd = get_md5(pwd)[8:24]
            print "\nDomain: %s\nName: %s\nPass: %s" % (domain,ID,mpwd)
        elif options.List:
            print json.dumps(data, indent=4)
        else:
            parser.print_help()
    else:
        if len(sys.argv) != 3:
            print "Usage: python account.py domain ID"
        else:
            domain = sys.argv[1]
            ID = sys.argv[2]
            print "Please input key: ",
            key = get_pass()

            mdomain = get_md5(domain)[0:8]
            mid = get_md5(ID)[8:24]
            mkey = get_md5(key)[16:32]
            pwd = mdomain + mid + mkey
            mpwd = get_md5(pwd)[8:24]
            print "\nDomain: %s\nName: %s\nPass: %s" % (domain,ID,mpwd)

main()
```

### 0x02 运行结果
可在脚本同文件夹下新建txt文件，内容形式如：baidu.com*reber，站点域名和用户名以*分割
![存在文件](/img/post/create_pwd_has_file.png)

![不存在文件](/img/post/create_pwd_no_file.png)
