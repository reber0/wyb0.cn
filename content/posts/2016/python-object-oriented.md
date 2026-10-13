---
draft: false
date: 2016-01-25 11:17:59
title: Python 的面向对象
description: 
categories:
  - Python
tags:
  - python
---

### 0x00 面向对象
* 面向对象是为了解决系统的可维护性，可扩展性，可重用性

* 三个基本特征：封装、继承、多态  
    * 封装：对一类事物，将其相同特点和功能提取出来，所共有的特点叫做属性，共有的功能就叫做方法，将属性和方法组合在一起就叫做封装。  
    如：人具有姓名、年龄、性别，这些就是属性，人可以说话、可以走、可以跑，这些就是方法，封装起来就是一个类，而类的实例化就是对象

    * 继承：继承可以使得子类具有父类的属性和方法，不需要再次编写相同的代码，子类可以对继承的代码进行重写，也可以追加新的属性和方法。  
    如：有一个类People，教师就可以继承自People，可以添加自己的属性，如：工资、职工号，也可以添加自己的方法，如：备课、写教案

    * 多态：首先，多态必有继承，没有继承就没有多态，继承后一个父类的引用变量可以指向其任意一个子类对象。  
    如：有一个People类，它的子类可以有学生、老师、工人，有多种形态，这就是多态

### 0x01 类的实例
注意：类中每个方法后面都要写self，self就是当前对象指针

* 示例一

```python
#!/usr/bin/env python
# -*- coding:utf-8 -*-

# 声明一个People类
class People(object):
    """docstring for People"""
    def __init__(self, name, age):
        super(People, self).__init__()
        self.name = name
        self.age = age

    def running(self):
        print "%s is running" % self.name

    def print_base_msg(self):
        print "Name:%s Age:%d" % (self.name,self.age)

# 继承自People类
class Teacher(People):
    """docstring for Teacher"""
    def __init__(self, name, age, salary):
        super(Teacher, self).__init__(name, age)
        self.name = name
        self.age = age
        self.salary = salary

    def print_base_msg(self): #对父类方法进行重写，会覆盖原方法
        print "Name:%s Age:%d Salary:%d" % (self.name,self.age,self.salary)

# 继承自People类
class Student(People):
    """docstring for Student"""
    def __init__(self, name, age, score):
        super(Student, self).__init__(name, age)
        self.name = name
        self.age = age
        self.score = score

    def print_base_msg(self): #对父类方法进行重写，会覆盖原方法
        print "Name:%s Age:%d Score:%d" % (self.name,self.age,self.score)

t = Teacher('tom',40,13000)
t.running() #tom is running 调用时会先查找当前类中有无此方法，没有的话再从父类查找
t.print_base_msg() #Name:tom Age:40 Salary:13000

s = Student('xiaoming',16,97)
s.running() #xiaoming is running
s.print_base_msg() #Name:xiaoming Age:16 Score:97
```

* 示例二

```python
#!/usr/bin/env python
# -*- coding:utf-8 -*-

class A(object):
    """docstring for A"""
    def __init__(self, arg):
        super(A, self).__init__()
        self.arg = arg

    def print_a(self):
        print "A class"

    def print_arg(self):
        print "A output arg: %s" % (self.arg+'-a')

    # 以__开头的是私有成员
    def __print_pravite(self): #子类不能直接用A.__print_pravite()调用它
        a = "A pravite"
        return a

    def get_pravite(self): #可以使用自己的私有方法
        t = self.__print_pravite()
        print t

class B(A):
    """docstring for B"""
    def __init__(self, arg):
        super(B, self).__init__(arg)
        self.arg = arg
 
    def print_b(self):
        print "B class"

    def print_arg(self):
        print "B output arg: %s" % (self.arg+'-b')

    def call_a_fun(self):
        self.print_b()
        self.print_arg()

    def call_b_fun(self):
        A.print_a(self) #调用父类方法。当父类名称改变时子类所有父类名都要变
        super(B, self).print_arg() #调用父类方法，父类名称改变时子类不用调整
        super(B, self).get_pravite() #子类可以使用父类的公有方法
        # super(B, self).__print_pravite() #出错，子类不能使用父类的私有方法

b = B('test')
b.call_b_fun()
b.call_a_fun()

# 输出如下：
# A class
# A output arg: test-a
# A pravite
# B class
# B output arg: test-b
# [Finished in 0.1s]
```

* 示例三

```python
#!/usr/bin/env python
# -- coding: utf-8 -*-

class People(object):
    """docstring for People"""

    peoplecount = 0 #类属性

    def __init__(self, name, age, salary):
        super(People, self).__init__()
        self.name = name #对象属性
        self.age = age
        self.__salary = salary #私有属性，外部不能访问
        People.peoplecount += People.peoplecount + 1

    def display_count(self):
        print People.peoplecount #访问类属性

    def display_msg(self):
        print "name:%s age:%d" % (self.name,self.age)

    def set_salary(self, v):
        if v > 0:
            self.__salary = v
        else:
            print "value is error"

    def display_salary(self):
        print "salary:%d" % self.__salary


print People.peoplecount
p1 = People('tom', 21, 20000)
p2 = People('jack', 25, 14900)
p1.display_msg()
p2.display_msg()
p2.display_count()

# 结果如下：
# 0
# name:tom age:21
# name:jack age:25
# 3
# [Finished in 0.1s]
```