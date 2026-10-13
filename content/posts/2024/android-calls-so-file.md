---
draft: false
isCJKLanguage: true
date: 2024-05-17
lastmod: 2024-05-17
title: "安卓调用 so 文件"
description: 我的个人博客，主要用于记录自己的一些渗透测试、编程等学习笔记之类的东西。
categories: 
  - Code
tags:
  - android
---


### 0x00 安卓的 JNI
安卓开发中，JNI 就是 Java Native Interface 的缩写，它允许 Java 代码调用原生的 C/C++ 代码，或者允许 C/C++ 代码调用 Java 代码。

在 Android Stdio 中，有以下 3 种方法使用 so 文件：

* 本地库模块和 App 模块在同一个工程内  
1、在本地模块使用 C/C++ 实现功能  
2、在 native.cpp 中为本地函数添加 JNI 标注  
3、App 模块使用 System.loadLibrary 加载本地库  
4、通过 JNIEnv 调用本地函数

* 本地库作为独立的类库模块开发，为其他项目提供服务  
1、本地库模块使用 C/C++ 实现功能  
2、在 native.cpp 中为本地函数添加 JNI 标注  
3、将本地库导出为共享库文件(.so)  
4、其他项目的 App 模块使用 System.loadLibrary 加载该共享库  
5、通过 JNI 调用本地函数

* 自己编译 C/C++，然后放到项目中  
1、直接通过 C/C++ 实现功能  
2、通过编译工具将代码编译为共享库文件(.so)  
3、项目的 App 模块使用 System.loadLibrary 加载该共享库  
4、在 native.cpp 中为 so 中的函数添加 JNI 标注  
5、通过 JNI 调用本地函数

### 0x01 项目中生成 so
* 添加 C++ Module

    通过 Android Stdio 文件-Add C++ to Module，会自动创建 demo/app/src/main/cpp 文件夹，同时下面有 `CMakeLists.txt`、`<project name>.cpp`
    ![80](/img/post/1719794839203.jpg)

    同时在 demo/app/build.gradle.kts 会自动添加相关内容
    ![80](/img/post/Xnip2024-07-01_08-49-38.png)

* 创建 JNI

    在 com.example.demo 下新建一个 java 类 MyJNI
    ![80](/img/post/Xnip2024-07-01_08-50-30.png)

    在 MyJNI.java 下添加一个函数，代码如下
    ```java
    package com.example.demo;
    
    public class MyJNI {
        static {
            System.loadLibrary("demo"); // 加载内部 so
        }
        public static native String helloFromDemo();
    }
    ```

    然后根据 Android Stdio 的提示添加对应的函数，会自动跳转到 demo.cpp 并添加函数
    ![](/img/post/Xnip2024-07-01_08-51-08.png)


    我们修改 demo.cpp 下的函数 helloFromTest 返回一个字符串，如下：
    ```c
    #include <jni.h>
    #include <string>
    
    extern "C"
    JNIEXPORT jstring JNICALL
    Java_com_example_demo_MyJNI_helloFromDemo(JNIEnv *env, jclass clazz) {
        // TODO: implement helloFromDemo()
        std::string hello = "Hello from project Demo";
        return env->NewStringUTF(hello.c_str());
    }
    ```
    然后在其他地方通过 MyJNI.helloFromDemo() 进行调用即可

* 编译为 apk

    在编译 apk 时涉及到的 C/C++ 代码会自动生成为  libdemo.so 并打包进 apk 中
    ![80](/img/post/Xnip2024-07-01_08-51-35.png)
    通过 nm 查看
    ```
    ➜ nm -D arm64-v8a/libdemo.so | grep "Java"
    000000000001db30 T Java_com_example_demo_MyJNI_helloFromDemo
    ```

### 0x02 使用其他项目生成的 so

* 编译为 so 文件

    通过 Android Stdio 创建一个 Native C++ 项目，然后实现 C/C++ 代码，然后通过 构建-Make Project 即可在项目下生成 so 文件
    ```
    ➜ cd demo/app/build/intermediates/cxx/Debug/645r244u/obj
    ➜ tree .
    .
    ├── arm64-v8a
    │   └── libdemo.so
    ├── armeabi-v7a
    │   └── libdemo.so
    ├── x86
    │   └── libdemo.so
    └── x86_64
        └── libdemo.so
    
    5 directories, 4 files
    ```
    
    通过 nm 可以看到有 Java_com_example_demo_MyJNI_helloFromDemo，这个 so 可以在其他项目使用，其他项目引入 so 文件后，通过 MyJNI.helloFromDemo() 就也可以调用
    ```
    ➜ nm -D arm64-v8a/libdemo.so | grep "Java"
    000000000001db30 T Java_com_example_demo_MyJNI_helloFromDemo
    ```
    
