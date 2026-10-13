---
draft: false
date: 2016-08-10 11:46:13
title: SSH 免密登录及 SSH 隧道
description: Linux 下 SSH 的免密登录，构建 SSH 隧道进行正向连接、反向连接，内网端口转发、穿透内网
categories:
  - Linux
tags:
  - 隧道
  - 端口转发
---

### 0x00 SSH相关选项
* -V 显示版本
* -f 输入密码后进入后台模式
* -N 不执行远程命令，一般与-f连用，用于端口转发
* -C 压缩传输的数据，网速快时会影响速度



* -L l_port:r_host:r_port(将本地机的某个端口转发到远端指定机器的指定端口)
* -R l_port:r_host:r_port(将远程主机的某个端口转发到本地端指定机器的指定端口)
* -D l_port (指定一个本地机器 "动态的" 应用程序端口转发，目前支持SOCKS4和SOCKS5协议)

### 0x01 环境
```ini
A主机: 外网IP 222.222.222.222，内网IP 无
B主机: 外网IP 123.123.123.123，内网IP 192.168.1.10
C主机: 外网IP 无，             内网IP 192.168.1.11
```

### 0x02 SSH 免密登陆
A主机免密码登陆B主机：

```bash
#A主机执行ssh-keygen -t rsa生成两个文件~/.ssh/id_rsa和~/.ssh/id_rsa.pub
reber@ubuntu-linux:~$ ssh-keygen -t rsa

#然后将id_rsa.pub中的内容复制到B主机的~/.ssh/authorized_keys中即可
#ssh-copy-id的功能就是将本机的公钥写入远端主机，也可以登录远端主机手工写入
reber@ubuntu-linux:~$ ssh-copy-id root@123.123.123.123
The authenticity of host '123.123.123.123 (123.123.123.123)' can't be established.
RSA key fingerprint is a7:46:e4:9a:18:65:4e:8e:0b:8a:22:15:7d:91:a7:7f.
Are you sure you want to continue connecting (yes/no)? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@123.123.123.123's password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'root@123.123.123.123'"
and check to make sure that only the key(s) you wanted were added.

#A主机免密登录B主机
reber@ubuntu-linux:~$ ssh root@123.123.123.123
Last login: Tue Aug  7 12:29:26 2018 from 111.111.111.111
[root@macos ~]#
```

```
若登陆B主机，手工写入自己的公钥的话：
1、要确保B主机~/.ssh/authorized_keys权限为600
2、要确保B主机~/.ssh/文件夹权限为700
3、要确保上述两个文件属主是当前用户
```

### 0x03 SSH 正向连接(ssh -f -N -L)
就是client连上server，然后把server能访问的机器地址和端口（当然也包括server自己）镜像到client的端口上。

* 将B主机能访问的C主机的端口镜像到A主机(这里的本机A主机是client，B主机是server)

```bash
#在A主机执行
$ ssh -f -N -L 222.222.222.222:8888:192.168.1.11:80 root@123.123.123.123
#$ ssh -f -N -L 127.0.0.1:8888:192.168.1.11:80 root@123.123.123.123
#$ ssh -f -N -L 8888:192.168.1.11:80 root@123.123.123.123
root@123.123.123.123's password:

#输入B主机的密码后，在A主机访问8888端口即为访问内网主机C的80端口
```

### 0x04 SSH 反向连接(ssh -f -N -R)
就是client连上server，然后把client能访问的机器地址和端口（也包括client自己）镜像到server的端口上。

* 将B主机能访问的C主机的端口镜像到A主机(这里的本机A主机是server，B主机是client)

```bash
#在B主机执行：
$ ssh -f -N -R 222.222.222.222:8888:192.168.1.11:80 reber@222.222.222.222 -p 22
reber@222.222.222.222's password:

#输入主机A的用户reber的密码后，在A主机访问8888端口即为访问内网主机C的80端口
```

### 0x05 SSH 动态端口转发(ssh -f -N -D)
设置后本地所有的协议都可以走代理端口的ssh协议，这里以http为例
![设置ssh socks5](/img/post/ssh_socks5_proxy_set.png)
![设置ssh socks5](/img/post/ssh_socks5_proxy_set_firefox.png)
![火狐通过代理可以上网](/img/post/ssh_socks5_proxy_firefox_internet.png)


#### Reference(侵删)：
* [https://blog.csdn.net/linsanhua/article/details/17360369](https://blog.csdn.net/linsanhua/article/details/17360369)