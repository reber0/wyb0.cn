---
draft: false
date: 2016-09-10 16:24:18
title: Tmux 的使用
description: 
categories:
  - Linux
tags:
  - software
---

### 0x00 Tmux 的快捷键前缀
在 Tmux 下想要使用快捷键时，需要先按下快捷键前缀，然后再按下快捷键。

默认情况下，Tmux 的快捷键前缀是 Ctrl+b，即所有的命令都以 Ctrl+b 开头。

比如想按快捷键 d 时，你需要：先按 Ctrl+b，松开后再按d。

### 0x01 会话
* 新建一个名为 tmux_test 的 session
    * tmux new -s tmux_test
    ![60](/img/post/tmux_new_session1.png)

* 将 session 放到后台运行
    * 先按 Ctrl+b，然后按 d
    * tmux ls 可查看会话，这里有两个会话，一个 frpc、一个 tmux_tests
    ![60](/img/post/tmux_new_session2.png)

* 进入某个 session
    * tmux a -t frps
    ![70](/img/post/tmux_in_session.png)

* 切换 session
    * 在一个 session 中，按 Ctrl+b，再按 s 可列出所有 session
    ![70](/img/post/tmux_show_all_session.png)

    * 按上下方向键即可切换进入相应 session
    ![70](/img/post/tmux_select_session.png)

### 0x02 窗口和窗格


* 切割窗口为窗格
    * 横向切割，Ctrl+b，再按 ```"```
    ![70](/img/post/tmux_split_windows1.png)

    * 纵向切割，Ctrl+b，再按 ```%```
    ![70](/img/post/tmux_split_windows2.png)

    * 先按 Ctrl+b，再按 q 会出现相应数字，然后按数字即可到相应窗格
    ![70](/img/post/tmux_select_pane.png)

* 多个窗口
    * 在第一个窗口的第一个窗格运行 top 命令
    ![70](/img/post/tmux_0_windows_run_top.png)

    * 先按 Ctrl+b，然后按 c 可新建一个窗口
    ![70](/img/post/tmux_new_windows.png)

    * 按 Ctrl+b，然后再按对应窗口的数字可进入相应窗口
    ![70](/img/post/tmux_select_windows.png)
