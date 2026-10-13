---
draft: false
date: 2016-11-16 10:37:03
title: AJAX 与 PHP
description: 
categories:
  - JS
tags:
  - js
---

### 0x00 AJAX与PHP
ajax.html代码如下：

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <script>
    function showHint(str) {
        var xmlhttp;
        if (str.length==0) { 
            document.getElementById("txtHint").innerHTML="";
            return;
        }
        if (window.XMLHttpRequest) {
            // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
            xmlhttp=new XMLHttpRequest(); //创建对象
        } else {
            // IE6, IE5 浏览器执行代码
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                document.getElementById("txtHint").innerHTML=xmlhttp.responseText;
            }
        }
        xmlhttp.open("GET","./ajax.php?q="+str,true);
        xmlhttp.send();
    }
    </script>
</head>
<body>
    <h3>在输入框中尝试输入字母 a:</h3>
    <form action=""> 
    输入姓名: <input type="text" id="txt1" onkeyup="showHint(this.value)" />
    </form>
    <p>提示信息: <span id="txtHint"></span></p> 
</body>
</html>
```
```
上面的代码会完成以下的东西：

1. 在输入字母时会调用showHint()
2. showHint()创建对象
3. 定义onreadystatechange事件
4. xmlhttp.open()访问当前目录下的ajax.php来请求资源
```

ajax.php代码如下：
```
<?php
// Fill up array with names
$a[]="Anna";
$a[]="Brittany";
$a[]="Cinderella";
$a[]="Diana";
$a[]="Eva";
$a[]="Fiona";
$a[]="Gunda";
$a[]="Hege";
$a[]="Inga";
$a[]="Johanna";
$a[]="Kitty";
$a[]="Linda";
$a[]="Nina";
$a[]="Ophelia";
$a[]="Petunia";
$a[]="Amanda";
$a[]="Raquel";
$a[]="Cindy";
$a[]="Doris";
$a[]="Eve";
$a[]="Evita";
$a[]="Sunniva";
$a[]="Tove";
$a[]="Unni";
$a[]="Violet";
$a[]="Liza";
$a[]="Elizabeth";
$a[]="Ellen";
$a[]="Wenche";
$a[]="Vicky";

//get the q parameter from URL
$q=$_GET["q"];

//lookup all hints from array if length of q>0
if (strlen($q) > 0) {
    $hint="";
    for($i=0; $i<count($a); $i++) {
        if (strtolower($q)==strtolower(substr($a[$i],0,strlen($q)))) {
            if ($hint=="") {
                $hint=$a[$i];
            } else {
                $hint=$hint." , ".$a[$i];
            }
        }
    }
}

// Set output to "no suggestion" if no hint were found
// or to the correct values
if ($hint == "") {
    $response="no suggestion";
} else {
    $response=$hint;
}

//output the response
echo $response;
?>
```

结果如下：
![ajax与php](/img/post/ajax_and_php.gif)

### 0x01 AJAX与数据库

```
可以通过xmlhttp.open("GET","./ajax.php?q="+str,true);的形式获取服务器数据，
那么也就可以通过这种方式获取服务端数据库中的内容
```
ajax.html代码如下：
```
<html>
<head>
    <meta charset="utf-8">
    <script>
    function showUser(str) {
        if (str=="") {
            document.getElementById("txtHint").innerHTML="";
            return;
        } 
        if (window.XMLHttpRequest) {
            // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
            xmlhttp=new XMLHttpRequest();
        } else {
            // IE6, IE5 浏览器执行代码
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200){
                document.getElementById("txtHint").innerHTML=xmlhttp.responseText;
            }
        }
        xmlhttp.open("GET","getuser.php?id="+str,true);
        xmlhttp.send();
    }
    </script>
</head>
<body>
    <form>
        <select name="users" onchange="showUser(this.value)">
            <option value="">Select a person:</option>
            <option value="7">用户1</option>
            <option value="8">用户2</option>
            <option value="9">用户3</option>
        </select>
    </form>
    <br>
    <div id="txtHint"><b>Person info will be listed here.</b></div>
</body>
</html>
```
getuser.php代码如下：
```
<?php
    header("Content-Type:text/html; charset=gbk");

    $id=$_GET["id"];

    $con = mysql_connect('localhost','root','123456');
    mysql_select_db("thinkphp",$con);
    $sql="SELECT * FROM msg WHERE id = '".$id."'";
    $result = mysql_query($sql);

    echo "<table border='1'>
    <tr>
    <th>Id</th>
    <th>Name</th>
    <th>Sex</th>
    </tr>";

    while($row = mysql_fetch_array($result)) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['name'] . "</td>";
        echo "<td>" . $row['sex'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";

    mysql_close($con);
?>
```

结果如下：
![ajax与mysql1](/img/post/ajax_and_mysql1.png)
![ajax与mysql2](/img/post/ajax_and_mysql2.png)
![ajax与mysql3](/img/post/ajax_and_mysql3.png)

### 0x02 AJAX使用实例
```
<!DOCTYPE html>
<html>
<head>
    <script>
        var xmlhttp;
        function loadXMLDoc(url,cfunc) {
            if (window.XMLHttpRequest) {
                // IE7+, Firefox, Chrome, Opera, Safari 代码
                xmlhttp=new XMLHttpRequest();
            } else {
                // IE6, IE5 代码
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange=cfunc;
            xmlhttp.open("GET",url,true);
            xmlhttp.send();
        }
        function myFunction() {
            loadXMLDoc(
                "/try/ajax/ajax_info.txt",
                function() {
                    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                        document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
                    }
                }
            );
        }
    </script>
</head>
<body>
    <div id="myDiv"><h2>使用 AJAX 修改文本内容</h2></div>
    <button type="button" onclick="myFunction()">修改内容</button>
</body>
</html>
```