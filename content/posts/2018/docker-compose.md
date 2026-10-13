---
draft: false
date: 2018-11-19 20:10:23
title: Docker Compose
description: 
categories:
  - Linux
tags:
  - docker
---

### 0x00 关于docker compose
可以把docker-compose当作docker命令的封装，它是一个用来把 docker 自动化的东西，docker-compose可以一次性管理多个容器，通常用于需要多个容器相互配合来完成某项任务的场景。

### 0x01 安装与卸载
[https://docs.docker.com/compose/install](https://docs.docker.com/compose/install?_blank)

### 0x02 一些常用命令
* 构建容器：docker-compose up -d
* 启动容器：docker-compose start
* 停止容器：docker-compose stop
* 重启容器：docker-compose restart
* kill容器：docker-compose kill
* 删除容器：docker-compose rm
* bash连接容器：docker-compose exec [services_name] bash
* 执行一条命令：docker-compose run [services_name] [command]

### 0x03 docker-compose简单应用
* 结构

    ```
    .
    ├── Dockerfile
    ├── docker-compose.yml
    └── src
        ├── app.py
        └── sources.list

    1 directory, 4 files
    ```

* Dockerfile

    ```
    FROM ubuntu:14.04.4
    MAINTAINER reber <1070018473@qq.com>

    COPY ./src /code #将data挂载到容器的code
    WORKDIR /code
    RUN cp sources.list /etc/apt/sources.list && apt-get update
    RUN apt-get install -y python-dev python-pip
    RUN pip install flask redis

    CMD ["python","app.py"]
    ```

* docker-compose.yml(构建两个services)

    ```
    version: '3'
    services:
      web:
        image: "dockercompose:test"  #镜像名字和标签
        build: .
        ports:
         - "8888:5000" #将容器的5000映射到本机的8888端口
        volumes:
         - ./src:/code  #挂载后更改本机文件时容器中的文件会随之改变，反之一样
        links:
         - redis  #links后在web中访问redis就可以通过redis这个名字来访问而不用通过ip，比如ping -c 2 redis
      redis:
        image: "redis:alpine"
        ports:
         - "3333:6379"
    ```

* app.py

    ```
    import time
    import redis
    from flask import Flask

    app = Flask(__name__)
    cache = redis.Redis(host='redis', port=6379)

    def get_hit_count():
        retries = 5
        while True:
            try:
                return cache.incr('hits')
            except redis.exceptions.ConnectionError as exc:
                if retries == 0:
                    raise exc
                retries -= 1
                time.sleep(0.5)

    @app.route('/')
    def hello():
        count = get_hit_count()
        return 'Hello World! I have been seen {} times.\n'.format(count)

    if __name__ == "__main__":
        app.run(host="0.0.0.0", debug=True)
    ```

* 操作容器

    ```
    [12:21 reber@wyb in ~/dockercomposetest]
    #构建并运行容器
    ➜  docker-compose up -d
    Creating dockercomposetest_redis_1 ...
    Creating dockercomposetest_redis_1 ... done
    Creating dockercomposetest_web_1 ...
    Creating dockercomposetest_web_1 ... done
    
    #拉取了两个镜像ubuntu和redis，在此基础上生成镜像dockercompose:test
    ➜  docker images
    REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
    dockercompose       test                c421a84a85a9        About an hour ago   415MB
    redis               alpine              05635ee9e1c7        6 days ago          40.8MB
    ubuntu              14.04.4             0ccb13bf1954        2 years ago         188MB
    
    #生成两个容器
    ➜  docker ps
    CONTAINER ID        IMAGE                COMMAND                  CREATED             STATUS              PORTS                    NAMES
    b1a5d90b0646        dockercompose:test   "python app.py"          36 seconds ago      Up 35 seconds       0.0.0.0:8888->5000/tcp   dockercomposetest_web_1
    364d6cf7ae50        redis:alpine         "docker-entrypoint..."   36 seconds ago      Up 35 seconds       0.0.0.0:3333->6379/tcp   dockercomposetest_redis_1

    #执行一条命令就会生成一个容器
    ➜  docker-compose run web pwd
    Starting dockercomposetest_redis_1 ... done
    /code
    ➜  docker-compose run web ls
    Starting dockercomposetest_redis_1 ... done
    app.py  sources.list
    ➜  docker ps -a
    CONTAINER ID        IMAGE                COMMAND                  CREATED              STATUS                          PORTS                    NAMES
    9b74c86f8f99        dockercompose:test   "ls"                     15 seconds ago       Exited (0) 10 seconds ago                                dockercomposetest_web_run_2
    6025c6379617        dockercompose:test   "pwd"                    20 seconds ago       Exited (0) 19 seconds ago                                dockercomposetest_web_run_1
    b1a5d90b0646        dockercompose:test   "python app.py"          9 minutes ago        Up 9 minutes                    0.0.0.0:8888->5000/tcp   dockercomposetest_web_1
    364d6cf7ae50        redis:alpine         "docker-entrypoint..."   9 minutes ago        Up 9 minutes                    0.0.0.0:3333->6379/tcp   dockercomposetest_redis_1

    #查看运行情况
    ➜  curl http://127.0.0.1:8888
    Hello World! I have been seen 3 times.
    ➜  redis-cli -h 127.0.0.1 -p 3333
    127.0.0.1:3333> keys *
    1) "hits"
    127.0.0.1:3333> get hits
    "3"
    127.0.0.1:3333> exit
    ```

* 常用命令

    ```
    [12:31 reber@wyb in ~/dockercomposetest]
    ➜  docker-compose up -d
    Creating dockercomposetest_redis_1 ...
    Creating dockercomposetest_redis_1 ... done
    Creating dockercomposetest_web_1 ...
    Creating dockercomposetest_web_1 ... done
    ➜  docker ps
    CONTAINER ID        IMAGE                COMMAND                  CREATED             STATUS              PORTS                    NAMES
    d8b6270f1b63        dockercompose:test   "python app.py"          7 seconds ago       Up 6 seconds        0.0.0.0:8888->5000/tcp   dockercomposetest_web_1
    4d1965d53fe5        redis:alpine         "docker-entrypoint..."   7 seconds ago       Up 6 seconds        0.0.0.0:3333->6379/tcp   dockercomposetest_redis_1
    ➜  docker-compose stop
    Stopping dockercomposetest_web_1 ... done
    Stopping dockercomposetest_redis_1 ... done
    [12:31 reber@wyb in ~/dockercomposetest]
    ➜  docker ps -a
    CONTAINER ID        IMAGE                COMMAND                  CREATED             STATUS                     PORTS               NAMES
    0582adca2a2d        dockercompose:test   "python app.py"          12 seconds ago      Exited (0) 7 seconds ago                       dockercomposetest_web_1
    1f8417160da3        redis:alpine         "docker-entrypoint..."   12 seconds ago      Exited (0) 6 seconds ago                       dockercomposetest_redis_1
    ➜  docker-compose rm
    Going to remove dockercomposetest_web_1, dockercomposetest_redis_1
    Are you sure? [yN] y
    Removing dockercomposetest_web_1 ... done
    Removing dockercomposetest_redis_1 ... done
    ➜  docker ps -a
    CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
    ```

### 0x04 构建tomcat实例
```bash
➜  tree
.
├── Dockerfile
├── docker-compose.yml
├── src
│   ├── apache-tomcat-8.0.53.tar.gz
│   ├── jdk-8u181-linux-x64.tar.gz
│   └── sources.list
└── web
    └── index.jsp

2 directories, 6 files

➜  cat Dockerfile
FROM ubuntu:14.04.4
MAINTAINER reber <1070018473@qq.com>

COPY ./src /data
WORKDIR /data
RUN cp sources.list /etc/apt/sources.list && apt-get update
RUN tar -zxvf apache-tomcat-8.0.53.tar.gz && mv apache-tomcat-8.0.53 /opt
RUN tar -zxvf jdk-8u181-linux-x64.tar.gz && mv jdk1.8.0_181 /opt
RUN rm -rf /data

ENV JAVA_HOME="/opt/jdk1.8.0_181"
ENV JAVA_BIN="$JAVA_HOME/bin"
ENV CLASSPATH="$JAVA_HOME/lib"
ENV PATH="$JAVA_HOME/bin":$PATH

WORKDIR /opt/apache-tomcat-8.0.53/webapps/ROOT

ENTRYPOINT ["tail","-f","/dev/null"] #使容器一直运行，不自动退出

➜  cat docker-compose.yml
version: '3'
services:
  tomcat:
    image: ubuntu:tomcat
    build: .
    ports:
     - "8888:8080"
    volumes:
     - ./web:/opt/apache-tomcat-8.0.53/webapps/ROOT
```



#### Reference(侵删)：
* [https://docs.docker.com/compose/gettingstarted/](https://docs.docker.com/compose/gettingstarted/?_blank)

