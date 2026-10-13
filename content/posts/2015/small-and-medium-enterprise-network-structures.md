---
draft: false
isCJKLanguage: true
title: 中小企业网络搭建
date: 2015-07-13
lastmod: 2015-07-13
description: 使用交换机、路由器等设备,在局域网搭建中小企业网络
categories:
  - Other
tags:
  - 网络设备
---

### 0x00 中小企业需求分析
1. 搭建企业私有局域网络环境，使用交换机、路由器等网络设备完成由局域网到互联网的接入。
2. 对网络设备能够方便地进行远程管理。
3. 在局域网中公司部门间进行vlan划分，实现安全管理。
4. 对三层设备路由技术这方面采取RIPV2协议或OSPF协议。
5. 配置访问控制列表（ACL）以对网络数据进行有效的分类和控制，限制终端之间的相互访问。
6. 内网通过配置PAT技术实现与外网之间的通信。

### 0x01 所需设备
![中小企业所需设备](/img/post/enterprise_network_the_required_equipment.png)

### 0x02 网络规划
1. 在三层交换机设置ACL，控制个vlan间的通信
2. 在防火墙(路由器)上设置NAT转换
3. 路由协议采用OSPF
4. 内网访问控制
	* 内网中只有市场部可以访问外网
	* 市场部可以访问市场部、打印机
	* 设计部可以访问设计部、财务部、打印机
	* 外网只有202.202.2.0/24能访问内网
5. IP规划如下：
   * 打印机：192.168.1.0/24
   * 市场部：192.168.2.0/24
   * 设计部：192.168.3.0/24
   * 财务部：192.168.4.0/24
   * 防火墙和三层交换机所在网段：192.168.5.0/24
   * 管理ip所在网段：192.168.100.0/24

### 0x03 网络设备配置命令代码
* Firewall配置

```
Router>enable 
Router#conf t
Router(config)#no ip domain-lookup  //禁止域名解析
Router(config)#hostname Firewall  //更改设备名
Firewall(config)#enable password 123
Firewall(config)#router eigrp 1
Firewall(config-router)#no auto-summary  //关闭自动汇总
Firewall(config-router)#exit
Firewall(config)#int f0/0
Firewall(config-if)#ip add 192.168.5.2 255.255.255.0  //配端口ip
Firewall(config-if)#no shut
Firewall(config-if)#exit
Firewall(config)#router ospf 1  //配路由协议ospf
Firewall(config-router)#network 202.202.1.0 0.0.0.255 area 0
Firewall(config-router)#network 192.168.5.0 0.0.0.255 area 0
Firewall(config-router)#exit
Firewall(config)#int s1/0
Firewall(config-if)#ip add 202.202.1.1 255.255.255.0
Firewall(config-if)#clock rate 128000   //配同步时钟
Firewall(config-if)#no shut
Firewall(config-if)#exit
Firewall(config)#ip nat pool NAT 202.202.1.1 202.202.1.1 netmask 255.255.255.0 //地址池
Firewall(config)#ip nat inside source list 1 pool NAT overload //定义接口复用
Firewall(config)#access-list 1 permit 192.168.0.0 0.0.255.255  //定义需要转换的内部本地地址
Firewall(config)#int f0/0
Firewall(config-if)#ip nat inside //定义NAT接口
Firewall(config-if)#int s1/0
Firewall(config-if)#ip nat outside 
Firewall(config-if)#exit
Firewall(config)#access-list 101 permit ip 202.202.2.0 0.0.0.255 192.168.0.0 0.0.255.255   //配置ACL
Firewall(config)#access-list 101 deny ip any any 
Firewall(config)#int f0/0
Firewall(config-if)#ip access-group 101 out  //应用ACL到接口
Firewall(config-if)#end
Firewall#write
Building configuration...
[OK]
Firewall#
```

* R1的配置

