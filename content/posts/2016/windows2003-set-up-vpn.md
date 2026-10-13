---
draft: false
date: 2016-07-07 10:39:50
title: Windows2003 下搭建 VPN
description: 
categories:
  - Server
tags:
  - server
---

### 0x00 环境及要求
Windows2003下搭建基于PPTP(点对点隧道协议)的VPN服务器

### 0x01 安装服务
![70](/img/post/build_vpn_install_service1.png)
![60](/img/post/build_vpn_install_service2.png)
![80](/img/post/build_vpn_close_firewall.png)

### 0x02 配置并启用路由和远程访问
![35](/img/post/build_vpn_config_and_start_routing_remote_access1.png)
![55](/img/post/build_vpn_config_and_start_routing_remote_access2.png)
![55](/img/post/build_vpn_config_and_start_routing_remote_access3.png)
![65](/img/post/build_vpn_config_and_start_routing_remote_access4.png)
![65](/img/post/build_vpn_config_and_start_routing_remote_access5.png)

### 0x03 新增路由协议
![70](/img/post/build_vpn_add_routing_protocol1.png)
![40](/img/post/build_vpn_add_routing_protocol2.png)

### 0x04 新增接口
![50](/img/post/build_vpn_add_interface1.png)
![40](/img/post/build_vpn_add_interface2.png)
![45](/img/post/build_vpn_add_interface3.png)

### 0x05 新增VPN用户
![70](/img/post/build_vpn_add_vpn_users1.png)
![50](/img/post/build_vpn_add_vpn_users2.png)
![40](/img/post/build_vpn_add_vpn_users3.png)
![70](/img/post/build_vpn_add_vpn_users4.png)

### 0x06 尝试连接VPN
![40](/img/post/build_vpn_try_connect_vpn1.png)
![45](/img/post/build_vpn_try_connect_vpn2.png)
![50](/img/post/build_vpn_try_connect_vpn3.png)
