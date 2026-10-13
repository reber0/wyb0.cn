---
draft: false
date: 2017-05-30 12:53:41
title: SQLServer 的基本使用
description: 
categories:
  - Database
tags:
  - sqlserver
---

### 0x00 数据库
```
-- 创建数据库
CREATE DATABASE student;

-- 选择数据库
USE student;

-- 查看当前数据库
SELECT DB_NAME();

-- 查看当前数据库
SELECT DB_NAME();

-- 查看数据库版本
SELECT @@version;
```

### 0x01 数据表
```
-- 创建数据库表
CREATE TABLE info
(
    id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    name VARCHAR(20) NOT NULL DEFAULT 'xiaoming',
    sex INT NOT NULL DEFAULT 1
)

-- 查看表结构
EXEC sp_help 'info';

-- 更新表结构
ALTER TABLE info add age int; -- 添加一列
ALTER TABLE info DROP COLUMN age; -- 删除一列

-- 插入数据
INSERT INTO info(name,sex)
VALUES('xiaohong',0);

-- 查看数据
SELECT * FROM dbo.info;

-- 更新数据
UPDATE info
SET name='aaa',sex=1
WHERE id=1;

-- 删除数据
DELETE info
WHERE id=1;

-- 删除表
DROP TABLE info;
```