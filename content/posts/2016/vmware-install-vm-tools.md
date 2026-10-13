---
draft: false
date: 2016-07-20 08:30:53
title: 虚拟机下安装 vm-tools
description: 
categories:
  - Other
tags:
  - 虚拟机
---

vm-tools安装后可以在客户机和虚拟机间双向复制文件

### 0x00 安装
![vm-tools挂载光盘](/img/post/vm_tools_mount_cd.png)

![vm-tools拷贝并解压安装包](/img/post/vm_tools_copy_and_unzip.png)

![vm-tools安装](/img/post/vm_tools_install.png)

![vm-tools安装完成](/img/post/vm_tools_install_complete.png)

### 0x01 Kali2.0
一般安装的话按照上面的步骤即可安装成功，但是Kali2.0不行，可以用如下方法安装：
![vm-tools在Kali2.0下的安装1](/img/post/vm_tools_kali2.0_install1.png)

![vm-tools在Kali2.0下的安装2](/img/post/vm_tools_kali2.0_install2.png)

```
安装后可以终端输入：dpkg-reconfigure locales，在弹出的界面选择zh_CN.UTF-8设置语言为中文
可以用vim /root/.config/user-dirs.dirs将"桌面"修改为"Desktop"
```