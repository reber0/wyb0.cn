---
draft: false
date: 2016-05-05
lastmod: 2022-06-17
title: Git 的用法
description: 
categories:
  - Git
tags:
  - git
---

### 0x00 仓库
* 创建仓库
    * git init
* 克隆
    * git clone git@github.com:reber0/wyb0.com.git
* 添加远程仓库连接
    * git remote add origin git@github.com:reber/reber.com.git
* 删除远程仓库信息
    * git remote rm origin

### 0x01 添加 SSH key
生成 key
```
➜ ssh-keygen -t rsa -b 2048 -f id_rsa_github -C "123456@qq.com"
```

将 ~/.ssh/ 下生成的 id_rsa_github.pub 的内容添加到 github

验证是否添加成功
```
➜ ssh -T git@github.com
Hi reber0! You've successfully authenticated, but GitHub does not provide shell access.
```

### 0x02 配置全局信息
* 配置全局用户名、邮箱

    ➜ git config -\-global user.name "reber0"  
    ➜ git config -\-global user.email "123456@qq.com"  
    ➜ git config -l

* 配置全局忽略文件

    ➜ cat ~/.gitignore_global
    ```
    Thumbs.db // 忽略 Thumbs.db 这个文件
    log/  // 忽略 log 文件夹下的文件
    *.pyc // 忽略 .pyc 结尾的文件
    ```

* 查看配置

    ➜ cat ~/.gitconfig
    ```
    [user]
            name = reber0
            email = 123456@qq.com
    [filter "lfs"]
            process = git-lfs filter-process
            required = true
            clean = git-lfs clean -- %f
            smudge = git-lfs smudge -- %f
    [core]
            excludesfile = /Users/reber/.gitignore_global

    [init]
            defaultBranch = main
    ```

### 0x03 添加和提交和推送
```
git fetch // 查看远端文件改动
git status // 查看本地文件改动
git add a.txt
git commit -m "add file a.txt"
git push origin main
```

忽略文件更新
```
# 忽略 config.py 这个文件的更新，即 config.py 的内容改变时 git add 不会添加 config.py
➜ git update-index --assume-unchanged config.py
```

### 0x04 分支
初始化仓库
```sh
[15:46 reber@wyb at ~/temp/test]
➜ git init
已初始化空的 Git 仓库于 /Users/reber/temp/test/.git/
[15:48 reber@wyb at ~/temp/test git:(main) ✗]
➜ git add a.txt
[15:48 reber@wyb at ~/temp/test git:(main) ✗]
➜ git commit -m "add file a.txt"
[main（根提交） e23479e] add file a.txt
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 a.txt
```

新建分支，切换分支后，分支的更改不会影响原来分支，分支更改后需要 add，然后 commit
```
[15:48 reber@wyb at ~/temp/test git:(main)]
➜ git branch gh-pages
[15:48 reber@wyb at ~/temp/test git:(main)]
➜ git checkout gh-pages
切换到分支 'gh-pages'
[15:49 reber@wyb at ~/temp/test git:(gh-pages)]
➜ touch b.txt
[15:49 reber@wyb at ~/temp/test git:(gh-pages) ✗]
➜ git add b.txt
[15:49 reber@wyb at ~/temp/test git:(gh-pages) ✗]
➜ git commit -m "add file b.txt"
[gh-pages 12aa148] add file b.txt
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 b.txt
[15:49 reber@wyb at ~/temp/test git:(gh-pages)]
➜ ls
a.txt b.txt
[15:49 reber@wyb at ~/temp/test git:(gh-pages)]
➜ git checkout main
切换到分支 'main'
[15:49 reber@wyb at ~/temp/test git:(main)]
➜ ls
a.txt
```

合并分支代码到主分支
```
[15:54 reber@wyb at ~/temp/test git:(main)]
➜ git merge gh-pages
更新 e23479e..12aa148
Fast-forward
 b.txt | 0
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 b.txt
[15:54 reber@wyb at ~/temp/test git:(main)]
➜ ls
a.txt b.txt
```

### 0x05 标签

* 添加标签
    * git tag -a 标签名 -m '描述'

* 版本号
    * 格式：主版本号.次版本号.修订号（X.Y.Z）
    * 主版本号：当你做了不兼容的 API 修改
    * 次版本号：当你做了向下兼容的功能性新增
    * 修订号：当你做了向下兼容的问题修正

* 查看标签
    * 查看本地标签 git tag
    * 查看远程标签 git ls-remote -\-tags origin

