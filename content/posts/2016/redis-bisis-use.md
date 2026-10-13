---
draft: false
date: 2016-08-03 11:02:20
title: 一次存储型 XSS 利用实例
description: 
categories:
  - Server
  - Database
tags:
  - server
  - redis
---

### 0x00 关于Redis
```
Redis和MySQL这种关系型数据库不一样，它是非关系型数据库，是日志型、Key-Value数据库，
实现了master-slave(主从)同步,数据都是缓存在内存中的,所以可高速读写,但存储成本较高,
不适合做海量数据存储。
```

### 0x01 安装
* Linux下安装Redis
可在http://download.redis.io/releases/ 下载
```
$ cd /opt
$ wget http://download.redis.io/releases/redis-3.2.3.tar.gz
$ tar -zxvf redis-3.2.3.tar.gz
$ cd redis-3.2.3
$ make
$ make install
```

* Windows下安装Redis
下载：<a href="https://github.com/MSOpenTech/redis/releases" target="_blank">点此下载</a>

安装后添加环境变量

```
添加为系统服务：
redis-server.exe --service-install redis.windows.conf --loglevel verbose

启动服务：
redis-server.exe --service-start

关闭服务：
redis-server.exe --service-stop

为Redis添加密码：
打开安装目录下的文件redis.windows-service.conf，
找到requirepass，配置为requirepass mypassword，然后重启redis
此时仍然可以连接上，但是执行命令时会提示没权限

带密码连接Redis：
redis-cli.exe -h 127.0.0.1 -p 6379 -a mypassword
```

### 0x02 产生的可执行文件
```
redis-server：redis服务器启动程序
redis-cli：redis命令行工具，也可为客户端
redis-stat：redis状态检测工具
redis-benchmark：redis性能检测工具(读写)
```

### 0x03 配置文件
```
$ vim /opt/redis-3.2.3/redis.conf
  daemonize yes  # 当值为yes时可以后台运行
  bind 127.0.0.1  # 绑定ip，配置后只接受来自该ip的请求
  port 6379  # 监听端口
  timeout 300 # 客户端连接超时时间，单位为秒
  loglevel notice  # 日志等级分为4级，debug、verbose、notice、warning
  logfile "/var/log/redis.log"  # 日志文件位置
  databases 16  # 数据库数量
  sava 900 1  # 设置数据库镜像的频率
  dbfilename dump.rdb  # 镜像备份文件的名字
  dir ./ 数据库镜像备份保存路径
  # slaveof <masterip> <masterport>  # 设置这个redis为从服务器
  # masterauth <master-password>  # 主服务器连接需要的密码验证
  # requirepass 123456  # 登陆时的密码
  maxclients 10000  # 最大连接的客户数量
  # mexmemory <bytes>  # redis能够使用的最大内存
  appendonly no  # 可以设置是否只能追加
```

### 0x04 启动测试
```
本地启动：
$ redis-server /opt/redis-3.2.3/redis.conf  # 启动服务
$ ps -aux | grep redis
```

```cs
# 客户端连接
$ redis-cli

# 连接远程redis
$ redis-cli -h host -p port -a password
/*
$ redis-cli -h host -p port
127.0.0.1:6379> keys *
(error) NOAUTH Authentication required.
127.0.0.1:6379> auth password
OK
*/

# 查看所有键值
127.0.0.1:6379> keys *

# 选择数据库
127.0.0.1:6379> select 0 #可以选择0～15

# 获取redis安装目录
127.0.0.1:6379> config get dir
1) "dir"
2) "/var/lib/redis"

# 备份(恢复数据时只需要将备份文件放在redis安装目录即可)
127.0.0.1:6379> save
OK
127.0.0.1:6379> exit
```

### 0x06 数据类型
* String(字符串)
    * string是redis最基本的类型，你可以理解成与Memcached一模一样的类型，一个key对应一个value。
    * string类型是二进制安全的。意思是redis的string可以包含任何数据。比如jpg图片或者序列化的对象。
    * string类型是Redis最基本的数据类型，一个键最大能存储512MB。
    ```cs
    # 添加键值对
    127.0.0.1:6379> set name "xiaoming"
    # 获取键值
    127.0.0.1:6379> get name
    # 删除键值对
    127.0.0.1:6379> del name
    ```

