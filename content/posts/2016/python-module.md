---
draft: false
date: 2016-08-31 11:22:41
title: Python 的模块
description: 
categories:
  - Python
tags:
  - python
  - module
---

### 0x00 Python的模块
* 在python中，任何一个python文件都可以看作一个模块
* 不同包下有相同模块名并不会冲突，且包下必须有文件```__init__.py```
* from lib import * 意思是从包lib中导入所有模块(若lib为模块名则为导入模块的所有函数)
* from lib.module1 import test 意思是从lib这个包下的module1模块中导入函数test
* import导入模块时会从sys.path输出的结果路径中查找模块然后导入
* ```sys.path.append('D:/xx/xx/xx/code')```可以添加搜索路径
* 使用```if __name__ == '__main__':```

### 0x01 实例
* 文件结构如下

![模块目录结构](/img/post/python_module_file_tree.png)

* 测试文件test.py

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

from package1 import * #导入包package1下的所有模块
import package2.module3 #导入包package2下的module3模块
import package2.module4 as s #导入包package2下的module4模块并重命名为s

a = module1.Class1() #创建一个对象
a.test() #调用类中的方法

b = module2.Class2()
b.test()

c = package2.module3.Class3()
c.test()

d = s.Class4()
d.test()
```

* 包package1

    * __init__.py

    > ```python
    #这个文件可以为空

    __all__ = ['module1', 'module2'] #有这一句才能使用import *导入所有模块
    ```

    * module1.py

    > ```python
    #!/usr/bin/env python
    # -*- coding: utf-8 -*-

    'this is test moudle'

    __author__ = 'reber'

    import sys

    class Class1(object):
        """docstring for Class1"""
        def __init__(self):
            super(Class1, self).__init__()
            
        def test(self):
            print "package1 -> module1.py -> Class1 -> test()"

        def main(self):
            print "this is module1.py main()"

    if __name__ == '__main__':
        sub11 = Class1()
        sub11.test()
        sub11.main()
    ```

    * module2.py

    > ```python
    #!/usr/bin/env python
    # -*- coding: utf-8 -*-

    'this is test moudle'

    __author__ = 'reber'

    import sys

    class Class2(object):
        """docstring for Class1"""
        def __init__(self):
            super(Class2, self).__init__()
            
        def test(self):
            print "package1 -> module2.py -> Class2 -> test()"

        def main(self):
            print "this is module2.py main()"

    if __name__ == '__main__':
        sub11 = Class2()
        sub11.test()
        sub11.main()
    ```

* 包package2
    * __init__.py

    > ```python

    __all__ = ['module3', 'module4']
    ```

    * module3.py

    > ```python
    #!/usr/bin/env python
    # -*- coding: utf-8 -*-

    'this is test moudle'

    __author__ = 'reber'

    import sys

    class Class3(object):
        """docstring for Class1"""
        def __init__(self):
            super(Class3, self).__init__()
            
        def test(self):
            print "package2 -> module3.py -> Class3 -> test()"

        def main(self):
            print "this is module3.py main()"

    if __name__ == '__main__':
        sub11 = Class3()
        sub11.test()
        sub11.main()
    ```

    * module4.py

    > ```python
    #!/usr/bin/env python
    # -*- coding: utf-8 -*-

    'this is test moudle'

    __author__ = 'reber'

    import sys

    class Class4(object):
        """docstring for Class4"""
        def __init__(self):
            super(Class4, self).__init__()
            
        def test(self):
            print "package2 -> module4.py -> Class4 -> test()"

        def main(self):
            print "this is module4.py main()"

    if __name__ == '__main__':
        sub11 = Class4()
        sub11.test()
        sub11.main()
    ```
* 执行python test.py结果
![导入模块测试结果](/img/post/python_module_test_result.png)
