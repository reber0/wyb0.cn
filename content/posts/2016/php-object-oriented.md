---
draft: false
date: 2016-05-20 16:07:55
title: PHP 之面向对象
description: 
categories:
  - PHP
tags:
  - php
---

### 0x00 面向对象
1. 面向对象概念
	* 面向对象是达到了软件工程的三个目标：重用性、灵活性和扩展性，使其编程的代码更加简洁、更易于维护、并且具有更强的可重用性。
2. 类和对象的关系
	* 在面向对象的编程语言中，类是一个对立的程序单位，而对象的抽象就是类。类描述了一组有相同特性(属性)和相同行为(方法)的对象。开发时要先抽象类再用该类去创建对象。而我们的程序中直接使用的是对象而不是类。
3. 什么是类
	* 在面向对象的编程语言中，类是一个对立的程序单位，是具有相同属性和服务的一组对象的集合。它为属于该类的所有对象提供了同意的抽象描述，其内部包括成员属性和服务的方法两个部分。
4. 什么是对象
	* 在客观世界里，所有的事物都是由对象和对象之间的联系组成的。对象是系统中用来描述客观事物的一个实体，它是构成系统的一个基本单位，一个对象由一组属性和有权对这些属性进行操作的一组服务的封装体。

### 0x01 类的声明
1. 类名和变量名还有函数名的命名规则类似，都遵循PHP中定义名称的命名规则。
2. 若类名由多个单词组成，习惯上每个单词的首字母要大写
3. 类中成员可分为属性和方法
4. 属性为静态描述，方法为动态描述
5. 在类中声明成员属性时，变量前面一定要有关键字，如：public、private、static等
6. 若不需要有特定意义的修饰，则使用var关键字

```php
格式：
[一些修饰类的关键字] class 类名 {
    类中成员;
}

Class Person {
成员属性：
    姓名、性别、年龄、身高、体重、电话、住址等
成员方法：
    说话、学习、走路、吃饭、开车、使用手机等
}

例子：
<?php
    class Person {
        var $name;
        var $age;
        var $sex;
        function say() {
            echo "人在说话";
        }
        function run() {
            echo "人在走路";
        }
    }
?>
```

### 0x02 实例化对象
```php
格式：
$变量名 = new 类名称([参数列表]);
$变量名 = new 类名称;

例子：
<?php
    class Phone {
    // ...
    }
    class Person {
    // ...
    }
    $person1 = new Person();
    $person2 = new Person();
    $person3 = new Person;
    $phone1 = new Phone();
    $phton2 = new Phone();
    $phton3 = new Phone;
?>
```

### 0x03 对象中成员的访问
```php
<?php
	/**
    *声明一个人类Person，其中包含三个成员属性和两个成员方法
    */
    class Person
    {
    	var $name;
        var $age;
        var $sex;
        
        function say() {
        	echo "我的名字：".$this->name.",性别：".$this->sex."，年龄：".$this->age."。<br />\n";
        }
        function run() {
        	echo $this->name."在走路<br />\n";
        }
    }
    
    $xiaoming = new Person();
    $wyb = new Person();
    
    $xiaoming->name = "小明";
    $xiaoming->sex = "男";
    $xiaoming->age = 16;
    
    $wyb->name = "wyb";
    $wyb->sex = "男";
    $wyb->age = 18;
    
    $xiaoming->say();
    $wyb->run();
?>
```

### 0x04 构造方法和析构方法
* 构造方法和析构方法是对象中两个特殊的方法
* 构造方法是对象创建完成后第一个被对象自动调用的方法
* 析构方法是对象在销毁之前最后一个被对象自动调用的方法
* 通常用构造方法完成一些对象的初始化工作，用析构方法完成一些对象在销毁前的清理工作

```php
function _ _construct([参数列表]) {
	//方法体，通常用来对成员属性进行初始化赋值
}

function _ _destruct([参数列表]) {
	//方法体，通常用来完成一些在对象销毁前的清理工作
}
```