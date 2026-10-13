---
draft: false
date: 2017-07-20 14:20:26
title: 使用 Python 读写 xml 文件
description: 
categories:
  - Python
tags:
  - python
  - xml
---

### 0x00 解析XML的方法
1. SAX (simple API for XML)  
python 标准库包含SAX解析器，SAX用事件驱动模型，通过在解析XML的过程中触发一个个的事件并调用用户定义的回调函数来处理XML文件。

2. DOM(Document Object Model)  
将XML数据在内存中解析成一个树，通过对树的操作来操作XML。

3. ElementTree(元素树)  
ElementTree就像一个轻量级的DOM，具有方便友好的API。代码可用性好，速度快，消耗内存少。

- **我在这里使用ElementTree**

### 0x01 Element对象的属性
每个Element对象都具有以下属性：

* tag：string对象，表示数据代表的种类
* attrib：dictionary对象，表示附有的属性
* text：string对象，表示element的内容
* tail：string对象，表示element闭合之后的尾迹
* 若干子元素（child elements）

```python
>>> from xml.etree import ElementTree as ET
>>> xml = """<books>
...   <book id='37476'>aaaa</book>
...   <book id='83727'>bbbb</book>
... </books>"""
>>> root = ET.fromstring(xml)
>>> root.tag
'books'
>>> child = root.getchildren()
>>> child
[<Element 'book' at 0x106f59410>, <Element 'book' at 0x106f59450>]
>>> child[0].tag
'book'
>>> child[0].attrib
{'id': '37476'}
>>> child[0].text
'aaaa'
```

### 0x02 文件内容
```
<?xml version='1.0' encoding='UTF-8'?>
<books>
  <book>
    <name>Python黑帽子</name>
    <date>2015</date>
    <price>37￥</price>
    <description>用python写一些程序</description>
  </book>
  <book>
    <name>Web安全深度剖析</name>
    <date>2014</date>
    <price>39￥</price>
    <description>讲述web渗透的基础知识</description>
  </book>
  <book>
    <name>白帽子讲web安全</name>
    <date>2013</date>
    <price>44￥</price>
    <description>道哥力作</description>
  </book>
</books>
```

### 0x03 读取xml节点
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

from xml.etree import ElementTree as ET

tree = ET.parse('test.xml')
root = tree.getroot()
# root = ET.fromstring(country_data_as_string) #通过字符串导入,直接获取根
childs = root.getchildren()

books = []
for child0 in childs:
    book = {}
    for child00 in child0.getchildren():
        # print child00.tag #标签名，即name、date、price、description
        # print child00.text
        book[child00.tag] = child00.text
    books.append(book)

print books
"""
books = [
    {'name': 'Python黑帽子','date': '2015','price': '37￥','description': '用python写一些程序'},
    {'name': 'Web安全深度剖析','date': '2014','price': '39￥','description': '讲述web渗透的基础知识'},
    {'name': '白帽子讲web安全','date': '2013','price': '44￥','description': '道哥力作'}        
]
"""
```

### 0x04 写入xml文件
```
#!/usr/bin/env python
# -*- coding: utf-8 -*-
# code by reber <1070018473@qq.com>

from xml.etree import ElementTree as ET

bs = [
    {
        'name': u'Python黑帽子',
        'date': '2015',
        'price': u'37￥',
        'description': u'用python写一些程序'
    },
    {
        'name': u'Web安全深度剖析',
        'date': '2014',
        'price': u'39￥',
        'description': u'讲述web渗透的基础知识'
    },
    {
        'name': u'白帽子讲web安全',
        'date': '2013',
        'price': u'44￥',
        'description': u'道哥力作'
    }        
]

def indent(elem, level=0):
    """美化写入文件的内容"""
    i = "\n" + level*"  "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "  "
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for elem in elem:
            indent(elem, level+1)
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i

books = ET.Element('books')

# for b in bs:
#     book = ET.Element('book')
#     books.append(book)

#     for k,v in b.items():
#         child = ET.Element(k)
#         child.text = v
#         book.append(child)

for b in bs:
    book = ET.SubElement(books, 'book')
    for k,v in b.items():
        ET.SubElement(book, k).text = v

indent(books,0)

tree = ET.ElementTree(books)
tree.write('aa.xml', 'utf-8')
# import sys
# tree.write(sys.stdout)
```