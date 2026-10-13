---
draft: false
date: 2016-05-09 23:33:12
title: 通过 gh-pages 发布博客
description: 
categories:
  - Git
tags:
  - git
---

环境：Ubuntu 14.4

### 0x00 添加密钥
```
➜ ssh-keygen -t rsa -b 2048 -C "123456@qq.com" -f id_rsa_github # 生成密钥
➜ cd ~/.ssh/
➜ cat id_rsa_github.pub # 将公钥添加到 github

➜ git config --global user.name "reber" # 配置本地用户
➜ git config --global user.email "123456@qq.com" # 配置本地邮箱

➜ ssh -T git@github.com # 验证密钥是否添加成功
```

### 0x01 gh-pages
Github 创建项目仓库后会产生一个 main 分支，只需要再添加 gh-pages 分支就可以创建静态页面了

将 html 文件推送到 gh-pages 分支可以解析 html 做博客

### 0x02 使用 hugo
Hugo 是由 Go 语言实现的静态网站生成器，可以快速生成 html 文件
```
➜ hugo new site wyb0.com # hugo 生成站点目录
➜ git clone https://github.com/reber/wyb0.com.git
➜ cd wyb0.com
➜ hugo new about.md
➜ hugo new first-article.md
➜ echo "wyb0.com" > static/CNAME # 配置 CNAME 以便使用 gh-pages
```

模版可以去 [https://themes.gohugo.io/](https://themes.gohugo.io/?_blank) 下载一个模版放到 themes 文件夹下
```
➜ cd themes
➜ git clone git@github.com:colorchestra/smol.git
➜ git clone git@github.com:WingLim/hugo-tania.git
➜ vim config.toml
➜ hugo server -w # 本地查看网站，没问题的话可以把文件上传到主分支
➜ git push origin main
```

### 0x07 创建 gh-pages 分支
使用的是 hugo，hugo 会将所有文件转化为 html 放到 public 文件夹

所以把 hugo 生成的 html 推到 gh-pages分支即可
```
➜ hugo
➜ cd public
➜ git init
➜ git checkout --orphan gh-pages
➜ git remote add origin git@github.com:reber/wyb0.com.git
➜ git add .
➜ git commit -m "add html"
➜ git push origin gh-pages
```
