---
draft: false
date: 2016-06-17 23:08:05
title: Linux 下搭建 Tomcat+MySQL+JSP
description: 
categories:
  - Server
tags:
  - server
---

安装环境为：CentOS-6.5-x86_64-minimal

### 0x00 安装mysql  
$ sudo yum install mysql mysql-server mysql-devel  
![安装mysql.png](/img/post/install_mysql.png)
![创建数据库tomcat.png](/img/post/creat_db_tomcat.png)
![将数据库tomcat分配给用户tomcat.png](/img/post/grant_db_tomcat.png)

### 0x01 安装jdk和tomcat
1. 创建安装jdk和tomcat的文件夹
![创建安装jdk和tomcat的文件夹.png](/img/post/mkdir_java_tomcat.png)

2. 下载安装包并解压安装  

jdk包可在[这里](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)下载  

tomcat包可在[这里](http://mirrors.cnnic.cn/apache/tomcat/tomcat-8/v8.0.36/bin/apache-tomcat-8.0.36.tar.gz)下载

![下载tomcat安装包.png](/img/post/download_tomcat.png)
![复制解压后的安装包到/opt下对应目录.png](/img/post/cp_jdk_tomcat_to_opt.png)

为java添加环境变量并设置命令链接符

```bash
$ tail -n 3 /etc/profile
export JAVA_HOME="/opt/jdk1.8.0_91"
export CLASSPATH=.:$JAVA_HOME/lib
export PATH=$JAVA_HOME/bin:$PATH

$ sudo update-alternatives --install /usr/bin/java java /opt/jdk1.8.0_91/bin/java 1
$ sudo update-alternatives --install /usr/bin/javac javac /opt/jdk1.8.0_91/bin/javac 1
$ sudo update-alternatives --set java /opt/jdk1.8.0_91/bin/java
$ sudo update-alternatives --set javac /opt/jdk1.8.0_91/bin/javac
```
![验证jdk是否设置成功.png](/img/post/java_version.png)

### 0x02 简单配置tomcat
![简单配置tomcat1.png](/img/post/config_tomcat.png)

### 0x03 启动tomcat
![启动tomcat.png](/img/post/start_tomcat.png)
![访问tomcat主页.png](/img/post/see_tomcat_index.png)

### 0x04 连接数据库
驱动可在[这里](http://dev.mysql.com/downloads/connector/j/)下载
![复制数据库驱动.png](/img/post/tomcat_copy_mysql_driver.png)
$ vim /opt/tomcat/apache-tomcat-8.0.36/webapps/ROOT/a.jsp
```jsp
<%@page contentType="text/html;charset=utf-8" import="java.sql.*" %>
<%
	String driver = "com.mysql.jdbc.Driver"; 
	String url = "jdbc:mysql://localhost:3306/tomcat"; //数据库web
	String user = "tomcat"; 
	String password = "123456"; 
	try { 
		Class.forName(driver); 
		Connection conn = DriverManager.getConnection(url, user, password);

		if(!conn.isClosed()) 
		    out.println("数据库连接成功！"); 
		conn.close(); 
	} 
	catch(ClassNotFoundException e) { 
	    out.println("找不到驱动程序"); 
	    e.printStackTrace(); 
	} 
	catch(SQLException e) { 
	    e.printStackTrace(); 
	} 
%>
```
![连接数据库.png](/img/post/tomcat_conn_mysql.png)