---
draft: false
date: 2016-09-12 22:54:28
title: Python 封装 MySQL 类
description: 
categories:
  - Python
  - Database
tags:
  - python
  - mysql
---

### 0x00 安装
有两种，一个是MySQLdb，一个是pymysql

* 下载[MySQL-python](https://pypi.python.org/pypi/MySQL-python/1.2.5)然后安装  
* sudo pip install pymysql(推荐，因为py3已经不支持MySQLdb了)

### 0x01 简单表设计如下
```
insert into mysql.user(Host,User,Password) values('%','python','123456');

drop database if exists python;
create database python;
use python;

drop table if exists msg;
create table msg(
    id int not null auto_increment primary key,
    ip varchar(40) not null default '127.0.0.1' comment 'ip地址',
    domain varchar(100) not null default 'www.xx.com' comment '域名'
);

grant all privileges on python.* to 'python'@'%' identified by '123456';
flush privileges;
```

### 0x02 MySQLdb封装代码
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import MySQLdb

class mysql(object):
    """docstring for mysql"""
    def __init__(self, dbconfig):
        self.host = dbconfig['host']
        self.port = dbconfig['port']
        self.user = dbconfig['user']
        self.passwd = dbconfig['passwd']
        self.dbname = dbconfig['dbname']
        self.charset = dbconfig['charset']
        self._conn = None
        self._connect()
        self._cursor = self._conn.cursor()

    def _connect(self):
        try:
            self._conn = MySQLdb.connect(host=self.host,
                port = self.port,
                user=self.user,
                passwd=self.passwd,
                db=self.dbname,
                charset=self.charset)
        except MySQLdb.Error,e:
            print e
            
    def query(self, sql):
        try:
            result = self._cursor.execute(sql)
        except MySQLdb.Error, e:
            print e
            result = False
        return result

    def select(self, table, column='*', condition=''):
        condition = ' where ' + condition if condition else None
        if condition:
            sql = "select %s from %s %s" % (column,table,condition)
        else:
            sql = "select %s from %s" % (column,table)
        self.query(sql)
        return self._cursor.fetchall()

    def insert(self, table, tdict):
        column = ''
        value = ''
        for key in tdict:
            column += ',' + key
            value += "','" + tdict[key]
        column = column[1:]
        value = value[2:] + "'"
        sql = "insert into %s(%s) values(%s)" % (table,column,value)
        try:
            self._cursor.execute(sql)
            self._conn.commit()
        except:
            self.rollback()
        return self._cursor.lastrowid #返回最后的id

    def update(self, table, tdict, condition=''):
        if not condition:
            print "must have id"
            exit()
        else:
            condition = 'where ' + condition
        value = ''
        for key in tdict:
            value += ",%s='%s'" % (key,tdict[key])
        value = value[1:]
        sql = "update %s set %s %s" % (table,value,condition)
        try:
            self._cursor.execute(sql)
        except:
            self.rollback()
        return self.affected_num() #返回受影响行数

    def delete(self, table, condition=''):
        condition = 'where ' + condition if condition else None
        sql = "delete from %s %s" % (table,condition)
        try:
            self._cursor.execute(sql)
            self._conn.commit()
        except:
            self.rollback()
        return self.affected_num() #返回受影响行数

    def rollback(self):
        self._conn.rollback()

    def affected_num(self):
        return self._cursor.rowcount

    def __del__(self):
        try:
            self._cursor.close()
            self._conn.close()
        except:
            pass

    def close(self):
        self.__del__()

if __name__ == '__main__':
    dbconfig = {
        'host':'192.168.188.134',
        'port':3306,
        'user':'python',
        'passwd':'123456',
        'dbname':'python',
        'charset':'utf8'
    }
    db = mysql(dbconfig)

    # print db.select('msg','id,ip,domain')
    # print db.select('msg','id,ip,domain','id>2')
    # print db.affected_num()

    # tdict = {
    #     'ip':'111.13.100.91',
    #     'domain':'baidu.com'
    # }
    # print db.insert('msg', tdict)
    
    # tdict = {
    #     'ip':'111.13.100.91',
    #     'domain':'aaaaa.com'
    # }
    # print db.update('msg', tdict, 'id=5')

    # print db.delete('msg', 'id>3')

    db.close()
```

### 0x03 pymysql封装代码
```
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urlparse
import pymysql
import contextlib

class MySQLX(object):
    def __init__(self, mysql_uri):
        super(MySQLX, self).__init__()
        self.mysql_uri = mysql_uri
        self.mysql_info = self.mysql_parse_uri()

    def mysql_parse_uri(self):
        p = urlparse.urlparse(self.mysql_uri)
        host = p.hostname
        port = p.port
        user = p.username
        password = p.password
        dbname = p.path.strip('/')
        charset = urlparse.parse_qs(p.query)['charset'][0]

        return {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'db': dbname,
            'charset': charset,
            'cursorclass': pymysql.cursors.DictCursor,
        }

    @contextlib.contextmanager
    def init(self):
        dbconn = pymysql.connect(**self.mysql_info)
        cursor = dbconn.cursor()
        # dbconn = pymysql.connect(
        #     host=mysql_info.get('host'),
        #     user=mysql_info.get('user'),
        #     password=mysql_info.get('password'),
        #     db=mysql_info.get('db'),
        #     charset=mysql_info.get('charset')
        #     )
        # cursor = dbconn.cursor(cursor=pymysql.cursors.DictCursor)

        try:
            yield cursor #这里就是with返回的
        finally:
            dbconn.commit()
            cursor.close()
            dbconn.close()

    def query(self, sql, arg=''):
        try:
            with self.init() as cursor:
                if arg:

                    cursor.execute(sql,arg) #返回受影响行数
                else:
                    cursor.execute(sql)
                result = cursor.fetchall() #返回数据格式是[{},{}]
                # result = cursor.fetchone() #返回数据格式是{}
                return result
        except Exception as e:
            print sql,str(e)

if __name__ == '__main__':
    mysql_uri = "mysql+pymysql://root:root@localhost:3306/rtest?charset=utf8mb4"
    sqlconn = MySQLX(mysql_uri)
    sql = "select * from `msg` where id=%s"
    result = sqlconn.query(sql,"2")
    print result
```
