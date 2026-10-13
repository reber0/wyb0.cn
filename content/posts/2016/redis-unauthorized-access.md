---
draft: false
date: 2016-08-04 15:52:26
title: Redis 未授权访问漏洞
description: 
categories:
  - Pentest
tags:
  - redis
  - 逻辑漏洞
---

### 0x00 Redis的未授权访问
若Redis服务器对公网开放，且未启用认证，则攻击者可以未授权访问服务器。

若Redis以root身份运行，黑客可以给root账户写入SSH公钥文件，通过SSH登录受害服务器。

### 0x01 写shell
连接目标主机的redis写文件
![65](/img/post/redis_install_conn_and_write_file.png)
![60](/img/post/redis_install_visit_file.png)

### 0x02 向Redis服务器上传SSH公钥
![60](/img/post/redis_unauthorized_access_create_keys.png)
![60](/img/post/redis_unauthorized_access_export_pubkey.png)
![60](/img/post/redis_unauthorized_access_write_pubkey.png)
![75](/img/post/redis_unauthorized_access_use_sshkey_login.png)

### 0x03 通过计划任务反弹shell
![65](/img/post/redis_unauthorized_access_write_cron.png)
![65](/img/post/redis_unauthorized_access_listen_port.png)
