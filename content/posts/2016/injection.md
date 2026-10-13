---
draft: false
date: 2016-06-19 20:18:48
title: SQL 注入
description: 
categories:
  - Pentest
tags:
  - SQL注入
---

### 0x00 含义
sql注入是将代码插入(拼接)到应用(用户)的输入参数中，之后再将这些参数传递给后台的SQL服务器加以解析并执行的攻击，

总结起来就是攻击者将恶意代码拼接到sql语句并加以执行从而得到数据的过程。

### 0x01 成因
SQl语句未对用户参数进行严格过滤

### 0x02 可引发注入的地方
其实只要是客户端可控、参数值代入数据库查询的地方都可能存在注入，常见的如下，按出现频率排序：

* GET
* POST
* X-Forwarded-For
* Cookie
* User-Agent

### 0x03 注入分类
* 根据语法(较权威)
    * UNION query SQL injection(可联合查询注入)  
        只要页面有显示位即可使用，且注入速度很快
    * Error-based SQL injection(报错型注入)  
        没有显示位但用echo "mysql_error()"输出了错误信息，速度很快，但是语句较复杂
    * Boolean-based blind SQL injection(布尔型注入)  
        一次一个字节，速度慢，但只要有注入就能用
    * Time-based blind SQL injection(基于时间延迟注入)  
        超级慢，比布尔型注入慢几倍，但是通用性较强
    * Stacked queries SQL injection(堆叠注入)  
        只有SQL Server可以使用(可多语句查询注入)

* 根据类型
    * 整形  
        形如```"a.asp?ID=55"```，这类注入的参数是"数字"，因此称为"数字型注入点"。
    * 字符串型  
        形如```"b.asp?name=xiaoming"```这类注入的参数是"字符"，称为"字符型"注入点。  
    * 搜索型  
        指在进行数据搜索时没过滤搜索参数，直接通过搜索框表单提交。  

### 0x04 查找注入点
* 在URL中
    * and 1=1/and 1=2(整型)
    * 随即输入(整型)
    * -1/+1 回显上下页面(整型)
    * 单引号(字符型/整型)
    * and sleep(5) (判断页面返回时间)

* 在http头
    * X-Forwarded-For
    * Cookie
    * User-Agent

### 0x05 SQL注入之判断数据库类型
* 常见手段
    * 扫描端口、指纹、抓包查看http头信息、在网址后面直接判断

* 根据各数据库特有函数判断
    * Access:
    ```
    and (select count(*) from MSysAccessObjects)>0   返回正常说明是access
    and exists(select count(*) from表)
    ID=1 and (select count (*) from sysobjects)>0 返回异常
    ID=1 and (select count (*) from msysobjects)>0返回异常
    ```

    * SQLServer:
    ```
    and (select count(*) from sysobjects) >0   返回正常说明是mssql
    ID=1 and (select count (*) from sysobjects)>0 返回正常
    ID=1 and (select count (*) from msysobjects)>0返回异常
    ID=1 and left(version(),1)=5%23  //红色字体也可能是4
    ID=1 and exists(select id from sysobjects)
    ID=1 and len(user)>0 
    ID=1 CHAR(97)+CHAR(110)+CHAR(100)+CHAR(32)+CHAR(49)+CHAR(61)+CHAR(49)
    ```

    * MySQL:
    ```
    and length(user())>0   返回正常说明是MySQL
    id=2 and version()>0 返回正常
    id=2 and length(user())>0
    id=2 CHAR(97, 110, 100, 32, 49, 61, 49)
    ```

    * ORACLE:
    ```
    ID=1  and '1'||'1’='11'
    ID=1  and 0<>(select count(*) from dual) 
    ID=1 CHR(97) || CHR(110) || CHR(100) || CHR(32) || CHR(49) || CHR(61) || CHR(49)
    ```

* 其他方法
    ```
    "/*"是MySQL中的注释符，返回错误说明该注入点不是MySQL，继续提交如下查询字符：
    "--"是Oracle和MSSQL支持的注释符，如果返回正常，则说明为这两种数据库类型之一。继续提交如下查询字符：
    ";"是子句查询标识符，Oracle不支持多行查询，因此如果返回错误，则说明很可能是Oracle数据库。
    ```
