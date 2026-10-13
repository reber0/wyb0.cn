---
draft: false
date: 2016-02-05 11:38:23
title: Python 的正则
description: 
categories:
  - Python
tags:
  - python
  - 正则
---

### 0x00 正则表达式
正则表达式是用来匹配字符串的异常强大的东西，可以用来匹配邮箱、域名等字符串

### 0x01 符号
![75](/img/post/regular_atomic_character.png)

### 0x02 特殊字符
![75](/img/post/regular_metacharacters.png)

### 0x03 常用的模块属性
![75](/img/post/regular_modifier.png)

### 0x04 re模块
由于Pyton的字符串本身也用\转义，强烈建议使用r前缀

* 函数match()  
这个函数会尝试从字符串起始位置匹配一个模式，未匹配到则返回None
![re模块的match函数](/img/post/regular_re_match.png)

* 函数search()  
这个函数会扫描整个字符串并返回第一个成功的匹配，未匹配到则返回None
![re模块的match函数](/img/post/regular_re_search.png)

* 函数findall()和finditer()  
re.findall()将以列表的形式返回所有能匹配到的字符  
re.finditer()将以迭代器的形式返回所有能匹配到的字符
![re的findall和finditer](/img/post/regular_re_findall_finditer.png)

* 函数sub()  
这个函数会对字符串进行匹配，然后替换，可以指定替换次数
![re的sub函数](/img/post/regular_re_sub.png)

* 函数split()  
这个函数会以正则来分割字符串，以列表样式返回
![re的split函数](/img/post/regular_re_split.png)

* 函数compile()  
这个函数可以编译正则，提高匹配速度
![re的compile函数](/img/post/regular_re_compile.png)

### 0x05 提取子串  
根据正则可以匹配字符然后提取出来，用括号表示要提取的分组
![提取子串](/img/post/regular_re_get_substr.png)

### 0x06 贪婪匹配
正则表达式默认贪婪匹配，会尽可能的多匹配字符，一般就是用"？"来抑制贪婪匹配
![非贪婪匹配](/img/post/regular_re_not_greed_match .png)
