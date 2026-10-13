---
title: 通过 Sphinx 快速查询数据
date: 2021-06-10 16:44:23
description: 搭建社工库，通过 Sphinx 快速查询数据
categories:
  - Pentest
tags:
  - tools
  - 社工
---

### 0x00 Sphinx
Sphinx 是一款基于 SQL 的高性能全文检索引擎，Sphinx 的性能在众多全文检索引擎中也是数一数二的，利用 Sphinx我们可以完成比数据库本身更专业的搜索功能，而且可以有很多针对性的性能优化。

* 快速创建索引：3 分钟左右即可创建近 100 万条记录的索引，并且采用了增量索引的方式，重建索引非常迅速。
* 闪电般的检索速度：尽管是 1 千万条的大数据量，查询数据的速度也在毫秒级以上，2-4G 的文本量中平均查询速度不到 0.1 秒。
* 为很多脚本语言设计了检索 API，如 PHP,Python,Perl,Ruby 等，因此你可以在大部分编程应用中很方便地调用 Sphinx 的相关接口。
* 为 MySQL 设计了一个存储引擎插件，因此如果你在 MySQL 上使用 Sphinx，那简直就方便到家了。
* 支持分布式搜索，可以横向扩展系统性能。

### 0x01 安装
* windows 可以去 [这里](http://sphinxsearch.com/downloads/current/) 下载对应版本，然后添加环境变量
* ubuntu 可以 sudo apt-get install sphinxsearch (sphinxapi.py 要使用对应版本)
* macbook 可以 brew install sphinx (sphinxapi.py 要使用对应版本)

### 0x02 使用 Sphinx 查询的流程
* 通过 Sphinx 的 indexer 生成索引（需要先配置文件 sphinx.conf）  
    部分索引：indexer -c ./sphinx.conf \<index_name>  
    全部索引：indexer -c ./sphinx.conf -\-all  
    若 searchd 已启动则需要加 -\-rotate 参数：indexer -c ./sphinx.conf -\-all -\-rotate

* Sphinx 启动一个 searchd 进行监听（调接口）  
    searchd -c ./sphinx.conf --console

* 查询时把关键字给 Sphinx 的接口，searchd 返回 id  
    searchd 返回的 id 是该关键字在数据库中对应的 id

* 在数据库中根据 id 查数据

### 0x03 Sphinx 配置文件编写


下面索引了两个库中的两个表

一个是 37wan_com 库的 cdb_members、cdb_uc_members 表，索引的 username,email 这两列

一个是 3pk_com 库的 member 表，索引的 uname,email 这两列

```ini
source base_source {
    type = mysql

    sql_host = 127.0.0.1
    sql_user = root
    sql_pass = root
    sql_port = 3306
    # sql_db = tttttmp # 需要建索引的数据库名字

    sql_query_pre = SET NAMES utf8 # 定义查询时的编码
    # sql_query = select id,content from test # 设置要做索引的字段，包含至少一个唯一主键，这里会索引 id、content 这个两个字段
}
index base_index {
    min_word_len = 1 # 最小索引词长度,小于这个长度的词不会被索引

    min_prefix_len = 3 # 最小索引前缀(搜索关键字长度至少为3) 12345* 得到 12345xxxxxx
    # min_infix_len = 3 # 最小索引中缀(搜索关键字长度至少为3) *aaa* 得到 xxxxxaaa、xxxxxaaaxxxxx、aaaxxxxx

    # 不按照词典，而是按照字长来分词，主要针对非英文体系的语言，如果指定为1，搜 丰 得到 张丰、邓丰至、丰年
    ngram_len = 2
    # 需要分词的字符，如果要搜索中文，需要配置 ngram_chars
    # U+3000..U+2FA1F是汉字。为了能搜到完整邮箱：添加 U+0040,U+002D,U+002E 代表 @,-,.
    ngram_chars = U+3000..U+2FA1F,U+0040,U+002D,U+002E

    html_strip = 1 # html标记清理,是否从输出全文数据中去除HTML标记

    # source = base_source # 这里与上面的source对应
    # path = ./sphinx_data/index/base_source # 索引文件存放路径及索引的文件名
}

source 37wan_com_cdb_members:base_source {
    sql_db = 37wan_com
    sql_query = select id,username,email from cdb_members
}
index 37wan_com_cdb_members:base_index {
    source = 37wan_com_cdb_members
    path = /opt/sgk/sphinx_data/index/37wan_com_cdb_members # 索引文件存放路径及索引的文件名
}

source 37wan_com_cdb_uc_members:base_source {
    sql_db = 37wan_com
    sql_query = select id,username,email from cdb_uc_members
}
index 37wan_com_cdb_uc_members:base_index
{
    source = 37wan_com_cdb_uc_members
    path = /opt/sgk/sphinx_data/index/37wan_com_cdb_uc_members
}

source 3pk_com_member:base_source {
    sql_db = 3pk_com
    sql_query = select id,email,uname as username from member
}
index 3pk_com_member:base_index {
    source = 3pk_com_member
    path = /opt/sgk/sphinx_data/index/3pk_com_member
}


indexer
{
    mem_limit = 512M # 用来构建索引的索引器运行所占用的内存
}
searchd
{
    listen = 127.0.0.1:23333 # 查询服务监听的端口
    # listen = 127.0.0.1:3333:mysql41 # mysql -h localhost -P 3333; show tables 可查看生成的索引
    pid_file = ./sphinx_data/searchd.pid

    log = ./sphinx_data/logs/searchd.log # 监听日志
    query_log = ./sphinx_data/logs/query.log # 查询日志
    binlog_path = # 二进制日志路径，这里禁止掉

    read_timeout = 5 # 客户端读超时时间
    max_children = 30 # 并行执行搜索的数目
    seamless_rotate = 1 # 启动无缝轮转，防止 searchd 轮换在需要预取大量数据的索引时停止响应
    preopen_indexes = 0 # 索引预开启，是否强制重新打开所有索引文件，索引比较多时如果设置为 1 会出现 Too many open files 错误
    unlink_old = 1 # 索引轮换成功之后，是否删除以.old为扩展名的索引拷贝
    dist_threads = 12 # 并发查询线程数
}
```

### 0x04 Sphinx 索引
* 生成索引

```
indexer -c ./sphinx.conf --all
Sphinx 3.3.1 (commit b72d67bc)
Copyright (c) 2001-2020, Andrew Aksyonoff
Copyright (c) 2008-2016, Sphinx Technologies Inc (http://sphinxsearch.com)

using config file './sphinx.conf'...
indexing index '37wan_com_cdb_members'...
collected 34219 docs, 0.8 MB
sorted 0.1 Mhits, 100.0% done
total 34219 docs, 835.3 Kb
total 0.4 sec, 1.915 Mb/sec, 78452 docs/sec
indexing index '37wan_com_cdb_uc_members'...
collected 34219 docs, 0.8 MB
sorted 0.1 Mhits, 100.0% done
total 34219 docs, 835.2 Kb
total 0.4 sec, 2.048 Mb/sec, 83899 docs/sec
indexing index '3pk_com_member'...
collected 10007 docs, 0.3 MB
sorted 0.0 Mhits, 100.0% done
total 10007 docs, 258.6 Kb
total 0.2 sec, 1.707 Mb/sec, 66041 docs/sec
```

* 启动 searchd 守护进程

```
searchd -c ./sphinx.conf --console
Sphinx 3.3.1 (commit b72d67bc)
Copyright (c) 2001-2020, Andrew Aksyonoff
Copyright (c) 2008-2016, Sphinx Technologies Inc (http://sphinxsearch.com)

using config file './sphinx.conf'...
listening on all interfaces, port=23333
listening on all interfaces, port=3333
precaching index '37wan_com_cdb_members'
precaching index '37wan_com_cdb_uc_members'
precaching index '3pk_com_member'
precached 3 indexes using 3 threads in 0.0 sec
accepting connections
```

### 0x05 Sphinx 使用
```py
import pymysql
from sphinxapi import *

limit = 200
sphinx = SphinxClient()
sphinx.SetServer("localhost", 23333) # 设置连接 sphinx 的 searched
sphinx.SetConnectTimeout(5.0)
sphinx.SetLimits(0, limit, max(limit,1000))

sgk_index_msg = [
    {
        "index": "37wan_com_cdb_members",
        "db_name": "37wan_com",
        "table_name": "cdb_members",
        "columns": "id,username,password,email"
    },
    {
        "index": "37wan_com_cdb_uc_members",
        "db_name": "37wan_com",
        "table_name": "cdb_uc_members",
        "columns": "id,username,password,email,salt"
    },
    {
        "index": "3pk_com_member",
        "db_name": "3pk_com",
        "table_name": "member",
        "columns": "id,email,uname as username,password"
    }
]

all_results = list()
try:
    mysql_uri = "mysql+pymysql://root:root@localhost:3306/mysql?charset=utf8mb4"
    sqlconn = MySQLX(mysql_uri)
    for index_dict in sgk_conf:
        index = index_dict.get("index")
        db_name = index_dict.get("db_name")
        table_name = index_dict.get("table_name")
        columns = index_dict.get("columns")

        res = sphinx.Query(keyword, index)
        # print(keyword, index, res)
        if res and res["total_found"]:
            ids = [str(x["id"]) for x in res["matches"]]
            ids = ",".join(ids)

            sql = "select {} from {}.{} where id in({})".format(columns, db_name, table_name, ids)
            results = sqlconn.query(sql)
            for result in results:
                _tmp = dict()
                _tmp["id"] = result.get("id", "")
                _tmp["from"] = db_name
                _tmp["uid"] = result.get("uid", "")
                _tmp["username"] = result.get("username", "")
                _tmp["password"] = result.get("password", "")
                _tmp["salt"] = result.get("salt", "")
                _tmp["mobile"] = result.get("mobile", "")
                _tmp["email"] = result.get("email", "")
                all_results.append(_tmp)
except Exception as e:
    print(e)
```
