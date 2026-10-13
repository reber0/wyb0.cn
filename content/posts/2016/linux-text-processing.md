---
draft: false
date: 2016-04-20 07:58:07
title: Linux 之文本处理
description: 
categories:
  - Linux
tags:
  - linux
---

这里介绍3种方式：awk、grep、sed

### 0x00 awk处理文本(最常用)
```
作用：awk对数据以行分析并生成报告时显得很强大，它将行进行切片，再处理分开的切片，可对格式化的数据重新进行格式化  
awk命令格式：awk [F filed-separator] 'commands' input-fiel(s)  
参数-F：可以添加任意的分割符，比较重要  
awk工作流程是这样的：  
读入有'\n'换行符分割的一条记录，然后将记录按-F指定的域分隔符划分域，$0则表示所有域,$1表示第一个域,$n表示第n个域。默认域分隔符是"空白键" 或 "[tab]键"。
```

* 入门示例：
```bash
[wyb@localhost temp]$ head -n 5 /etc/passwd
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
[wyb@localhost temp]$ head -n 5 /etc/passwd | awk -F ':' '{print $1}' #输出第1列，域分隔符为：
root
bin
daemon
adm
lp
[wyb@localhost temp]$ head -n 5 /etc/passwd | awk -F ':'  '{pri
nt "id:"$1"\tshell:"$7}' #输出第1、7列且给予列名
id:root shell:/bin/bash
id:bin  shell:/sbin/nologin
id:daemon       shell:/sbin/nologin
id:adm  shell:/sbin/nologin
id:lp   shell:/sbin/nologin
[wyb@localhost temp]$ head -n 5 /etc/passwd | awk -F ':'  'BEGIN {print "====begin====="} {print "id:"$1"\tshell:"$7} END {print "====end===="}'
====begin=====
id:root shell:/bin/bash
id:bin  shell:/sbin/nologin
id:daemon       shell:/sbin/nologin
id:adm  shell:/sbin/nologin
id:lp   shell:/sbin/nologin
====end====
[wyb@localhost temp]$ awk -F: '/root/' /etc/passwd #搜索含有root关键字的所有行
root:x:0:0:root:/root:/bin/bash
operator:x:11:0:operator:/root:/sbin/nologin
[wyb@localhost temp]$ awk -F: '/root/{print $7}' /etc/passwd #匹配root并输出对应shell
/bin/bash
/sbin/nologin
[wyb@localhost temp]$ awk -F: '/^root/' /etc/passwd #匹配以root开头的行
root:x:0:0:root:/root:/bin/bash
```

* 内置变量：
<table>
    <tr>
        <td bgcolor=black>
ARGC&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;命令行参数个数<br/>
ARGV&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;命令行参数排列<br/>
ENVIRON&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;支持队列中系统环境变量的使用<br/>
FILENAME&nbsp;&nbsp;&nbsp;awk浏览的文件名<br/>
FNR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;浏览文件的记录数<br/>
FS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;设置输入域分隔符，等价于命令行 -F选项<br/>
NF&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;浏览记录的域的个数<br/>
NR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;已读的记录数<br/>
OFS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;输出域分隔符<br/>
ORS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;输出记录分隔符<br/>
RS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;控制记录分隔符
        </td>
    </tr>
</table>
```
[wyb@localhost temp]$ awk -F: '{print "filename:" FILENAME ",linenumber:" NR ",columns:" NF ",linecontent:"$0}' a.txt
filename:a.txt,linenumber:1,columns:1,linecontent:1     root    12sf34s56
filename:a.txt,linenumber:2,columns:1,linecontent:2     admin   ksdjfiweurf
filename:a.txt,linenumber:3,columns:1,linecontent:3     dome    skd89453
filename:a.txt,linenumber:4,columns:1,linecontent:4     tomkd   3jkke34
filename:a.txt,linenumber:5,columns:1,linecontent:5     jarry   sdkj89ry4
filename:a.txt,linenumber:6,columns:1,linecontent:6     canki   sdkj834
filename:a.txt,linenumber:7,columns:1,linecontent:7     lola    er8f7734
filename:a.txt,linenumber:8,columns:1,linecontent:8     marry   j8jkf78
filename:a.txt,linenumber:9,columns:1,linecontent:9     candy   kd89943
```

* awk编程：
    * 变量和赋值：
    ```
    [wyb@localhost temp]$ head -n 5 /etc/passwd | awk -F ':'  'BEGIN {count=0} {count++; print "username:"$1} END {print "count:"count}'
    username:root
    username:bin
    username:daemon
    username:adm
    username:lp
    count:5
    [wyb@localhost ~]$ ls -l aaa/ettercap-0.8.2 | awk 'BEGIN {size=0;} {size=size+5;} END {print "[end]size is:",size,"byte"}'
    [end]size is: 160 byte
    [wyb@localhost ~]$ ls -l aaa/ettercap-0.8.2 | awk 'BEGIN {size=0;} {size=size+5;} END {print "[end]size is:",size/1024/1024,"M"}'
    [end]size is: 0.000152588 M
    ```
    
    * 条件语句：
    ```
    [wyb@localhost ~]$ head -n 6 /etc/passwd | awk -F ':' '{if($1=="root") print "root bash is:"$7}'
    root bash is:/bin/bash
    [wyb@localhost ~]$ 
    ```

