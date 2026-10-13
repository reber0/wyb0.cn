---
draft: false
date: 2018-01-08 22:02:07
title: 打包下载 php 文件
description: 
categories:
  - PHP
tags:
  - php
---

### 0x00 代码如下
```
<?php

function addFileToZip($zip,$zipname,$path){
    $handler = opendir($path);
    while(($filename = readdir($handler))!==false) {
        if($filename != "." && $filename != ".." && $filename!= $zipname){
            if (is_dir($path."/".$filename)) {  //如果读取的某个对象是文件夹，则递归
                addFileToZip($zip,$zipname,$path."/".$filename);
            } else {
                $zip->addFile($path."/".$filename);
            }
        }
    }
    @closedir($path);
}

function tar($zipname,$path) {
    $zip = new ZipArchive(); //使用本类，linux需开启zlib，windows需取消php_zip.dll前的注释

    if ($zip->open($zipname, ZipArchive::OVERWRITE) === TRUE) {
        addFileToZip($zip,$zipname,$path);$zip->close();
    } else {
        exit('Unable to open file, or file creation failed!');
    }
}

function download($zipname) {
    if(!file_exists($zipname)){
      exit("Zip file does not exist!");
    }  
    header("Cache-Control: public");
    header("Content-Description: File Transfer");
    header('Content-disposition: attachment; filename='.basename($zipname)); //文件名
    header("Content-Type: application/zip"); //zip格式的  
    header("Content-Transfer-Encoding: binary"); //告诉浏览器，这是二进制文件
    header('Content-Length: '. filesize($zipname)); //告诉浏览器，文件大小
    @readfile($zipname);

    unlink($zipname);
}

$zipname = 'bak.zip';
$path = '.';
tar($zipname,$path);
download($zipname);

?>
```


#### Reference(侵删)：
* [http://blog.csdn.net/libinemail/article/details/52190235](http://blog.csdn.net/libinemail/article/details/52190235)