---
draft: false
date: 2016-05-22 16:29:47
title: PHP 之目录与文件
description: 
categories:
  - PHP
tags:
  - php
---

### 0x00 目录的操作
```php
<?php
  $path = "/var/www/html/php/dir.php";
  echo dirname($path)."<br />";  //返回上级路径
  echo basename($path)."<br />";  //返回文件名部分
  print_r(pathinfo($path));  //返回包含path信息的数组

  echo "<br /><br />";

  //readdir()从目录句柄读取条目，返回目录中的文件名，指针依次向后移动
  $path = "D:/phpStudy/WWW/php";
  $dh = opendir($path);
  while (false !== ($filename=readdir($dh))) {
    echo $filename."<br />";
  }
  rewinddir($dh);  //指针复位
  echo readdir($dh);
  closedir($dh);

  mkdir("./aaa");//创建文件夹aaa
  rmdir("./aaa");//删除文件夹aaa

  file_put_contents("aa.php", "");//创建文件aa.php
  unlink("./aa.php");//删除文件aa.php
?>
```
<center>
![箭头](/img/post/arrow.png)<br />
![目录的操作](/img/post/dir.png)
</center>

### 0x01 文件的读写
1. fopen(filename,mode)和fclose(filename,mode)
![fopen()打开文件的模式](/img/post/file_open_mode.png)
#### 例子：
```php
<?php
	$file = fopen("test.txt","r");
	$file = fopen("/home/test/test.txt","r");
	$file = fopen("/home/test/test.gif","wb");
	$file = fopen("http://www.example.com/","r");
	$file = fopen("ftp://user:password@example.com/test.txt","w");
?>
```
2. 读取内容  
```php
fread(h_file,length)  //读取打开文件的length个字节，返回读取的字符串  
fgets(h_file,length)  //读取一行返回length个字节，不加length时默认1024个字节，失败返回false  
fgetc(h_file)   //逐字读取
```

3. file_get_content()和file_put_content()  
```php
file_get_content($filename)可以得到文件中的所有内容  
file_put_content($filename, $str)可以将字符串覆盖写入文件中  
file_put_content($filename, $str, FILE_APPEND)可以将字符串追加到文件中
```

4. filetype()  
```php
filetype($filename)可以得到文件的类型
```

### 0x02 查看文件夹下的文件信息
```php
<?php
	$path = "./";
	$filelist=array("filesystem.php");//要过滤掉的文件

	//浏览指定目录下的文件，并使用表格输出
	//path目录信息的过滤，判断path存在，并且是否是个目录
	if(!file_exists($path) || !is_dir($path)){
		die($path."目录无效！");
	}
	//2. 输出表头信息
	echo "<h3>{$path}目录下的文件信息<h3>";
	echo "<table width='600' border='0'>";
	echo "<tr bgcolor='#cccccc' align='left'>";
	echo "<th>序号</th><th>名称</th><th>类型</th><th>大小</th><th>创建时间</th>";
	echo "</tr>";

	//打开这个目录，并遍历目录下面的所有文件
	$dir = opendir($path);
	if($dir){
		$i=0;
		//遍历目录中的文件,并输出文件的信息
		while($f = readdir($dir)){
			if($f=="." || $f==".." || in_array($f,$filelist)){
				continue;//跳出本次循环，继续下一次遍历。
			}
			$file = trim($path,"/")."/".$f;
			$i++;
			echo "<tr>";
			echo "<td>{$i}</td>";
			echo "<td>{$f}</td>";
			echo "<td>".filetype($file)."</td>";
			echo "<td>".filesize($file)."</td>";
			echo "<td>".date("Y-m-d H:i:s",filectime($file))."</td>";
			echo "</tr>";
		}
		closedir($dir); //关闭目录
	}
	echo "<tr bgcolor='#cccccc' align='left'><td colspan='6'>&nbsp;</td></tr>";
	echo "</table>";
?>
```
<center>
![箭头](/img/post/arrow.png)<br />
![查看文件夹下的文件信息](/img/post/file_info.png)
</center>