---
draft: false
date: 2016-04-19 10:03:07
title: Linux 之基础命令
description: 
categories:
  - Linux
tags:
  - linux
---

### 0x00 ls：显示文件
```
[wyb@localhost tmp]$ ls
a  a.txt
[wyb@localhost tmp]$ ls -l
total 4
drwxr-xr-x. 2 wyb root 4096 Apr 17 18:23 a
-rw-r--r--. 1 wyb root    0 Apr 17 18:23 a.txt
[wyb@localhost tmp]$ ls -a
.  ..  a  a.txt  .esd-500  .ICE-unix
[wyb@localhost tmp]$ ls -al
total 20
drwxrwxrwt.  5 root root 4096 Apr 17 18:23 .
dr-xr-xr-x. 22 root root 4096 Apr 17 16:31 ..
drwxr-xr-x.  2 wyb  root 4096 Apr 17 18:23 a
-rw-r--r--.  1 wyb  root    0 Apr 17 18:23 a.txt
drwx------.  2 wyb  wyb  4096 Apr 10 19:15 .esd-500
drwxrwxrwt.  2 root root 4096 Apr 17 16:31 .ICE-unix
```

### 0x02 pwd：查看当前工作路径
```             
[wyb@localhost ~]$ pwd  
/home/wyb
```

### 0x03 cd：切换目录
```
[wyb@localhost ~]$ ls
Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos
[wyb@localhost ~]$ cd Desktop/     //相对路径
[wyb@localhost Desktop]$ cd /tmp/a    //绝对路径
[wyb@localhost a]$ pwd
/tmp/a
[wyb@localhost a]$ cd -  //返回原来的目录
[wyb@localhost Desktop]$ pwd
/home/user/reber/Desktop
```

### 0x04 mkdir：新建文件夹
```
[wyb@localhost tmp]$ ls
a  a.txt
[wyb@localhost tmp]$ mkdir bbb
[wyb@localhost tmp]$ ls
a  a.txt  bbb
```

### 0x05 touch/vim：新建文件
```
[wyb@localhost tmp]$ ls
a  a.txt  bbb
[wyb@localhost tmp]$ touch bbb.txt
[wyb@localhost tmp]$ ls
a  a.txt  bbb  bbb.txt
```

### 0x06 rm：删除文件
```
[wyb@localhost tmp]$ ls
a  a.txt  bbb  bbb.txt  c.txt
[wyb@localhost tmp]$ rm c.txt   //删除文件c.txt
[wyb@localhost tmp]$ ls
a  a.txt  bbb  bbb.txt
[wyb@localhost tmp]$ rm a   //删除文件夹a，结果不能删除
rm: cannot remove `a': Is a directory
[wyb@localhost tmp]$ rm -r a   //加上-r才能删除文件夹
[wyb@localhost tmp]$ ls
a.txt  bbb  bbb.txt
```

### 0x07 ifconfig：查看网卡的信息
```
[wyb@localhost tmp]$ ifconfig
eth0    Link encap:Ethernet  HWaddr 00:0C:29:56:B4:10  
        inet addr:192.168.63.131  Bcast:192.168.63.255  Mask:255.255.255.0
        inet6 addr: fe80::20c:29ff:fe56:b410/64 Scope:Link
        UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
        RX packets:67099 errors:0 dropped:0 overruns:0 frame:0
        TX packets:34939 errors:0 dropped:0 overruns:0 carrier:0
        collisions:0 txqueuelen:1000 
        RX bytes:94042525 (89.6 MiB)  TX bytes:1995748 (1.9 MiB)

lo      Link encap:Local Loopback  
        inet addr:127.0.0.1  Mask:255.0.0.0
        inet6 addr: ::1/128 Scope:Host
        UP LOOPBACK RUNNING  MTU:16436  Metric:1
        RX packets:0 errors:0 dropped:0 overruns:0 frame:0
        TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
        collisions:0 txqueuelen:0 
        RX bytes:0 (0.0 b)  TX bytes:0 (0.0 b)
