---
draft: false
date: 2017-09-19 10:35:09
title: Docker 之数据卷
description: 
categories:
  - Linux
tags:
  - docker
---

### 0x00 为什么使用数据卷
```
Docker镜像是由多个文件系统(只读层)叠加而成的。
当一个容器启动时Docker会加载只读镜像层并在其上添加一个读写层。
读写层中的修改在镜像重新启动后会全部丢失。
在Docker中，只读层及在顶部的读写层的组合被称为Union File System(联合文件系统)。

如果想要保存数据，则可以使用数据卷来在容器外面保存数据，主要为如下两种方式：
* 使用docker run运行容器时指定数据卷
* 在Dockerfile中直接指定数据卷
```

### 0x01 通过docker run挂载Volume(使用-v参数)
* 不指定主机目录

```bash
#运行完后容器中的根目录下就会多个data文件夹，这个就是数据卷
$ docker run -itd --name v_test -v /data debian:jessie /bin/bash
root@d145e8c6f874:/# ls
bin   data  etc   lib    media  opt   root  sbin  sys  usr
boot  dev   home  lib64  mnt    proc  run   srv   tmp  var
root@d145e8c6f874:/# exit
exit

#查看数据卷的对应位置，前者是宿主机的位置，后者是容器中的位置
$ docker inspect -f {{.Mounts}} v_test
[{volume 8f39f7de0f851e0bfbcfdd4561fbb20484f01f864ce00a159b09bdcdf743e068 /var/lib/docker/volumes/8f39f7de0f851e0bfbcfdd4561fbb20484f01f864ce00a159b09bdcdf743e068/_data /data local  true }]
```

* 指定主机目录(只能通过-v参数实现，Dockerfile不行)

```bash
# 本机的/home/var/docker_data和容器的/data对应
$ docker run -itd -v /home/var/docker_data:/data debian:jessie /bin/bash
root@d853c4ca7632:/# exit
exit
$ docker inspect -f {{.Mounts}} d853c4ca7632
[{bind  /home/var/docker_data /data   true rprivate}]
$ docker inspect -f {{.Mounts}} d853c4ca7632
[{bind  /home/var/docker_data /data   true rprivate}]
```

```
# 本机创建文件，容器中就会同时出现
#宿主机创建文件
$ sudo touch /home/var/docker_data/a.txt

#容器可以查看到文件同样被创建
root@8e1ccd30fe33:/# ls data/
a.txt
```

### 0x02 通过Dockerfile声明Volume
```bash
FROM debian:jessie VOLUME /data #之后的任何命令都不能更改Volume的任何东西
```

### 0x03 数据共享
使用--volumes-from参数项即可访问另外一个容器的Volume。  
因为数据容器不启动也可以被其它容器访问，所以一般不推荐启动数据容器。
```bash
#启动一个容器，使用v_test这个容器的数据卷，v_test没有启动，但依然有data这个数据卷
$ docker run -itd --volumes-from v_test debian:jessie /bin/bash
root@65aedf9c2ee1:/# ls
bin   data  etc   lib    media  opt   root  sbin  sys  usr
boot  dev   home  lib64  mnt    proc  run   srv   tmp  var
root@65aedf9c2ee1:/# exit
exit

#可以看下65aedf9c2ee1这个容器的数据卷和v_test数据卷在宿主机对应的是同一个文件夹
$ docker inspect -f {{.Mounts}} 65aedf9c2ee1
[{volume 8f39f7de0f851e0bfbcfdd4561fbb20484f01f864ce00a159b09bdcdf743e068 /var/lib/docker/volumes/8f39f7de0f851e0bfbcfdd4561fbb20484f01f864ce00a159b09bdcdf743e068/_data /data local  true }]
```

### 0x04 删除Volumes
```bash
docker rm -v d145e8c6f874 #删除容器时一起删除数据
```


#### Reference(侵删)：
* [http://dockone.io/article/128](http://dockone.io/article/128?_blank)
