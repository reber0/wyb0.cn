---
draft: false
date: 2016-06-13 09:14:45
title: Ubuntu 下使用 ShadowSocks
description: 
categories:
  - Linux
tags:
  - software
---

环境：Ubuntu14.04

### 0x00 安装shadowsocks-qt5
```sh
sudo apt-get update
sudo apt-get python-software-properties software-properties-common

sudo add-apt-repository ppa:hzwhuang/ss-qt5（添加源）
sudo apt-get update （更新你的软件库）
sudo apt-get install shadowsocks-qt5 (正式安装)
```

### 0x01 配置客户端
![打开shadowsocks客户端](/img/post/ss_open_client.png)

![shadowsocks添加配置](/img/post/ss_add_config.png)

![配置shadowsocks](/img/post/ss_config.png)

![连接shadowsocks](/img/post/ss_connection.png)

### 0x02 配置火狐
![火狐配置代理](/img/post/firfox_config_agent.png)

### 0x03 访问YouTube
![访问YouTube](/img/post/ss_go_youtube.png)
