---
draft: false
isCJKLanguage: true
date: 2024-03-29
lastmod: 2024-03-29
title: "固件提取"
description: 我的个人博客，主要用于记录自己的一些渗透测试、编程等学习笔记之类的东西。
categories: 
  - Pentest
tags:
  - bin
---


### 0x00 固件组成
固件通常由 bootloader、内核、根文件系统及其他资源文件组成  
固件采用的根系统文件类型有很多种，常见的有 squashfs、ubifs、ext4、jeffs2 等。  
固件文件通常以 bin、zip、LZMA、arj 等文件压缩类型封装，最常见的为 bin 和 zip 格式  
最常采用的文件系统是 squashfs，分析人员可以使用 unsqushfs 工具对文件系统提取数据。

* bootloader  
    简单的说，bootloader 和 PC 的 BIOS 在启动时的作用是一致的。  
    引导程序主要负责初始化硬件设备并加载内核到内存中。

* 内核  
    一旦内核镜像被加载到 RAM 中，引导程序会将控制权交给内核，  
    内核接管系统后，设置内存管理、建立中断处理程序、初始化设备驱动程序等，  
    然后挂载根文件系统，再加载初始化脚本和服务到内存以进行系统的初始化和启动。

* 根文件系统  
    根文件系统是内核启动时所 mount 的第一个文件系统，根文件系统中保存了内核代码映像、初始化脚本、配置文件以及其他系统所需的文件。

### 0x01 提取固件
一般就是通过各种方法尝试解压固件，然后通过修改固件启动项（比如说在启动的 sh 文件里加 telnet 后门），然后将重新打包后的固件进行刷写，在设备启动后就会起一个 telnet 从而获取 shell 权限

#### 1. 名词
NAND 是一种硬件技术，通常作为嵌入式系统中的主要存储设备，类似于闪存芯片，可以用于存储操作系统、根文件系统和其他数据。

MTD（Memory Technology Devices）提供对不同类型闪存芯片（如 NAND、NOR、OneNAND 等）的统一接口，使开发人员能够以相同的方式与这些设备进行通信，以访问、读取、写入和擦除 NAND 闪存中的数据。

UBI（Unsorted Block Image）是一个软件层，可以看作是对 MTD 的二次封装和抽象，提供了更高级的功能和接口，使文件系统（如SquashFS、UBIFS）更方便地使用和管理闪存设备。

UBIFS（UBI File System），UBIFS 是一个专门为 UBI 设计的文件系统，用于在 NAND 闪存上存储和管理文件。

SquashFS（Squash File System），与 UBIFS 不同，它只适用于只读、需要节省存储空间的场景。

#### 2. 获取根文件系统的文件
某更新包里存在文件如下：  
AA.YYY.CRD07.S.830.V2.02.UPDATE.json  
AA.YYY.CRD07.S.830.V2.02.UPDATE.zip  
AA.YYY.CRD07.S.830.V2.02.UPDATE_MD5.txt
    
直接解压 zip 出错，通过 binwalk -e AA.YYY.CRD07.S.830.V2.02.UPDATE.zip 成功解压
```
➜ binwalk -e AA.A001.UPDATE.zip
    
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
8             0x8             PEM certificate
909           0x38D           Zip archive data, at least v2.0 to extract, compressed size: 6680, uncompressed size: 19225, name: FlashDriver_AUTO.bin
7762          0x1E52          Zip archive data, at least v2.0 to extract, compressed size: 154, uncompressed size: 197, name: XXX_YYY_S.830_V2.02_MD5.txt
8096          0x1FA0          Zip archive data, at least v2.0 to extract, compressed size: 264497, uncompressed size: 502825, name: MCUApp_YYY_S.830_V2.02.bin
272772        0x42984         Zip archive data, at least v2.0 to extract, compressed size: 102679176, uncompressed size: 102667680, name: update.zip
102952446     0x622EDFE       End of Zip archive, footer length: 22
```

binwalk 解压后生成文件如下：
```
➜ ls -al _AA.YYY.CRD07.S.830.V2.02.UPDATE.zip.extracted
total 402656
drwxr-xr-x  9 reber  staff        288  3 28 16:39 .
drwxr-xr-x@ 7 reber  staff        224  3 28 15:50 ..
-rw-r--r--@ 1 reber  staff  102951559  3 28 15:50 38D.zip
-rw-r--r--@ 1 reber  staff      19225  8 30  2023 FlashDriver_AUTO.bin
-rw-r--r--  1 reber  staff        197  8 30  2023 XXX_YYY_S.830_V2.02_MD5.txt
-rw-r--r--  1 reber  staff     502825  8 30  2023 MCUApp_YYY_S.830_V2.02.bin
-rw-r--r--@ 1 reber  staff  102667680  8 30  2023 update.zip
```

