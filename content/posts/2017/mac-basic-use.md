---
draft: false
date: 2017-05-19 16:51:11
title: Mac 基础设置
description: 
categories:
  - Other
tags:
  - other
---

macOS Sierra 10.12.6

### 0x00 安装brew
```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

### 0x01 安装wget
```
$ brew install wget
```

### 0x02 安装oh-my-zsh
```
$ wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | sh
$ cat /etc/shells #查看当前有什么shell
$ which zsh #查看zsh路径
$ chsh -s /bin/zsh  #切换shell为zsh
$ vim ~/.zshrc添加alias c='clear'
```

### 0x03 换源
```
# 对于zsh用户换源
$ echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.zshrc
$ source ~/.zshrc
$ brew update
```

### 0x04 安装scroll-reverser
> 去[http://pilotmoon.com/scrollreverser](http://pilotmoon.com/scrollreverser?_blank)下载

### 0x05 安装java环境
> 去[Oracle官网](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html?_blank)下载jre然后安装

### 0x06 安装iterm2
> 去[http://www.iterm2.com](http://www.iterm2.com?_blank)下载

### 0x07 设置MAMP
```
# 下载安装包安装后，将MAMP的mysql添加到环境变量
$ ln -s /Applications/MAMP/Library/bin/mysql /usr/local/bin/mysql

# 配置数据库
左上角，File -> Edit Template -> MySQL my.cnf
在[client]下面添加：default-character-set=utf8
在[mysqld]在下面添加character_set_server=utf8
```

### 0x08 pip安装
```
# mac里面python自带easy_install
$ sudo easy_install pip
$ sudo pip install bs4 --user -U #安装第三方模块
```

### 0x09 安装go2shell
去[这里](http://zipzapmac.com/go2shell?_blank)下载安装包然后安装，安装好后把图标拖到Dock，然后把Dock中的图标拖到finder

### 0x0A Google导入BurpSuite证书
```
1. 使用burp代理，下载证书然后改为.crt
2. 谷歌-设置-HTTPS/SSL-证书管理
3. 钥匙串访问-系统，左上角文件-导入项目，然后导入证书
4. 导入的证书上右键-显示简介-信任-SSL始终信任
```

### 0x0B 快捷键
```
$ open .  # 在finder中打开当前文件夹
```

**基本操作**
```
Command-Z 撤销　
Command-X 剪切
Command-C 拷贝
Command-V 粘贴
Command-A 全选
Command-S 保存
Command-F 查找
Command-O 打开
Command-W 关闭
Command-Q 退出
Command-M 最小化窗口
Command-空格 切换输入法
```

**文本处理**
```
fn-Delete 相当于PC全尺寸键盘上的Delete，也就是向后删除
fn-上箭头 向上滚动一页（Page Up）
fn-下箭头 向下滚动一页（Page Down）
fn-左箭头 滚动至文稿开头（Home）
fn-右箭头 滚动至文稿末尾（End）
Command-右箭头 将光标移至当前行的行尾
Command-左箭头 将光标移至当前行的行首
Command-下箭头 将光标移至文稿末尾
Command-上箭头 将光标移至文稿开头
```

**在Finder中**
```
return 这个其实不算快捷键，点击文件，按下可重命名文件
Command-O 打开所选项。在Mac里打开文件不像Windows里直接按Enter
Command-Option-V 对文件复制，在目的位置按下这个快捷键，文件将被剪切到此位置
Command-上箭头 打开上层文件夹
Command-Delete 将文件移至废纸篓
空格键 快速查看选中的文件，也就是预览功能
```

**在浏览器中**
```
Control-Tab 转向下一个标签页
Command-L 光标直接跳至地址栏
Control-Tab 转向下一个标签页
Control-Shift-Tab 转向上一个标签页
Command-加号或等号 放大页面
Command-减号 缩小页面
```