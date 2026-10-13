---
draft: false
date: 2016-04-20 15:54:07
title: Linux 之文本处理软件 awk
description: 
categories:
  - Linux
tags:
  - linux
  - software
---

awk默认是以行为单位处理文本的，对文本中的每一行都执行后面 "{ }" 中的语句。

### 0x00 awk


* 若有一个需要重新格式化的字典test.txt(用户名、密码、地址)：
```
xiaosan sadasdw jiaozuo
234wer  asdfasd asdas
1111    aaaa    cccc
2222    aaaa    degd
1111    aaaa    cccc
3333    aaaa    dfger
21asd   sdfsd   sadasd
dwqx    asds    sasdfcv
```

* 要求：
```
1.里面有重复数据，使用命令去重
2.提取出用户名和密码 每一行前面加上id数字，递增。
3.只提取出密码作为爆破字典
4.某些公司都是一个公司前缀+姓名简写，所以为用户名一栏全部改为uv_用户名
5.提取出密码一列，有些密码爆破成功率高，所以增加一列，标出密码出现次数
```

### 0x01 去重
```
$ cat test.txt | awk '!a[$1]++'
$ cat test.txt | uniq #作用和上面命令相同
xiaosan sadasdw jiaozuo
234wer  asdfasd asdas
1111    aaaa    cccc
2222    aaaa    degd
3333    aaaa    dfger
21asd   sdfsd   sadasd
dwqx    asds    sasdfcv
```


### 0x02 去重、添加id
```
一般字典不需要id、user、pass等标示符，这里只是为了便于观看

$ cat test.txt | awk '!a[$1]++' | awk -F '\t' '{print "id:"NR"\tuser:"$1"\tpass:"$2"\taddress:"$3}' | column -t  #最后一个命令可以将列对齐
id:1    user:aosan      pass:sadasdw    address:jiaozuo
id:2    user:234wer     pass:asdfasd    address:asdas
id:3    user:1111       pass:aaaa       address:cccc
id:4    user:2222       pass:aaaa       address:degd
id:5    user:3333       pass:aaaa       address:dfger
id:6    user:21asd      pass:sdfsd      address:sadasd
id:7    user:dwqx       pass:asds       address:sasdfcv
```

### 0x03 去重、添加id、添加公司前缀
```
$ cat test.txt | awk '!a[$1]++' | awk -F '\t' '{print "id:"NR"\tuser:uv_"$1"\tpass:"$2"\taddress:"$3}'
id:1    user:uv_aosan   pass:sadasdw    address:jiaozuo
id:2    user:uv_234wer  pass:asdfasd    address:asdas
id:3    user:uv_1111    pass:aaaa       address:cccc
id:4    user:uv_2222    pass:aaaa       address:degd
id:5    user:uv_3333    pass:aaaa       address:dfger
id:6    user:uv_21asd   pass:sdfsd      address:sadasd
id:7    user:uv_dwqx    pass:asds       address:sasdfcv
```

### 0x04 去重然后输出密码
```
$ cat test.txt | awk '!a[$1]++' | awk -F '\t' '{print "pass:"$2}'
pass:sadasdw
pass:asdfasd
pass:aaaa
pass:aaaa
pass:aaaa
pass:sdfsd
pass:asds
```

### 0x05 输出密码、得到密码出现次数
```
下面的'a[$1]++'是按第一列来去重的,若有两条数据只有第一列重复则成功，可以用$0按行来去重
$ cat test.txt | awk '!a[$1]++' | awk -F '\t' '{print $2}' | awk '{a[$1]++} END {for (j in a) print a[j],j}'
1 sadasdw
1 sdfsd
1 asdfasd
1 asds
3 aaaa

uniq 只能去除挨着的重复数据，所以先sort升序排序，然后uniq -c统计重复，再sort -r降序排序
cat test.txt | awk '{print $2}' | sed '1d' |sort | uniq -c |sort -r
```
    
### 0x06 其他：

* 对!a[$1]++的解释如下：
    * a[e54r56wer]为空，!a[e54r56wer]为真，可以输出，然后++
    * 若再来一个a[e54r56wer]，因为上一步已经++，此时值为1，!a[e54r56wer]为假，不输出，再++

* 对for输出数组的解释如下：  
    awk ```'{a[$1]++} END {for (j in a) print a[j],j}'``` test.txt
    * 在遍历完文件后，通过END把后面的句子连起来
    * for (j in a) 是指打印数组a的下标，并定义下标为变量j
    * 最后print a[j],j就是打印数组下标和数组，这样就相同的$1排重并计数