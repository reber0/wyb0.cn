---
draft: false
date: 2016-05-18 11:09:46
title: PHP 之数组
description: 
categories:
  - PHP
tags:
  - php
---

### 0x00 分类
1. 索引数组
	索引值从0开始，依次递增
2. 关联数组
	以字符串为索引，键和值对是无序组合，每个键都是唯一的

### 0x01 数组的定义
两种方法：

1. 直接为数组元素赋值即可声明数组
2. 使用array()函数声明数组
```php
<?php
        // 1.直接为数组元素赋值即可声明数组
        $contact_index[0] = 1;
        $contact_index[1] = "高某";
        $contact_index[2] = "A公司";
        $contact_index[3] = "北京市";
        $contact_index[] = "gao@a.com";
        var_dump($contact_index);
        
        $contact_key["ID"] = "2";
        $contact_key["姓名"] = "峰某";
        $contact_key["公司"] = "B公司";
        $contact_key["邮箱"] = "feng@b.com";
        var_dump($contact_key);

        // 2.使用array()函数声明数组
        $contact_key_array = array(
            "ID" => 1;
            "姓名" => "峰某";
            "公司" => "B公司";
            "邮箱" => "feng@b.com";
        );
        var_dump($contact_key_array);
?>
```

### 0x02 数组的遍历
1. for语句遍历数组
2. foreach语句遍历数组
```php
<?php
        // for语句遍历索引数组
        $cars=array("Volvo","BMW","SAAB");
        $arrlength=count($cars);
        for($x=0; $x < $arrlength; $x++) {
            echo $cars[$x];
            echo "<br>";
        }

        // foreach语句遍历关联数组
        $age=array("Bill"=>"35", "Steve"=>"37", "Peter"=>"43");
        foreach($age as $x => $x_value) {
            echo "Key=" . $x . ", Value=" . $x_value;
            echo "<br>";
        }
?>
```

### 0x03 预定义数组
1. 它就是一个特殊数组，操作方式没有区别
2. 不用声明它们，每个PHP脚本中默认存在
3. 它们在全局范围内自动生效

    |预定义数组 |说明|
    |---------|:--|
    |$_SERVER |变量由Web服务器设定或者直接与当前脚本的执行环境相关联|
    |$_ENV    |执行环境提交至脚本的变量|
    |$_GET    |经由URL请求提交至脚本的变量|
    |$_POST   |经由HTTP POST方法提交至脚本的变量|
    |$_REQUEST|经由GET，POST，COOKIE机制提交至脚本的变量，该数组不值得信任|
    |$_FILES  |经由HTTP POST文件上传而提交至脚本的变量|
    |$_COOKIE |经由HTTP Cookies方法提交至脚本的变量|
    |$_SESSION|当前注册给脚本会话的变量|
    |$GLOBALS |包含一个引用指向每个当前脚本的全局范围内的有效的变量。该数组的键名为全局变量的名称|

### 0x04 合并数组
* array_merge()函数将数组合并到一起，返回一个联合的数组。

* array array_merge(array array1 array2...,arrayN)
```php
<?php
        $fruits = array("apple","banana","pear");
        $numbered = array("1","2","3");
        $cards = array_merge($fruits, $numbered);
        print_r($cards);
        // output
        // Array ( [0] => apple [1] => banana [2] => pear [3] => 1 [4] => 2 [5] => 3 )
?>
```

### 0x05 拆分数组
* array_slice()函数将返回数组中的一部分，从键offset开始，到offset+length位置结束

* array array_slice(array array,int offset[,int length])

* offset为正值时从前面开始，为负值时从后面开始
```php
<?php
        $fruits = array("Apple", "Banana", "Orange", "Pear", "Grape", "Lemon",
        "Watermelon");
        $subset = array_slice($fruits, 3);
        print_r($subset);
        // output
        // Array ( [0] => Pear [1] => Grape [2] => Lemon [3] => Watermelon )
    ?>
```
```php
<?php
        $fruits = array("Apple", "Banana", "Orange", "Pear", "Grape", "Lemon",
        "Watermelon");
        $subset = array_slice($fruits, 2, -2);
        print_r($subset);
        // output
        // Array ( [0] => Orange [1] => Pear [2] => Grape )
?>
```

