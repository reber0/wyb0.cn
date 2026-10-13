---
draft: false
date: 2016-07-24 21:33:59
title: Windows 下用 Proxifier 实现全局代理
description: 
categories:
  - Other
tags:
  - 代理
  - tools
---

### 0x00 环境
在windows下用Shadowsocks和Proxifier实现全局代理：
```
System：Windows10 Pro x64
Shadowsocks：Shadowsocks v2.5.2.0 
Proxifier：Proxifier Portable Edition v3.29
```

### 0x01 配置Shadowsocks
![Windows下实现全局代理-设置shadowsocks](/img/post/global_agent_set_shadowsocks.png)

### 0x02 配置Proxifier
* Proxifier添加代理服务
![Windows下实现全局代理-添加代理服务1](/img/post/global_agent_proxifier_add_proxy_servers1.png)
![Windows下实现全局代理-添加代理服务2](/img/post/global_agent_proxifier_add_proxy_servers2.png)
![Windows下实现全局代理-检测添加的代理](/img/post/global_agent_proxifier_check_proxy.png)


* Proxifier添加规则
![Windows下实现全局代理-设置规则1](/img/post/global_agent_proxifier_set_rules1.png)
![Windows下实现全局代理-设置规则2](/img/post/global_agent_proxifier_set_rules2.png)
![Windows下实现全局代理-添加规则1](/img/post/global_agent_proxifier_add_rules1.png)
![Windows下实现全局代理-添加规则2](/img/post/global_agent_proxifier_add_rules2.png)

* 测试全局代理设置成功与否
![Windows下实现全局代理-测试全局代理是否设置成功1](/img/post/global_agent_test1.png)
![Windows下实现全局代理-测试全局代理是否设置成功2](/img/post/global_agent_test2.png)