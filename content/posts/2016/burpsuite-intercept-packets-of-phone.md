---
draft: false
date: 2016-08-13 23:53:39

title: BurpSuite 抓手机包
description: 
categories:
  - Pentest
tags:
  - tools
---

### 0x00 环境设置
Windows Phone手机和电脑处于同一无线环境下：
![PC机的ip](/img/post/burpsuite_pc_ip.png)
![IP设置](/img/post/burpsuite_ip_set.png)

### 0x01 BurpSuite设置
![设置burpsuite抓8888端口的包1](/img/post/burpsuite_set_phone_proxy1.png)
![设置burpsuite抓8888端口的包2](/img/post/burpsuite_set_phone_proxy2.png)

### 0x02 抓HTTP包
![手机访问网络](/img/post/burpsuite_phone_visit_internet.png)
![burpsuite抓手机包](/img/post/burpsuite_get_phone_packet.png)

### 0x03 抓HTTPS包
* 挂burpsuite的代理下载证书
![下载证书1](/img/post/burpsuite_down_ca1.png)
![下载证书2](/img/post/burpsuite_down_ca2.png)

* 把证书上传到你自己的服务器上(也可以本地搭建网站)，然后手机访问证书  
安卓手机修改证书后缀为crt，证书可以放在网站上，也可以直接拖到手机上，然后安装
![手机安装证书](/img/post/burpsuite_phone_install_ca.png)

* 抓https数据包
![手机访问https链接](/img/post/burpsuite_get_https_packet1.png)
![burpsuite抓https包](/img/post/burpsuite_get_https_packet2.png)
