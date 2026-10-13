---
draft: false
date: 2016-01-21 21:13:17
title: Python 的函数式编程
description: 
categories:
  - Python
tags:
  - python
---

### 0x00 函数式编程
首先说一下高阶函数，能将函数作为参数来接收的函数就可以称为高阶函数，如下：
```python
def add(x,y,f):
    return f(x) + f(y)
print add(7,-3,abs) #abs是求绝对值的函数，这里返回的值为10
```
将函数作为参数传入，这样的函数就是高阶函数，而函数式编程就是指这种抽象程度很高的编程范式。  
函数式编程的一个特点就是可以将函数作为参数，还允许返回一个函数。  
纯粹的函数式编程语言编写的函数没有变量，因此，任意一个函数，只要输入是确定的，输出就是确定的，这种纯函数我们称之为没有副作用。  
允许使用变量的程序设计语言，由于函数内部的变量状态不确定，同样的输入，可能得到不同的输出，因此，这种函数是有副作用的。

### 0x01 高阶函数
* map()函数  
map接收两个参数，一个是函数，一个是列表(list)，map将函数依次作用到list的每个元素，然后返回新的list

```python
def f(x):
    return x*x
print map(f,[1,2,3,4]) #返回[1,4,9,16]
print map(str,[1,2,3,4]) # 返回['1','2','3','4']
```

* reduce()函数  
reduce接收参数和map一样(但传入的函数必须接收两个参数)，reduce会对list的每个元素反复调用函数，然后返回最终值

```python
def f(x,y):
    return x*y
print reduce(f,[1,2,3,4]) #1*2*3*4，返回24
```

* filter()函数  
filter也接收函数和list，函数会对list的每个元素进行判断然后返回True或False，为True的组成新list返回

```python
def f(x):
    return x > 3
print filter(f,[1,2,3,4,5]) #返回[4,5]
```

* sorted()函数  
Python内置的函数sorted()可以对list进行排序

```python
sorted([34,2,345,3]) #返回[2,3,34,345]
```
sorted也是一个高阶函数，当然也可以接收函数和参数。通常规定，对于两个元素x和y，若认为x < y则返回-1，若认为x == y则返回0，若认为x > y则返回1，从而进行正向排序
```python
def s(s1,s2):
    u1 = s1.lower()
    u2 = s2.lower()
    if u1 < u2:
        return -1
    if u1 > u2:
        return 1
    return 0
print sorted(['tom,Bob,Jerry,Alim'],s) #返回['Alim','Bob','Jerry','tom']
```

### 0x02 匿名函数
匿名函数有时可以节省代码量，它没有函数名，也不存在return，它会用到关键字lambda，后面跟参数，然后是冒号，冒号后面写表达式(也是返回值)，形如：lambda x,y:x*y代表的就是参数为x,y，返回x*y。Python的匿名函数都可以用def代替
```python
print map(lambda x:x*x,[1,2,3,4]) #返回[1,4,9,16]
print reduce(lambda x,y:x*y,[1,2,3,4]) #返回1*2*3*4，即24
print filter(lambda x:x>3,[1,2,3,4,5]) #返回[4,5]
f = lambda x,y:x+y
print f(3,2) #返回5
g = lambda x,y=3:x+y
print g(5) #不输入y值则默认为3，这里返回8
print (lambda s:' '.join(s.split('*')))("I*am*tom") #返回I am tom
print (lambda x,y:x if x>y else y)(53,34) #返回53
L = [lambda x:x**2,lambda x:x**3,lambda x:x**4]
for f in L:
    print f(2), #输出4 8 16
```

### 0x03 装饰器
装饰器可以提高程序的课重复利用性，并增加程序的可读性

* 不带参数

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

def deco(func):
    def _deco():
        print "before func()"
        func()
        print "after func()"

    return _deco #返回一个修饰过的函数(即修改过的func())


@deco #等价于foo = deco(foo)，即修饰过的函数赋给foo
def foo():
    print "this is foo()"

foo() # 此时的foo()就是deco(foo)的返回值，即函数_deco()
"""
#结果如下：
# before func()
# this is foo()
# after func()
"""
```

* 带参数

```python
def deco(func):
    def _deco(*args, **kwargs):
        print "before func()"
        ret = func(*args, **kwargs)
        print "after func()"
        return ret

    return _deco

@deco
def myfunc1(a, b):
    print "myfunc1"
    return a+b

@deco
def myfunc2(a, b, c):
    print "myfunc2"
    return a+b+c

print myfunc1(2,3)
print myfunc2(2,3,4)
"""
#结果如下：
# before func()
# myfunc1
# after func()
# 5
# before func()
# myfunc2
# after func()
# 9
"""
```