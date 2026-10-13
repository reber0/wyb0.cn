---
draft: false
date: 2016-07-20 17:04:44
title: 文件上传漏洞常见绕过手法
description: 
categories:
  - Pentest
tags:
  - 文件上传
  - bypass
---

### 0x00 一般防止上传漏洞手法
```
1、客户端检测：客户端使用JavaScript检测，在文件未上传时，就对文件进行验证
    //任何客户端的验证都是不安全的，客户端验证目的是防止用户输入错误、减少
    //服务器开销，而服务端验证才可以真正防御攻击者。  
2、服务器端检测：服务端脚本一般会检测文件的MIME类型，检测文件扩展名是否合法
```

### 0x01 客户端检测
客户端验证代码形如下：
```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>图片上传</title>
    <script type="text/javascript">
    function checkFile(){
        var flag = false;
        var str = document.getElementById("file").value;
        str = str.substring(str.lastIndexOf('.') + 1);
        var arr = new Array('png','bmp','gif','jpg');
        for (var i=0;i<arr.length;i++){
            if(str==arr[i]){
                flag = true;
            }
        }
        if(!flag){
            alert('文件不合法！');
        }
        return flag;
    }
    </script>
</head>
<body>
    <form action="upload.php" method="post" onsubmit="checkFile()" enctype="multipart/form-data">
        <input type="file" name="file" id="file" /><br/>
        <input type="submit" value="提交" name="submit" />
    </form>
</body>
</html>
```

接收文件的脚本upload.php代码如下：
```php
<?php
if(isset($_POST["submit"])){
    $name = $_FILES['file']['name'];
    $name = md5(date('Y-m-d h:m:s')).strrchr($name,".");
    $size = $_FILES['file']['size'];
    $tmp = $_FILES['file']['tem_name'];
    move_uploaded_file($tmp,$name);
    echo "文件上传成功！path：".$name;
}
?>
```

绕过：
```
1、可以用firebug将form表单中的onsubmit事件删除，这样就可以绕过验证。
2、使用Burp Suite：
    1）先将木马文件的扩展名改为一张正常图片的扩展名，如jpg
    2）上传时使用Burp Suite拦截数据包，将木马文件扩展名改为php就可绕过客户端验证。
    注意：这里修改文件名字后，请求头中的Content-Length的值也要改
```

### 0x02 服务端检测
服务端分为6项：
```
* 黑名单与白名单验证
* MIME验证
* 目录验证
* 截断上传攻击
* 文件攻击
* 检测文件内容
```

#### 1. 黑名单与白名单验证

* 黑名单过滤方式

```php
<?php
$Blacklist = array('asp','php','jsp','php5','asa','aspx');    //黑名单
if (isset($_POST["submit"])){
    $name = $FILES['file']['name'];    //接收文件名
    $extension = substr(strrchr($name, ".") , 1);    //得到扩展名
    $boo = false;
    foreach ($Blaklist as $key => $value){
        if ($value==$extension) {    //迭代判断是否命中
            $boo = true;
            break;     //命中后直接退出循环
        }
    }
    if (!$boo) {    //若没有被命中，则进行上传操作
        $size = $_FILES['file']['size'];  //接收文件大小
        $tmp = $FILES['file']['temp_name'];   //临时路径
        move_uploaded_file($tmp, $name);   //移动临时文件到当前文件目录
    } else {
        echo "文件不合法!!";
    }
}
?>
```

* 白名单过滤方式

```php
<?php
$WhiteList = array('rar','jpg','png','bmp','gif','jpg','doc');
if(isset($_POST["submit"])){
    $name = $_FILES['file']['name'];
    $extension = substr(strrchr($name,"."),1);
    $boo = false;
    foreach($WhiteList as $key => $value){
        if($value==$extension){
            $boo = true;
        }
    }
    if($boo){
        $size = $_FILES['file']['size'];
        $tmp = $_FILES['file']['tmp_name'];
        move_uploaded_file($tmp,$name);
        echo "文件上传成功！<br/>path:".$name;
    }else{
        echo "文件不合法！";
    }
}
?>
```
绕过方法：
```
* 0x00截断绕过
* 从黑名单中找到web开发者忽略的扩展名，如：cer
* 没有对扩展名进行大小写转换，在window平台依然可以大小写绕过
* 在window下，若文件名以"."或者空格作为结尾，系统会自动去除"."与空格，所以可以上传不符合Windows命名规则的文件来绕过，
  如：test.asp.、test.asp(空格)、test.asp_、test.php::$DATA
* 配合解析漏洞，如iis6上传test.asp;1.jpg
```

