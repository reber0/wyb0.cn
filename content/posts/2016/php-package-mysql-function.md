---
draft: false
date: 2016-06-03 11:19:05
title: PHP 之封装 MySQL 类
description: 
categories:
  - PHP
  - Database
tags:
  - php
  - mysql
---

### 0x00 config.inc.php内容如下
```
<?php
return array(
    'DB_HOST' => '192.168.188.134',
    'DB_NAME' => 'scoreboard', 
    'DB_USER' => 'score',
    'DB_PASS' => '123456',
    'DB_CHARSET' => 'utf8',
    'IS_LOG' => 1,//开启日志
    'LOGFILEPATH' => '../log.txt'//日志路径
);
/*
    $database = require('./config.php');
    echo $database['DB_TYPE'];   //输出'DB_TYPE'
*/

?>
```

### 0x01 表设计如下
```sql
create database scoreboard;
use scoreboard;

drop table if exists users;
create table users(
    id int not null auto_increment primary key,
    gid int not null default 'xiaoming' comment '组id',
    username varchar(20) not null default 'xiaoming' comment '用户名',
    password varchar(32) not null default '123456' comment '密码',
    sex varchar(2) not null default '0' comment '性别',
    totalscore int not null default '0' comment '个人总积分'
);

drop table if exists share;
create table share(
    id int not null auto_increment primary key,
    uid int not null,
    content varchar(1024) not null default 'content' comment '分享内容',
    comment varchar(1024) comment '点评',
    date varchar(15) not null default '20150101' comment '分享日期'
);

drop table if exists score;
create table score(
    id int not null auto_increment primary key,
    uid int not null default '0' comment '用户id',
    score int not null default '0' comment '用户单次积分',
);

grant all privileges on scoreboard.* to 'score'@'%' identified by '123456';

-- 或者只给特定权限
-- grant select,update,delete on scoreboard.* to 'score'@'%' identified by '123456';

flush privileges;
```

