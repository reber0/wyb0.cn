---
draft: false
date: 2016-04-19
title: 利用 EtterCap 进行中间人攻击
description: 
categories:
  - Pentest
tags:
  - 中间人
  - tools
---

### 0x00 准备
```
操作系统：CentOS  
首先，ettercap 安装时需要 4 个依赖包，而且安装包里面也已经提供了  
执行：sudo yum groupinstall "Development tools"    #源码安装软件就需要安装这个
使用 wget 下载 ettercap 源码
```

### 0x01 查看需要的依赖项
```
[wyb@localhost ettercap-0.8.2]$ vim INSTALL

 #### Bundled libraries  
 Ettercap now bundles the following libraries with the source distribution:  
   libnet 1.1.6  
   curl 7.41.0  
   luajit 2.0.3  
   check 0.9.14  
[wyb@localhost ettercap-0.8.2]$ cd bundled_deps/  
[wyb@localhost bundled_deps]$ ls  
check  curl  libnet  luajit
```

### 0x02 安装依赖包
1. 安装check
```
[wyb@localhost check]$ cd check-0.9.14
[wyb@localhost check-0.9.14]$ ls
[wyb@localhost check-0.9.14]$ ./configure 
[wyb@localhost check-0.9.14]$ make
[wyb@localhost check-0.9.14]$ sudo make install
```

2. 安装curl
```
[wyb@localhost check-0.9.14]$ cd ..
[wyb@localhost curl-7.41.0]$ cd curl/
[wyb@localhost curl-7.41.0]$ cd curl-7.41.0
[wyb@localhost curl-7.41.0]$ make
[wyb@localhost curl-7.41.0]$ sudo make install
```

3. 安装libnet
```
[wyb@localhost curl-7.41.0]$ cd ../../libnet/
[wyb@localhost libnet]$ tar -zxvf libnet-1.1.6.tar.gz
[wyb@localhost libnet]$ cd libnet-1.1.6
[wyb@localhost libnet-1.1.6]$ ./configure 
[wyb@localhost libnet-1.1.6]$ make
[wyb@localhost libnet-1.1.6]$ sudo make install
```

4. 安装luajit
```
[wyb@localhost luajit]$ tar -zxvf LuaJIT-2.0.3.tar.gz 
[wyb@localhost luajit]$ make
[wyb@localhost luajit]$ sudo make install
```

