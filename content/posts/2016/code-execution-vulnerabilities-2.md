---
draft: false
date: 2016-10-14 13:16:32
title: 代码执行漏洞(二)
description: 
categories:
  - Pentest
tags:
  - rce
---

#### 接着上一篇：[代码执行漏洞(一)](/posts/2016/code-execution-vulnerabilities/)

### 0x00 函数create_function()
php中的函数create_function()可以创建一个匿名函数，其函数原型如下：
```
string create_function ( string $args , string $code )
其中$args是函数的参数，$code是函数的内容
```
若对提交的code未过滤或过滤不当则可能会导致代码执行漏洞

### 0x01 示例 
示例a.php代码如下：
```
<?php
    $test = @$_GET['test'];
    $newfun = create_function('$a,$b', $test);
    $newfun('1111','2222');
?>
上述代码中$nuwfun('1111','2222')代表此时$a='1111',$b='2222',然后将其传给$test
```
![示例1](/img/post/code_execution_create_function1.png)
![示例2](/img/post/code_execution_create_function2.png)
![示例3](/img/post/code_execution_create_function3.png)

### 0x02 函数assert()
这个函数和eval()的作用差不多
```
<?php @assert($_GET['str']); ?>
```
![函数assert()](/img/post/code_execution_assert.png)
