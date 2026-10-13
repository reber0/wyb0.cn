---
draft: false
date: 2016-08-23 10:05:52
title: Metasploit 利用 workspace 进行批量扫描爆破
description: 
categories:
  - Pentest
tags:
  - intranet
  - tools
---


### 0x00 启动
![启动msf](/img/post/msf_start.png)

### 0x01 Metasploit的工作平台
在msf里的工作平台可以保存历史的一些操作信息
![msf工作平台的帮助信息](/img/post/msf_workspace_h.png)
![创建新的工作平台](/img/post/msf_workspace.png)

### 0x02 使用db_nmap扫描主机
![扫描lanou3g的ip信息](/img/post/msf_nmap_lanou3g_ip.png)
扫描后的结果会保留在工作平台中，可以用hosts和services进行查看：
![查看主机列表](/img/post/msf_hosts.png)
![查看服务](/img/post/msf_services.png)

### 0x03 使用msf的模块进行弱口令爆破
注：这里针对ftp服务进行弱口令测试
![查看都有那个主机开启了21端口](/img/post/msf_services_p_21.png)
![查找用于ftp爆破的模块](/img/post/msf_search_module.png)
![使用模块并设置参数](/img/post/msf_use_module_and_set.png)
![查看设置的参数](/img/post/msf_use_show_options.png)
![开始攻击](/img/post/msf_start_attack_ftp.png)

使用vulns可以查看结果：msf auxiliary(ftp_login) > vulns 
