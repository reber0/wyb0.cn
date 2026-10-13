---
draft: false
date: 2016-04-17 10:03:07
title: Linux 之权限
description: 
categories:
  - Linux
tags:
  - linux
---

主要有三种参数：rwx 
对于文件来说：分别是读/写/执行  
对于目录来说：r读目录结构；w操作目录结构；x进入目录  
如：drwxr--r-- 3 root root 4096 Jun 25 08:35 .ssh  
若账号vbird不属于root群组，则vbird可以查询此目录下的文件名，没有x权限所以不能切换到此目录中


### 0x00 文件权限
1. chmod -x
```
[root@localhost tmp]# ls -l
total 0
-rwxrwxrwx. 1 root root 0 Apr 16 20:32 a.txt
[root@localhost tmp]# chmod -x a.txt   去除ugo的x权限
[root@localhost tmp]# ls -l
total 0
-rw-rw-rw-. 1 root root 0 Apr 16 20:32 a.txt
[root@localhost tmp]# ls -l a.txt 
-rwxrw-rw-. 1 root root 9 Apr 16 20:42 a.txt
[root@localhost tmp]# cat a.txt 
echo aaa
[root@localhost tmp]# ./a.txt    直接执行了a.txt中的echo命令
aaa
[root@localhost tmp]# 
```

2. chmod -R
```
[root@localhost tmp]# ls -l a;ls -l a/a.txt 
total 0
-rw-r--r--. 1 root root 0 Apr 16 20:35 a.txt
-rw-r--r--. 1 root root 0 Apr 16 20:35 a/a.txt
[root@localhost tmp]# chmod -R o+x a  遍历更改a文件夹及a下所有文件的权限
[root@localhost tmp]# ls -l a;ls -l a/a.txt 
total 0
-rw-r--r-x. 1 root root 0 Apr 16 20:35 a.txt
-rw-r--r-x. 1 root root 0 Apr 16 20:35 a/a.txt
```

3. chmod 7 a.txt
```
[root@localhost tmp]# ll a.txt 
-rw-rw-rw-. 1 root root 0 Apr 16 20:32 a.txt
[root@localhost tmp]# chmod 7 a.txt    //只更改其他人的权限，ug赋为0
[root@localhost tmp]# ll a.txt 
-------rwx. 1 root root 0 Apr 16 20:32 a.txt
```

### 0x01 文件夹权限：
可读是指能看到里面的文件<br/>
可写是指能在里面删除、增加文件<br/>
文件夹可执行是指能cd进去

1. 不能进入没有x权限的文件夹：
```
[wyb@localhost Desktop]$ ls -l
total 4
dr--------. 2 wyb wyb 4096 Apr 17 01:25 aa
[wyb@localhost Desktop]$ cd aa/
```

2. 不能删除有777权限的文件：
```
[wyb@localhost Desktop]$ ls -l;ls -l aa/a.txt 
total 4
dr-xr-xr-x. 2 wyb wyb 4096 Apr 17 01:25 aa
-rwxrwxrwx. 1 wyb wyb 0 Apr 17 01:25 aa/a.txt
[wyb@localhost Desktop]$ rm aa/a.txt 
rm: cannot remove `aa/a.txt': Permission denied  //因为没有aa的x权限，所以不能删除aa下的文件
```

### 0x02 chown：
普通用户不能将自己的文件改变成其他的拥有者。其操作权限一般为管理员。
```
//将aaa.txt的所属由xiao改变为fans组，属主为xiaofang
$ chown xiaofang:fans aaa.txt
```

### 0x03 一般用visudo添加sudo