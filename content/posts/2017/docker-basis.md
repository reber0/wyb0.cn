---
draft: false
date: 2017-08-15 22:16:35
title: Docker 初识
description: 
categories:
  - Linux
tags:
  - docker
---

### 0x00 关于Docker
* Docker中的镜像类似VM的快照，容器类似虚拟机，使用镜像创建容器类似于使用快照创建虚拟机。
* Docker中运行应用的是容器，容器的创建和销毁在秒级就能完成。
* Docker使用了AUFS，可以以递进的方式创建"VM"，一个"VM"叠在另一个"VM"上，就像使用git增量开发一样。
* 软件的运行环境（image）和软件本身（container）分离，和数据也分离。

学习Docker需要了解4个概念：镜像、容器、数据卷、链接

### 0x01 镜像image
* Docker Images 只是一个只读模板，用来运行Docker容器，可以在Docker hub(官方镜像库)下载。
* 镜像拥有唯一ID(比如：72c989e2d109)以及一个供人阅读的名字和标签对(比如：ubuntu:latest)。
* 镜像必须完全可移植,Docker不允许例外。

### 0x02 容器container
* 可以在一个镜像的基础上创建多个容器，每个容器相互独立。
* 容器也拥有唯一ID以及一个供人阅读的名字。
* 容器被启动时会被分配一个随机的私有IP，其他容器可以通过这个IP与它进行通信。
* Docker允许公开容器的特定端口。
* 一个容器一个进程，容器设计本意是用来运行一个应用的而非一台机器。
* 容器应该是短暂和一次性的。
* Docker镜像层对于容器来说，是只读的，容器对于文件的写操作绝对不会作用在镜像中。

### 0x03 数据卷
* 数据卷表现为容器内的空间，但实际保存在容器外，你可以在不影响数据的情况下销毁、重建、修改、丢弃容器。
* Docker允许你定义应用和数据部分，并提供工具让你可以将它们分开。

### 0x04 链接
* Docker允许你在创建一个新容器时引用其它现存容器，在你刚创建的容器里被引用的容器将获得一个你指定的别名，我们就说这两个容器被链接在了一起。
* 若DB容器已经在运行，我们可以创建一个Web服务器容器，并在创建时引用这个DB容器，可以给它起个别名(比如dbapp)，在新创建的Web服务器容器中，可以在任何时候使用主机名dbapp与DB容器进行通信。

### 0x05 镜像与容器关系
* Docker镜像是一个文件，属于静态的内容；Docker容器属于动态的内容，可以把容器理解为一个或多个运行进程。
* Docker可以通过解析Docker镜像的json文件，获知应该在这个镜像之上运行什么样的进程，应该为进程配置怎么样的环境变量。
* Docker守护进程手握Docker镜像的json文件，它为容器配置相应的环境并真正运行Docker镜像所指定的进程，从而完成Docker容器的真正创建。
* 当Docker容器运行起来之后，Docker镜像json文件就失去作用了。此时Docker镜像的绝大部分作用就是：为Docker容器提供一个文件系统的视角，供容器内部的进程访问文件资源。

### 0x06 Docker有三个组件和三个基本元素
* 三个组件
    * Docker Daemon 运行于主机上，处理服务请求，是用于管理容器的后台进程，上面有一些api接口。
    * Docker Client 用于操作容器，它是Deamon的api接口(如docker start、docker rm等)的封装。
    * Docker Index 是中央registry，支持拥有公有与私有访问权限的Docker容器镜像的备份。

* 三个基本要素
    * Docker Images 是一个只读模板，用来运行Docker容器。
    * Docker Containers 负责应用程序的运行，包括操作系统、用户添加的文件以及元数据。
    * DockerFile 是文件指令集，用来说明如何自动创建Docker镜像。

### 0x07 Docker的运行原理
* Docker使用以下操作系统的功能来提高容器技术效率  
Namespaces：充当隔离的第一级。确保一个容器中运行一个进程而且不能看到或影响容器外的其它进程。  
Control Groups：是LXC的重要组成部分，实现资源核算与限制，提供CPU、内存、网络相关指标等。  
UnionFS：union文件系统，容器的构建块。它用于保存镜像并使容器变得短暂(即轻量级及速度快的特性)。

* 运行任何应用程序都需要两个基本步骤，即构建一个镜像和运行容器  
上面两步都是从Docker Client的命令(比如：docker run)开始的  
在基础层面上，Docker Client会告诉Docker Daemon需要创建的镜像以及需要在容器内运行的命令

### 0x08 Docker Registry
Docker Registry是Docker的镜像存储服务端，它是所有仓库(包括私有和公有)以及工作流的中央Registry  
Docker Registry有3个角色：index、registry、registry client

* index
```
负责并维护有关用户账户、镜像的体验以及公共命名空间的信息。
index通过Web UI、元数据存储、认证服务、符号化这几个组件来维护这些信息。
```

* registry  
它是镜像和图表的仓库(比如Docker hub)
```
Registry包含一个或多个Repository
Repository包含一个或多个Image
Image用GUID表示，有一个或多个Tag与之关联
```

* registry client
```
客户端
```

### 0x09 Docker下载镜像的原理
![docker pull](/img/post/docker_pull.png)

1. Client向Index请求，询问从哪里下载CentOS
2. Index回复Client说CentOS在Registry A可以得到，并且返回CentOS的Checksum，所有层的Token
3. Client带着Token向Registry A请求CentOS的所有层(Registry A负责存储CentOS，以及它所依赖的层)
4. Regsitry A向Index发起请求，验证用户Token的合法性
5. Index回复Registry A这次请求是否合法
6. Client从Registry A下载所有的层：Registry从后端存储中获取实际的文件数据，返给Client

### 0x0A Docker安装与卸载
```bash
#安装
$ sudo apt-get update
$ sudo apt-get install apt-transport-https ca-certificates curl software-properties-common

$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
# Verify that the key fingerprint is 9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88
$ sudo apt-key fingerprint 0EBFCD88

$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

$ sudo apt-get update
$ sudo apt-get install docker-ce

$ sudo docker info #查看是否安装成功
```

```bash
#卸载
$ sudo apt-get purge docker-ce
$ sudo rm -rf /var/lib/docker
```

```
#添加当前用户到docker组
$ sudo gpasswd -a ${USER} docker
$ sudo service docker restart
$ newgrp - docker
```


#### Reference(侵删)：
* [https://docs.docker.com/install/](https://docs.docker.com/install/?_blank)