### 0x01 Grep处理文本
匹配到时输出一行  

* 常用参数：nrABC
<table>
    <tr>
        <td bgcolor=black>
-n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;输出匹配到的字符串所在行数<br/>
-r&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;遍历子目录文件查找字符串<br/>
-A 3&nbsp;&nbsp;显示匹配行及下面3行<br/>
-B 4&nbsp;&nbsp;显示匹配行及上面4行<br/>
-C 4&nbsp;&nbsp;显示匹配行及上下4行<br/>
-i&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;不区分大小写<br/>
-v&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;显示所有不包含字符的行
        </td>
    </tr>
</table>

```
[wyb@localhost ~]$ grep root /etc/passwd #查找root这个字符
root:x:0:0:root:/root:/bin/bash
operator:x:11:0:operator:/root:/sbin/nologin
[wyb@localhost ~]$ grep -n root /etc/passwd #查找root字符串并输出所在行数
1:root:x:0:0:root:/root:/bin/bash
11:operator:x:11:0:operator:/root:/sbin/nologin
[wyb@localhost ~]$ grep -n root /etc/passwd --color #给字符串不同颜色
1:root:x:0:0:root:/root:/bin/bash
11:operator:x:11:0:operator:/root:/sbin/nologin
[wyb@localhost temp]$ ls
aa  b.txt
[wyb@localhost temp]$ grep -r -n root /home/wyb/temp/ --color #在temp目录及子目录查找字符串root
/home/wyb/temp/b.txt:4:sdkrootwe
/home/wyb/temp/b.txt:6:fsdkfjroot
/home/wyb/temp/b.txt:9:root
/home/wyb/temp/aa/a.txt:1:1     root    12sf34s56
[wyb@localhost temp]$ grep -r -n "^root" /etc/passwd --color #正则查找字符串root
1:root:x:0:0:root:/root:/bin/bash
[wyb@localhost temp]$ grep -r -n "root" /etc/passwd --color -c #匹配的行的数
2
[wyb@localhost temp]$ ps aux | grep "^wyb"
wyb        2185  0.0  0.1  99952  1840 ?        S    16:33   0:02 sshd: wyb@pts/0  
wyb        2186  0.0  0.1 108464  1944 pts/0    Ss   16:33   0:00 -bash
wyb        3229  2.0  0.1 110232  1136 pts/0    R+   18:27   0:00 ps aux
wyb        3230  0.0  0.0 103244   828 pts/0    S+   18:27   0:00 grep ^wyb
[wyb@localhost temp]$ ps aux | grep ora
wyb        3233  0.0  0.0 103244   828 pts/0    S+   18:28   0:00 grep ora
```

### 0x02 sed处理文本
```
* 处理大文本很好用，上几十万、上百万行的数据
* sed主要以行为单位，可以将数据行进行替换、删除、新增、选取等
* sed语法 参数 动作 文件
* -n只把匹配到的输出
* 主要参数是：
    * a 在下面插入数据
    * d 删除
    * i 在上面插入数据
    * p 输出数据
    * c 替换字符串，后面可跟字符串，字符串替换n1到n2之间的行<br/>
      s 替换字符串，通常搭配正则
```

* 字符的删除

```
[wyb@localhost aa]$ nl a.txt | sed '3,8d' #不输出3-8行
     1  1     root      12sf34s56
     2  2     admin     ksdjfiweurf
     9  9     candy     kd89943
[wyb@localhost aa]$ nl a.txt | sed '3,$d' #从第三行删到最后一行
     1  1     root      12sf34s56
     2  2     admin     ksdjfiweurf
[wyb@localhost aa]$ nl a.txt | sed '/root/d' #正则删除带root的行
     2  2     admin     ksdjfiweurf
     3  3     dome      skd89453
     4  4     tomkd     3jkke34
     5  5     jarry     sdkj89ry4
     6  6     canki     sdkj834
     7  7     lola      er8f7734
     8  8     marry     j8jkf78
     9  9     candy     kd89943
```

* a插入字符

```
[wyb@localhost aa]$ nl a.txt | sed '2a aaaaaa' | head -n 5 #在第二行下面插入一行字符串aaaaaa
     1  1     root      12sf34s56
     2  2     admin     ksdjfiweurf
aaaaaa
     3  3     dome      skd89453
     4  4     tomkd     3jkke34
[wyb@localhost aa]$ nl a.txt | sed '2i aaaaaa' | head -n 5 #在第二行上面插入一行字符串aaaaaa
     1  1     root      12sf34s56
aaaaaa
     2  2     admin     ksdjfiweurf
     3  3     dome      skd89453
     4  4     tomkd     3jkke34
[wyb@localhost aa]$ nl a.txt | sed '2i aaaaaa \ #增加多行用\
bbbbb\
ccccc\
dddddd' | head -n 7
     1  1     root      12sf34s56
aaaaaa 
bbbbb
ccccc
dddddd
     2  2     admin     ksdjfiweurf
     3  3     dome      skd89453
```

