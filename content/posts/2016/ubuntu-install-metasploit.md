---
draft: false
date: 2016-08-18 10:38:41
title: Ubuntu 下安装 Metasploit
description: 在 Ubuntu 下安装渗透测试工具 Metasploit
categories:
  - Pentest
tags:
  - tools
  - intranet
---

### 0x00 安装Metasploit
* 下载msfinstall脚本
```
$ curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall
```

* 修改文件权限
```
$ chmod 755 msfinstall
```

* 安装(可能时间较久)
```
$ ./msfinstall
```

* 更新exp
```
$ msfupdate
```

### 0x01 连接数据库
* 首先启动postgresql数据库
```
$ /etc/init.d/postgresql start #service postgresql start也可以
```

* 初始化MSF数据库(关键步骤)
```
$ msfdb init
```

* 运行msfconsole
```
$ msfconsole
```

* 在msf中查看数据库连接状态
```
msf > db_status
#若出现错误：Module database cache not built yet, using slow search
#则重新构建缓存，缓存构建通常需要5-10分钟左右。
#构建完成后，退出Metasploit控制台，然后重新进入即可使用数据库缓存进行搜索模块
msf > db_rebuild_cache
```

### 0x02 Metasploit Cheat Sheet
常见命令可以看下 [https://www.comparitech.com/net-admin/metasploit-cheat-sheet/](https://www.comparitech.com/net-admin/metasploit-cheat-sheet/?_blank)
