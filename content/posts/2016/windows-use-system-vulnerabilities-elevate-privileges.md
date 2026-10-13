---
draft: false
date: 2016-08-07 21:31:35
title: Windows 下系统漏洞提权
description: 
categories:
  - Pentest
tags:
  - intranet
---

提权是在已经getshell但是权限不大的前提下做的

### 0x00 查看基本信息
![Windows系统漏洞提权-查看基本信息1](/img/post/privilge_escalation_win_view_msg1.png)

![Windows系统漏洞提权-查看基本信息2](/img/post/privilge_escalation_win_view_msg2.png)

### 0x01 使用cmd执行命令
* 尝试使用cmd执行命令
![Windows系统漏洞提权-尝试使用cmd执行命令](/img/post/privilge_escalation_win_try_use_cmd.png)

* 找可写目录
![Windows系统漏洞提权-找可写目录](/img/post/privilge_escalation_win_find_wirteable_dir.png)

* 尝试上传cmd.exe
![Windows系统漏洞提权-尝试上传cmd](/img/post/privilge_escalation_win_try_upload_cmd.png)

* 写一个aspx马
![Windows系统漏洞提权-写一个aspx马](/img/post/privilge_escalation_win_write_aspx.png)
![Windows系统漏洞提权-查看aspx马](/img/post/privilge_escalation_win_view_aspx.png)

* 上传cmd.exe
![Windows系统漏洞提权-上传cmd](/img/post/privilge_escalation_win_upload_cmd.png)
![Windows系统漏洞提权-查看上传的cmd](/img/post/privilge_escalation_win_view_cmd.png)

* 再次尝试使用cmd执行命令
![Windows系统漏洞提权-再次尝试使用cmd执行命令1](/img/post/privilge_escalation_win_try_use_cmd_again1.png)
![Windows系统漏洞提权-再次尝试使用cmd执行命令2](/img/post/privilge_escalation_win_try_use_cmd_again2.png)

### 0x02 权限提升
* 查看未安装补丁
```  
systeminfo>a.txt&(for %i in (KB952004 KB956572 KB2393802 KB2503665 KB2592799 KB2621440 KB2160329 KB970483 KB2124261 KB977165 KB958644) do @type a.txt|@find /i "%i"||@echo %i Not Installed!)&del /f /q /a a.txt
```
![Windows系统漏洞提权-查看系统未安装补丁](/img/post/privilge_escalation_win_view_patch.png)

* 上传exp提权
![Windows系统漏洞提权-上传iis6](/img/post/privilge_escalation_win_upload_iis6.png)
![Windows系统漏洞提权-第一次运行iis6](/img/post/privilge_escalation_win_run_iis6_1.png)
![Windows系统漏洞提权-再次运行iis6](/img/post/privilge_escalation_win_run_iis6_2.png)

### 0x03 添加用户
* 添加远程连接用户

![Windows系统漏洞提权-使用系统自带的帮助用户](/img/post/privilge_escalation_win_use_sys_help_user.png)
![Windows系统漏洞提权-为系统自带的帮助用户添加密码](/img/post/privilge_escalation_win_sys_help_user_add_pwd.png)
![Windows系统漏洞提权-将系统自带的帮助用户添加到管理员组](/img/post/privilge_escalation_win_sys_help_user_add_administrators.png)
![Windows系统漏洞提权-启用系统自带的帮助用户](/img/post/privilge_escalation_win_active_sys_help_user.png)
![Windows系统漏洞提权-查看系统自带的帮助用户现在的权限信息](/img/post/privilge_escalation_win_view_sys_help_user.png)

### 0x04 使用3389远程连接
![Windows系统漏洞提权-查看ip信息](/img/post/privilge_escalation_win_view_ip.png)

![Windows系统漏洞提权-远程连接](/img/post/privilge_escalation_win_remote_connection.png)

![Windows系统漏洞提权-远程连接输入用户名密码](/img/post/privilge_escalation_win_remote_connection_input_pwd.png)

![Windows系统漏洞提权-远程连接成功](/img/post/privilge_escalation_win_remote_connection_success.png)