### 0x02 封装类如下
```
<?php

class mysql {
    private $logfilepath;
    private $is_log;
    private $hlog;
    private $conn;

    //构造函数
    public function __construct() {
        $config = include_once(dirname(__FILE__)."/../config/config.inc.php");
        $this->is_log = $config['IS_LOG'];
        $this->logfilepath = $config['LOGFILEPATH'];

        if ($this->is_log){
            $handle = fopen($this->logfilepath,"a+");
            $this->hlog = $handle;
        }

        $this->conn = $this->connect($config['DB_HOST'],$config['DB_USER'],$config['DB_PASS'],$config['DB_NAME'],$config['DB_CHARSET']);
    }

    //连接数据库
    public function connect($dbhost, $dbuser, $dbpass, $dbname, $dbcharset) {
        $this->conn = @mysql_connect($dbhost,$dbuser,$dbpass);
        if (!$this->conn) {
            $msg = "连接数据库失败：".mysql_error();
            $this->write_log($msg);
            die($msg);
        } else {
            if (!@mysql_select_db($dbname)) {
                $msg = "连接数据库成功，但选择数据库失败：".mysql_error();
                $this->write_log($msg);
                die($msg);
            } else {
                $msg = "连接数据库成功，且选择数据库成功";
                $this->write_log($msg);
            }
        }

        @mysql_query("set names ".$dbcharset);

    }

    //执行语句
    public function query($sql) {
        
        $result = @mysql_query($sql);

        if (!$result) {
            $this->write_log('mysql_query error:'.mysql_error());
        } else {
            $this->write_log('执行语句：'.$sql.' 且执行成功');
        }
        return $result;
    }

    //查询一条数据
    public function select_one($tab,$column = "*",$condition = '',$debug=False) {   //查询函数
        $condition = $condition ? ' where ' . $condition : NULL;
        $sql = "select $column from $tab $condition ";
        if ($debug) {
            echo '将执行语句：'.$sql.'<br />';
        } else {
            $result = $this->query($sql);
            $row = @mysql_fetch_assoc($result);
            return $row;
        }
    }

    //查询多条数据
    public function select_more($tab,$column = "*",$condition = '',$debug=False) {   //查询函数
        $condition = $condition ? ' where ' . $condition : NULL;
        $sql = "select $column from $tab $condition";
        if ($debug) {
            echo '将执行语句：'.$sql;
        } else {
            $result = $this->query($sql);
            $i = 0;
            $rows = array();
            while ($row = @mysql_fetch_assoc($result)) {
                $rows[$i] = $row;
                // print_r($rows[$i]);
                $i++; 
            }
            return $rows;
        }
    }

    //返回结果集
    public function echo_result($tab,$column = "*",$condition = '',$debug=False) {   //查询函数
        $condition = $condition ? ' where ' . $condition : NULL;
        $sql = "select $column from $tab $condition ";
        if ($debug) {
            echo '将执行语句：'.$sql.'<br />';
        } else {
            return $this->query($sql);
        }
    }

    //插入数据
    public function insert($tab,$arr,$debug=False) {
        $value = '';
        $column = '';
        foreach ($arr as $k => $v) {
            $column .= ",{$k}";
            $value .= ",'{$v}'";
        }
        $column = substr($column, 1);
        $value = substr($value, 1);

        $sql = "insert into $tab($column) values($value)";
        if ($debug) {
            echo '将执行语句：'.$sql;
        } else {
            $this->query($sql);
            $num = $this->affected_num();
            $this->write_log("受影响行数：".$num);
            return $num;    //返回受影响行数
        }
    }

    //获取最后插入的id
    public function insert_id() {
        $id = mysql_insert_id($this->link_id);
        $this->write_log('最后插入的id为：'.$id);
        return $id;
    }

    //更新数据
    public function update($tab,$arr,$condition = '',$debug=False) {
        if (!$condition) {
            die("error".mysql_error());
        } else {
            $condition = 'where ' . $condition;
        }
        
        $value = '';
        foreach ($arr as $k => $v) {
            $value .= "{$k}='{$v}',";
        }
        $value = substr($value,0,-1);

        $sql = "update $tab set $value $condition";
        if ($debug) {
            echo '将执行语句：'.$sql;
        } else {
            $this->query($sql);
            $num = $this->affected_num();
            $this->write_log("受影响行数：".$num);

            return $num;            
        }
    }

    //删除数据
    public function delete($tab,$condition='',$debug=False) {
        $condition = $condition ? ' where ' . $condition : NULL;
        $sql = "delete from $tab $condition";
        if ($debug) {
            echo '将执行语句：'.$sql;
        } else {
            $this->query($sql);
            $num = $this->affected_num();
            $this->write_log("受影响行数：".$num);
            return $num;    //返回受影响行数
        }
    }

    //返回受影响行数
    public function affected_num() {
        $num = @mysql_affected_rows();
        return $num;
    }

    //写入日志
    public function write_log($msg='') {
        if ($this->is_log){
            $text = date("Y-m-d H:i:s")." ".$msg."\r\n";
            fwrite($this->hlog,$text);
        }
    }

    //关闭数据库连接
    public function close() {  
        mysql_close($this->conn);
    }

    //析构函数
    public function __destruct() {
        if($this->is_log){
            fclose($this->hlog);
        }
    }
}

    //$db = new mysql();
    
    // //select_one($tab,$column = "*",$condition = '')
    // $rows = $db->select_more('share','*');
    // print_r($rows[0]);
    // print_r($rows[1]);

    // //insert($tab,$arr)
    // $arr = array();
    // $arr['uid'] = '3';
    // $arr['content'] = 'xss';
    // $arr['comment'] = 'very good';
    // $arr['date'] = '1464082630';
    // $db->insert('share',$arr);

    // //update($tab,$arr,$condition = '')
    // $arr = array();
    // $arr['content'] = 'xssxssxssxssxss';
    // $arr['comment'] = 'goodgoodgoodgood';
    // $condition = 'id > 5';
    // $db->update('share',$arr,$condition);

    //$db->delete("share","id between 10 and 15");

    //$db->close();
?>
```