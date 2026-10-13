---
draft: false
date: 2017-01-16 20:18:05
title: Ubuntu 下部署 Gitlab
description: 
categories:
  - Git
tags:
  - git
---

![钢之炼金术师FA](/img/anime/anime004.jpg)

### 0x00 前期准备
```
# 环境 Ubuntu 14.04
reber@ubuntu:~/Desktop$ sudo apt-get install openssh-server
reber@ubuntu:~/Desktop$ sudo apt-get install openssh-client
reber@ubuntu:~/Desktop$ sudo apt-get install git
```

### 0x01 安装
```
reber@ubuntu:~/Desktop$ wget https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/ubuntu/pool/trusty/main/g/gitlab-ce/gitlab-ce_8.8.0-ce.0_amd64.deb
reber@ubuntu:~/Desktop$ sudo dpkg -i gitlab-ce_8.8.0-ce.0_amd64.deb
```

### 0x02 配置
```
reber@ubuntu:~/Desktop$ sudo vim /etc/gitlab/gitlab.rb
    external_url 'http://192.168.188.160:80'
    ......
    gitlab_rails['time_zone'] = 'Asia/Shanghai'
    gitlab_rails['gitlab_email_from'] = 'xxxxxx@163.com'
    ......
    gitlab_rails['smtp_enable'] = true
    gitlab_rails['smtp_address'] = "smtp.163.com"
    gitlab_rails['smtp_port'] = 25
    gitlab_rails['smtp_user_name'] = "xxxxxx@163.com"
    gitlab_rails['smtp_password'] = "111111" # 客户端授权密码
    gitlab_rails['smtp_domain'] = "163.com"
    gitlab_rails['smtp_authentication'] = "login"
    gitlab_rails['smtp_enable_starttls_auto'] = true
    ......
    user["git_user_email"] = "xxxxxx@163.com"
# 只要修改配置文件就要reconfigure
reber@ubuntu:~/Desktop$ sudo gitlab-ctl reconfigure 
reber@ubuntu:~/Desktop$ sudo gitlab-ctl status
run: gitlab-workhorse: (pid 15918) 16s; run: log: (pid 15290) 200s
run: logrotate: (pid 15310) 187s; run: log: (pid 15309) 187s
run: nginx: (pid 15297) 193s; run: log: (pid 15296) 193s
run: postgresql: (pid 15169) 258s; run: log: (pid 15168) 258s
run: redis: (pid 15076) 269s; run: log: (pid 15075) 269s
run: sidekiq: (pid 15384) 141s; run: log: (pid 15279) 206s
run: unicorn: (pid 15360) 158s; run: log: (pid 15246) 212s
reber@ubuntu:~/Desktop$ netstat -anlt
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address       Foreign Address      State
tcp        0      0 127.0.0.1:8080      0.0.0.0:*            LISTEN
tcp        0      0 0.0.0.0:80          0.0.0.0:*            LISTEN
tcp        0      0 127.0.1.1:53        0.0.0.0:*            LISTEN
tcp        0      0 0.0.0.0:22          0.0.0.0:*            LISTEN

# 其中8080是unicore的端口
# 80是nginx的端口，nginx反向代理ruby开的web服务unicore
```

### 0x03 访问web页面
* 有时出现502，可以刷新网页或者再次reconfigure

* 有时需要sudo gitlab-ctl restart nginx

* 初次访问Web页面会强制让你改密码，初始用户名/密码：root/5iveL!fe

* 禁止前台注册  
登录后：右上角 Admin Area --> Settings --> Sign-in Restrictions
![禁止前台注册](/img/post/gitlab_forbid_registration.png)
然后保存

* 修改admin的邮箱  
Admin Area --> Users --> Edit 然后保存

### 0x04 添加401认证
```
# 401认证是nginx的，如果gitlab出现漏洞，也需要过401才行
reber@ubuntu:~/Desktop$ cd /var/opt/gitlab/
# 安装软件apache2-utils，用于生成认证的密码文件
reber@ubuntu:/var/opt/gitlab$ sudo apt-get install apache2-utils
reber@ubuntu:/var/opt/gitlab$ sudo ls nginx/conf/
gitlab-http.conf  nginx.conf
reber@ubuntu:/var/opt/gitlab$ sudo htpasswd -b -c nginx/conf/htpasswd username password
reber@ubuntu:/var/opt/gitlab$ sudo ls nginx/conf/
gitlab-http.conf  htpasswd  nginx.conf
# 配置nginx
reber@ubuntu:/var/opt/gitlab$ sudo vim nginx/conf/gitlab-http.conf
......
server {
  listen *:80; # 这里可以修改Web端的端口

  # 添加下面两句
  auth_basic "reber's gitlab";
  auth_basic_user_file htpasswd;  #指明密码文件路径

  server_name 192.168.188.160;
  server_tokens off; ## Don't show the nginx version number, a security best practice

# 重启nginx
reber@ubuntu:/var/opt/gitlab$ sudo gitlab-ctl restart nginx
```
![401验证](/img/post/gitlab_401_verify.png)

