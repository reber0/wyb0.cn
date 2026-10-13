---
draft: false
date: 2017-08-18 14:36:39
title: Docker 之镜像与容器
description: Docker 中镜像以及容器的添加、删除等操作
categories:
  - Linux
tags:
  - docker
---

操作系统：Ubuntu14.04.1  
Docker版本：Docker version 17.06.0-ce, build 02c1d87

### 0x00 镜像操作
* 下载镜像

```bash
#一般镜像、容器的id和name可以互换

$ docker search ubuntu #从公共registry搜索镜像

$ docker pull ubuntu #从公共registry下载镜像
$ docker pull ubuntu:14.04
```

* 查看当前系统镜像

```bash
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              14.04               7e4b16ae8b23        11 days ago         188MB
ubuntu              latest              1d9c17228a9e        11 days ago         86.7MB
```

* 查看镜像层组成

```bash
$ docker history ubuntu:14.04 # ubuntu:14.04可以用7e4b16ae8b23替代，用id和images_name:tag效果一样
```

* 删除镜像(删除镜像前要先删除上面的容器)

```bash
$ docker rmi ubuntu:latest # 也可docker rmi 1d9c17228a9e
```

### 0x01 容器操作
* 运行容器(exit后容器就停止了)
    * -\-rm：告诉Docker一旦运行的容器停止就删除容器
    * -ti：告诉Docker分配一个伪终端并进入交互模式(这将进入容器内)
    * ubuntu:14.04 是容器立足的镜像
    * /bin/bash：shell

    ```bash
    $ docker run --rm -it ubuntu:14.04 /bin/bash
    root@172c8d8b0671:/# ls
    bin   dev  home  lib64  mnt  proc  run   srv  tmp  var
    boot  etc  lib   media  opt  root  sbin  sys  usr
    root@172c8d8b0671:/# exit
    exit
    ```

* 后台运行容器
    * -d：告诉Docker容器在后台运行(不能与--rm参数一起用)

    ```bash
    $ docker run -itd ubuntu:14.04 /bin/bash
    6f9d8dea6aa0e984e725802e3e49685ea040a21defa9a9d5e8db644076bbb42b
    $ docker run -itd 7e4b16ae8b23 ping 8.8.8.8
    3e4c995326c0757d7e83daa72034d472e4f988cb553e9a85acd0bec06a666d60
    $ sudo docker run -itd ubuntu:14.04 /bin/sh -c "while true; do echo hello world; sleep 1; done"
    39b5bab299be909e2b1cdc3629d7c7fe2b5375348dfff498be58b4b0a0108676
    ```

* 查看当前运行的容器

```bash
$ docker ps #只显示正在运行的容器
CONTAINER ID   IMAGE          COMMAND                 CREATED         STATUS        PORTS  NAMES
39b5bab299be   ubuntu:14.04   "/bin/sh -c 'while t…"  4 seconds ago   Up 4 seconds         distracted_wescoff
3e4c995326c0   7e4b16ae8b23   "ping 8.8.8.8"          6 seconds ago   Up 5 seconds         sad_payne
6f9d8dea6aa0   ubuntu:14.04   "/bin/bash"             9 seconds ago   Up 8 seconds         inspiring_keller

$ docker ps -a #显示所有的容器，包括停止的
```

* 向容器发送命令

```
$ docker exec -ti sad_payne whoami
root
$ docker exec -ti sad_payne uname -a
Linux 8e4f11f295e2 4.9.125-linuxkit #1 SMP Fri Sep 7 08:20:28 UTC 2018 x86_64 x86_64 x86_64 GNU/Linux
```

* 进入容器

```bash
$ docker exec -it sad_payne /bin/bash
root@3e4c995326c0:/# ps -aux |grep ping
root         1  0.0  0.0   6520   792 pts/0    Ss+  13:00   0:00 ping 8.8.8.8
root        22  0.0  0.0   8880   736 pts/1    S+   13:25   0:00 grep --color=auto ping
```

* 查看容器日志

```bash
$ docker logs 39b5bab299be|head -n 5
hello world
hello world
hello world
hello world
hello world

$ docker logs 3e4c995326c0|head -n 5
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=127 time=56.3 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=127 time=58.6 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=127 time=56.4 ms
64 bytes from 8.8.8.8: icmp_seq=5 ttl=127 time=57.0 ms
```

