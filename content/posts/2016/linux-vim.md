---
draft: false
date: 2016-04-15 21:03:07
title: Linux 之 vim
description: 
categories:
  - Linux
tags:
  - linux
---

### 0x00 Vim的安装及配置：
* 安装vim

```
yum install vim
```

* 配置文件的位置

```
在目录 /etc/ 下面，有个名为vimrc的 文件，
这是系统中公共的vim配置文件，对所有用户都有效。
```

* 设置语法高亮显示

```
1) 打开vimrc，添加以下语句来使得语法高亮显示：
    syntax on
2) 如果此时语法还是没有高亮显示，那么在/etc目录下的profile文件中添加以下语句：
    export TERM=xterm-color
```

* 设置Windows风格的C/C++自动缩进（添加以下set语句到vimrc中）

```
1）设置Tab为4个空格
    set tabstop=4 #设定tab长度为4
    set softtabstop=4 #使按退格键时可以一次删除4个空格
    set shiftwidth=4 #表示每一级缩进的长度，一般设置成跟softtabstop一样
    set expandtab/noexpandtab #缩进用空格/制表符表示
2）自动缩进
    set autoindent/noautoindent #设置每行的缩进值与上一行相等/不相等(我未启用)
3）使用 C/C++ 语言的自动缩进方式
    set cindent
4）在左侧显示文本的行号
    set nu
5）搜索设置
    set incsearch #输入搜索内容时就显示搜索结果
    set hlsearch #搜索时高亮显示被找到的文本
6）如果没有下列语句，就加上吧
    if &term=="xterm"
        set t_Co=8
        set t_Sb=^[[4%dm
        set t_Sf=^[[3%dm
    endif
```


### 0x01 Vim编辑器的三种模式
* 命令行模式

```
$vim 文件名 #直接进入命令行模式
Ctrl+ZZ#可保存文件

5dd/4yy#剪切5行/复制4行
p      #粘贴到当前行后面
u      #一直点的话会一直撤销，直到回复到文件最初状态

gg/G   #光标移动到首行/末行
H/M/L  #光标移动到屏幕显示的首行/中间/末行
0/$    #光标移动到行首/行尾
w/b    #光标跳到下一个/上一个单词

o      #在下一行插入
Ctrl+g #显示文本的信息

dt%      #删除所有内容直到遇到 %
d0/d$或D #删除从光标到行首/行尾的字符
3dw      #删除3个单词

v+方向键      #可以从当前光标向各方向选择字符或行
4+向下的方向键 #光标向下移动4行

/和？#向下和向上搜索
```

* 末行模式

```
:wq  #推出并保存
:wq! #强制退出并保存
:num #跳到第n行
:$	 #移动到最后一行
:/aaaa #向下搜aaaa这个字符串  n可以定位到下一个匹配的字符，N向上
:?aaaa #向上搜索
:%s/set/ddd/g #将字符串set全部替换为ddd
```

* 插入模式

```
在命令行模式直接点击i即可进入
```
	