解压 update.zip 后发现文件如下：
```
➜ ls -al update
total 209240
drwxr-xr-x@ 6 reber  staff       192  8 30  2023 .
drwxr-xr-x  9 reber  staff       288  3 28 16:39 ..
-rw-r--r--@ 1 reber  staff  32768000  8 30  2023 NON-HLOS.ubi
-rw-r--r--@ 1 reber  staff       876  8 30  2023 fotaconfig.xml
-rw-r--r--@ 1 reber  staff  10656072  8 30  2023 mdm9607-boot.img
-rw-r--r--@ 1 reber  staff  63700992  8 30  2023 mdm9607-sysfs.ubi
```
    
mdm9607-sysfs.ubi 应该就是根文件系统了

#### 3. 分析、挂载 ubi

1、使用 xxd 分析 ubi 镜像文件，得到 Page Size，PEB Size，UBI_VID_HDR 的偏移；  
2、阅读对应的 nand flash 数据手册，找到 Read ID 命令，确定 nandsim 的 4 个参数的值；  
3、在使用 ubiformat 和 ubiattach 时使用 -O 选项显式指定 UBI_VID_HDR 的偏移。

* ubi 根文件系统分析（获取 Page Size，PEB Size，UBI_VID_HDR）

    一会要用 nandsim 模拟出一个具有 mtd 接口的 nand 设备，而且这个设备要与 ubi 镜像的参数保持一致，这些参数包括设备的物理块擦除大小 (Physical Erase Block， PEB) 和 页大小 (Page Size)。

    ubi 镜像有多个 PEB 组成，每个 PEB 包括以下三部分内容  
    [ UBI_EC_HDR，UBI_VID_HDR，DATA (LEB) ]

    根据 ubi-header.h 中头部各个字节的含义的定义：
    ```c
    /*
    Erase counter header magic number (ASCII "UBI#") */
    #define UBI_EC_HDR_MAGIC  0x55424923
    Volume identifier header magic number (ASCII "UBI!") */
    #define UBI_VID_HDR_MAGIC 0x55424921
    */
    
    struct ubi_ec_hdr {
      uint32_t magic;  //#define UBI_EC_HDR_MAGIC  0x55424923
      uint8_t  version;
      uint8_t  padding1[3];
      uint64_t ec; /* Warning: the current limit is 31-bit anyway! */
      uint32_t vid_hdr_offset;
      uint32_t data_offset;
      uint8_t  padding2[36];
      uint32_t hdr_crc;
    } __attribute__ ((packed));
    ```
    
    获取 ubi 头部
    ```
    ➜  ~ xxd mdm9607-sysfs.ubi | head -n 2
    00000000: 5542 4923 0100 0000 0000 0000 0000 0000  UBI#............
    00000010: 0000 0800 0000 1000 1b06 7c71 0000 0000  ..........|q....
    ```

    从而得到：  
    magic，ubi 头，为 5542 4923，即 UBI#  
    vid_hdr_offset，为 0000 0800，即 2048，偏移 2k  
    data_offset，为 0000 1000，即 4096，偏移 4k

    根据 ubi-header.h 中定义的 UBI_EC_HDR 头为 UBI#、UBI_VID_HDR 头为 UBI!，  
    验证一下，发现 00000800 是 UBI!，00001000 这里就是 data
    ```
    ➜  ~ xxd mdm9607-sysfs.ubi | less
    00000000: 5542 4923 0100 0000 0000 0000 0000 0000  UBI#............
    00000010: 0000 0800 0000 1000 1b06 7c71 0000 0000  ..........|q....
    00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
    ......
    00000800: 5542 4921 0101 0005 7fff efff 0000 0000  UBI!............
    00000810: 0000 0000 0000 0000 0000 0000 0000 0000  ................
    ......
    00001000: 0000 01dd 0000 0001 0000 0000 0100 0006  ................
    00001010: 726f 6f74 6673 0000 0000 0000 0000 0000  rootfs..........
    ```

    通常 UBI_EC_HDR 和 UBI_VID_HDR 要么在每个 PEB 的头部各占一页，要么都在第一页。  
    若第一种，则页大小为 2KB；若第二种页大小为 4KB，nand flash 常见的页大小是 512byte 和 2KB，4KB 比较少见，故先推测为<font color=red>页大小 2KB</font>。

    再确定一下每个 PEB 的大小，每个 UBI_EC_HDR 相距 20000，所以 <font color=red>PEB 大小为 128K</font>：
    ```
    ➜  ~ xxd mdm9607-sysfs.ubi | grep '5542 4923' | head -n 3
    00000000: 5542 4923 0100 0000 0000 0000 0000 0000  UBI#............
    00020000: 5542 4923 0100 0000 0000 0000 0000 0000  UBI#............
    00040000: 5542 4923 0100 0000 0000 0000 0000 0000  UBI#............
    ```

    那么 <font color=red>LEB (Logical Erase Block) = PEB - data_offset = 128-4 = 124KB</font>