* 端口映射

```
#访问本地的8888端口就是访问容器的80端口
$ docker run -itd -p 8888:80 ubuntu:14.04 /bin/bash
4411d8092cffe5ae7e52dfaa9a4f434f31fdc32c68c4b712092851e1209d2683
$ netstat -anlt
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address   Foreign Address   State       PID/Program name
tcp        0      0 0.0.0.0:22      0.0.0.0:*         LISTEN      11053/sshd
tcp        0      0 127.0.0.1:3306  0.0.0.0:*         LISTEN      1204/mysqld
tcp6       0      0 :::22           :::*              LISTEN      11053/sshd
tcp6       0      0 :::8888         :::*              LISTEN      14691/docker-proxy
tcp6       0      0 :::80           :::*              LISTEN      1477/apache2
```

* 查看容器的端口映射

```bash
$ docker port 4411d8092cff
80/tcp -> 0.0.0.0:8888
```

* 查看容器的进程信息

```bash
$ docker top 4411d8092cff
```

* 从宿主机向容器复制数据

```bash
$ docker cp a.txt 4411d8092cff:/root/
$ docker exec -it 4411d8092cff /bin/bash
root@4411d8092cff:/# touch /root/abc.txt
root@4411d8092cff:/# ls /root/
123.txt  a.txt  abc.txt
```

* 从容器向宿主机复制数据

```bash
$ docker cp 4411d8092cff:/root/abc.txt ./
$ ls
123.txt  abc.txt  a.txt  Desktop
```

* 查看容器的文件变化

```bash
$ docker diff 4411d8092cff
C /root
A /root/.bash_history
A /root/123.txt
A /root/a.txt
A /root/abc.txt
```

* 停止/启动容器

```bash
$ docker stop 4411d8092cff
4411d8092cff
#docker kill 4411d8092cff
$ docker start 4411d8092cff
4411d8092cff
```

* 删除容器(容器需要先停止才能删除)

```bash
$ docker rm 39b5bab299be
Error response from daemon: You cannot remove a running container 4411d8092cffab2e1a901727e3eef9140e713f3a4699c55c0e67f8666cca5d11. Stop the container before attempting removal or force remove
$ docker kill 39b5bab299be
39b5bab299be
$ docker rm 39b5bab299be
39b5bab299be
```

* 删除所有容器(只能删除停止运行的)

```bash
$ docker rm $(docker ps -aq)
39b5bab299be
3e4c995326c0
6f9d8dea6aa0
```

### 0x02 打包镜像及容器
* 打包(save和export)

```
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              14.04               7e4b16ae8b23        11 days ago         188MB
$ docker run -itd -p 2222:22 ubuntu:14.04 /bin/bash
5a3ce7d8d5b55264c75f943c4fc8b10fda172f2d58c1b5cacd27ce688d180a77

# 一般可以在容器中安装一些常用的基础软件，如ssh、vim等，然后打包以后使用，这里连接容器安装ssh
$ docker exec -it 5a3ce7d8d5b5 /bin/bash
root@5a3ce7d8d5b5:/# apt-get install openssh-server
root@5a3ce7d8d5b5:/# exit

# commit安装ssh后的容器，产生镜像
$ docker commit 5a3ce7d8d5b5 ubuntu:ssh_install
sha256:cae40fb01d1fd1cae5589be8725dca89c11fb975dbf24fcabdc5cad9531e7c70
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              ssh_install         cae40fb01d1f        3 seconds ago       243MB
ubuntu              14.04               7e4b16ae8b23        11 days ago         188MB
$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS                  NAMES
5a3ce7d8d5b5        ubuntu:14.04        "/bin/bash"         18 minutes ago      Up 18 minutes       0.0.0.0:2222->22/tcp   loving_bose
```
```
# docker save <IMAGE ID> > save.tar，使用安装ssh后并commit的镜像id
$ docker save cae40fb01d1f > save.tar
# docker export <CONTAINER ID> > export.tar，使用安装ssh后的容器id
$ docker export 5a3ce7d8d5b5 > export.tar

#save镜像后体积变大，export容器后体积变小
$ du -h *.tar
245M    save.tar
221M    export.tar
```

