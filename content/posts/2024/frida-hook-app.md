---
draft: false
isCJKLanguage: true
date: 2024-05-15
lastmod: 2024-05-15
title: "使用 Hook 框架 frida 进行调试"
description: 我的个人博客，主要用于记录自己的一些渗透测试、编程等学习笔记之类的东西。
categories: 
  - Pentest
tags:
  - hook
---


### 0x00 frida

1、手机端安装一个 server 程序  
2、然后把手机端的端口转到 PC 端  
3、PC 端写 js 脚本进行通信

frida -U -f com.package.name -l exploit.js
```js
function hook() {
  console.log("[*] Starting script")
    
  Java.perform(function () {
    var <class_reference> = Java.use("<package_name>.<class>");
    <class_reference>.<method>.implementation = function(<args>) {
      console.log("hook <class_reference>.<method>()")
      console.log("args is:", args)
      
      var ret = this.<method_to_hook>(args);
      return ret
    }
  })
}
```

### 0x01 JAVA 层 - 直接调用函数

* 调用静态函数
    ```java
    package com.example.test.ui.test;
    
    public class TestFrida {
        public static String staticFunc(boolean isOk) {
            if (isOk){
                return "flag{sdfjwiejflkjf}";
            } else {
                return "nonono";
            }
        }
    }
    ```
    ```js
    function hook_static_func() {
      console.log("[*] Starting script")
    
      Java.perform(function () {
        var TestFrida = Java.use("com.example.test.ui.test.TestFrida")
        var str = TestFrida.staticFunc(true)
        console.log(str)
      })
    }
    ```

* 调用非静态函数
   ```java
    package com.example.test.ui.test;
    
    public class TestFrida {
        public String noStaticFunc(boolean isOk){
            if (isOk){
                return "flag{orjkwjflkjd}";
            } else {
                return "nonono";
            }
        }
    }
    ```
    ```js
    function hook_no_static_func() {
      console.log("[*] Starting script")
    
      Java.perform(function () {
        var TestFrida = Java.use("com.example.test.ui.test.TestFrida")
        var testFrida = TestFrida.$new();
        var str = testFrida.noStaticFunc(true);
        console.log(str)
      })
    }
    ```

### 0x02 JAVA 层 - hook 一般函数

* hook 函数返回值
    ```java
    package com.example.test.ui.test;
    
    public static String checkState(boolean state) {
        if (state) {
            return "flag !!!";
        } else {
            return "nonono";
        }
    }
    ```
    ```js
    function hook_func_return() {
      console.log("[*] Starting script")
    
      Java.perform(function () {
        var TestFrida = Java.use("com.example.test.ui.test.TestFrida")
        TestFrida.checkState.implementation = function(arg) {
          console.log("hook TestFrida.checkState()")
    
          return "flag"
        }
      })
    }
    ```

* hook 函数的参数
    ```java
    package com.example.test.ui.test;
    
    public class Use {
        public static void testReturn(Context context, boolean state) {
            String msg = checkState(state);
            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
        }
    
        public static String checkState(boolean state) {
            if (state) {
                return "flag !!!";
            } else {
                return "nonono";
            }
        }
    }
    ```
    调用 `TestFrida.testReturn(requireContext(), false);`
    ```js
    function hook_func_arg() {
      console.log("[*] Starting script")
    
      Java.perform(function () {
        var TestFrida = Java.use("com.example.test.ui.test.TestFrida")
        TestFrida.checkState.implementation = function(arg) {
          console.log("hook TestFrida.checkState()")
          console.log("arg is:", arg)
    
          arg = true
    
          var ret = this.checkState(arg);
          return ret
        }
      })
    }
    ```

### 0x03 JAVA 层 - hook 内部类的函数

* hook 类内静态变量
    ```java
    package com.example.test.ui.test;
    
    public class TestFrida {
        static class InnerClass {
            public String innerFunc(String msg) {
                return msg;
            }
        }
    
        public static String useInnerFunc() {
            InnerClass inner = new InnerClass();
            return inner.innerFunc("this is useInnerFunc()");
        }
    }
    ```
    ```js
    function hook_inner_class() {
      console.log("[*] Starting script")
    
      Java.perform(function () {
        var InnerClass = Java.use("com.example.test.ui.test.TestFrida$InnerClass")
        InnerClass.innerFunc.implementation = function(){
          var ret = this.innerFunc("test msg")
          return ret
        }
      })
    }
    ```

