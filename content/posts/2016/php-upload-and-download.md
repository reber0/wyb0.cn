---
draft: false
date: 2016-05-24 08:31:09
title: PHP 之上传与下载
description: 
categories:
  - PHP
tags:
  - php
---

### 0x00 上传
* 客户端设置  
客户端使用form表单上传文件，在form表单中必须指明enctype和method属性的值
```html
<html>
<head>
    <title>post</title>
</head>
<body>
    <form action="xx.php" mothod="post" enctype="multipart/form-data">
        <input type="file" value="myfile" /><br />
        <input type="submit" value="提交" />
    </form>
</body>
</html>
```

* 服务端设置
    * php.ini:
    ```
    file_uploads = On   //默认允许HTTP文件上传，此选项不能设置为OFF
    upload_tmp_dir=    //文件上传时存放文件的临时目录
    upload_max_filesize = 20M   //设定单个文件上传的大小，必须小于post_max_size
    post_max_size = 19M   //允许POST表单的数据最大大小
    ```

    * $_FILES:
    ```
        $_FILES['upload_file']['name']  //带扩展名的原始文件名
        $_FILES['upload_file']['size']  //文件大小
        $_FILES['upload_file']['tmp_name']  //临时文件名
        $_FILES['upload_file']['error']  //上传文件时的错误信息
        $_FILES['upload_file']['type']  //上传文件的类型

        //type是上传文件时原始信息里的content_type,即MIME,有image/gig、text/html等
        //error一般有5中类型：
        //0 上传成功
        //1 文件大小超过了upload_max_filesize
        //2 文件大小超过了表单总MAX_FILE_SIZE设定的值
        //3 只有部分被上传
        //4 没有上传任何文件
    ```
    * 服务端上传步骤
    ```
        1、判断uploads这个文件夹存在
        2、判断error的值
        3、判断文件后缀是否合法
        4、判断MIME的类型和子类型是否合法
        5、判断文件大小
        6、对文件进行重命名
        7、移动
    ```

    * 服务端接收脚本
    ```php
    <?php
        //执行文件（图片）上传
        echo "<pre>";
        var_dump($_FILES);
        echo "</pre>";

        //1.获取上传文件信息
         $upfile = $_FILES["pic"]; //html的form表单的input中name属性值要为pic
         $typelist = array("image/jpeg","image/jpg","image/png","image/gif"); //定义允许的类型
         $path="./uploads/";  //定义一个上传过后的目录

        //2. 过滤上传文件的错误号
        if($upfile["error"]>0){
            //获取错误信息
            switch($upfile['error']){
                case 1:
                    $info="上传的文件超过了 php.ini 中 upload_max_filesize 选项限制的值。"; 
                    break;
                case 2:
                    $info="上传文件的大小超过了 HTML 表单中 MAX_FILE_SIZE 选项指定的值。"; 
                    break;
                case 3:
                    $info="文件只有部分被上传。"; 
                    break;
                case 4:
                    $info="没有文件被上传。 ";
                case 6:
                    $info="找不到临时文件夹。"; 
                    break;
                case 7:
                    $info="文件写入失败"; 
                    break;
            }

            die("上传文件错误，原因：".$info);
        }
      
        //3. 本次上传文件到小的过滤（自己选择）
        if($upfile["size"]>100000){
            die("上传文件大小超出限制！");
        }
        
        //4. 类型过滤
        if(!in_array($upfile["type"],$typelist)){
            die("上传文件类型非法！".$upfile["type"]);
        }

        //5. 上传后的文件名定义(随机获取一个文件名（保持后缀名不变）)
        $fileinfo = pathinfo($upfile["name"]);//解析上传文件名字
        do{
            $newfile= date("YmdHis").rand(1000,9999).".".$fileinfo["extension"];
        }while(file_exists($path.$newfile));
        //6. 执行文件上传
        //判断是否是一个上传的文件
        if(is_uploaded_file($upfile["tmp_name"])){
            //执行文件上传（移动上传文件）
            if(move_uploaded_file($upfile["tmp_name"],$path.$newfile)){
                echo "文件上传成功！";
                echo "<h3><a href='index.php'>浏览</a></h3>";
            }else{
                die("上传文件失败");
            }
        }else{
            die("不是一个上传文件！");
        }
    ?>
    ```

### 0x01 下载
* 对于php无法解析的类型
```
<a href="http://www.aa.com/xx.rar">下载</a >
```

* 对于php能解析的文件(同时为了安全性)
```php
<?php
    header("Content-type:text/html;charset=utf-8");
    $file_name = "文件.exe";
    $file_name=iconv("utf-8","gb2312",$file_name); //解决中文不能显示的问题 
    $file_dir = "/public/www/download/";
    $file_path = $file_dir.$file_name;
    if (!file_exists($file_path)) { //检查文件是否存在
        echo "文件找不到";
        exit;
    } else {
        $file = fopen($file_path,"r"); // 打开文件
        Header("Accept-Ranges: bytes");//代表支持断点续传
        // 输入文件标签,下面3个Header是必须的
        Header("Content-type: application/octet-stream");
        Header("Accept-Length: ".filesize($file_path));
        Header("Content-Disposition: attachment; filename=" . $file_name);
        // 输出文件内容
        echo fread($file,filesize($file_path));
        fclose($file);
        exit;
    }
?> 
```