#### 2. MIME验证
对文件MIME类型做验证的PHP代码如下：
```php
<?php
if($_FILES['file']['type']==" image/jpeg"){
    $imageTempName = $_FILES['file']['tmp_name'];
    $imageName = $_FILES['file']['name'];
    $last = substr($imageName,strrpos($imageName,"."));
    if(!is_dir("uploadFile")){
        mkdir("uploadFile");
    }
    $imageName = md5($imageName).$last;
    move_upload_file($imageTempName,"./uploadFile/".$imageName);
    echo("文件上传成功！ path = /uploadFile/$imageName");
}else{
    echo("文件上传类型错误，请重新上传...");
    exit();
}
?>
```
未修改MIME类型，上传失败：
![上传漏洞没有修改MIME](/img/post/upload_vuln_not_alter_mime.png)
修改MIME类型，上传成功：
![上传漏洞修改MIME](/img/post/upload_vuln_alter_mime.png)

#### 3. 目录验证
文件上传时通常允许用户将文件放到指定的目录中，若目录存在则将文件写入目录，否则新建目录然后写入，若为iis6.0则可以利用这个漏洞，客户端上传代码如下：
```html
<html>
<head>
    <meta charset="UTF-8">
    <title>up</title>
</head>
<body>
    <form action="upload.php" method="post" enctype="multipart/form-data">
        <input type="file" name="file" /><br/>
        <input type="hidden" name="Extension" value="up" />
        <input type="submit" value="提交" name="submit" />
    </form>
</body>
</html>
```
服务端PHP接收文件的代码如下：
```php
<?php
if($_FILES['file']['type']=="image/jpeg"){
    $imageTempName=$_FILES['file']['tmp_name'];
    $imageName=$_FILES['file']['name'];
    $last=substr($imageName,strrpos($imageName,"."));
    if($last!=".jpg"){
        echo("mime error!<br/>");
    }
    $Extension=$_POST['Extension'];
    if(!is_dir($Extension)){
        mkdir("./$Extension");
        echo "mkidr $Extension succesfully"."<br/>";
    }
    $imageName=md5($imageName).$last;
    move_uploaded_file($imageTempName,"./$Extension/".$imageName);
    echo("upload ok! path = /$Extension/$imageName");
} else {
    echo("type error...");
    exit();
}
?>
```
查看上传到了那个文件：
![上传漏洞查看上传到那个文件夹](/img/post/upload_vuln_check_upload_dirname.png)
将文件改名：
![上传漏洞尝试更改上传文件夹名字](/img/post/upload_vuln_alter_upload_dirname.png)
![上传漏洞查看asp文件夹是否生成](/img/post/upload_vuln_check_asp_dirname.png)

#### 4. 截断上传攻击
截断上传攻击在ASP程序中比较常见(在PHP、JSP中也有)
先上传正常后缀的图片马：
![上传漏洞上传正常后缀的图片马](/img/post/upload_vuln_upload_normal_picture.png)
更改图片名字：
![上传漏洞修改图片名字](/img/post/upload_vuln_alter_picture_name.png)
截断：
![上传漏洞截断文件名](/img/post/upload_vuln_truncate_picture_name.png)
上传成功：
![上传漏洞成功将jpg图片马上传为asp脚本](/img/post/upload_vuln_upload_success.png)

#### 5. 文件攻击
- .htaccess文件攻击  
Apache设置为AllowOverride All时，通过.htaccess文件调用php解析器去解析一个文件名中只要包含"haha"这个字符串的任意文件，无论扩展名是什么(没有也行)，都以php的方式来解析，.haccess文件代码如下：
```
<FilesMatch "haha">
SetHandler application/x-httpd-php
</FilesMatch>
```
或者如下，上传一个文件名为evil.gif的图片马：
```
<FilesMatch "evil.gif">
SetHandler application/x-httpd-php
</FilesMatch>
```
或者如下，上传一个后缀为png的图片马：
```
<Files *.png>
SetHandler application/x-httpd-php
</Files>
```

- .user.ini文件攻击  
```
只要中间键是以fastcgi运行的php都可以用这个方法，.user.ini能被动态加载，它也有两个配置
项：auto_append_file和auto_prepend_file，只要在.user.ini中添加auto_prepend_file=aa.jpg
这句话，就可以让其他php文件执行前自动包含aa.jpg，和require()类似。
```
![上传漏洞-文件攻击1](/img/post/upload_vuln_file_attack1.png)
![上传漏洞-文件攻击2](/img/post/upload_vuln_file_attack2.png)

#### 6. 检测文件内容
- 文件幻数检测  
在文件首部加上如下幻数，后面跟一句话木马即可
```
JFIF    FF D8 FF E0 00 10 4A 46 49 46
GIF89a  47 49 46 38 39 61
PNG     89 50 4E 47
```

- 文件相关信息检测  
通常用的getimagesize()函数，只需要在幻数基础上加一些文件信息就行了，如下：
```
GIF89a
(...some binary data for image...)
<?php phpinfo(); ?>
(... skipping the rest of binary data ...)
```

- 文件加载检测  
服务端会调用API或函数对文件进行加载测试，常见的是图像渲染测试，变态的甚至是二次渲染：
```
对渲染/加载测试的攻击方式是代码注入绕过
对二次渲染的攻击方式是攻击文件加载器本身
```