* 删除标签
    * 删除本地标签
        * git tag -d v0.0.1
        * git push origin v0.0.1 推送 v0.0.1 到远程
        * git push origin -\-tags 推送全部 tags 到远程
    * 删除远程标签
        * git tag -d v0.0.9
        * git push origin -\-delete v0.0.9

### 0x06 撤回

* 撤销 add

    ```
    git reset HEAD        # 撤销上一次 add 的全部文件
    git reset HEAD 1.txt  # 撤销 add 的 1.txt
    ```


* 查看 commit id

    git log -\-pretty=oneline -\-abbrev-commit


* 删除 commit 历史记录(比如不小心在 pass.txt 里提交了密码)

    
    * 查看 log: `git log --pretty=oneline --abbrev-commit`

        6b9efd1 不小心提交了密码，bc1f979 中删除了，两个记录中都会存在密码
        ```
        822726b (HEAD -> main, origin/main, origin/HEAD) update
        bc1f979 remove pass
        6b9efd1 real pass
        1fa8193 add pass.txt & update a.txt
        ee6ff05 mv c.txt 2 cc.txt
        3f8a7ab update b.txt
        1f00c68 add a/b/c.txt
        568868b update README.md
        4dc6f15 Initial commit
        ```
        然后随便找到 6b9efd1 前面的一个 id，这里用 ee6ff05

    * 变基，清除 commit 记录: git rebase -i ee6ff05

        涉及密码更新的两个 id 都把 pick 改为 s
        ```
        1 pick 1fa8193 add pass.txt & update a.txt
        2 s 6b9efd1 real pass
        3 s bc1f979 remove pass
        4 pick 822726b update
        5 
        6 # 变基 ee6ff05..822726b 到 ee6ff05（5 个提交）
        7 #
        8 # 命令:
        9 # p, pick <提交> = 使用提交
        10 # r, reword <提交> = 使用提交，但编辑提交说明
        10 # e, edit <提交> = 使用提交，但停止以便在 shell 中修补提交
        10 # s, squash <提交> = 使用提交，但挤压到前一个提交
        ```

        保存文件，然后注释或删掉两个涉及密码的提交说明(即 #2 和 #3)
        ```
        1 # 这是一个 3 个提交的组合。
        2 # 这是第一个提交说明：
        3 
        4 add pass.txt & update a.txt
        5 
        6 # 这是提交说明 #2：
        7 
        8 # real pass
        9 
        10 # 这是提交说明 #3：
        11 
        12 # remove pass
        13 
        14 # 请为您的变更输入提交说明。以 '#' 开始的行将被忽略，而一个空的提交
        15 # 说明将会终止提交。
        16 #
        17 # 日期：  Sat Apr 2 11:29:01 2022 +0800
        ```

    * 再次查看 log，原来无关的 1fa8193 变为 b9c4e96，涉及密码的更新没有了

        ```
        060473b (HEAD -> main, origin/main, origin/HEAD) update
        b9c4e96 add pass.txt & update a.txt
        ee6ff05 mv c.txt 2 cc.txt
        3f8a7ab update b.txt
        1f00c68 add a/b/c.txt
        568868b update README.md
        4dc6f15 Initial commit
        ```

    * 强制推送即可

        git push -f origin main

* 文件恢复

    ```
    1.若用的 rm 删除文件，那就相当于只删除了工作区的文件，直接用git checkout -- <file>即可恢复
    2.若用 git rm 删除文件，则删除文件的同时且操作被添加到了暂存区，即暂存区的文件也被删了，需要先 git reset HEAD <file>，然后再 git checkout -- <file> 恢复
    3.若先用了 git rm，而且 git commit 了，那只能 git reset --hard HEAD^ 恢复，或者 git reset --hard <add 时的 id>
    ```

### 0x07 多用户
如果有多个用户时可进行如下设置
```
➜ ssh-keygen -t rsa -b 2048 -f id_rsa_github -C "123456@qq.com"
➜ ssh-keygen -t rsa -b 2048 -f id_rsa_gitlab -C "456789@qq.com"
➜ cat ~/.ssh/config
Host github.com
HostName ssh.github.com
User reber0ask@qq.com
Port 443
PreferredAuthentications publickey
IdentityFile ~/.ssh/id_rsa_github

Host git.mysite.com
HostName git.mysite.com
User reber
Port 22
IdentityFile ~/.ssh/id_rsa_gitlab

Host myvps
HostName 123.56.123.123
User root
Port 9833
IdentityFile ~/.ssh/id_rsa
➜ ls
    config  id_rsa_github.pub  id_rsa_gitlab.pub  id_rsa.pub
    id_rsa_github  id_rsa_gitlab      id_rsa      known_hosts
```