* nandsim 命令参数的值

    根据网上的描述，nandsim 后面跟的 4 个参数是 nand flash 芯片的 ID，nandsim 模拟 nand，设备指定的参数需要根据镜像的闪存芯片来选择，可以拆硬件搜索存储芯片的型号，比如 29F1G08ABAEA，然后找对应的数据手册。
    
    或者用关键词 "2k page size nand flash" 进行 google，得到一篇 nand flash 芯片的[手册](https://media-www.micron.com/-/media/client/global/documents/products/data-sheet/nand-flash/60-series/m68m_non_ecc.pdf)，
    重点阅读 Read ID 命令，发现<font color=red>(别人发现的)</font>正是第 4 个参数决定了生成的 mtd 设备的 PEB 和 页大小。
    ![](/img/post/Xnip2024-07-01_08-58-03.png)
    我们的页大小 2KB、PEB 大小为 128K，3.3V，根据上面的表，可以确定 Byte value 为 95h，
    所以 nandsim 模拟 nand 的命令为
    ```
    modprobe nandsim first_id_byte=0x2c second_id_byte=0xf1 third_id_byte=0x80 fourth_id_byte=0x95
    // disk size=128MB, page size=2048 bytes，block size=128KB
    ```

* 挂载 ubi

    模拟闪存设备
    ```
    # 载入 mtd、ubi 内核模块
    root@bad:~# modprobe mtdblock
    root@bad:~# modprobe ubi

    # 载入 nandsim 来模拟 nand 设备
    root@bad:~# modprobe nandsim first_id_byte=0x2c second_id_byte=0xf1 third_id_byte=0x80 fourth_id_byte=0x95
    
    # 检查加入模块的环境，镜像大小 size=128MB，PEB=erasesize=128KB
    root@bad:~# cat /proc/mtd
    dev:    size   erasesize  name
    mtd0: 08000000 00020000 "NAND simulator partition 0"
    root@bad:~# ls -la /dev/mtd*
    crw------- 1 root root 90, 0 Mar 29 17:42 /dev/mtd0
    crw------- 1 root root 90, 1 Mar 29 17:42 /dev/mtd0ro
    brw-rw---- 1 root disk 31, 0 Mar 29 17:42 /dev/mtdblock0
    root@bad:~# mtdinfo /dev/mtd0
    mtd0
    Name:                           NAND simulator partition 0
    Type:                           nand
    Eraseblock size:                131072 bytes, 128.0 KiB
    Amount of eraseblocks:          1024 (134217728 bytes, 128.0 MiB)
    Minimum input/output unit size: 2048 bytes
    Sub-page size:                  512 bytes
    OOB size:                       64 bytes
    Character device major/minor:   90:0
    Bad blocks are allowed:         true
    Device is writable:             true
    ```

    将 ubi 模块关联 /dev/mtd0，使系统可以使用 UBI 来管理闪存设备
    ```
    root@bad:~# modprobe ubi mtd=0
    ```

    使用 UBI 格式化 mtd 块设备，并把 mdm9607-sysfs.ubi 加载到 mtd 块设备
    ```
    # 格式化之前先解绑定
    root@bad:~# ubidetach /dev/ubi_ctrl -m 0
    # 注意：这里要加上 -O 2048 的选项，显式表明 UBI_VID_HDR 的偏移位置是 2KB，而不是默认值。
    # 从上面 mtdinfo /dev/mtd0 的输出结果中，有一项 Sub-page size 的选项，如果不用 -O 显示指定，默认偏移值则是 sub-page size。
    root@bad:~# ubiformat /dev/mtd0 -s 2048 -f mdm9607-sysfs.ubi -O 2048
    ubiformat: mtd0 (nand), size 134217728 bytes (128.0 MiB), 1024 eraseblocks of 131072 bytes (128.0 KiB), min. I/O size 2048 bytes
    libscan: scanning eraseblock 1023 -- 100 % complete
    ubiformat: 1024 eraseblocks are supposedly empty
    ubiformat: flashing eraseblock 485 -- 100 % complete
    ubiformat: formatting eraseblock 1023 -- 100 % complete
    ```

    将闪存设备关联到 ubi 控制器上
    ```
    root@bad:~# ubiattach /dev/ubi_ctrl -m 0 -O 2048
    UBI device number 0, total 1024 LEBs (130023424 bytes, 124.0 MiB), available 0 LEBs (0 bytes), LEB size 126976 bytes (124.0 KiB)
    ```

    挂载 ubi
    ```
    # 创建 ubi 分卷
    root@bad:~# ubimkvol /dev/ubi0 -N ubifs_0 -m
    
    # 挂载 ubi
    root@bad:~# mkdir /mnt/loop
    root@bad:~# mount -t ubifs ubi0 /mnt/loop/
    root@bad:~# ls /mnt/loop/
    ```
    ```
    # 有时候在 UBI 之上会使用 SquashFS，因此常规的挂载方法会失效，将 UBI 用 squashfs 挂载即可
    root@bad:~# dd if=/dev/ubi0_0 of=ubi0_0
    243536+0 records in
    243536+0 records out
    124690432 bytes (125 MB, 119 MiB) copied, 1.10426 s, 113 MB/s
    
    # 可以看到是 Squashfs filesystem
    root@bad:~# xxd ubi0_0 | grep -E 'hsqs|sqsh|sqlz|shsq|hsqt|tqsh'
    00000000: 6873 7173 1f10 0000 e5ed ee64 0000 0200  hsqs.......d....
    root@bad:~# file ubi0_0
    ubi0_0: Squashfs filesystem, little endian, version 4.0, zlib compressed, 60564798 bytes, 4127 inodes, blocksize: 131072 bytes, created: Wed Aug 30 07:21:09 2023
    
    # unsquashfs
    root@bad:~# unsquashfs ./ubi0_0
    Parallel unsquashfs: Using 2 processors
    3848 inodes (3425 blocks) to write
    
    [=====================================================] 7273/7273 100%
    
    created 2560 files
    created 288 directories
    created 1217 symlinks
    created 62 devices
    created 0 fifos
    created 0 sockets
    created 9 hardlinks
    
    root@bad:~# ls squashfs-root
    bin         cache  etc       lib    oemapp   rom   sdcard  system    tmp      var
    boot        data   firmware  media  persist  run   share   systemrw  usr      WEBSERVER
    build.prop  dev    home      mnt    proc     sbin  sys     target    usrdata
    ```

### 0x02 修改固件
添加 telnet 后门，`telnetd -l /bin/sh &`
```
root@bad:~/squashfs-root/rom/XXX/etc# vim oemstart.sh
root@bad:~/squashfs-root/rom/XXX/etc# head oemstart.sh
#!/bin/sh

APPDIR=/rom/XXX/bin
LIBDIR=/rom/XXX/lib
ETCDIR=/rom/XXX/etc
CFGSDIR=/rom/XXX/config

telnetd -l /bin/sh &

export LD_LIBRARY_PATH=${LIBDIR}:${LD_LIBRARY_PATH}
```

### 0x03 打包修改后的根系统文件
需要借助前面 ubiattach 的输出信息，一共 1024 个 LEB，LEB 大小为 126976
```
root@bad:~# ubiattach /dev/ubi_ctrl -m 0 -O 2048
UBI device number 0, total 1024 LEBs (130023424 bytes, 124.0 MiB), available 0 LEBs (0 bytes), LEB size 126976 bytes (124.0 KiB)
```

打包为 img
```
root@bad:~# mkfs.ubifs -m 2048 -e 126976 -c 1024 -r ./squashfs-root mdm9607-sysfs.img
```

打包为 ubi：
-m 页大小
-p PEB 的大小
-O PEB 的偏移
```
root@bad:~# cat ubi_config.ini
[ubi_rfs]
mode=ubi
image=mdm9607-sysfs.img
vol_id=0
vol_size=86470656
vol_type=dynamic
vol_name=system
vol_alignment=1
vol_flags=autoresize

root@bad:~# ubinize -o mdm9607-sysfs1.ubi -m 2048 -p 128KiB -O 2048 ubi_config.ini
```

binwalk 封包
```
root@bad:~# binwalk --dd=your_directory --create-archive your_file.zip
```


**参考资料**
* [固件提取及分析技术](https://www.freebuf.com/articles/ics-articles/262454.html?_blank)
* [挂载和反向制作 ubi 镜像](https://baurine.netlify.app/2015/06/13/mount_and_make_ubi/?_blank)
* [IoT（八）ubi文件系统挂载&解包](https://www.gandalf.site/2019/01/iotubi.html?_blank)
* [固件提取系列-UBI文件系统提取以及重打包](https://gorgias.me/2019/12/27/固件提取系列-UBI文件系统提取以及重打包/?_blank)
