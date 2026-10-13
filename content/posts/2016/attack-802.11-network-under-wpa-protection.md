---
draft: false
date: 2016-07-13 08:18:59

title: 攻击 WPA 保护下的 802.11 网络
description: 
categories:
  - Pentest
tags:
  - 中间人
---

### 0x00 网络拓扑及信息
![无线网络渗透测试拓扑图](/img/post/wireless_topology.png)
其中 ip 等信息如下：
![无线网络渗透测试IP等基本信息](/img/post/wireless_base_msg.png)

### 0x01 获取信息
1. 查看无线网卡并将其设置为监听模式
![无线网络渗透测试查看网卡信息](/img/post/wireless_ifconfig.png)
![无线网络渗透测试设置网卡为监听模式](/img/post/wireless_mode_to_monitor.png)

2. 打开 kismet，进行基本设置
![无线网络渗透测试开启kismet](/img/post/wireless_start_kismet.png)
![无线网络渗透测试add source](/img/post/wireless_kismet_add_source.png)
![无线网络渗透测试kismet主界面](/img/post/wireless_kismet.png)

3. 选择名字为 111111 的 AP 为目标
![无线网络渗透测试kismet选择目标](/img/post/wireless_select_target.png)
![无线网络渗透测试AP的信息](/img/post/wireless_target_msg.png)
![无线网络渗透测试退出kismet](/img/post/wireless_quit_kismet.png)

4. 查看 kismet 抓包信息

    kismet 生成的 nettxt 文件的部分信息如下：

    ```
    Network 104: BSSID D8:42:AC:C9:5C:1D
    Manuf      : Shanghai
    First      : Mon Nov 16 12:46:21 2015
    Last       : Mon Nov 16 13:10:23 2015
    Type       : infrastructure
    BSSID      : D8:42:AC:C9:5C:1D
    SSID 1
        Type       : Probe Response
        SSID       : "111111" 
        First      : Mon Nov 16 12:46:30 2015
        Last       : Mon Nov 16 13:10:22 2015
        Max Rate   : 54.0
        Packets    : 249
        Encryption : WPA+PSK
    Encryption : WPA+AES-CCM
    Channel    : 5
    Frequency  : 0 - 979 packets, 83.75%
    Frequency  : 2432 - 9 packets, 0.77%
    Frequency  : 2437 - 61 packets, 5.22%
    Frequency  : 2442 - 77 packets, 6.59%
    Frequency  : 2447 - 42 packets, 3.59%
    Frequency  : 2452 - 1 packets, 0.09%
    Max Seen   : 1000
    LLC        : 249
    Data       : 920
    Crypt      : 341
    Fragments  : 0
    Retries    : 0
    Total      : 1169
    Datasize   : 146798
    Last BSSTS : 0
        Seen By : aaa (wlan0mon) fae5a030-8c1c-11e5-a78b-0403b30d2c03 1169 packets
                Mon Nov 16 13:10:23 2015
    Client 3: MAC DC:C7:93:C5:05:58
    Manuf      : WP
    First      : Mon Nov 16 12:47:01 2015
    Last       : Mon Nov 16 13:09:55 2015
    Type       : To Distribution
    MAC        : 68:DF:DD:42:6A:F2
    Channel    : 0
    Frequency  : 0 - 149 packets, 99.33%
    Frequency  : 2447 - 1 packets, 0.67%
    Max Seen   : 1000
    LLC        : 0
    Data       : 150
    Crypt      : 22
    Fragments  : 0
    Retries    : 0
    Total      : 150
    Datasize   : 10740
        Seen By : aaa (wlan0) fae5a030-8c1c-11e5-a78b-0403b30d2c03 150 packets
                Mon Nov 16 13:09:55 2015
    ```

    筛选出的有用信息如下：

    ```
    BSSID      : D8:42:AC:C9:5C:1D
    SSID       : "111111" 
    Encryption : WPA+PSK
    Encryption : WPA+AES-CCM
    Channel    : 5
    Client 3: MAC DC:C7:93:C5:05:58
    ```

### 0x02 开始攻击
1. 通过 airodump-ng -c 5 -w 20151117 wlan0 开始抓包保存
![无线网络渗透测试抓包](/img/post/wireless_get_package.png)

2. 得到 handshake 包，用另一个终端进行 deauth 攻击
![无线网络渗透测试开始deauth攻击](/img/post/wireless_start_deauth_attack.png)
![无线网络渗透测试得到handshake包](/img/post/wireless_get_handshake_package.png)

3. 得到 AP 密码
![无线网络渗透测试得到无线的密码](/img/post/wireless_get_ap_password.png)