* p输出字符

```
[wyb@localhost aa]$ nl a.txt | sed '2,5p'
     1  1     root      12sf34s56
     2  2     admin     ksdjfiweurf
     2  2     admin     ksdjfiweurf
     3  3     dome      skd89453
     3  3     dome      skd89453
     4  4     tomkd     3jkke34
     4  4     tomkd     3jkke34
     5  5     jarry     sdkj89ry4
     5  5     jarry     sdkj89ry4
     6  6     canki     sdkj834
     7  7     lola      er8f7734
     8  8     marry     j8jkf78
     9  9     candy     kd89943
[wyb@localhost aa]$ nl a.txt | sed -n '2,5p' #加-n去除其余行
     2  2     admin     ksdjfiweurf
     3  3     dome      skd89453
     4  4     tomkd     3jkke34
     5  5     jarry     sdkj89ry4
[wyb@localhost aa]$ nl a.txt | sed -n '/root/p' #正则匹配root
     1  1     root      12sf34s56
[wyb@localhost bbb]$ nl /etc/passwd | sed -n '/root/{s/root/111111/;p}' #查找root，然后将行中的第一个root替换为abcdefg  -n代表不输出所有的
     1  111111:x:0:0:root:/root:/bin/bash
    11  operator:x:11:0:operator:/111111:/sbin/nologin
```

* c和s替换字符

```
[wyb@localhost aa]$ nl a.txt | sed '2,5c aaaaaa' #将第2-5行替换
     1  1     root      12sf34s56
aaaaaa
     6  6     canki     sdkj834
     7  7     lola      er8f7734
     8  8     marry     j8jkf78
     9  9     candy     kd89943
[wyb@localhost aa]$ nl /etc/passwd | sed -n '/root/{s/root/1111/g;p}'查找root，然后将全局的root替换为1111
     1  1111:x:0:0:1111:/1111:/bin/bash
    11  operator:x:11:0:operator:/1111:/sbin/nologin
[wyb@localhost aa]$ nl /etc/passwd | sed -n '1,3{s/root/1111/g;p}'前五行查找root，然后将全局的root替换为1111
     1  1111:x:0:0:1111:/1111:/bin/bash
     2  bin:x:1:1:bin:/bin:/sbin/nologin
     3  daemon:x:2:2:daemon:/sbin:/sbin/nologin
[wyb@localhost aa]$ nl /etc/passwd | sed -n '1,5{s/root/1111/g;p;q}'前五行查找root，然后将整行的root替换为1111,查找到一个就退出
     1  1111:x:0:0:1111:/1111:/bin/bash
```

* 实例

```
[wyb@localhost aa]$ ifconfig eth0
eth0      Link encap:Ethernet  HWaddr 00:0C:29:56:B4:10  
          inet addr:192.168.63.131  Bcast:192.168.63.255  Mask:255.255.255.0
          inet6 addr: fe80::20c:29ff:fe56:b410/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:11732 errors:0 dropped:0 overruns:0 frame:0
          TX packets:7223 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000 
          RX bytes:1148256 (1.0 MiB)  TX bytes:1192150 (1.1 MiB)


[wyb@localhost aa]$ ifconfig eth0 | grep 'inet add' 
          inet addr:192.168.63.131  Bcast:192.168.63.255  Mask:255.255.255.0
[wyb@localhost aa]$ ifconfig eth0 | grep 'inet add' | sed 's/Bcast.*$//g'
          inet addr:192.168.63.131  
[wyb@localhost aa]$ 

[wyb@localhost aa]$ nl /etc/passwd | sed '3,$d'
     1  root:x:0:0:root:/root:/bin/bash
     2  bin:x:1:1:bin:/bin:/sbin/nologin
[wyb@localhost aa]$ nl /etc/passwd | sed '3,$d' | sed -n 's/bash/buleshell/p'
     1  root:x:0:0:root:/root:/bin/buleshell

[wyb@localhost aa]$ nl /etc/passwd | sed -e '3,$d' -e 's/bash/buleshell/p'
     1  root:x:0:0:root:/root:/bin/buleshell
     1  root:x:0:0:root:/root:/bin/buleshell
     2  bin:x:1:1:bin:/bin:/sbin/nologin
[wyb@localhost aa]$ 


[wyb@localhost aa]$ nl /etc/passwd | sed -e '3,$d' -e 's/bash/buleshell/p'
     1  root:x:0:0:root:/root:/bin/buleshell
     1  root:x:0:0:root:/root:/bin/buleshell
     2  bin:x:1:1:bin:/bin:/sbin/nologin
[wyb@localhost aa]$ nl /etc/passwd | sed -e '3,$d' -e 's/bash/buleshell/p' > test.txt
[wyb@localhost aa]$ cat test.txt 
     1  root:x:0:0:root:/root:/bin/buleshell
     1  root:x:0:0:root:/root:/bin/buleshell
     2  bin:x:1:1:bin:/bin:/sbin/nologin
```