```
Router>enable 
Router#conf t
Router(config)#no ip domain-lookup 
Router(config)#hostname R1
R1(config)#enable password 123
R1(config)#router eigrp 1
R1(config-router)#no auto-summary
R1(config-router)#exit
R1(config)#int s1/1
R1(config-if)#ip add 202.202.1.2 255.255.255.0
R1(config-if)#no shut
R1(config-if)#exit
R1(config)#int f0/0 
R1(config-if)#ip add 202.202.2.254 255.255.255.0
R1(config-if)#no shut
R1(config-if)#exit
R1(config)#int f0/1
R1(config-if)#ip add 202.202.3.254 255.255.255.0
R1(config-if)#no shut
R1(config-if)#exit
R1(config)#router ospf 1
R1(config-router)#network 202.202.1.0 0.0.0.255 area 0
R1(config-router)#network 202.202.2.0 0.0.0.255 area 0
R1(config-router)#network 202.202.3.0 0.0.0.255 area 0
R1(config-router)#exit
R1(config)#exit
R1#write
Building configuration...
[OK]
R1#
```

* 三层交换机配置

```
Switch>enable 
Switch#conf t
Switch(config)#no ip domain-lookup
Switch(config)#hostname MS1
MS1(config)#line vty 0 4
MS1(config-line)#password soft  
MS1(config-line)#exit
MS1(config)#enable password 123
MS1(config)#int vlan 1
MS1(config-if)#ip add 192.168.100.254 255.255.255.0 //配管理ip
MS1(config-if)#no shut
MS1(config-if)#exit
MS1(config)#int f0/1
MS1(config-if)#switchport trunk encapsulation dot1q//封IEEE802.1q协议
MS1(config-if)#switchport mode trunk  //将端口设为trunk
MS1(config-if)#exit
MS1(config)#int f0/2
MS1(config-if)#switchport trunk encapsulation dot1q 
MS1(config-if)#switchport mode trunk 
MS1(config-if)#int f0/3
MS1(config-if)#switchport trunk encapsulation dot1q
MS1(config-if)#switchport mode trunk 
MS1(config-if)#exit
MS1(config)#int g0/1
MS1(config-if)#no switchport  //将2层接口变为3层
MS1(config-if)#exit
MS1(config)#exit
MS1#vlan database 
MS1(vlan)#vlan 10 name vlan10  //创建vlan
VLAN 10 added:
    Name: vlan10
MS1(vlan)#vlan 20 name vlan20
VLAN 20 added:
    Name: vlan20
MS1(vlan)#vlan 30 name vlan30
VLAN 30 added:
    Name: vlan30
MS1(vlan)#vlan 40 name vlan40
VLAN 40 added:
    Name: vlan40
MS1(vlan)#exit
APPLY completed.
Exiting....
MS1#conf t
MS1(config)#int vlan 10
MS1(config-if)#ip add 192.168.1.254 255.255.255.0  //为vlan配ip，也是vlan的网关
MS1(config-if)#int vlan 20
MS1(config-if)#ip add 192.168.2.254 255.255.255.0
MS1(config-if)#int vlan 30
MS1(config-if)#ip add 192.168.3.254 255.255.255.0
MS1(config-if)#int vlan 40
MS1(config-if)#ip add 192.168.4.254 255.255.255.0
MS1(config-if)#exit
MS1(config)#int g0/0
MS1(config-if)#ip add 192.168.5.1 255.255.255.0
MS1(config-if)#no shut
MS1(config-if)#exit
MS1(config)#route ospf 1
MS1(config-router)#network 192.168.1.0 0.0.0.255 area 0
MS1(config-router)#network 192.168.2.0 0.0.0.255 area 0
MS1(config-router)#network 192.168.3.0 0.0.0.255 area 0
MS1(config-router)#network 192.168.4.0 0.0.0.255 area 0
MS1(config-router)#network 192.168.5.0 0.0.0.255 area 0
MS1(config-router)#network 192.168.100.0 0.0.0.255 area 0
MS1(config-router)#exit
MS1(config)#access-list 1 permit 192.168.2.0 0.0.0.255 
MS1(config)#access-list 1 deny 192.168.0.0 0.0.255.255
MS1(config)#access-list 1 permit any 
MS1(config)#int g0/1
MS1(config-if)#ip access-group 1 out
MS1(config-if)#exit
MS1(config)#access-list 20 permit 192.168.1.0 0.0.0.255
MS1(config)#access-list 20 deny 192.168.0.0 0.0.255.255
MS1(config)#access-list 20 permit any
MS1(config)#int vlan 20
MS1(config-if)#ip access-group 20 out
MS1(config-if)#exit
MS1(config)#access-list 30 permit 192.168.1.0 0.0.0.255
MS1(config)#access-list 30 permit 192.168.4.0 0.0.0.255
MS1(config)#access-list 30 deny 192.168.0.0 0.0.255.255
MS1(config)#access-list 30 permit any
MS1(config)#int vlan 30
MS1(config-if)#ip access-group 30 out
MS1(config-if)#end
MS1#write
Building configuration...
[OK]
MS1#
```