```

### 0x08 netstat：查找网络连接信息
```
netstat -l   //listen状态的
netstat -an  //显示所有的连接信息，且以ip地址代替名称
netstat -t   //显示tcp连接信息
netstat -u   //显示udp连接信息
LISTENING	//监听端口状态
ESTABLSHED	//建立连接
CLOSE_WAIT	//对方主动断开连接，此时我方就会变为这个状态，我方要调用close()
TIME_WAIT	//我方主动调用close(),对方收到后变为CLOSE_WAIT
[root@localhost ~]# netstat -l -n
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address               Foreign Address远程         State      
tcp        0      0 0.0.0.0:22                  0.0.0.0:*                   LISTEN  所有ip均可连接22
tcp        0      0 127.0.0.1:631               0.0.0.0:*                   LISTEN
tcp        0      0 127.0.0.1:25                0.0.0.0:*                   LISTEN  只有127.0.0.1连接25端口
tcp        0      0 :::22                       :::*                        LISTEN      
tcp        0      0 ::1:631                     :::*                        LISTEN  
Active UNIX domain sockets (only servers)
Proto RefCnt Flags       Type       State         I-Node Path
unix  2      [ ACC ]     STREAM     LISTENING     14229  public/cleanup
unix  2      [ ACC ]     STREAM     LISTENING     14236  private/tlsmgr
unix  2      [ ACC ]     STREAM     LISTENING     14240  private/rewrite
unix  2      [ ACC ]     STREAM     LISTENING     14244  private/bounce
unix  2      [ ACC ]     STREAM     LISTENING     14248  private/defer
```

### 0x09 nslookup：查看DNS信息
```
nslookup 查看ip和域名的相互映射
nslookup www.baidu.com   //返回一些信息
```

### 0x0A ping
```
ping -c 3 www.baidu.com   //指定ping百度3次
```

### 0x0B last/finger：查看近期的登陆信息
```
[root@localhost ~]# last
```

```
[root@localhost ~]# finger
```

### 0x0C find：查找文件
```
which vim   //查看可执行文件的位置
*which是通过 PATH环境变量到该路径内查找可执行文件，所以基本的功能是寻找可执行文件* 

whereis、locate也可查找文件,它们是使用数据库来搜索数据

find . -name 1.txt  //查找当前文件夹及子目录下的1.txt、
find . -name *.txt  //使用通配符
find /bin -perm 755 //返回的都是755权限的文件  
find /bin -perm 4755  //返回有gid(即s权限)的文件    2是gid
[wyb@localhost tmp]$ sudo find / -name *.log    //根目录下查找名字以log结尾的文件
/var/spool/plymouth/boot.log
/var/log/wpa_supplicant.log
/var/log/dracut.log
/var/log/vmware-tools-upgrader.log
[wyb@localhost ~]$ find /bin -perm 755 | xargs ls -al   //前一个命令的输出作为后一个命令的输入
-rwxr-xr-x. 1 root root    123 Feb 21  2013 /bin/alsaunmute
-rwxr-xr-x. 1 root root  27776 Jun 22  2012 /bin/arch
-rwxr-xr-x. 1 root root  26264 Jun 22  2012 /bin/basename
-rwxr-xr-x. 1 root root 938768 Feb 21  2013 /bin/bash
-rwxr-xr-x. 1 root root  48568 Jun 22  2012 /bin/cat
-rwxr-xr-x. 1 root root  55472 Jun 22  2012 /bin/chgrp
-rwxr-xr-x. 1 root root  52472 Jun 22  2012 /bin/chmod
```

### 0x0D grep
```
//可以遍历查询mkr文件夹下含有字符串"reber"的文件及字符串所在行
reber@WYB:~$ grep -Rn "reber" mkdir   
mkr/cc:3:reber
mkr/a/a.txt:3:reber
mkr/a/b.txt:16:reber
mkr/b/xx:8:reber
```

### 0x0E cat/nl
```
前者显示
后者显示的同时有行号
[wyb@localhost tmp]$ cat > a.txt  //创建文件同时写入数据
this is a.txt
^C
[wyb@localhost tmp]$ cat > b.txt
this is b.txt
^C
[wyb@localhost tmp]$ cat a.txt b.txt > c.txt   //合并文件
[wyb@localhost tmp]$ cat c.txt 
this is a.txt
this is b.txt
[wyb@localhost tmp]$ cat -n c.txt   //获取文件内容切添加行号
 1  this is a.txt
 2  this is b.txt
```
     
### 0x0F head
```
[wyb@localhost tmp]$ head /etc/passwd   //默认显示前10行
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
mail:x:8:12:mail:/var/spool/mail:/sbin/nologin
uucp:x:10:14:uucp:/var/spool/uucp:/sbin/nologin

[wyb@localhost tmp]$ head -n 4 /etc/passwd  //设置显示前4行
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin

[wyb@localhost tmp]$ head -c 100 d.txt //显示前100个字节
     1  this is a.txt
     2  this is b.txt
this is add content
     1  this is a.txt
     2  this is b.[wyb@localhost tmp]$ 
```

### 0x10 tail
```
[wyb@localhost tmp]$ tail -f a.txt  //实时显示文件后10行
this is a.txt
111111
aaaaaa
^C

[wyb@localhost tmp]$ tail -n 3 d.txt //显示文件后3行
     1  this is a.txt
     2  this is b.txt
this is add content

[wyb@localhost tmp]$ tail -c 100 d.txt //显示后100个字节
  2     this is b.txt
this is add content
     1  this is a.txt
     2  this is b.txt
this is add content
[wyb@localhost tmp]$ 
```

### 0x11 scp
```
向远程服务器put文件和文件夹，默认就是22端口
scp -P 22 ./aa.txt reber@123.206.78.220:/home/reber
scp -r ./bb reber@123.206.78.220:/home/reber

