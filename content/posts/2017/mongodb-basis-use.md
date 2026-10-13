---
draft: false
date: 2017-05-25 15:33:12
title: MongoDB 的基本使用
description: 
categories:
  - Database
tags:
  - mongodb
---


### 0x00 角色和权限
Mongo的授权采用了角色授权的方法，每个用户都有一组权限，Monog内建角色权限如下：

* 数据库用户角色
    * read：允许用户读取指定数据库
    * readWrite：允许用户读写指定数据库
* 数据库管理角色
    * dbOwner：包含readWrite、dbAdmin、userAdmin
    * dbAdmin：允许用户在指定数据库中对集合、文档等操作
    * userAdmin：允许用户向system.users集合写入，可以在指定数据库里创建、删除和管理用户
* 集群管理角色
    * clusterAdmin：只在admin数据库中可用，包含clusterManager、clusterMonitor、hostManager 
    * clusterManager：
    * clusterMonitor：
    * hostManager
* 备份和恢复角色
    * backup
    * restore
* 所有数据库角色
    * readAnyDatabase：只在admin数据库中可用，赋予用户所有数据库的读权限
    * readWriteAnyDatabase：只在admin数据库中可用，赋予用户所有数据库的读写权限
    * dbAdminAnyDatabase：只在admin数据库中可用，赋予用户所有数据库的dbAdmin权限
    * userAdminAnyDatabase：只在admin数据库中可用，赋予用户所有数据库的userAdmin权限
* 超级用户角色
    * root：只在admin数据库中可用。超级账号，超级权限
* 内部角色
    * \__system

### 0x01 创建用户
```
#创建管理员用户
> use admin
switched to db admin
> db.createUser({
... user:"root",
... pwd:"root123",
... roles:[{"role":"root","db":"admin"}]
... })
Successfully added user: {
        "user" : "root",
        "roles" : [
                {
                        "role" : "root",
                        "db" : "admin"
                }
        ]
}
> db.auth("root","root123")
1

#这个例子创建了一个名为 root 的用户管理员。创建完了这个用户之后，我们应该马上以该用户的身份登录：
#db.auth() 方法返回 1 表示登录成功。接下来我们为指定的数据库创建访问所需的账号。

#创建数据库用户
> use test
switched to db test
> db.createUser({
... user:"test",
... pwd:"test123",
... roles:[
... {"role":"readWrite","db":"test"},
... {"role":"dbOwner","db":"test"}]
... })
Successfully added user: {
        "user" : "test",
        "roles" : [
                {
                        "role" : "readWrite",
                        "db" : "test"
                },
                {
                        "role" : "dbOwner",
                        "db" : "test"
                }
        ]
}
> db.auth("test","test123")
1
> exit
bye
```

### 0x02 配置
MongoDb版本：version v3.4.4
```
#配置文件如下
$ sudo vim /etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  fork: true

#MongoDB默认不需要密码,这里设置为enabled则访问时需要密码
security:
  authorization: enabled
```
```bash
#启动服务(通过配置文件)
$ sudo mongod --config /etc/mongod.conf

#关闭服务(需要进入数据库)
$ mongo
> use admin
#此时就需要验证后才能进行操作
> db.auth('root','root123')
1
> db.shutdownServer()
```

### 0x03 数据库
```
$ mongo

#创建数据库，创建数据库后只有插入一条数据才能保存数据库
> use test

#查看所有数据库
> show dbs

#查看当前数据库
> db

#删除数据库
>use test
switched to db test
>db.dropDatabase()
{ "dropped" :  "test", "ok" : 1 }
```

### 0x04 集合
```
#创建集合
> use test
> db.createCollection("msg")
{ "ok" : 1 }
> db.createCollection("book")
{ "ok" : 1 }

#查看集合
> show collections
msg
book

#删除集合
> db.book.drop()
true
> show collections
msg
```

### 0x05 文档
```
#插入文档,若student这个集合不存在时会自动创建集合student
> db.student.insert({"name":"xiaoming","sex":1})
WriteResult({ "nInserted" : 1 })
> db.student.insert({
... name:'xiaohong',
... sex:0
... })

#查询文档
> db.student.findOne()
{ "_id" : ObjectId("59267f1c7e72bcd757917260"), "name" : "xiaoming", "sex" : 1 }
> db.student.find()
{ "_id" : ObjectId("59267f1c7e72bcd757917260"), "name" : "xiaoming", "sex" : 1 }
{ "_id" : ObjectId("59267f397e72bcd757917261"), "name" : "xiaohong", "sex" : 0 }
> db.student.find().pretty()
{
        "_id" : ObjectId("59267f1c7e72bcd757917260"),
        "name" : "xiaoming",
        "sex" : 1
}
{
        "_id" : ObjectId("59267f397e72bcd757917261"),
        "name" : "xiaohong",
        "sex" : 0
}
> db.student.find({age:32}).pretty()   相当于查询age=32的
> db.student.find({sex:0,age:32}).pretty()   相当于sex=0 and age=32

#更新文档，相当于set age=23 where name='xiaohong'
> db.student.update({name:'xiaohong'},{$set:{age:23}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })

#删除文档
> db.student.remove({name:'xiaojuan'})  删除所有名字为xiaojuan的这条数据
WriteResult({ "nRemoved" : 1 })
> db.student.remove({sex:1},1)  只删除一条性别为1的数据
WriteResult({ "nRemoved" : 1 })
```

### 0x06 其他
```
#排序
> db.student.find()
{ "_id" : ObjectId("592681367e72bcd757917262"), "name" : "xiaohong", "sex" : 0, "age" : 30 }
{ "_id" : ObjectId("5926814d7e72bcd757917264"), "name" : "xiaohua", "sex" : 1, "age" : 24 }
> db.student.find().sort({"age":1})
{ "_id" : ObjectId("5926814d7e72bcd757917264"), "name" : "xiaohua", "sex" : 1, "age" : 24 }
{ "_id" : ObjectId("592681367e72bcd757917262"), "name" : "xiaohong", "sex" : 0, "age" : 30 }

#备份与还原
$ mongodump 会备份到当前的dump文件夹中
$ mongorestore 会把dump中的数据导入到mongo
```

### 0x07 python连接MongoDB
```
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pymongo

#创建连接
client = pymongo.MongoClient("localhost", 27017)

#连接数据库
db = client["test"]

#如果有密码的话要先验证下
#db.authenticate('username','password')

#选择集合(相当于mysql中的选择表)
collection = db["msg"]

#输出集合的第一条数据
print collection.find_one()
```

### 0x08 遇到的问题
```
#非正常停止后再次启动可能会遇到：
about to fork child process, waiting until server is ready for connections.
forked process: 2221
ERROR: child process failed, exited with error number 1

解决方案，使用sudo权限：
$ sudo mongod --config /etc/mongod.conf
```
