---
draft: false
date: 2016-11-13 11:59:26
title: "[转] MySQL 报错注入原理分析(count()、rand()、group by)"
description: MySQL 中利用 count()、rand()、group by 进行报错注入原理分析，详细描述了 web 安全中的报错注入的具体原理
categories:
  - Pentest
tags:
  - SQL注入
---

原文链接：[http://drops.wooyun.org/tips/14312](http://drops.wooyun.org/tips/14312?_blank)

### 0x00 疑问

一直在用mysql数据库报错注入方法，但为何会报错？

![](/img/post/wooyun-drops-tips-14312-1.jpg)

百度谷歌知乎了一番，发现大家都是把官网的结论发一下截图，然后执行sql语句证明一下结论，但是没有人去深入研究为什么rand不能和order by一起使用，也没彻底说明三者同时使用报错的原理。

![](/img/post/wooyun-drops-tips-14312-2.jpg)

### 0x01 位置问题？
<f>```select count(*),(floor(rand(0)*2))x from information_schema.tables group by x;```</f>这是网上最常见的语句,目前位置看到的网上sql注入教程,<f>floor</f> 都是直接放<f>count(*)</f>后面，为了排除干扰，我们直接对比了两个报错语句，如下图

![](/img/post/wooyun-drops-tips-14312-3.jpg)

由上面的图片，可以知道报错跟位置无关。

### 0x02 绝对报错还是相对报错？
是不是报错语句有了<f>floor(rand(0)*2)</f>以及其他几个条件就一定报错？其实并不是如此，我们先建建个表，新增一条记录看看，如下图：
![](/img/post/wooyun-drops-tips-14312-4.jpg)
确认表中只有一条记录后，再执行报错语句看看，如下图：
![](/img/post/wooyun-drops-tips-14312-5.jpg)
多次执行均未发现报错。

然后我们新增一条记录。
![](/img/post/wooyun-drops-tips-14312-6.jpg)
然后再测试下报错语句
![](/img/post/wooyun-drops-tips-14312-7.jpg)
多次执行并没有报错

OK 那我们再增加一条
![](/img/post/wooyun-drops-tips-14312-8.jpg)
执行报错语句
![](/img/post/wooyun-drops-tips-14312-9.jpg)
ok 成功报错

由此可证明<f>floor(rand(0)*2)</f>报错是有条件的，记录必须3条以上，而且在3条以上必定报错，到底为何？请继续往下看。

### 0x03 随机因子具有决定权么(rand()和rand(0))

为了更彻底的说明报错原因，直接把随机因子去掉，再来一遍看看，先看一条记录的时候，如下图:
![](/img/post/wooyun-drops-tips-14312-10.jpg)
一条记录的话 无论执行多少次也不报错

然后增加一条记录。

两条记录的话 结果就变成不确定性了
![](/img/post/wooyun-drops-tips-14312-11.jpg)
![](/img/post/wooyun-drops-tips-14312-12.jpg)
![](/img/post/wooyun-drops-tips-14312-13.jpg)
随机出现报错。

然后再插入一条

三条记录之后，也和2条记录一样进行随机报错。

由此可见报错和随机因子是有关联的，但有什么关联呢，为什么直接使用<f>rand()</f>，有两条记录的情况下就会报错，而且是有时候报错，有时候不报错，而<f>rand(0)</f>的时候在两条的时候不报错，在三条以上就绝对报错？我们继续往下看。

### 0x04 不确定性与确定性
前面说过，<f>floor(rand(0)*2)</f>报错的原理是恰恰是由于它的确定性，这到底是为什么呢？从0x03我们大致可以猜想到，因为<f>floor(rand()*2)</f>不加随机因子的时候是随机出错的，而在3条记录以上用<f>floor(rand(0)*2)</f>就一定报错，由此可猜想<f>floor(rand()*2)</f>是比较随机的，不具备确定性因素，而<f>floor(rand(0)*2)</f>具备某方面的确定性。

为了证明我们猜想，分别对<f>floor(rand()*2)</f>和<f>floor(rand(0)*2)</f>在多记录表中执行多次(记录选择10条以上)，在有12条记录表中执行结果如下图：
```
mysql> select floor(rand()*2) from `T-Safe`;
+-----------------+
| floor(rand()*2) |
+-----------------+
|               0 |
|               0 |
|               0 |
|               0 |
|               0 |
|               0 |
|               1 |
|               0 |
|               0 |
|               0 |
|               0 |
|               0 |
+-----------------+
12 rows in set (0.00 sec)

mysql> select floor(rand()*2) from `T-Safe`;
+-----------------+
| floor(rand()*2) |
+-----------------+
|               1 |
|               1 |
|               0 |
|               0 |
|               1 |
|               1 |
|               0 |
|               1 |
|               1 |
|               1 |
|               0 |
|               0 |
+-----------------+
12 rows in set (0.00 sec)

mysql> select floor(rand()*2) from `T-Safe`;
+-----------------+
| floor(rand()*2) |
+-----------------+
|               1 |
|               1 |
|               1 |
|               1 |
|               0 |
|               0 |
|               1 |
|               0 |
|               1 |
|               1 |
|               0 |
|               1 |
+-----------------+
12 rows in set (0.00 sec)
```

连续3次查询，毫无规则，接下来看看<f>```select floor(rand(0)*2) from `T-Safe`;```</f>，如下图：
```
mysql> select floor(rand(0)*2) from `T-Safe`;
+------------------+
| floor(rand(0)*2) |
+------------------+
|                0 |
|                1 |
|                1 |
|                0 |
|                1 |
|                1 |
|                0 |
|                0 |
|                1 |
|                1 |
|                1 |
|                0 |
+------------------+
12 rows in set (0.00 sec)

mysql> select floor(rand(0)*2) from `T-Safe`;
+------------------+
| floor(rand(0)*2) |
+------------------+
|                0 |
|                1 |
|                1 |
|                0 |
|                1 |
|                1 |
|                0 |
|                0 |
|                1 |
|                1 |
|                1 |
|                0 |
+------------------+
12 rows in set (0.00 sec)

mysql> select floor(rand(0)*2) from `T-Safe`;
+------------------+
| floor(rand(0)*2) |
+------------------+
|                0 |
|                1 |
|                1 |
|                0 |
|                1 |
|                1 |
|                0 |
|                0 |
|                1 |
|                1 |
|                1 |
|                0 |
+------------------+
12 rows in set (0.00 sec)
```

可以看到<f>floor(rand(0)*2)</f>是有规律的，而且是固定的，这个就是上面提到的由于是确定性才导致的报错，那为何会报错呢，我们接着往下看。

### 0x05 count与group by的虚拟表

使用<f>```select count(*) from `T-Safe` group by x;```</f>这种语句的时候我们经常可以看到下面类似的结果：

```php
mysql> select * from Tsafe;
+-----+--------+
| id  | name   |
+-----+--------+
|   3 | test3  |
|   4 | test4  |
|   5 | test5  |
|   1 | test1  |
|   2 | test2  |
|   6 | test6  |
|   7 | test7  |
|   8 | test8  |
|   9 | test9  |
|  10 | test10 |
|  11 | test11 |
|  12 | test12 |<-----
|  13 | test12 |<-----
|  14 | test12 |<-----
|  15 | test12 |<-----
|  16 | test12 |<-----
+-----+--------+
16 rows in set (0.00 sec)

mysql> select name,count(*) from Tsafe group by name;
+--------+----------+
| name   | count(*) |
+--------+----------+
| test1  |        1 |
| test10 |        1 |
| test11 |        1 |
| test12 |        5 |<-----
| test2  |        1 |
| test3  |        1 |
| test4  |        1 |
| test5  |        1 |
| test6  |        1 |
| test7  |        1 |
| test8  |        1 |
| test9  |        1 |
+--------+----------+
12 rows in set (0.00 sec)
```

可以看出 test12的记录有5条

与<f>count(*)</f>的结果相符合，那么mysql在遇到<f>```select count(*) from TSafe group by x;```</f>这语句的时候到底做了哪些操作呢，我们果断猜测mysql遇到该语句时会建立一个虚拟表(实际上就是会建立虚拟表)，那整个工作流程就会如下图所示：

1. 先建立虚拟表，如下图(其中key是主键，不可重复):
![](/img/post/wooyun-drops-tips-14312-17.jpg)

2. 开始查询数据，取数据库数据，然后查看虚拟表存在不，不存在则插入新记录，存在则count(*)字段直接加1，如下图:
![](/img/post/wooyun-drops-tips-14312-18.jpg)

由此看到 如果key存在的话就+1， 不存在的话就新建一个key。

那这个和报错有啥内在联系，我们直接往下来，其实到这里，结合前面的内容大家也能猜个一二了。

### 0x06 floor(rand(0)*2)报错
其实mysql官方有给过提示，就是查询的时候如果使用<f>rand()</f>的话，该值会被计算多次，那这个“被计算多次”到底是什么意思，就是在使用<f>group by</f>的时候，<f>floor(rand(0)*2)</f>会被执行一次，如果虚表不存在记录，插入虚表的时候会再被执行一次，我们来看下<f>floor(rand(0)*2)</f>报错的过程就知道了，从0x04可以看到在一次多记录的查询过程中<f>floor(rand(0)*2)</f>的值是定性的，为011011…(记住这个顺序很重要)，报错实际上就是<f>floor(rand(0)*2)</f>被计算多次导致的，具体看看<f>```select count(*) from TSafe group by floor(rand(0)*2);```</f>的查询过程：

1. 查询前默认会建立空虚拟表如下图:
![](/img/post/wooyun-drops-tips-14312-19.jpg)

2. 取第一条记录，执行<f>floor(rand(0)*2)</f>，发现结果为0(第一次计算),查询虚拟表，发现0的键值不存在，则<f>floor(rand(0)*2)</f>会被再计算一次，结果为1(第二次计算)，插入虚表，这时第一条记录查询完毕，如下图:
![](/img/post/wooyun-drops-tips-14312-20.jpg)

3. 查询第二条记录，再次计算<f>floor(rand(0)*2)</f>，发现结果为1(第三次计算)，查询虚表，发现1的键值存在，所以<f>```floor(rand(0)*2)```</f>不会被计算第二次，直接<f>```count(*)```</f>加1，第二条记录查询完毕，结果如下:
![](/img/post/wooyun-drops-tips-14312-21.jpg)

4. 查询第三条记录，再次计算<f>floor(rand(0)*2)</f>，发现结果为0(第4次计算)，查询虚表，发现键值没有0，则数据库尝试插入一条新的数据，在插入数据时<f>floor(rand(0)*2)</f>被再次计算，作为虚表的主键，其值为1(第5次计算)，然而1这个主键已经存在于虚拟表中，而新计算的值也为1(主键键值必须唯一)，所以插入的时候就直接报错了。

5. 整个查询过程<f>floor(rand(0)*2)</f>被计算了5次，查询原数据表3次，所以这就是为什么数据表中需要3条数据，使用该语句才会报错的原因。

### 0x07 floor(rand()*2)报错
由0x05我们可以同样推理出不加入随机因子的情况，由于没加入随机因子，所以<f>floor(rand()*2)</f>是不可测的，因此在两条数据的时候，只要出现下面情况，即可报错，如下图:
![](/img/post/wooyun-drops-tips-14312-22.jpg)

最重要的是前面几条记录查询后不能让虚表存在0,1键值，如果存在了，那无论多少条记录，也都没办法报错，因为<f>floor(rand()*2)</f>不会再被计算做为虚表的键值，这也就是为什么不加随机因子有时候会报错，有时候不会报错的原因。如图：
![](/img/post/wooyun-drops-tips-14312-23.jpg)

当前面记录让虚表长成这样子后，由于不管查询多少条记录，<f>```floor(rand()*2)```</f>的值在虚表中都能找到，所以不会被再次计算，只是简单的增加<f>```count(*)```</f>字段的数量，所以不会报错，比如<f>floor(rand(1)*2)</f>，如图：
```
mysql> select floor(rand(1)*2) from mysql.user;
+------------------+
| floor(rand(1)*2) |
+------------------+
|                0 |
|                1 |
|                0 |
|                0 |
|                0 |
|                1 |
|                1 |
+------------------+
7 rows in set (0.00 sec)

mysql> select floor(rand(1)*2) from mysql.user;
+------------------+
| floor(rand(1)*2) |
+------------------+
|                0 |
|                1 |
|                0 |
|                0 |
|                0 |
|                1 |
|                1 |
+------------------+
7 rows in set (0.00 sec)

mysql> select floor(rand(1)*2) from mysql.user;
+------------------+
| floor(rand(1)*2) |
+------------------+
|                0 |
|                1 |
|                0 |
|                0 |
|                0 |
|                1 |
|                1 |
+------------------+
7 rows in set (0.00 sec)
```

在前两条记录查询后，虚拟表已经存在0和1两个键值了，所以后面再怎么弄还是不会报错。

总之报错需要<f>count(*)</f>，<f>rand()</f>、<f>group by</f>，三者缺一不可。
