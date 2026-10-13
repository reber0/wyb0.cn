---
draft: false
date: 2017-06-22 15:18:29
title: AJAX 之跨域
description: 
categories:
  - JS
tags:
  - js
---

### 0x00 简介 
当使用AJAX请求其他域名下的数据时会出现拒绝访问的情况，这是出于安全考虑，AJAX只能访问本地的资源，而不能跨域访问。

当使用[AJAX与PHP](http://wyb0.com/posts/ajax-and-php/)中的代码请求其他域的数据时会出现下面的情况

![ajax跨域请求](/img/post/ajax_cross_domain.png)

至于解决方案的话这里说三种：JSONP、jQuery、CORS。

### 0x01 JSONP
这里的场景是本地127站点跨域请求远程114.115.214.111站点的数据
```
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>jsonptest</title>
</head>
<body>

<script>
    function callback_func(data) {
        document.getElementById("txtHint").innerHTML="姓名:"+data.name+"--性别:"+data.sex+"--年龄:"+data.age;
    }

    function get_msg(name) {
        var url = "http://114.115.214.111/wyb/msg.php?name="+name+"&callback=callback_func";
        var script = document.createElement('script');
        script.setAttribute('src', url);
        script.setAttribute('id', 'aaabbb');
        document.getElementsByTagName('head')[0].appendChild(script);
        document.getElementById('aaabbb').remove();
    }
</script>


<h3>在输入框中尝试输入姓名(xiaoming):</h3>
<form action=""> 
输入姓名: <input type="text" onkeyup="get_msg(this.value)" />
</form>
<p>提示信息: <span id="txtHint"></span></p> 

</body>
</html>
```
```
<?php
    $conn = @mysql_connect('localhost','admin','123456');
    mysql_select_db('test',$conn);

    $name = $_GET['name'];
    $callback = $_GET['callback'];

    $sql = "select * from student where name='".$name."'";
    $result = mysql_query($sql,$conn);
    $row = mysql_fetch_array($result);

    $name = $row['name'];
    $sex = $row['sex'];
    $age = $row['age'];

    echo $callback.'({'.'"name":"'.$name.'","sex":'.$sex.',"age":'.$age.'})';
?>
```
![ajax跨域请求](/img/post/ajax_cross_domain_jsonp.png)

我们看到调用的url中传递了一个name参数，告诉远端服务器获取name为xiaoliu的信息，而callback参数则告诉服务器，我的本地回调函数叫做callback_func，所以请把查询结果传入这个函数中。

### 0x02 jQuery中的ajax
其实就是对上面JSONP例子中函数的封装扩展
```
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>xsstest</title>
    <script src='https://cdn.bootcss.com/jquery/3.0.0/jquery.min.js'></script>
</head>
<body>

<script>
    function get_msg(name){
        var url="http://114.115.214.111/wyb/msg.php?name="+name;
        $.ajax({
            type: "get",
            async: false,
            url: url,
            dataType: "jsonp",
            jsonp: "callback",//以获得jsonp回调函数名的参数名(默认为:callback)
            // jsonpCallback:"aaaaa",//jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            "success": function(data) {
                $("#txtHint").text("姓名:"+data.name+"--性别:"+data.sex+"--年龄:"+data.age);
            },
            "error": function() {
                alert("error");
            }
        });
    }
</script>


<h3>在输入框中尝试输入姓名(xiaoming):</h3>
<form action=""> 
输入姓名: <input type="text" onkeyup="get_msg(this.value)" />
</form>
<p>提示信息: <span id="txtHint"></span></p> 

</body>
</html>
```
![ajax跨域请求](/img/post/ajax_cross_domain_jquery.png)

### 0x03 CORS
简单来说就是在请求的文件中加入header，指定可以访问资源的域名  
在php中就是```header("Access-Control-Allow-Origin:*");``` 这里的*代表允许所有  
加入后使用[AJAX与PHP](http://wyb0.com/posts/ajax-and-php/)中的代码就能跨域访问