* 在新项目中引用 so 文件

    新建项目 Test，创建文件夹复制 so，Test/app/src/main/jniLibs/arm64-v8a/libdemo.so。  
    然后创建 Test/app/src/main/java/com/example/demo/MyJNI.java，这个路径和上面 so 文件里函数的名字 Java_com_example_demo_MyJNI_helloFromDemo 一致，MyJNI.java 内容如下：
    ```java
    package com.example.demo;

    public class MyJNI {
        static {
            System.loadLibrary("demo"); // 加载外部 so
        }
        public static native String helloFromDemo();
    }
    ```
    之后在 Test 项目里通过 MyJNI.helloFromDemo() 即可直接调用外部 so 里的函数(这里不用对 helloFromDemo 实现 C/C++ 功能)
    

### 0x03 自己通过 Android NDK 编译生成 so

自己新建一个 test.c
```c
#include <stdio.h>

char* c_hello() {
    return "Hello from main.c\n";
}

int c_add(int a, int b) {
    int c,d;
    c = a;
    d = b;
    return c + d;
}
```

通过 NDK 生成 so 文件
```
➜ which aarch64-linux-android21-clang                                                        
/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android21-clang

➜ aarch64-linux-android34-clang -fpic -shared -Wl,--export-dynamic -o libself_build.so test.c

➜ file libself_build.so                  
libself_build.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, not stripped

➜ strip libself_build.so             

➜ file libself_build.so 
libself_build.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, stripped
```

查看动态符号表，可以看到 c_hello、c_add
```
➜ objdump -T libself_build.so

libself_build.so:     file format elf64-littleaarch64

DYNAMIC SYMBOL TABLE:
0000000000000000     DF *UND*  0000000000000000 (LIBC)    __cxa_finalize
0000000000000000     DF *UND*  0000000000000000 (LIBC)    __cxa_atexit
0000000000000000     DF *UND*  0000000000000000 (LIBC)    __register_atfork
0000000000001618 g   DF .text  000000000000000c  Base     c_hello
0000000000001624 g   DF .text  0000000000000030  Base     c_add
```

在项目里创建一个 Java 类
```java
package com.example.test.ui.test;

public class TestJNI {
    static {
        System.loadLibrary("self_build"); // 加载外部 so
    }
    public static native String chello();
    public static native int cadd(int a, int b);
}
```

在 native.cpp 中为 so 中的函数添加 JNI 标注，自己编译的 so 要通过 dlopen 添加
```cpp
#include <jni.h>
#include <string>
#include <dlfcn.h>
#include <android/log.h>

extern "C"
JNIEXPORT jstring JNICALL
Java_com_example_test_ui_test_TestJNI_helloFromTest(JNIEnv *env, jclass clazz) {
    std::string hello = "Hello from project Test";
    return env->NewStringUTF(hello.c_str());
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_example_test_ui_test_TestJNI_chello(JNIEnv *env, jclass clazz) {
    void* handle = dlopen("libself_build.so", RTLD_LAZY);
    if (!handle) {
        __android_log_print(ANDROID_LOG_ERROR, "dlopen", "dlopen failed");
        return NULL;
    }

    typedef char* (*Fun)();
    Fun hello = (Fun)dlsym(handle, "c_hello");

    char* str = hello();
    jstring result = env->NewStringUTF(str);

    dlclose(handle);

    return result;
}

extern "C"
JNIEXPORT int JNICALL
Java_com_example_test_ui_test_TestJNI_cadd(JNIEnv *env, jclass clazz, jint a, jint b) {
    void* handle = dlopen("libself_build.so", RTLD_LAZY);
    if (!handle) {
        __android_log_print(ANDROID_LOG_ERROR, "dlopen", "dlopen failed");
        return NULL;
    }

    typedef int (*Fun)(int, int);
    Fun c_add = (Fun)dlsym(handle, "c_add");

    int result = c_add(a, b);

    dlclose(handle);

    return result;
}
```

之后通过 JNI 调用即可
```java
package com.example.test.ui.test;

import android.content.Context;
import android.widget.Toast;

import com.example.demo.MyJNI;


public class Use {
    public static void testJNI(Context context) {
        String hello = TestJNI.helloFromTest();
        Toast.makeText(context, "libtest.so: "+hello, Toast.LENGTH_SHORT).show();

        String text = MyJNI.helloFromDemo();
        Toast.makeText(context, "libdemo.so: "+text, Toast.LENGTH_LONG).show();

        int sum = TestJNI.cadd(1,4);
        Toast.makeText(context, "libself_build.so: Sum of 1 and 4 is " + sum, Toast.LENGTH_SHORT).show();

        String xx = TestJNI.chello();
        Toast.makeText(context, "libself_build.so: "+xx, Toast.LENGTH_SHORT).show();
    }
}
```
