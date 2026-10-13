---
title: Gophish 钓鱼测试
date: 2021-09-26 11:45:33
description: 渗透测试中的钓鱼邮件测试，通过 Gophish 给目标用户发送精心构造的钓鱼邮件，之后提示学习如何防范钓鱼邮件。
categories:
  - Pentest
tags:
  - 钓鱼
---


### 0x00 Gophish 使用
  * 配置 Gophish 服务
  * 配置发送邮箱
  * 编写钓鱼邮件内容
  * 编写钓鱼页面
  * 添加目标邮箱
  * 开始攻击

### 0x01 配置 Gophish 服务

在 [https://github.com/gophish/gophish/releases](https://github.com/gophish/gophish/releases?_blank) 下载

然后编辑 config.json，之后直接 ./gophish 运行即可
```json
{
    "admin_server": {
        "listen_url": "0.0.0.0:58001", // Gophish 管理页面
        "use_tls": true,
        "cert_path": "gophish.crt",
        "key_path": "gophish.key"
    },
    "phish_server": {
        "listen_url": "0.0.0.0:58002", // 钓鱼的 web 服务
        "use_tls": false,              // 不使用 tls，web 服务地址为 http://x.x.x.x:58002/
        "cert_path": "gophish.crt",
        "key_path": "gophish.key"
    },
    "db_name": "sqlite3",
    "db_path": "gophish.db",
    "migrations_prefix": "db/db_",
    "contact_address": "",
    "logging": {
        "filename": "",
        "level": ""
    }
}
```

### 0x02 配置发送邮箱

Sending Profiles -> New Profile -> 填写相关信息 -> Send Test Email
![90](/img/post/Xnip2021-12-06_14-22-06.jpg)
![65](/img/post/Xnip2021-12-06_14-24-28.jpg)

收到测试邮件证明配置成功
![65](/img/post/Xnip2021-12-06_14-27-19.jpg)

### 0x03 编写钓鱼邮件内容

添加邮件模版，Add files 可以添加附件
![90](/img/post/Xnip2021-12-06_15-30-58.jpg)

其他模版例子
![70](/img/post/Xnip2021-12-06_15-33-46.jpg)
![70](/img/post/Xnip2021-12-06_15-34-39.jpg)

### 0x04 编写钓鱼页面
我的一个模版文件：[Gophish 钓鱼页面模版.html](https://raw.githubusercontent.com/reber0/Resources/main/gophish_钓鱼页面模版.html?_blank)  
可以通过 Source 编写 html，也可以直接通过 url 导入，勾选获取提交的数据，设置用户点击提交数据后跳转的页面
![90](/img/post/Xnip2021-12-06_14-30-09.jpg)

### 0x05 添加目标邮箱

可以一个个添加，也可以通过 csv 文件批量添加
![90](/img/post/Xnip2021-12-06_16-07-04.jpg)

### 0x06 开始攻击

![90](/img/post/Xnip2021-12-06_16-16-10.jpg)

用户点击邮件中的链接后如下：
![80](/img/post/Xnip2021-12-06_16-24-52.jpg)
![80](/img/post/Xnip2021-12-06_16-25-27.jpg)

### 0x07 查看结果

![](/img/post/Xnip2021-12-06_16-20-19.jpg)

数据概览
![](/img/post/Xnip2021-12-06_16-21-33.jpg)

查看详情
![](/img/post/Xnip2021-12-06_16-22-14.jpg)