5. 安装ettercap

        [wyb@localhost ettercap-0.8.2]$ cd ettercap-0.8.2 
        [wyb@localhost ettercap-0.8.2]$ mkdir build                   
        [wyb@localhost ettercap-0.8.2]$ cd build  
        [wyb@localhost build]$ cmake ../    *cmake ettercap时提示未安装cmake*  
        -bash: cmake: command not found  
        [wyb@localhost build]$ sudo yum install cmake   *安装cmake*  
        [wyb@localhost build]$ cmake ../    *提示未安装curses*  
        -- The C compiler identification is GNU 4.4.7  
        -- Check for working C compiler: /usr/bin/cc  
        -- Check for working C compiler: /usr/bin/cc -- works  
        .....  
        .....  
        CMake Error at /usr/share/cmake/Modules/FindPackageHandleStandardArgs.cmake:108 (message):  
          Could NOT find Curses (missing: CURSES_LIBRARY CURSES_INCLUDE_PATH)  
        .....  
        .....  
        [wyb@localhost build]$ yum search curses    *查找curses*  
        Loaded plugins: fastestmirror, refresh-packagekit, security  
        Determining fastest mirrors  
         * base: mirrors.yun-idc.com  
         * extras: mirrors.opencas.cn  
         * updates: mirrors.btte.net
        ============================= N/S Matched: curses   ==============================  
        ncurses.x86_64 : Ncurses support utilities  
        ncurses-devel.i686 : Development files for the ncurses library  
        ncurses-devel.x86_64 : Development files for the ncurses library  
        ncurses-libs.x86_64 : Ncurses libraries  
        ncurses-libs.i686 : Ncurses libraries  
        ncurses-static.x86_64 : Static libraries for the ncurses library  
        ocaml-curses.x86_64 : OCaml bindings for ncurses    
        ocaml-curses-devel.x86_64 : Development files for ocaml-curses  
        ncurses-base.x86_64 : Descriptions of common terminals  
        ncurses-term.x86_64 : Terminal descriptions  
          Name and summary matches only, use "search all" for everything.  
        [wyb@localhost build]$ sudo yum install ncurses ncurses-devel   *安装ncurses开发包*  
        [wyb@localhost build]$ rm -rf *     *清除上次cmake产生的文件*  
        [wyb@localhost build]$ cmake ../    *出错，缺少依赖包GTK*  
        -- The C compiler identification is GNU 4.4.7  
        -- Check for working C compiler: /usr/bin/cc  
        ......  
        ......  
        CMake Error at /usr/share/cmake/Modules/FindGTK2.cmake:429 (message):  
          Could not find GTK2 include directory  
        ....  
        ....  
        [wyb@localhost build]$ yum search gtk  
        Loaded plugins: fastestmirror, refresh-packagekit, security  
        Loading mirror speeds from cached hostfile  
         * base: mirrors.yun-idc.com  
        .....  
        .....  
        gtk2.x86_64 : The GIMP ToolKit (GTK+), a library for creating GUIs for X  
        gtk2.i686 : The GIMP ToolKit (GTK+), a library for creating GUIs for X  
        gtk2-devel.i686 : Development files for GTK+   
        .... 
        ....  
        [wyb@localhost build]$ sudo yum install gtk2 gtk2-devel *安装gtk及开发包* 
        [wyb@localhost build]$ rm -rf *     *清除上次cmake产生的文件*  
        [wyb@localhost build]$ cmake ../    *缺少依赖包OpenSSL*  
        -- The C compiler identification is GNU 4.4.7  
        -- Check for working C compiler: /usr/bin/cc  
        -- Check for working C compiler: /usr/bin/cc -- works  
        -- Detecting C compiler ABI info  
        -- Detecting C compiler ABI info - done  
        -- Check if the system is big endian  
        .....  
        .....  
        CMake Error at /usr/share/cmake/Modules/FindPackageHandleStandardArgs.cmake:108 (message):  
          Could NOT find OpenSSL, try to set the path to OpenSSL root folder in the  
          system variable OPENSSL_ROOT_DIR (missing: OPENSSL_LIBRARIES OPENSSL_INCLUDE_DIR)    
        .....  
        .....  
        [wyb@localhost build]$ yum search openssl   *查找openssl*  
        [wyb@localhost build]$ sudo yum install openssl openssl-devel   *安装openss及其开发包*  
        [wyb@localhost build]$ rm -rf *     *清除上次cmake产生的文件*  
        [wyb@localhost build]$ cmake ../    *依赖libpcap*  
        ......  
        ......  
        -- Looking for inet_aton  
        -- Looking for inet_aton - found  
        CMake Error at cmake/Modules/EttercapLibCheck.cmake:191 (message):  
          libpcap not found!  
        ....  
        ....  
        [wyb@localhost build]$ yum search libpcap   *查找libpcap*  
        Loaded plugins: fastestmirror, refresh-packagekit, security  
        Loading mirror speeds from cached hostfile  
         * base: mirrors.yun-idc.com   
         * extras: mirrors.opencas.cn  
         * updates: mirrors.btte.net  
        ============================= N/S Matched: libpcap =============================  
        libpcap-devel.i686 : Libraries and header files for the libpcap library  
        libpcap-devel.x86_64 : Libraries and header files for the libpcap library  
        libpcap.x86_64 : A system-independent interface for user-level packet capture  
        libpcap.i686 : A system-independent interface for user-level packet capture  
          Name and summary matches only, use "search all" for everything.  
        [wyb@localhost build]$ sudo yum install libpcap-devel   *安装libpcap-devel*  
        [wyb@localhost build]$ rm -rf *     *清除上次cmake产生的文件*  
        [wyb@localhost build]$ cmake ../    *cmake成功*  
        [wyb@localhost build]$ make *make*  
        ....  
        ....  
        Linking C executable etterlog  
        [100%] Built target etterlog  
        Scanning dependencies of target man  
        [100%] Built target man  
        [wyb@localhost build]$ sudo make install    *make install*  
        .....  
        .....   
        -- Installing: /usr/local/share/man/man8/ettercap_curses.8  
        -- Installing: /usr/local/share/man/man8/ettercap-pkexec.8  
        -- Installing: /usr/local/share/man/man5/etter.conf.5  
        [wyb@localhost build]$ cd  
        [wyb@localhost ~]$ ettercap -v  *查看版本且能查看，证明安装成功*  
        ettercap 0.8.2 copyright 2001-2015 Ettercap Development Team  
        ettercap 0.8.2  
        [wyb@localhost ~]$