从服务器下载文件和文件夹
scp -P 2222 ubuntu@123.22.38.215:/home/reber/a.txt D:/a.txt
scp -r -P 2222 ubuntu@123.22.38.215:/home/reber/test D:/test/
```

### 0x12 磁盘
```
fdisk /dev/sdb
sudo mkfs.ext3 /dev/sdb1
mount -t ext3 -o rw /dev/sdb1 /home/aaa  //-o指定权限
```

### 0x13 时间同步
```
ntpdate time.nist.gov //需要root权限
```

### 0x14 下载
```
$ curl -o aa.xml http://wyb0.com/index.xml #可以访问网页，它同时还保存了文件，文件名为aa.xml
$ wget http://wyb0.com/index.xml #下载的文件名为index.xml
```

### 0x15 环境变量
```
$ env
```
    
### 0x16 压缩与解压缩
* tar
    * tar主要参数
    ```bash
    # 主要参数
    -c  创建一个新的压缩文件
    -x  解压
    -t  查看压缩文件的内容
    -f  指定档案文件的名字
    -v  显示过程信息
    -r  增加文件到指定的包
    -C  指定解压后的路径
    -z  使用gzip
    -j  使用bzip2
    -Z  使用compress
    ```
    * tar示例
    ```bash
    # tar用法示例
    $ ls
    aaa
    $ tar -cvf 1.tar aaa/   #打包不压缩
    aaa/
    aaa/b.txt
    aaa/c.txt
    aaa/test.txt
    aaa/a.txt
    $ tar -zcvf 1.tar.gz aaa/   #打包且以gzip压缩
    aaa/
    aaa/b.txt
    aaa/c.txt
    aaa/test.txt
    aaa/a.txt
    $ tar -jcvf 1.tar.bz2 aaa/  #打包且以bzip2压缩
    aaa/
    aaa/b.txt
    aaa/c.txt
    aaa/test.txt
    aaa/a.txt
    tar -zxvf aa.tar.gz /home/aaa --exclude=dir  #排除目录
    $ ls -l
    total 24
    -rw-r--r--. 1 wyb root 10240 Apr 19 07:47 1.tar
    -rw-r--r--. 1 wyb root   265 Apr 19 07:48 1.tar.bz2
    -rw-r--r--. 1 wyb root   253 Apr 19 07:48 1.tar.gz
    drwxr-xr-x. 2 wyb root  4096 Apr 19 07:22 aaa
    $ file 1.tar.gz     #查看文件类型
    1.tar.gz: gzip compressed data, from Unix, last modified: Tue Apr 19 07:48:01 2016
    $ tar -ztvf 1.tar.gz    #查看压缩包内容
    drwxr-xr-x wyb/root          0 2016-04-19 07:22 aaa/
    -rw-r--r-- wyb/root          0 2016-04-19 05:05 aaa/b.txt
    -rw-r--r-- wyb/root          0 2016-04-19 05:05 aaa/c.txt
    -rw-r--r-- wyb/root         84 2016-04-19 05:50 aaa/test.txt
    -rw-r--r-- wyb/root          0 2016-04-19 05:05 aaa/a.txt
    $ ls
    1.tar  1.tar.bz2  1.tar.gz  aaa
    $ rm -rf aaa/
    $ ls
    1.tar  1.tar.bz2  1.tar.gz
    $ tar -zxvf 1.tar.gz    #解压到当前目录
    aaa/
    aaa/b.txt
    aaa/c.txt
    aaa/test.txt
    aaa/a.txt
    $ ls
    1.tar  1.tar.bz2  1.tar.gz  aaa
    $ ls aaa/
    a.txt  b.txt  c.txt  test.txt
    $ ls /tmp/
    111.txt  aa
    $ tar -zxvf 1.tar.gz -C /tmp/aa #解压到指定路径
    aaa/
    aaa/b.txt
    aaa/c.txt
    aaa/test.txt
    aaa/a.txt
    ```
* zip
```
# zip用法示例
[reber@localhost ~]$ ls aaa/
a.txt  b.txt  c.txt
[reber@localhost ~]$ zip -re aaa.zip aaa/   #加密压缩
Enter password: 
Verify password: 
  adding: aaa/ (stored 0%)
  adding: aaa/b.txt (stored 0%)
  adding: aaa/c.txt (stored 0%)
  adding: aaa/a.txt (stored 0%)
[reber@localhost ~]$ rm aaa/*
[reber@localhost ~]$ ls aaa/
[reber@localhost ~]$ unzip aaa.zip   #解压缩
Archive:  aaa.zip
[aaa.zip] aaa/b.txt password: 
 extracting: aaa/b.txt         
 extracting: aaa/c.txt               
 extracting: aaa/a.txt
```
