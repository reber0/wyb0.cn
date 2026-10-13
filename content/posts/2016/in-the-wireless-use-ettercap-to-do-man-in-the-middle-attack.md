---
draft: false
date: 2016-07-13 09:22:39
title: 无线下 ettercap 做中间人攻击
description: 
categories:
  - Pentest
tags:
  - 中间人
---

前提：攻击主机和被攻击主机在一个无线下面

### 0x00 打开ettercap
![无线网络渗透测试打开ettercap](/img/post/wireless_start_ettercap.png)

### 0x01 查看host列表
在软件的图形化界面点击sniff，选择unified sniffing选择网卡，然后单击hosts选项，选择scan for host，然后选择host list
![无线网络渗透测试ettercap查看host列表](/img/post/wireless_ettercap_see_host_list.png)

### 0x02 选定攻击目标
选择192.168.1.116的IP地址，点击Add to Target 1,然后选择网关的IP地址192.168.1.1，点击Add to Target 2
![无线网络渗透测试ettercap添加攻击目标](/img/post/wireless_ettercap_add_target.png)

### 0x03 开始攻击
ettercap选择```"mitm"—"arp poisoning"—"Sniff remote connections"— "确定"```，然后再在被攻击端查看arp，可知攻击已经成功
![无线网络渗透测试ettercap开始攻击](/img/post/wireless_ettercap_attack.png)

### 0x04 ettercap持续监听目标
软件上开始监听，被攻击端用浏览器登录路由器
![无线网络渗透测试ettercap监听到目标用户的账号和密码](/img/post/wireless_ettercap_get_msg.png)

### 0x05 得到Cookie
点击主界面的"View" —  "connetcions" 可以查看被攻击主机的一些网络链接
![无线网络渗透测试ettercap查看目标用户的网络连接信息](/img/post/wireless_ettercap_view_conn_msg.png)
![无线网络渗透测试ettercap目标用户的Cookie](/img/post/wireless_ettercap_get_cookie.png)

### 0x06 用cookie登陆被入侵账户
打开火狐浏览器，通过firebug插件添加截获到的cookie从而登陆账户
![无线网络渗透测试用firebug添加目标用户的Cookie](/img/post/wireless_firebug_add_cookie.png)
![无线网络渗透测试用目标用户的Cookie成功登陆新浪博客](/img/post/wireless_firebug_sign_success.png)
