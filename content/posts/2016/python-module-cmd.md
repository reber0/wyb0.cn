---
draft: false
date: 2016-07-14 09:44:06
title: Python 的 cmd 模块
description: 
categories:
  - Python
tags:
  - python
  - module
---

### 0x00 关于cmd模块
使用cmd模块创建的命令行解释器可以循环读取输入的所有行并且解析它们

### 0x01 cmd模块的一些常用方法：
1. cmdloop()：类似与Tkinter的mainloop，运行Cmd解析器
2. onecmd(str)：读取输入，并进行处理，通常不需要重载该函数，而是使用更加具体的do_command来执行特定的命名
3. emptyline()：当输入空行时调用该方法
4. default(line)：当无法识别输入的command时调用该方法
5. completedefault(text,line,begidx,endidx):如果不存在针对的complete_*()方法，那么会调用该函数
6. precmd(line)：命令line解析之前被调用该方法
7. postcmd(stop，line)：命令line解析之后被调用该方法
8. preloop()：cmdloop()运行之前调用该方法
9. postloop()：cmdloop()退出之后调用该方法

### 0x02 用cmd模块简单实现shell命令
```
#!/usr/bin/env python
#-*- coding:utf-8 -*-

import sys
import os
import socket
from cmd import Cmd

class ClassShell(Cmd):
    """docstring for ClassShell"""
    def __init__(self):
        Cmd.__init__(self)
        os.chdir("C:/Users/reber/Desktop")
        hostName = socket.gethostname()
        self.prompt = "reber@" + hostName + "  " + os.path.abspath('.') + "\n$ "
        

    def help_dir(self):
        print "dir [path]"
    def do_dir(self, arg):
        if not arg:
            print "\n".join(os.listdir('.'))
        elif os.path.exists(arg):
            print "\n".join(os.listdir(arg))
        else:
            print "no such path exists"

    def help_ls(self):
        print "ls [path]"
    def do_ls(self, arg):
        if not arg:
            print "\n".join(os.listdir('.'))
        elif os.path.exists(arg):
            print "\n".join(os.listdir(arg))
        else:
            print "no such path exists"

    def help_pwd(self):
        print "pwd"
    def do_pwd(self, arg):
        print os.path.abspath('.')

    def help_cd(self):
        print "cd [path]"
    def do_cd(self, arg):
        hostName = socket.gethostname()
        if not arg:
            os.chdir("C:/Users/reber/Desktop")
            self.prompt = "reber@" + hostName + "  " + os.path.abspath('.') + "\n$ "
        elif os.path.exists(arg):
            os.chdir(arg)
            self.prompt = "reber@" + hostName + "  " + os.path.abspath('.') + "\n$ "
        else:
            print "no such path"

    def help_clear(self):
        print "clear"
    def do_clear(self, arg):
        i = os.system('cls')

    def help_cat(self):
        print "cat filename"
    def do_cat(self, arg):
        if os.path.exists(arg):
            with open(arg,"r") as f:
                data = f.read()
            print data
        else:
            print "no such file exists"

    def help_mv(self):
        print "mv oldfilename newfilename"
    def do_mv(self, arg):
        oldfilename,newfilename = arg.split()
        if os.path.exists(oldfilename):
            os.rename(oldfilename,newfilename)
        else:
            print "no such file:" + oldfilename

    def help_touch(self):
        print "touch filename"
    def do_touch(self, arg):
        with open(arg, "w") as f:
            pass

    def help_rm(self):
        print "rm filepath"
    def do_rm(self, arg):
        if os.path.exists(arg):
            os.remove(arg)
        else:
            print "no such file:" + arg
        
    def help_cp(self):
        print "cp oldfilepath newfilepath"
    def do_cp(self, arg):
        oldfilepath,newfilepath = arg.split()
        if os.path.exists(oldfilepath):
            with open(oldfilepath, "r") as f:
                data = f.read()
            with open(newfilepath, "w") as f:
                f.write(data)
        else:
            print "no such path:" + oldfilepath

    def help_exit(self):
        print "input exit will exit the program"

    def do_exit(self, arg):
        print "Exit:",arg
        sys.exit()


if __name__ == '__main__':
    shell = ClassShell()
    shell.cmdloop()
```

### 0x03 程序执行结果如下
![60](/img/post/cmd_results_sample.png)