* 删除现有镜像后重新导入刚才保存的镜像(load和import)

```bash
$ docker load < save.tar
a1dfb45ac02d: Loading layer [=======================================>]    197MB/197MB
cbafb465c00d: Loading layer [=======================================>]  209.9kB/209.9kB
382d42470bcc: Loading layer [=======================================>]  7.168kB/7.168kB
74decbb2e028: Loading layer [=======================================>]  3.072kB/3.072kB
95d4db8f1e96: Loading layer [=======================================>]  59.22MB/59.22MB
Loaded image ID: sha256:cae40fb01d1fd1cae5589be8725dca89c11fb975dbf24fcabdc5cad9531e7c70
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
<none>              <none>              cae40fb01d1f        11 minutes ago      243MB
$ docker tag cae40fb01d1f ubuntu:save_load #给镜像cae40fb01d1f打tag
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              save_load           cae40fb01d1f        12 minutes ago      243MB
```
```
$ docker import export.tar
sha256:57275c69a2a3a9527086f2563426170c4ec7bed0a1bc3ee10fcedb17b31cee41
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
<none>              <none>              57275c69a2a3        27 seconds ago      218MB
ubuntu              save_load           cae40fb01d1f        13 minutes ago      243MB
$ docker tag 57275c69a2a3 ubuntu:export_import
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED              SIZE
ubuntu              export_import       57275c69a2a3        About a minute ago   218MB
ubuntu              save_load           cae40fb01d1f        14 minutes ago       243MB
```
```
# 容器打包的镜像包丢失历史和层，镜像打包的镜像包没有丢失
➜  ~ docker history 57275c69a2a3
IMAGE               CREATED              CREATED BY    SIZE      COMMENT
57275c69a2a3        About a minute ago                 218MB     Imported from -
➜  ~ docker history cae40fb01d1f
IMAGE           CREATED           CREATED BY                                SIZE     COMMENT
cae40fb01d1f    14 minutes ago    /bin/bash                                 55.3MB
<missing>       11 days ago       /bin/sh -c #(nop)  CMD ["/bin/bash"]      0B
<missing>       11 days ago       /bin/sh -c mkdir -p /run/systemd && ec…   7B
<missing>       11 days ago       /bin/sh -c rm -rf /var/lib/apt/lists/*    0B
<missing>       11 days ago       /bin/sh -c set -xe   && echo '#!/bin/s…   195kB
<missing>       11 days ago       /bin/sh -c #(nop) ADD file:c860cba1b1c…   188MB
```

* 总结
    * 使用save和export生成的其实<f>都是镜像包</f>，save.tar和export.tar导入后生成的容器中都有ssh
    * save镜像后体积变大，export容器后体积变小
    * 打包容器后的包会丢失历史和层(layer)，打包镜像后的包不会丢失历史和层(layer)

### 0x03 查看镜像或容器的底层信息(IP、端口绑定、配置信息等)
```bash
$ docker inspect 65987aa8f0cb
```

### 0x04 例子
```bash
$ docker kill $(docker ps -aq)
e5b5aaed385b
$ docker rm $(docker ps -aq)
e5b5aaed385b
$ exec_ping=$(docker run -itd ubuntu:14.04 ping 8.8.8.8)
$ echo $exec_ping
5af570b6abef143f409110d413fbc84a03120255181c1acfe1e21a23be8697d4
$ docker logs $exec_ping | head -n 3
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=127 time=56.3 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=127 time=56.0 ms
$ docker commit $exec_ping ubuntu:ping
sha256:2937b5ab38d7d1329e749bb585e99d5f9067ae8a531b777fa604228c2a7b7c30
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              ping                2937b5ab38d7        7 seconds ago       188MB
ubuntu              14.04               7e4b16ae8b23        11 days ago         188MB
ubuntu              latest              1d9c17228a9e        11 days ago         86.7MB
```


#### Reference(侵删)：
* [https://my.oschina.net/zjzhai/blog/225112](https://my.oschina.net/zjzhai/blog/225112?_blank)