### 0x06 数组的交集
* array_intersect()函数返回一个保留了键的数组，这个数组只由第一个数组中出现的且在其他每个输入数组中都出现的值组成

* array array_intersect(array array1,array array2[,arrayN...])
```php
<?php
        $fruit1 = array("Apple","Banana","Orange");
        $fruit2 = array("Pear","Apple","Grape");
        $fruit3 = array("Watermelon","Orange","Apple");
        $intersection = array_intersect($fruit1, $fruit2, $fruit3);
        print_r($intersection);
        // output
        // Array ( [0] => Apple )
?>
```

### 0x07 in_array
* in_array()函数在一个数组中汇总搜索一个特定值，若找到则返回true，否则返回false

* boolean in_array(mixed needle,array haystack[,boolean strice])
```php
<?php
		$fruit = "apple";
        $fruits = array("apple","banana","orange","pear");
		if( in_array($fruit,$fruits) ){
        	echo "$fruit已经在数组中";
        }
?>
```

### 0x08 array_key_exists
* 若在数组中找到一个指定的键，函数返回true，否则返回false

* boolean array_key_exists(mixed key,array array)  
```php
<?php
        $fruit["apple"] = "red";
        $fruit["banana"] = "yellow";
        $fruit["pear"] = "green";
        if(array_key_exists("apple", $fruit)){
            printf("apple's color is %s",$fruit["apple"]);
        }
        //apple's color is red
?>
```

### 0x09 array_search
* array_search()函数在一个数组中搜索指定的值，若存在则返回相应的键，否则返回true

* mixed array_search(mixed needle,array haystack[,boolean strict])
```php
<?php
        $fruits["apple"] = "red";
        $fruits["banana"] = "yellow";
        $fruits["watermelon"]="green";
        $founded = array_search("green", $fruits);
        if($founded){
            printf("%s was founded on %s.",$founded, $fruits[$founded]);
        }
        //watermelon was founded on green.
?>
```

### 0x0A 数组头添加元素
* array_unshift()函数在数组头添加元素。

* 所有已有的数值键都会相应地修改，以反应其在数组中的新位置，但是关联键不受影响

* int array_unshift(array array,mixed variable[,mixed variable])
```php
<?php
        $fruits = array("apple","banana");
        array_unshift($fruits,"orange","pear")
        // $fruits = array("orange","pear","apple","banana");
?>
```

### 0x0B 数组头删除元素
* array_shift()函数删除并返回数组中找到的元素。其结果是，若使用的是数值键，则所有相应的值都会下移，而使用关联键的数组不受影响。

* mixed array_shift(array array)
```php
<?php
        $fruits = array("apple","banana","orange","pear");
        $fruit = array_shift($fruits);
        // $fruits = array("banana","orange","pear")
        // $fruit = "apple";
?>
```

### 0x0C 数组尾添加元素
* array_push()函数的返回值类型是int型，是压入数据后数组中元素的个数，可以为此函数传递多个变量作为参数，同时向数组压入多个变量

* int array_push(array array,mixed variable [,mixed variable...])
```php
<?php
        $fruits = array("apple","banana");
        array_push($fruits,"orange","pear")
        //$fruits = array("apple","banana","orange","pear")
?>
```

### 0x0D 数组尾删除元素
* array_pop()函数删除并返回数组的最后一个元素

* mixed array_pop(array target_array)
```php
<?php
        $fruits = array("apple","banana","orange","pear");
        $fruit = array_pop($fruits);
        //$fruits = array("apple","banana","orange");
        //$fruit = "pear";
?>
```