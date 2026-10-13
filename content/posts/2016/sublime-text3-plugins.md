---
draft: false
date: 2016-09-02 23:07:44
title: Sublime Text 3 几个好用的插件
description: 
categories:
  - Other
tags:
  - software
---

### 0x00 Package Control
安装完这个插件后可以更容易的管理(安装、删除、查看等)其他插件  

* 代码安装  
ctrl+~快捷键调出console，将下面代码粘贴进去，然后Enter执行(注意单引号)

```
import urllib.request,os; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); open(os.path.join(ipp, pf), 'wb').write(urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ','%20')).read())
```

* 手动安装  
    * 点击https://sublime.wbond.net/Package%20Control.sublime-package 下载文件
    * 将下载的文件放在root path/Data/Installed Packages下
    * 重启Sublime Text
* 使用方法
    * Ctrl+Shift+P调出菜单然后选择相应操作
    ![40](/img/post/sublime_package_control1.png)

    * Preferences -> Package Control也可调出
    ![20](/img/post/sublime_package_control2.png)

    * 选择Install Package后可以输入想安装的插件名搜索安装
    ![50](/img/post/sublime_install.png)

### 0x01 Emmet
前端必备插件，前身是Zen Coding，可高效编写HTML和CSS(需要依赖PyV8，会自动安装)
![40](/img/post/sublime_emmet.png)
[![40](/img/post/sublime_emmet_demo.png)](http://emmet.io/?_blank)

### 0x02 Anaconda
可以自动补全并提示语法，还可跳转到定义、使用等
![55](/img/post/sublime_anaconda_set.png)
![55](/img/post/sublime_anaconda_set_default.png)
![60](/img/post/sublime_anaconda_set_user.png)
![70](/img/post/sublime_anaconda_add_file.png)

效果如下：
![55](/img/post/sublime_anaconda.png)

### 0x03 AutoFileName
快捷输入文件路径
![50](/img/post/sublime_autofilename.png)

### 0x04 主题Theme-SoDaReloaded
两个主题插件，安装好之后：首选项 -> 设置-用户，修改文件Packages/User/Preferences.sublime-settings如下
```
{
    "color_scheme": "Packages/Color Scheme - Default/Monokai.tmTheme",
    "font_size": 15,
    "highlight_line": true,//光标所在行高亮显示
    "ignored_packages":
    [
        "Vintage"
    ],
    "tab_size": 4,
    "theme": "SoDaReloaded Dark.sublime-theme",//使用的主题
    "translate_tabs_to_spaces": true,
    "update_check": false,
    "word_wrap": "auto",
    "draw_white_space": "all", //显示空格或tab字符
}
```

### 0x05 ConvertToUTF8
将文件转码成UTF8编码(存储时还是原来的编码)

当文件是其他编码，有时打开文件可能会有如下提示，安装插件Codecs33即可：
```
File: /Users/reber/Downloads/spider.py
Encoding: GB2312
Error: Codecs missing

Please install Codecs33 plugin (https://github.com/seanliang/Codecs33/tree/osx).
```

### 0x06 IMESupport
解决Sublime Text中文输入法不能跟随光标的问题

### 0x07 Git
在编辑器就可以执行git命令，有github的开发者必备
![40](/img/post/sublime_git.png)

### 0x08 GitGutter
在有了Git插件后，GitGutter 更好的帮助开发者查看文件之前的改动和差异，提升开发效率
![30](/img/post/sublime_gitgutter.png)
有时候卡顿，首选项→插件设置→GitGutter→Setting User
```
{
    "non_blocking" : "true",
    "live_mode" : "false"
}
```

### 0x09 Markdown Preview
可以在本地预览文件
![40](/img/post/sublime_markdown_preview.png)
![45](/img/post/sublime_markdown_preview_html.png)

### 0x0A DocBlokr
这个插件对于编码风格很严的编程语言很有帮助，可以生成标准的注释
![插件DocBlocr](/img/post/sublime_docblocr1.gif)
![插件DocBlocr](/img/post/sublime_docblocr2.gif)

### 0x0B Alignment
插件安装好后选中要对齐的文本，然后按Ctrl+Alt+a即可对齐```"=","+", "-", "&", "|", "<",">"```等符号
![20](/img/post/sublime_alignment.gif)

### 0x0C 后记
* 在安装插件时总出错提示```"There are no packages available for installation"```可以用上面提到的手动安装Package Control来解决，或者：
![40](/img/post/sublime_end1.png)

* 有时不能通过Package Control下载插件，可以直接下载插件，然后放在下面图示的文件夹中，然后重启Sublime Text使插件生效即可：
![40](/img/post/sublime_end2.png)
