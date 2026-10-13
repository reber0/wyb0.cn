---
draft: false
isCJKLanguage: true
title: 思科交换机基本配置
date: 2015-05-06 23:46:26
description: 
categories:
  - Other
tags:
  - 网络设备
---

### 0x00 简单配置命令
```
Switch>enable(配置交换机名称)
Switch(config)#hostname S

S(config)#enable password 222//(加密特权密码，密码为222)
S(config)#no enable password //(取消enable密码)
S(config)#enable secret 333//(设置后用show命令时不能看到密码)
S(config)#no enable secret //(取消enable密码)

S(config)#line vty 0 4//(有5个虚拟终端，即0-4)
S(config-line)#password 444//(设置虚拟终端密码)
S(config-line)#login//(使密码生效)

S(config)#line console 0//(设置控制台密码)
S(config-line)#password 111
S(config-line)#login
S(config)#line con 0//(取消控制台密码)
S(config-line)#no password

S(config-line)#exec-timeout 5 30//(超时时间)(分、秒)

S(config)#no ip domain-lookup//(禁止名称解析)
```

### 0x01 配置交换机管理IP、默认网关
```
S(config)#interface vlan 1  //(配置交换机管理IP、子网掩码)
S(config-if)#ip address 192.168.1.1 255.255.255.0
S(config-if)#no shutdown

S(config)#  exit
S(config)#ip default-gateway 192.168.1.250//(默认网关)
```

### 0x02 配置交换机的端口速率、端口双工模式
```
S(config)#//(端口双工模式)
S(config)#interface f0/1
S(config-if)#duplex ?
  auto  Enable AUTO duplex configuration
  full  Force full duplex operation
  half  Force half-duplex operation
S(config-if)#duplex auto

S(config-if)#speed ? // (配置交换机的端口速率)
  10    Force 10 Mbps operation
  100   Force 100 Mbps operation
  auto  Enable AUTO speed configuration
S(config-if)#speed 100

Switch#write  //(保存配置)
Building configuration...
[OK]
```