* Hash(哈希)
    * Redis hash 是一个键名对集合。
    * Redis hash是一个string类型的field和value的映射表，hash特别适合用于存储对象。
    ```cs
    # Hash中一个key对应多个值
    127.0.0.1:6379> hmset student1 name "xiaohong" age "18"
    OK
    127.0.0.1:6379> hmset student2 name "xiaoliu" age "23"
    OK
    127.0.0.1:6379> hgetall student1
    1) "name"
    2) "xiaohong"
    3) "age"
    4) "18"
    127.0.0.1:6379> hgetall student2
    1) "name"
    2) "xiaoliu"
    3) "age"
    4) "23"
    ```

* List(列表)
    * Redis 列表是简单的字符串列表，按照插入顺序排序。
    * 可以添加一个元素到列表的头部（左边）或者尾部（右边）。
    ```cs
    # 字符串列表
    127.0.0.1:6379> lpush list1 "python"
    (integer) 1
    127.0.0.1:6379> lpush list1 "php"
    (integer) 2
    127.0.0.1:6379> lpush list1 "asp"
    (integer) 3
    127.0.0.1:6379> lpush list1 "jsp"
    (integer) 4
    127.0.0.1:6379> rpush list2 "aaaa"
    (integer) 1
    127.0.0.1:6379> rpush list1 "aaaa"
    (integer) 5
    127.0.0.1:6379> lrange list1 0 10
    1) "jsp"
    2) "asp"
    3) "php"
    4) "python"
    5) "aaaa"
    127.0.0.1:6379> lindex list1 3
    "python"
    127.0.0.1:6379> llen list1
    (integer) 5
    127.0.0.1:6379> lpop list1
    "jsp"
    127.0.0.1:6379> rpop list1
    "aaaa"
    ```
* Set(集合)
    * Redis的Set是string类型的无序集合。
    * 集合内元素是唯一的，后者会覆盖前者。
    * 集合是通过哈希表实现的，所以添加，删除，查找的复杂度都是O(1)。
    ```cs
    # String类型的无序集合
    127.0.0.1:6379> sadd set1 "333"
    (integer) 1
    127.0.0.1:6379> sadd set1 "222"
    (integer) 1
    127.0.0.1:6379> sadd set1 "111"
    (integer) 1
    127.0.0.1:6379> sadd set1 "111"
    (integer) 0
    127.0.0.1:6379> sadd set1 "000"
    (integer) 1
    127.0.0.1:6379> smembers set1
    1) "000"
    2) "222"
    3) "333"
    4) "111"
    ```
* zset(有序集合)
    * Redis zset 和 set 一样也是string类型元素的集合,且不允许重复的成员。
    * zset每个元素都会关联一个double类型的分数。redis正是通过分数来为集合中的成员进行从小到大的排序。
    * zset的成员是唯一的,但分数(score)却可以重复。
    ```cs
    # String类型的有序集合
    127.0.0.1:6379> zadd zset1 2 "222"
    (integer) 1
    127.0.0.1:6379> zadd zset1 1 "111"
    (integer) 1
    127.0.0.1:6379> zadd zset1 3 "333"
    (integer) 1
    127.0.0.1:6379> zadd zset1 3 "333"
    (integer) 0
    127.0.0.1:6379> zadd zset1 0 "000"
    (integer) 1
    127.0.0.1:6379> zrange zset1 0 10
    1) "000"
    2) "111"
    3) "222"
    4) "333"
    127.0.0.1:6379> zadd zset1 0 "555"
    (integer) 1
    127.0.0.1:6379> zrange zset1 0 10
    1) "000"
    2) "555"
    3) "111"
    4) "222"
    5) "333"
    127.0.0.1:6379> zrange zset1 0 10 withscores
     1) "000"
     2) "0"
     3) "555"
     4) "0"
     5) "111"
     6) "1"
     7) "222"
     8) "2"
     9) "333"
    10) "3"
    ```
