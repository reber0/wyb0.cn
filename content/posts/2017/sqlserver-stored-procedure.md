---
draft: false
date: 2017-05-30 13:16:18
title: SQLServer 存储过程
description: 
categories:
  - Database
tags:
  - sqlserver
---

### 0x00 数据表结构
```
CREATE DATABASE student;

CREATE TABLE info
(
    id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    name VARCHAR(20) NOT NULL DEFAULT 'xiaoming',
    sex INT NOT NULL DEFAULT 1,
    age INT NOT NULL DEFAULT 0,
    hight INT NOT NULL DEFAULT 0
)

INSERT INTO info(name,sex,age,hight) VALUES('xiaohong',0,23,165);
INSERT INTO info(name,sex,age,hight) VALUES('xiaogang',1,24,175);
INSERT INTO info(name,sex,age,hight) VALUES('xiaoliu',1,21,160);
INSERT INTO info(name,sex,age,hight) VALUES('xiaozhang',1,19,165);
INSERT INTO info(name,sex,age,hight) VALUES('xiaoli',1,23,170);
INSERT INTO info(name,sex,age,hight) VALUES('xiaohua',0,23,160);
INSERT INTO info(name,sex,age,hight) VALUES('xiaoming',1,21,165);
INSERT INTO info(name,sex,age,hight) VALUES('xiaowang',1,23,166);
INSERT INTO info(name,sex,age,hight) VALUES('xiaojuan',0,21,159);
```

### 0x01 存储过程
```
--如果存在名为get_student_msg(相当于函数)的存储过程则删除
IF EXISTS (SELECT name FROM sysobjects WHERE name='get_student_msg' AND type='p')
    DROP PROCEDURE get_student_msg

CREATE PROCEDURE get_student_msg --创建存储过程
    @name VARCHAR(20) --声明全局变量
AS
    BEGIN
        SELECT * from info
        WHERE name=@name
    END
GO

--创建好存储过程后在其他地方直接使用函数并传参就行了
EXEC get_student_msg 'xiaoli'
```

### 0x02 使用游标的存储过程
```
-- 使用DECLARE声明局部变量，一般在函数和存储过程中使用
DECLARE @name VARCHAR(20)
DECLARE @sex INT
DECLARE @age INT
DECLARE @hight INT

DECLARE stu_cursor CURSOR FOR --定义游标，后面跟sql语句
SELECT name,sex,age,hight --使用游标的对象(根据需要写select语句)
FROM dbo.info
WHERE age IN (23,24)

OPEN stu_cursor --打开游标

--将游标向下移1行，并把下一行作为当前行(递归)
--游标刚打开时可以理解为指向第一行之前，所以这里就是把游标指向第一行
--然后获取游标指向行的数据
FETCH NEXT FROM stu_cursor INTO @name,@sex,@age,@hight

WHILE (@@FETCH_STATUS = 0) --判断是否成功获取数据
    BEGIN
        PRINT '名字: '+@name
        PRINT '性别: '+STR(@sex)
        PRINT '年龄: '+STR(@age)
        PRINT '身高: '+STR(@hight)
        PRINT ''

        --游标指向下一行(第二行)，然后取出这一行的数据
        FETCH NEXT FROM stu_cursor INTO @name,@sex,@age,@hight
    END

CLOSE stu_cursor --关闭游标
DEALLOCATE stu_cursor --删除游标
```