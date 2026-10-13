---
draft: false
isCJKLanguage: true
date: 2026-10-12
lastmod: 2026-10-12
title: "macOS 上发送 CANFD 报文"
description: macOS 上发送 CANFD 报文：PCAN 驱动不可用，换 CANable 板并刷 Elmue 2.5 固件，用 python-can slcan 收发
categories: 
  - Pentest
tags:
  - uds
  - canfd
  - hardware
  - mac
---


### 0x00 前因

我的主力机是 Mac，手头有个 PEAK PCAN-USB Pro FD，平时拿它发车上的诊断请求  
它在 Windows 上用着没问题，在 Mac 上却一直发不出 CANFD，但一连上就反复报 bus error / bus-off  
把诊断线全拔掉、只留 USB，空闲通道的状态查询照样报错

近期用 AI 排查了一通，算是能用了，AI 真好用、、、

### 0x01 PCAN + mac-can 驱动

刚开始想的是直接用 PCAN（手头就有一块 Pro FD），但 macOS 没有 PEAK 官方驱动，只能走开源的 mac-can（libPCBUSB）：

1. 从 [PCBUSB-Library](https://github.com/mac-can/PCBUSB-Library?_blank) 的 releases 下载 [macOS_Library_for_PCANUSB_v0.13.tar.gz](https://github.com/mac-can/PCBUSB-Library/releases/download/v0.13/macOS_Library_for_PCANUSB_v0.13.tar.gz)（Universal Binary，x86_64 + arm64）

2. 解压后 `cd PCBUSB && sudo ./install.sh`，安装了一下

    ```bash
    tar -xzf macOS_Library_for_PCANUSB_v0.13.tar.gz
    cd PCBUSB && sudo ./install.sh
    ```

    驱动装上之后，python-can 就能识别到 PCAN 设备了，这条命令执行不报错：

    ```python
    import can
    bus = can.interface.Bus(interface='pcan', channel='PCAN_USBBUS1', bitrate=500000)
    ```

3. 反复报错

    驱动装好后接车发诊断请求，开始反复报 bus error / bus-off，PCAN 是没问题的，在 Windows 上用 PCANView 诊断完全正常，OBD 线、配置的波特率之类的都没问题

    把 OBD 线拔掉、只留 PCAN 的 USB接入电脑，空闲通道照样报 PCAN_ERROR_BUSHEAVY

    **用 AI 查了下 github issues**：

    - releases 最新停在 **v0.13（2024-07-28）**，之后零更新
    - issue #24（macOS Tahoe 上 `pcbusb_recv` 接收间歇性、`pcbusb_send` 正常）**至今 open**，无修复无 workaround
    - Pro FD 支持从 v0.10 起就只保证 CAN1 单通道

    得出结论：**PCAN 在 Mac 上做诊断不可靠是定局，不是配置问题**，坏掉的是“收”，发是好的，但诊断必须收发都稳，于是考虑换硬件

### 0x02 换硬件

很早之前就大概查过资料，知道 CANable，AI 也建议用它，这次就具体看了下它

#### CANable 是什么

开源的 USB 转 CAN 适配器（硬件、固件都开源），对上走 USB，对下接 CAN 收发器。刷 slcan 固件的话，它就是一个免驱的 USB CDC 串口，macOS 上直接出`/dev/tty.usbmodem*`，python-can 用 `interface='slcan'`，同一套代码在三个平台都能跑，固件开源可以自己刷，淘宝兼容板多、便宜

#### 能不能发 FD 取决于三层

* **主控**：管协议（组帧解帧、CRC、ACK、位定时），FD 帧由它生成，所以必须带 FDCAN 控制器 —— STM32G4 系列就可以，像 STM32F072 只能经典 CAN

* **收发器**：管电气，把主控的 3.3V 单端信号转成总线上的差分电平（CAN_H / CAN_L），不关心帧内容，但数据段要跑到 2M 就得是 FD 级 —— TJA1051/3、TJA1057、SIT1051T/3、ISO1042 可以，TJA1051T、SIT1050 是经典 CAN（最高 1Mbps），发不了 FD

* **固件**：必须实现 FD —— 两种做法：**candleLight**（固件项目名，实现的协议是 gs_usb 原生 USB）和**带 FD 扩展命令的 slcan 固件**（slcan 协议 + FD 帧命令），标准老 slcan 固件发不出 FD。

  **任何一层不满足 → 发不出 CANFD，** 比如：主控是 G431（有 FDCAN）、但收发器是 TJA1051T，或者固件刷的是标准 slcan —— 前两层看着都对，实际发出去只有经典帧。

#### 购买 CANable
在淘宝搜了下，很多 CANable，有些没货，有些看描述里面主控或者收发器对不上，要不就是发资料让自己看，有些只说不支持(实际上应该是支持的，主控、收发器都是对的，感觉商家自己就没在 mac 上测试过)

最后找了 [鹿小班CANable2.0](https://e.tb.cn/h.jYTuHQx86mPBdwO?tk=88IeTI5U6iY?_blank)，是黑色的板子，详情里说主控是 STM32G4，图片上芯片丝印也是 STM32G431，买回来看了下，收发器丝印是 A1051/3 开头的，商家给了一些板子的资料 [CAN模块资料](https://www.xinlucity.com/?s=resourcedetail/index/id/164.html?_blank)，把板子资料给了 AI，说根据原理图来看是芯力特的 SIT1051T/3，可以 canfd

### 0x03 刷固件

先说结论：**G431 板只能刷 G431 专用固件**，最后是用 **Elmue 刷的 CANable 2.5（slcan 版）**，用 HUD ECU Hacker 上位机刷进去。

**① candleLight**

AI 最先推荐的是 candleLight（理由说的是 python-can 的 cantact 接口更成熟、FD 支持可靠，刷完是个原生 USB CAN 设备，Linux 上插上就能直接用

实际上这个是错的，cantact 是 CANtact 这个硬件的专用接口，跟 candleLight 没关系，而且它自己就不支持 FD：标准 candleLight_fw 官方不支持 G431； python-can 对应的 gs_usb 接口只提供经典速率（10K~1M），无法 FD

**② 官方网页刷**

后来 AI 推荐官网 [CANable 2.0 - Updater](https://canable.io/updater/canable2.html?_blank)，这是最省事的路

通过浏览器刷，什么软件都不用装，AI 还给出了具体操作步骤：拉高 BOOT 进 DFU（Device Firmware Upgrade） → 打开官网 → 选 slcan with FD support（当时以为它是官方渠道、支持 G431）

后来查证发现它的覆盖范围里没有 G431 这块板子，页面上只有官方 CANable 2.0（STM32F042/F072）的固件，刷不进 G431，也没有任何 G431/MKS 选项

**③ 带 FD 的 slcan 固件**

前面两条路都走不通之后，剩下的候选只有 slcan 固件，后来 AI 一通查，发现 python-can 的 slcan 完整支持发 canfd，整条链路走 USB CDC 串口，免驱、不用额外装任何包

路线就定：**STM32G431 + 带 FD 的 slcan 固件 + python-can `slcan` 接口**。

落到具体固件就是 **Elmue 的 CANable 2.5**，它基于官方 candlelight + slcan 改造、专为 G431 写，修掉了官方固件长期没解决的 BOOT0 与 CAN RX 复用引脚问题，用 HUD ECU Hacker 可以免编译直接刷。

**④ 刷固件流程**

当时 AI 去网上找 HUD ECU Hacker，被官网反爬了，我去网上搜了下，翻到一篇 CSDN 教程 [CANable V2.5 Candlelight&Slcan 使用教程](https://blog.csdn.net/gjy_skyblue/article/details/155202385?_blank)，HUD ECU Hacker 可以在 [github](https://github.com/Elmue/CANable-2.5-firmware-Slcan-and-Candlelight?_blank) 看源码，可以在 [官网](https://netcult.ch/elmue/HUD%20ECU%20Hacker/#Install?_blank) 下载

* 装驱动：装 HUD ECU Hacker → 打开“安装 USB 驱动并更新固件”→ 适配器选 CANable → 先勾上“为固件更新器安装 ST Microelectronics Tube 驱动”把 DFU 驱动装好
  
  ![70](/img/post/2026-10-12-15-44-37-image.png)

* 刷固件：板子进 DFU（V 孔短接 BOOT 孔后、插 USB）→ 点「更新固件」

  ```
  进 DFU 的正确接法（G431 黑板）：

  板子上有 4 孔 SWD 口，丝印 G/D/C/V = GND / SWDIO / SWCLK / VCC 3.3V，右侧紧挨 BOOT 通孔焊盘
  把 V 孔接到 BOOT 孔，USB 接电脑上电 → 进 ST DFU bootloader（ioreg 里能看到 DFU in FS Mode）
  
  注：刷完必须断电拔掉这根线，否则每次上电都进 DFU、不跑固件
  ```

  ![70](/img/post/2026-10-12-15-46-32-image.png)

* 在固件更新器里选 Detected devices、Targets、固件（源码里的构建目标 Slcan2.5 - Multiboard - STM32G431）→ Upload

  ![70](/img/post/2026-10-12-15-58-15-image.png)

* 刷完断电、断掉 V 孔和 BOOT 短接的线、重新上电（新版固件支持免跳线，软件上 `Enter DFU mode` 一键进 DFU、`Disable Pin Boot0` 永久禁用 BOOT0）

**⑤ 刷完先验证固件身份**（串口 CDC 免驱，不用装任何驱动）：

```bash
➜ system_profiler SPUSBHostDataType

USB:

    USB 3.1 Bus:

      Location ID: 0x03000000
      Connection Type: Built-in
      Driver: AppleT8142USBXHCI

        CANable 2.5 Slcan:

          Location ID: 0x03100000
          Connection Type: Removable
          Manufacturer: ElmueSoft (netcult.ch/elmue)
          Serial Number: 2063345F38455005
          Link Speed: 12 Mb/s
          USB Vendor ID: 0x16d0
          USB Product ID: 0x117e
          USB Product Version: 0x2510
          Power Allocated: 0.75 W (150 mA)
```

```bash
➜ ls /dev/tty.usbmodem*    # /dev/tty.usbmodem3101
```

```bash
➜ screen /dev/tty.usbmodem3101 115200    # 进去
V                                        # 敲 V + 回车，看回显

+Board: Multiboard   MCU: STM32G431   DevID: 1128   Firmware: …   Slcan: 105   Clock: 160   Limits: …
```

### 0x04 收发 demo：python-can + slcan

interface 就用 `slcan`，下面是收发脚本 demo，发一帧 UDS 诊断请求、收响应

#### 经典 CAN

```python
import can

CH = "/dev/tty.usbmodem3101"   # 显式指定串口，不做自动探测
REQ_ID = 0x74F                 # 诊断请求 ID

bus = can.interface.Bus(interface="slcan", channel=CH, bitrate=500000)

# 发：11 位 ID + 8 字节数据（ISO-TP 单帧，首字节 03 = 后面跟 3 字节）
msg = can.Message(arbitration_id=REQ_ID, data=bytes.fromhex("03220110")
bus.send(msg, is_extended_id=False))

# 收：首帧给 2 秒窗口，收到后按「帧间静默」退出
first = bus.recv(timeout=2.0)
if first is None:
    print("2 秒内没有响应")
else:
    print(first)
    while (nxt := bus.recv(timeout=0.3)) is not None:  # STmin 上限 127ms，0.3s 足够
        print(nxt)

bus.shutdown()
```

#### CANFD

```python
from can import BitTimingFd

CH = "/dev/tty.usbmodem3101"   # 同上
REQ_ID = 0x74F

bus = can.interface.Bus(interface="slcan", channel=CH, timing=t, fd=True)

# BitTimingFd 只收时序参数，不收波特率数字（传 data_bitrate_fd 会 TypeError）
t = BitTimingFd(f_clock=80_000_000,
                nom_brp=4,  nom_tseg1=31, nom_tseg2=8,  nom_sjw=8,     # 80M/(4×40) = 500K
                data_brp=1, data_tseg1=31, data_tseg2=8, data_sjw=8)  # 80M/(1×40) = 2M
assert (t.nom_bitrate, t.data_bitrate) == (500_000, 2_000_000)

msg = can.Message(arbitration_id=REQ_ID, data=bytes.fromhex("03220110")
bus.send(msg, is_fd=True, bitrate_switch=True))   # → slcan 命令 'b'

# 接收代码省略，和 CAN 一样
```

### 0x05 结论

**结果**：macOS 上通过 `/dev/tty.usbmodem3101`（G431 黑板 + Elmue 2.5 Slcan 固件），经典 CAN 500K 的 UDS 诊断请求能正常发出并收到响应，CANFD 500K 仲裁 / 2M 数据下 FD 帧收发都通，全程免驱。

**发送能力速查清单**：

1. macOS 上要发 CAN/CANFD，走 USB-CAN 适配器 + 串口协议（slcan）
2. 发 FD 要三层齐：主控 FDCAN + FD 级收发器 + 带 FD 扩展命令的固件
3. G431 板必须刷 G431 专用固件（Elmue 2.5 Slcan 版 / 厂商固件）
4. slcan 发 FD 帧靠 `is_fd` + `bitrate_switch`，双波特率用 `timing=BitTimingFd(...)`
5. 上车之后的主要矛盾不在「发」，在接收循环、连接复用这些细节

**参考资料**

* [mac-can/PCBUSB-Library](https://github.com/mac-can/PCBUSB-Library?_blank)
* [芯路城 USB TO CAN调试器（黑板）Canable2.0-客户资料](https://www.xinlucity.com/?s=resourcedetail/index/id/164.html?_blank)
* [CANable 2.0 - Updater](https://canable.io/updater/canable2.html?_blank)
* [python-can documentation](https://python-can.readthedocs.io/en/stable/interfaces/slcan.html?_blank)
* [CANable V2.5 Candlelight&Slcan 使用教程](https://blog.csdn.net/gjy_skyblue/article/details/155202385?_blank)
* [HUD ECU Hacker](https://netcult.ch/elmue/HUD%20ECU%20Hacker/?_blank)
* [CANable-2.5-firmware-Slcan-and-Candlelight](https://github.com/Elmue/CANable-2.5-firmware-Slcan-and-Candlelight?_blank)
* [CANable V2.5 Candlelight&Slcan 更新说明](https://jishuzhan.net/article/1993490212106862593?_blank)