* S1的配置(S2、S3和S1一样)

```
Switch>enable 
Switch#conf t
Switch(config)#no ip domain-lookup 
Switch(config)#hostname S1
S1(config)#line vty 0 4
S1(config-line)#password soft
S1(config-line)#exit
S1(config)#enable password 123
S1(config)#int vlan 1
S1(config-if)#ip add 192.168.100.1 255.255.255.0
S1(config-if)#no shut
S1(config-if)#exit
S1(config)#int g1/1
S1(config-if)#switchport mode trunk 
S1(config-if)#exit
S1(config)#int f0/24
S1(config-if)#switchport mode trunk 
S1(config-if)#int f0/23
S1(config-if)#switchport mode trunk 
S1(config-if)#exit
S1(config)#exit
S1#write
Building configuration...
[OK]
S1#
```

* S4的配置(S5、S6、S7和S4一样)

```
Switch>enable 
Switch#conf t
Switch(config)#no ip domain-lookup 
Switch(config)#hostname S4
S4(config)#line vty 0 4
S4(config-line)#password soft
S4(config-line)#exit
S4(config)#enable password 123
S4(config)#int vlan 1
S4(config-if)#ip add 192.168.100.4 255.255.255.0
S4(config-if)#no shut
S4(config-if)#exit 
S4(config)#int f0/24
S4(config-if)#switchport mode trunk 
S4(config-if)#exit
S4(config)#exit
S4#vlan database 
S4(vlan)#vlan 10 name vlan10
VLAN 10 added:
    Name: vlan10
S4(vlan)#vlan 20 name vlan20
VLAN 20 added:
    Name: vlan20
S4(vlan)#vlan 30 name vlan30
VLAN 30 added:
    Name: vlan30
S4(vlan)#vlan 40 name vlan40
VLAN 40 added:
    Name: vlan40
S4(vlan)#exit
APPLY completed.
Exiting....
S4#conf t
S4(config)#int vlan 10  //激活vlan
S4(config-if)#
%LINK-5-CHANGED: Interface Vlan10, changed state to up

%LINEPROTO-5-UPDOWN: Line protocol on Interface Vlan10, changed state to up
S4(config-if)#int vlan 20
S4(config-if)#int vlan 30
S4(config-if)#exit
S4(config)#exit
S4#write
Building configuration...
[OK]
S4#
```

### 0x04 测试及结果截图
* 开始时外网和内网均能相互通信
![开始时内外网能相互ping通1](/img/post/enterprise_network_init1.png)
![开始时内外网能相互ping通2](/img/post/enterprise_network_init2.png)

* 外网的2.0网段和3.0网段ping内网网段，只有2.0只能ping通内网的网段，且只能ping通192.168.2.0
![测试1](/img/post/enterprise_network_test1.png)

* 内网网段ping外网的202.202.2.1，只有2.0能ping通外网
![测试2](/img/post/enterprise_network_test2.png)

* 内网2.0网段ping内网网段，只能访问1.0
![测试3](/img/post/enterprise_network_test3.png)

* 内网3.0网段ping内网网段，能ping通1.0和4.0
![测试4](/img/post/enterprise_network_test4.png)

* 内网4.0网段ping内网网段，能ping通1.0和3.0
![测试5](/img/post/enterprise_network_test5.png)

* 远程配置设备
![测试6](/img/post/enterprise_network_test6.png)

* 查看NAT转换
![测试7](/img/post/enterprise_network_test7.png)

以上