### 0x05 汉化
```
# 首先检查版本
reber@ubuntu:~/Desktop$ cat /opt/gitlab/embedded/service/gitlab-rails/VERSION
 8.8.0
reber@ubuntu:~/Desktop$ git clone https://gitlab.com/larryli/gitlab.git
reber@ubuntu:~/Desktop$ cd gitlab/
# 比较8-8-stable(英文)和8-8-zh(汉化后)的区别然后导出为补丁
reber@ubuntu:~/Desktop/gitlab$ git diff origin/8-8-stable origin/8-8-zh > /tmp/8.8.diff
# 应用补丁
reber@ubuntu:~/Desktop/gitlab$ sudo patch -d /opt/gitlab/embedded/service/gitlab-rails -p1 < /tmp/8.8.diff
```

### 0x06 添加ssh公钥
```
首先用邮箱514581887@qq.com注册一个用户，用户名为55555
$ ssh-keygen -t rsa -C "514581887@qq.com" #在本机生成秘钥对
$ cat /home/reber/.ssh/id_rsa.pub #查看公钥
然后使用用户55555登录Web页面，添加上面文件id_rsa.pub中的公钥
#注释：上面添加的公钥存储在服务端的/var/opt/gitlab/.ssh/authorized_keys中

由于gitlab服务端使用的不是标准的22端口，所以本机要添加一个文件
$ cd ~/.ssh
$ vim config
  Host 192.168.188.160 #gitlab服务器的ip
  User 55555
  Port 2222 # gitlab服务器的ssh端口
  IdentityFile /home/reber/.ssh/id_rsa # 本地私钥文件id_rsa的路径

添加用户名和密码
$ git config --global user.name "55555"
$ git config --global user.email "514581887@qq.com"

检测是否添加成功
$ ssh -T git@192.168.188.160
  Welcome to GitLab, 55555! # 出现这句话证明成功

若出现错误："git: 'credential-cache' is not a git command."
则运行："git config --global --unset credential.helper"
```

### 0x07 推送自己的代码
```
# 首先clone项目
[reber@WYB ~]$ git clone git@192.168.188.160:first_group/first_project.git
[reber@WYB first_project]$ cd first_project
[reber@WYB first_project]$ git branch 163 # 创建自己的分支163
[reber@WYB first_project]$ git checkout 163 # 切换到分支
Switched to branch '163'
[reber@WYB first_project]$ git branch # 查看当前分支情况
* 163
  master
[reber@WYB first_project]$ vim 163_4_file
[reber@WYB first_project]$ git add 163_4_file # 添加项目代码文件
[reber@WYB first_project]$ git commit -m "add file 163_4_file"
[163 d5df55a] add file 163_4_file
 1 files changed, 1 insertions(+), 0 deletions(-)
 create mode 100644 163_4_file
[reber@WYB first_project]$ git push origin 163 # push代码
Counting objects: 4, done.
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 285 bytes, done.
Total 3 (delta 1), reused 0 (delta 0)
To git@106.75.87.166:first_group/first_project.git
 * [new branch]      163 -> 163
```

web端请求合并代码到master分支
![请求合并代码](/img/post/gitlab_pull_request.png)

```
# 下面的操作做不做都行
[reber@WYB first_project]$ git checkout master # 切换回master分支
Switched to branch 'master'
Your branch is ahead of 'origin/master' by 1 commit.
[reber@WYB first_project]$ git branch -D 163 # 删除分支163
Deleted branch 163 (was d5df55a).
[reber@WYB first_project]$ git branch # 再次查看分支
* master
[reber@WYB first_project]$ 
```

### 0x08 结果
![结果1](/img/post/gitlab_result1.png)

![结果2](/img/post/gitlab_result2.png)

### 0x09 备份与还原
注意：若要迁移，则新服务器上的Gitlab的版本必须与创建备份时的Gitlab版本号相同

```
# 如果出现backups文件夹没有权限，那就给700，所有者为git:git

ubuntu@1fa167:~$ sudo gitlab-rake gitlab:backup:create
  # 出现错误：
  Errno::ENOENT: No such file or directory @ realpath_rec - /var/opt/gitlab/gitlab-rails/shared/registry
# 新建文件
ubuntu@1fa167:~$ sudo mkdir /var/opt/gitlab/gitlab-rails/shared/registry
ubuntu@1fa167:~$ sudo chmod 700 /var/opt/gitlab/gitlab-rails/shared/registry
ubuntu@1fa167:~$ sudo chown git:git /var/opt/gitlab/gitlab-rails/shared/registry
# 备份
ubuntu@1fa167:~$ sudo gitlab-rake gitlab:backup:create

# 还原：
ubuntu@1fa167:~$ sudo ls -al /var/opt/gitlab/backups/
total 34500
drwx------  2 git  git      4096 Feb 17 15:09 .
drwxr-xr-x 13 root root     4096 Feb 17 15:01 ..
-rw-------  1 git  git  35317760 Feb 17 15:09 1487315379_gitlab_backup.tar
ubuntu@1fa167:~$ sudo gitlab-rake gitlab:backup:restore BACKUP=1487315379
```