---
draft: false
date: 2016-06-29 15:14:11
title: Python 的编码问题
description: 
categories:
  - Python
tags:
  - python
---

### 0x00 几个编码函数
```
* ord(x)  
    将字符转换为10进制整数(0~255之间) #ord('a')==>97
* chr(x)  
    将10进制整数(0~255之间)转换为字符 #chr(97)==>'a'，chr(0x61)==>'a'

* b2a_hex(x)  
    将字符转换为对应的16进制 #import binascii;binascii.b2a_hex('a')==>'61'
* a2b_hex(x)  
    将16进制转换为对应的字符 #import binascii;binascii.a2b_hex('61')==>'a'

* hex(x)  
    将10进制整数转换为对应的16进制 #hex(16)==>'0x10'
* oct(x)  
    将10进制整数转换为对应的8进制  #oct(9)==>'011'
```

### 0x01 设置为utf-8
* 在py文件开头设置
```python
#!/usr/bin/env python
#-*- coding: utf-8 -*-
或：
#coding=utf8
```

* 永久编码(推荐)
![python编码出错.png](/img/post/unicode_encode_error.png)
可以在python安装路径下的Lib\site-packages下新建文件sitecustomize.py文件，内容如下：
```python
#coding=utf8
import sys
reload(sys)
sys.setdefaultencoding('utf8')
# 此方法修改了python环境，设置系统默认编码，永久有效
```

### 0x03 编码转换
python默认unicode为中间编码，所以无论是何种编码，解码时默认都解码为unicode
```
python2中的字符串一般包含两种类型：str和unicode
str：str为ascii类型的字符串，utf-8、utf-16、GB2312、GBK等都是ascii类型的字符串
unicode：unicode编码的字符串才是unicode类型的字符串

可通过isinstance()和type()来判断

>>> aa = '小明'
>>> isinstance(aa,str)
True
>>> type(aa)
<type 'str'>

>>> bb = u'小明'
>>> isinstance(bb,unicode)
True
>>> type(bb)
<type 'unicode'>
```

```
>>> u'小明'.encode('utf8') #unicode到utf8
'\xe5\xb0\x8f\xe6\x98\x8e'
>>> '小明'.decode('utf8') #utf8到unicode
u'\u5c0f\u660e'

>>> u'小明'.encode('unicode-escape') #unicode到unicode-escape
'\\u5c0f\\u660e'
>>> '\\u5c0f\\u660e'.decode('unicode-escape')
u'\u5c0f\u660e'
>>> print '\\u5c0f\\u660e'.decode('unicode-escape')
小明
```

### 0x04 网页的编码
```python
#!/usr/bin/env python
#-*- coding:utf-8 -*-

import requests

resp = requests.get('http://soft.nyist.edu.cn/')
print resp.apparent_encoding #UTF-8-SIG
resp.encoding = resp.apparent_encoding #获取原网页的编码格式，并赋给resp.encoding
html = resp.text #以resp.encoding的格式解码为unicode
# print html.encode('gb18030') #转码为gbk不能正常输出html源码
print type(html) #<type 'unicode'>
title = html.lower().split('<title>')[1].split('</title')[0]
print title #南阳理工学院
```