### 0x04 JAVA 层 - hook 重载函数

* hook 重载函数
    ```java
    package com.example.test.ui.test;
    
    public class TestFrida {
        public static void testArg(Context context, String a) {
            Toast.makeText(context, a, Toast.LENGTH_SHORT).show();
        }
    
        public static void testArg(Context context, String a, String b) {
            Toast.makeText(context, a+","+b, Toast.LENGTH_SHORT).show();
        }
    }
    ```
    调用 `TestFrida.testArg(context, "aaa", "bbb");`
    使用 overload 来 hook 两个参数的那个 testArg()
    ```js
    function hook_class_static_variables() {
      console.log("[*] Starting script")
    
      Java.perform(function () {
        var TestFrida = Java.use("com.example.test.ui.test.TestFrida")
        TestFrida.testArg.overload(
          "android.content.Context", "java.lang.String", "java.lang.String"
        ).implementation = function(context, arg1, arg2) {
          console.log("hook TestFrida.testArg(String a, String b)")
          console.log("arg is:", context, arg1, arg2)
    
    
          var ret = this.testArg(context, arg1, arg2);
          return ret
        }
      })
    }
    ```

### 0x05 JAVA 层 - hook 构造函数

* hook 构造函数
    ```java
    package com.example.test.ui.test;
    
    public class TestFrida {
        int num = 0;
        
        public TestFrida(int num) {
            this.num = num;
        }
        
        public static String test() {
            if (this.num > 10) {
                return "flag !!!";
            } else {
                return "nonono";
            }
        }
    }
    ```
    
    调用的函数
    ```java
    public static void ttt(Context context) {
        TestFrida testFrida = new TestFrida(5);
        String msg = testFrida.test();
        Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show();
    }
    ```
    
    ```js
    function hook_init() {
      console.log("[*] Starting script")
    
      Java.perform(function () {
        var TestFrida = Java.use("com.example.test.ui.test.TestFrida")
        TestFrida.$init.implementation = function (arg){
            console.log("arg is: ", arg);
            this.$init(20);
    
            console.log(this.test()) // flag !!!
        }
      })
    }
    ```

### 0x06 JAVA 层 - hook 静态变量

* hook 类内静态变量
    ```java
    package com.example.test.ui.test;
    
    public class TestFrida {
        private static String msg="ccc";
        public static void testReturn(Context context, boolean state) {
            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
        }
    }
    ```
    ```js
    function hook_class_static_variables() {
      console.log("[*] Starting script")
    
      Java.perform(function () {
        var TestFrida = Java.use("com.example.test.ui.test.TestFrida")
    
        console.log("hook TestFrida.msg")
        TestFrida.msg.value = "new value"
      })
    }
    ```

### 0x07 JAVA 层 - MainActivity 中的函数

* 调用 MainActivity 中的函数
    直接调用 MainActivity 中的函数时会出现：Error: java.lang.ClassNotFoundException
    因为安卓组件(如 Activity)的子类依赖于应用程序上下文运行，而 Frida 中没有必要的上下文

    ```java
    public class MainActivity extends AppCompatActivity {
        public String test1() {
            return "call function MainActivity.test()";
        }
    
        public static String test2() {
            return "call static function MainActivity.test1()";
        }
    }
    ```
    ```js
    function hook_main_activity_func() {
      console.log("[*] Starting script")
    
      Java.performNow(function() {
        Java.choose('com.example.test.MainActivity', {
          onMatch: function(MainActivity) {
            var str1 = MainActivity.test1()
            console.log(str1)
            // call function MainActivity.test1()
    
            var str2 = MainActivity.test2()
            console.log(str2)
            // call static function MainActivity.test2()
          },
          onComplete: function() {}
        });
      });
    }
    ```

### 0x08 NATIVE 层

* 改 strlen
    ```js
    setImmediate(function() {
      Interceptor.attach(Module.findExportByName("libc.so", "strlen"), {
        onEnter: function(args) {
          console.log(Memory.readUtf8String(args[0]))
        },
        onLeave: function(retval) {
          console.log(retval)
          return this.retval
        }
      });
    })
    ```


**参考资料**
* [Frida-Hook-Java层操作大全](https://zhuanlan.zhihu.com/p/689390823?_blank)
* [【Frida Hook 学习记录】Frida Hook Android 常用方法](https://www.cnblogs.com/du-jun/p/14303380.html?_blank)
