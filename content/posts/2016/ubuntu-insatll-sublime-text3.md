---
draft: false
date: 2016-05-08 00:04:42
title: Ubuntu 下安装 sublime text 3
description: 
categories:
  - Linux
tags:
  - software
---

环境：ubuntu14.4

### 0x00 安装
1. 添加Sublime Text 3的仓库  
sudo add-apt-repository ppa:webupd8team/sublime-text-3

2. 更新软件库  
sudo apt-get update

3. 安装Sublime Text 3  
sudo apt-get install sublime-text-installer

### 0x01 解决不能输入中文的问题
1. 新建sublime\_imfix.c(位于～目录)，写入如下内容
```c
#include <gtk/gtkimcontext.h>
void gtk_im_context_set_client_window (GtkIMContext *context,GdkWindow  *window)
{
GtkIMContextClass *klass;
g_return_if_fail (GTK_IS_IM_CONTEXT (context));
klass = GTK_IM_CONTEXT_GET_CLASS (context);
if (klass->set_client_window)
    klass->set_client_window (context, window);
g_object_set_data(G_OBJECT(context),"window",window);
if(!GDK_IS_WINDOW (window))
    return;
int width = gdk_window_get_width(window);
int height = gdk_window_get_height(window);
if(width != 0 && height !=0)
    gtk_im_context_focus_in(context);
}
```

2. 将上一步的代码编译成共享库libsublime-imfix.so  
```
cd ~  
sudo apt-get install gtk+-2.0  
gcc -shared -o libsublime-imfix.so sublime_imfix.c  `pkg-config --libs --cflags gtk+-2.0` -fPIC
```

3. 将libsublime-imfix.so拷贝到sublime_text所在文件夹  
`sudo mv libsublime-imfix.so /opt/sublime_text/`

4. 修改文件/usr/bin/subl的内容  
```
sudo vim /usr/bin/subl  
将  
#!/bin/sh  
exec /opt/sublime_text/sublime_text "$@"  
修改为  
#!/bin/sh  
LD_PRELOAD=/opt/sublime_text/libsublime-imfix.so
exec /opt/sublime_text/sublime_text "$@"
```

5. 使用鼠标右键打开文件时能够使用中文输入  
sudo vim /usr/share/applications/sublime_text.desktop
```
    将[Desktop Entry]中的字符串  
    Exec=/opt/sublime_text/sublime_text %F  
    修改为  
    Exec=bash -c "LD_PRELOAD=/opt/sublime_text/libsublime-imfix.so exec /opt/sublime_text/sublime_text %F"  

    将[Desktop Action Window]中的字符串  
    Exec=/opt/sublime_text/sublime_text -n  
    修改为  
    Exec=bash -c "LD_PRELOAD=/opt/sublime_text/libsublime-imfix.so exec /opt/sublime_text/sublime_text -n"  

    将[Desktop Action Document]中的字符串  
    Exec=/opt/sublime_text/sublime_text --command new_file  
    修改为  
    Exec=bash -c "LD_PRELOAD=/opt/sublime_text/libsublime-imfix.so exec /opt/sublime_text/sublime_text --command new_file"
```

### 0x02 插件
* Anaconda
* ConvertToUTF8
* Emmet
