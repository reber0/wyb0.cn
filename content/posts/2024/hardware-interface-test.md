---
draft: false
isCJKLanguage: true
date: 2024-01-31
lastmod: 2024-01-31
title: "硬件接口测试"
description: 我的个人博客，主要用于记录自己的一些渗透测试、编程等学习笔记之类的东西。
categories: 
  - Pentest
tags:
  - hardware
---


### 0x01 JTAG 接口
主要用来读写固件，常见 JTAG 接口引脚有 10PIN、14PIN、20PIN

一般需要接的引脚：  
GND：接地引脚  
TDI：测试数据输入，用于向被测设备传输测试数据  
TDO：测试数据输出，用于从被测设备读取测试数据  
TCK：测试时钟，用于同步测试数据的传输  
TMS：测试模式选择，用于控制 JTAG 状态机的状态转移  
TRST：可选，TRST 可以用来对 TAPController 进行复位（初始化）

### 0x02 SWD 接口

留了 JTAG 接口，就是留了 SWD 接口  
JTAG 接口 TCK 和 TMS 引脚，就是 SWD 的 SWCLK 和 SWDIO引脚

常用的 SWD 接口有五线制和四线制两种，他们分别是：  
五线制：VCC GND SWDIO SWCLK RESET  
四线制：VCC GND SWDIO SWCKL  
区别是，四线制没有留出 RESET 引脚

一般需要接的引脚：  
VCC：电源线引脚  
GND：接地引脚，用于提供电路的共地引用。  
SWDIO：用于传输调试和编程数据的双向数据线。  
SWCLK：用于提供时钟信号，同步数据传输的时钟线。  
RESET：可选，仿真器输出至目标 CPU 的系统复位信号，一般建议接上

### 0x03 UART 接口

主要用来拿 shell，常见 JTAG 接口引脚有 4PIN

一般需要接的引脚：  
VCC：电源线引脚，一般为 3.3v 或 5v  
GND：接地引脚  
TXD：发送数据  
RXD：接收数据

### 0x04 连接设备找引脚

常见的 JTAG 波特率包括 100kHz、1MHz、10MHz 等  
常见的 UART 波特率包括 9600、115200、57600、38400 等

```
screen -ls 查看当前已有的 screen 会话
screen -x name 进入某个会话
Ctrl+a, 再按 d 挂起回话
Ctrl+a+k 杀死当前窗口
```

被测设备接通电源，然后使用万用表找到 GND  
将被测设备 GND 和 JTAGulator 的 GND 连接，其他被测设备其他引脚和 JTAGulator 的 CH 连接

```
➜ ls /dev/ | grep usb
cu.usbserial-AQ00DRLX
tty.usbserial-AQ00DRLX

➜ screen -L /dev/cu.usbserial-AQ00DRLX 115200 –L 进入 JTAGulator

输入 j 进入 jtag，输入 v 设置为 3.3v，输入 i，设置使用了的 ch，然后空格进行测试
```


**参考资料**
* [物联网安全从零开始-路由器硬件安全初探](https://www.iotsec-zone.com/article/358?_blank)
* [物联网安全从零开始-路由器jtag调试分析](https://www.iotsec-zone.com/article/375?_blank)
* [嵌入式安全利器 JTAGulator 的制作与调试实战](https://yaseng.org/diy-JTAGulator-and-debugging.html?_blank)
* [UART串口调试](https://www.secpulse.com/archives/157847.html?_blank)
