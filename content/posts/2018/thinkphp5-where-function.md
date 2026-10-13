---
draft: false
date: 2018-04-16 19:16:14
title: ThinkPHP5 的 where 函数使用不当存在注入
description: thinkphp 的 where 函数可以接收字符串和数组，接收字符串时就可能存在注入，还是使用数组来传值吧。。。
categories:
  - Pentest
  - PHP
tags:
  - SQL注入
  - 代码审计
---

### 0x00 关于thinkphp5的where函数
年前公司委托别的公司开发一个网站，使用的是ThinkPHP 5.0.13，存在一个注入漏洞，分析后发现是因为tp5中的where函数使用不当，tp5中where这个函数可以接收字符串和数组这两种类型的参数来进行查询，而在用字符串这种传递方式时，如果使用不当的话就可能会出现sql注入。

### 0x01 示例代码
tp5/application/home/controller/Index.php
```
<?php
namespace app\home\controller;

use think\Db;

class Index
{   
    //http://127.0.0.1/Source/tp5/home/index/testdb/id/1
    public function testDb()
    {
        // 调用 tp5/thinkphp/library/think/Db.php 的 connect() 函数 初始化数据库，并取得数据库类实例
        $msg = db('msg');

        $id = input('param.id',1); //不存在id的话默认为1

        //在Db.php中use think\db\Query; $msg->where()则调用了Query.php中的where函数进入查询流程
        $result = $msg->where("id=".$id)->select();
        // $result = $msg->where(['id'=>$id])->select();

        echo '<br/><hr/>执行的sql语句：';
        echo $msg->getLastSql();
        echo '<br/>最终得到的结果：';
        echo var_dump($result);
    }
}
```
where函数接收字符串和数组时，访问```http://127.0.0.1/Source/tp5/home/index/testdb/id/1```执行的SQL语句分别如下：
```
SELECT * FROM `msg` WHERE ( id=1 )

SELECT * FROM `msg` WHERE `id` = 1
```
前者存在注入，当payload为: <f>) and 1=1 and (1)=(1</f>时判断返回如下：
![80](/img/post/tp5_where_str1.png)
![45](/img/post/tp5_where_str2.png)
主要调用文件及函数顺序如下：
```html
调用 tp5/thinkphp/library/think/Db.php 的 connect() 函数 初始化数据库，并取得数据库类实例

调用 tp5/thinkphp/library/think/db/Query.php 的 __construct() 函数
    ==>调用 tp5/thinkphp/library/think/db/Builder.php 的 __construct() 函数

调用 tp5/thinkphp/library/think/db/Query.php 的 where() 函数
调用 tp5/thinkphp/library/think/db/Query.php 的 select() 函数
    ==>调用 tp5/thinkphp/library/think/db/Query.php 的 parseExpress 函数进行相关解析
    ==>调用 tp5/thinkphp/library/think/db/Builder.php 的 select() 函数得到最终执行的sql语句
    ==>调用 tp5/thinkphp/library/think/db/Query.php 的 query() 函数
```

### 0x02 调用流程中where的处理
* tp5/thinkphp/library/think/db/Query.php 的 where()

```
//指定AND查询条件
public function where($field, $op = null, $condition = null)
{
    $param = func_get_args(); //array(1) { [0]=> string(24) "id=1) and 1=1 and (1)=(1" } 
    array_shift($param); //array(0) { } 
    $this->parseWhereExp('AND', $field, $op, $condition, $param);
    return $this;
}

//分析查询表达式
protected function parseWhereExp($logic, $field, $op, $condition, $param = [])
{
    //$logic='AND'
    //$field="id=1) and 1=1 and (1)=(1"
    $logic = strtoupper($logic);
    if ($field instanceof \Closure) {
        $this->options['where'][$logic][] = is_string($op) ? [$op, $field] : $field;
        return;
    }

    if (is_string($field) && !empty($this->options['via']) && !strpos($field, '.')) {
        $field = $this->options['via'] . '.' . $field;
    }

    if (is_string($field) && preg_match('/[,=\>\<\'\"\(\s]/', $field)) {//进入
        $where[] = ['exp', $field];
        // echo '<pre>';
        // var_dump($where);
        // echo '<pre>';
        if (is_array($op)) {//跳出
            // 参数绑定
            $this->bind($op);
        }
    } elseif (is_null($op) && is_null($condition)) {
        if (is_array($field)) {
            // 数组批量查询
            $where = $field;
            foreach ($where as $k => $val) {
                $this->options['multi'][$logic][$k][] = $val;
            }
        } elseif ($field && is_string($field)) {
            // 字符串查询
            $where[$field]                            = ['null', ''];
            $this->options['multi'][$logic][$field][] = $where[$field];
        }
    } elseif (is_array($op)) {
        $where[$field] = $param;
    } elseif (in_array(strtolower($op), ['null', 'notnull', 'not null'])) {
        // null查询
        $where[$field]                            = [$op, ''];
        $this->options['multi'][$logic][$field][] = $where[$field];
    } elseif (is_null($condition)) {
        // 字段相等查询
        $where[$field]                            = ['eq', $op];
        $this->options['multi'][$logic][$field][] = $where[$field];
    } else {
        $where[$field] = [$op, $condition, isset($param[2]) ? $param[2] : null];
        if ('exp' == strtolower($op) && isset($param[2]) && is_array($param[2])) {
            // 参数绑定
            $this->bind($param[2]);
        }
        // 记录一个字段多次查询条件
        $this->options['multi'][$logic][$field][] = $where[$field];
    }
    if (!empty($where)) {//进入
        if (!isset($this->options['where'][$logic])) {//进入
            $this->options['where'][$logic] = [];
        }
        if (is_string($field) && $this->checkMultiField($field, $logic)) {
            $where[$field] = $this->options['multi'][$logic][$field];
        } elseif (is_array($field)) {
            foreach ($field as $key => $val) {
                if ($this->checkMultiField($key, $logic)) {
                    $where[$key] = $this->options['multi'][$logic][$key];
                }
            }
        }
        $this->options['where'][$logic] = array_merge($this->options['where'][$logic], $where);
        //array(1) { [0]=> array(2) { [0]=> string(3) "exp" [1]=> string(24) "id=1) and 1=1 and (1)=(1" } } 
    }
}
```
Query.php这里面经过where和parseWhereExp的处理后把数组存入了```options['where'][$logic]```里面

不过这里处理后我们拼接的数据没有变，这样where()就处理好了，接着调用select()

### 0x03 调用流程中select的处理(这里就query得到结果了)
流程的话分三步：

1、解析参数：在tp5/thinkphp/library/db/Query.php的select()函数中调用$this->parseExpress(); 进行表达式的解析

2、生成sql语句：在tp5/thinkphp/library/db/Query.php的select()函数中调用Builder.php里的select()处理上面解析后的参数最终生成sql语句

3、执行sql语句：在tp5/thinkphp/library/db/Query.php的select()函数中调用$this->query()得到结果

* 解析参数(tp5/thinkphp/library/db/Query.php)

```
//查找记录
public function select($data = null)
{
    if ($data instanceof Query) {
        return $data->select();
    } elseif ($data instanceof \Closure) {
        call_user_func_array($data, [ & $this]);
        $data = null;
    }
    // 分析查询表达式
    $options = $this->parseExpress();//分析了表达式，把查的表、查的列、查询条件都存到$options

    if (false === $data) {
        // 用于子查询 不查询只返回SQL
        $options['fetch_sql'] = true;
    } elseif (!is_null($data)) {
        // 主键条件分析
        $this->parsePkWhere($data, $options);
    }

    $resultSet = false;
    if (empty($options['fetch_sql']) && !empty($options['cache'])) {
        // 判断查询缓存
        $cache = $options['cache'];
        unset($options['cache']);
        $key       = is_string($cache['key']) ? $cache['key'] : md5(serialize($options) . serialize($this->bind));
        $resultSet = Cache::get($key);
    }
    if (false === $resultSet) {//进入
        // 生成查询SQL
        //这里调用tp5/thinkphp/library/db/Builder.php里的select()处理，生成sql语句如下：
        //$sql = "SELECT * FROM `msg` WHERE  (  id=1) and 1=1 and (1)=(1)"
        $sql = $this->builder->select($options);
        //echo "<br>最终生成的sql语句：".$sql."<br>";

        // 获取参数绑定
        $bind = $this->getBind();
        if ($options['fetch_sql']) {//跳过
            // 获取实际执行的SQL语句
            return $this->connection->getRealSql($sql, $bind);
        }

        $options['data'] = $data;//$data是空的

        if ($resultSet = $this->trigger('before_select', $options)) {
        } else {//进入，这里就执行了sql查询操作了，造成注入
            // 执行查询操作
            //调用 tp5/thinkphp/library/think/db/Connection.php 的 query() 函数
            $resultSet = $this->query($sql, $bind, $options['master'], $options['fetch_pdo']);

            if ($resultSet instanceof \PDOStatement) {
                // 返回PDOStatement对象
                return $resultSet;
            }
        }

        if (isset($cache) && false !== $resultSet) {
            // 缓存数据集
            $this->cacheData($key, $resultSet, $cache);
        }
    }

    /*
    省略部分代码
    */

    // 返回结果处理
    if (!empty($options['fail']) && count($resultSet) == 0) {
        $this->throwNotFound($options);
    }
    // var_dump($resultSet);
    return $resultSet;
}

//分析表达式（可用于查询或者写入操作）
protected function parseExpress()
{
    $options = $this->options;//将where()处理后的数据给options

    // 获取数据表
    if (empty($options['table'])) {//进入，得到查询的表名
        $options['table'] = $this->getTable(); //string(3) "msg" 
    }

    if (!isset($options['where'])) {
        $options['where'] = [];
    } elseif (isset($options['view'])) {
        // 视图查询条件处理
        foreach (['AND', 'OR'] as $logic) {
            if (isset($options['where'][$logic])) {
                foreach ($options['where'][$logic] as $key => $val) {
                    if (array_key_exists($key, $options['map'])) {
                        $options['where'][$logic][$options['map'][$key]] = $val;
                        unset($options['where'][$logic][$key]);
                    }
                }
            }
        }

        if (isset($options['order'])) {
            // 视图查询排序处理
            if (is_string($options['order'])) {
                $options['order'] = explode(',', $options['order']);
            }
            foreach ($options['order'] as $key => $val) {
                if (is_numeric($key)) {
                    if (strpos($val, ' ')) {
                        list($field, $sort) = explode(' ', $val);
                        if (array_key_exists($field, $options['map'])) {
                            $options['order'][$options['map'][$field]] = $sort;
                            unset($options['order'][$key]);
                        }
                    } elseif (array_key_exists($val, $options['map'])) {
                        $options['order'][$options['map'][$val]] = 'asc';
                        unset($options['order'][$key]);
                    }
                } elseif (array_key_exists($key, $options['map'])) {
                    $options['order'][$options['map'][$key]] = $val;
                    unset($options['order'][$key]);
                }
            }
        }
    }

    if (!isset($options['field'])) {//进入，设置查询的列名为*
        $options['field'] = '*';
    }

    if (!isset($options['data'])) {//进入
        $options['data'] = [];
    }

    if (!isset($options['strict'])) {//进入，bool(true)
        $options['strict'] = $this->getConfig('fields_strict');
    }

    foreach (['master', 'lock', 'fetch_pdo', 'fetch_sql', 'distinct'] as $name) {
        if (!isset($options[$name])) {//进入，$options[$name]置为false
            $options[$name] = false;
        }
    }

    foreach (['join', 'union', 'group', 'having', 'limit', 'order', 'force', 'comment'] as $name) {
        if (!isset($options[$name])) {//进入，$options[$name]置为''
            $options[$name] = '';
        }
    }

    if (isset($options['page'])) {
        // 根据页数计算limit
        list($page, $listRows) = $options['page'];
        $page                  = $page > 0 ? $page : 1;
        $listRows              = $listRows > 0 ? $listRows : (is_numeric($options['limit']) ? $options['limit'] : 20);
        $offset                = $listRows * ($page - 1);
        $options['limit']      = $offset . ',' . $listRows;
    }

    $this->options = [];
    // echo '<pre>';
    //     var_dump($options);
    // echo '<pre>';
    return $options;
}
```

* 生成SQL语句(tp5/thinkphp/library/db/Builder.php)

```
//生成查询SQL
public function select($options = [])
{
    //这里主要分析一下$this->parseWhere($options['where'], $options),
    $sql = str_replace(
        ['%TABLE%', '%DISTINCT%', '%FIELD%', '%JOIN%', '%WHERE%', '%GROUP%', '%HAVING%', '%ORDER%', '%LIMIT%', '%UNION%', '%LOCK%', '%COMMENT%', '%FORCE%'],
        [
            $this->parseTable($options['table'], $options),
            $this->parseDistinct($options['distinct']),
            $this->parseField($options['field'], $options),
            $this->parseJoin($options['join'], $options),
            $this->parseWhere($options['where'], $options),
            $this->parseGroup($options['group']),
            $this->parseHaving($options['having']),
            $this->parseOrder($options['order'], $options),
            $this->parseLimit($options['limit']),
            $this->parseUnion($options['union']),
            $this->parseLock($options['lock']),
            $this->parseComment($options['comment']),
            $this->parseForce($options['force']),
        ], $this->selectSql);
    return $sql;
}

//where分析
protected function parseWhere($where, $options)
{
    $whereStr = $this->buildWhere($where, $options);//( id=1) and 1=1 and (1)=(1 )
    if (!empty($options['soft_delete'])) {//跳过
        // 附加软删除条件
        list($field, $condition) = $options['soft_delete'];

        $binds    = $this->query->getFieldsBind($options['table']);
        $whereStr = $whereStr ? '( ' . $whereStr . ' ) AND ' : '';
        $whereStr = $whereStr . $this->parseWhereItem($field, $condition, '', $options, $binds);
    }
    return empty($whereStr) ? '' : ' WHERE ' . $whereStr;
}

//生成查询条件SQL
public function buildWhere($where, $options)
{
    if (empty($where)) {
        $where = [];
    }

    if ($where instanceof Query) {//跳过
        return $this->buildWhere($where->getOptions('where'), $options);
    }

    $whereStr = '';
    $binds    = $this->query->getFieldsBind($options['table']);
    //$binds 为 array(4) { ["id"]=> int(1) ["name"]=> int(2) ["title"]=> int(2) ["content"]=> int(2) }

    /*
    $where结构如下：
    array(1) {
      ["AND"]=>
      array(1) {
        [0]=>
        array(2) {
          [0]=>
          string(3) "exp"
          [1]=>
          string(24) "id=1) and 1=1 and (1)=(1"
        }
      }
    }
    */
    foreach ($where as $key => $val) {//$key为AND
        $str = [];
        foreach ($val as $field => $value) {//$field为0
            if ($value instanceof \Closure) {
                // 使用闭包查询
                $query = new Query($this->connection);
                call_user_func_array($value, [ & $query]);
                $whereClause = $this->buildWhere($query->getOptions('where'), $options);
                if (!empty($whereClause)) {
                    $str[] = ' ' . $key . ' ( ' . $whereClause . ' )';
                }
            } elseif (strpos($field, '|')) {
                // 不同字段使用相同查询条件（OR）
                $array = explode('|', $field);
                $item  = [];
                foreach ($array as $k) {
                    $item[] = $this->parseWhereItem($k, $value, '', $options, $binds);
                }
                $str[] = ' ' . $key . ' ( ' . implode(' OR ', $item) . ' )';
            } elseif (strpos($field, '&')) {
                // 不同字段使用相同查询条件（AND）
                $array = explode('&', $field);
                $item  = [];
                foreach ($array as $k) {
                    $item[] = $this->parseWhereItem($k, $value, '', $options, $binds);
                }
                $str[] = ' ' . $key . ' ( ' . implode(' AND ', $item) . ' )';
            } else {//进入
                // 对字段使用表达式查询
                $field = is_string($field) ? $field : '';//$field为''

                /*
                * 传递到parseWhereItem的参数如下：
                * $field为 ''
                * $value为 array(2) { [0]=> string(3) "exp" [1]=> string(24) "id=1) and 1=1 and (1)=(1" }
                *   $key为 AND
                * $binds为 array(4) { ["id"]=> int(1) ["name"]=> int(2) ["title"]=> int(2) ["content"]=> int(2) }
                */
                $str[] = ' ' . $key . ' ' . $this->parseWhereItem($field, $value, $key, $options, $binds);
                // $str为array(1) { [0]=> string(34) " AND ( id=1) and 1=1 and (1)=(1 )" } 
            }
        }
        
        //substr处理掉多出来的AND
        $whereStr .= empty($whereStr) ? substr(implode(' ', $str), strlen($key) + 1) : implode(' ', $str);
    }

    return $whereStr;//最后输出( id=1) and 1=1 and (1)=(1 )
}

// where子单元分析
protected function parseWhereItem($field, $val, $rule = '', $options = [], $binds = [], $bindName = null)
{
    // 字段分析
    $key = $field ? $this->parseKey($field, $options) : '';//$key为''

    // 查询规则和条件
    if (!is_array($val)) {
        $val = is_null($val) ? ['null', ''] : ['=', $val];
    }
    list($exp, $value) = $val;//$exp为exp，$value为id=1) and 1=1 and (1)=(1

    // 对一个字段使用多个查询条件
    if (is_array($exp)) {
        $item = array_pop($val);
        // 传入 or 或者 and
        if (is_string($item) && in_array($item, ['AND', 'and', 'OR', 'or'])) {
            $rule = $item;
        } else {
            array_push($val, $item);
        }
        foreach ($val as $k => $item) {
            $bindName = 'where_' . str_replace('.', '_', $field) . '_' . $k;
            $str[]    = $this->parseWhereItem($field, $item, $rule, $options, $binds, $bindName);
        }
        return '( ' . implode(' ' . $rule . ' ', $str) . ' )';
    }

    // 检测操作符
    if (!in_array($exp, $this->exp)) {//进入，$exp的值从exp变为了EXP
        $exp = strtolower($exp);
        if (isset($this->exp[$exp])) {
            $exp = $this->exp[$exp];//$exp为EXP
        } else {
            throw new Exception('where express error:' . $exp);
        }
    }
    $bindName = $bindName ?: 'where_' . str_replace(['.', '-'], '_', $field);
    // $bindName 是 where_
    if (preg_match('/\W/', $bindName)) {
        // 处理带非单词字符的字段名
        $bindName = md5($bindName);
    }

    if (is_object($value) && method_exists($value, '__toString')) {
        // 对象数据写入
        $value = $value->__toString();
    }

    $bindType = isset($binds[$field]) ? $binds[$field] : PDO::PARAM_STR;
    //返回PDO::PARAM_STR，即数字2

    if (is_scalar($value) && array_key_exists($field, $binds) && !in_array($exp, ['EXP', 'NOT NULL', 'NULL', 'IN', 'NOT IN', 'BETWEEN', 'NOT BETWEEN']) && strpos($exp, 'TIME') === false) {
        if (strpos($value, ':') !== 0 || !$this->query->isBind(substr($value, 1))) {
            if ($this->query->isBind($bindName)) {
                $bindName .= '_' . str_replace('.', '_', uniqid('', true));
            }
            $this->query->bind($bindName, $value, $bindType);
            $value = ':' . $bindName;
        }
    }

    $whereStr = '';
    if (in_array($exp, ['=', '<>', '>', '>=', '<', '<='])) {
        // 比较运算
        if ($value instanceof \Closure) {
            $whereStr .= $key . ' ' . $exp . ' ' . $this->parseClosure($value);
        } else {
            $whereStr .= $key . ' ' . $exp . ' ' . $this->parseValue($value, $field);
        }
    } elseif ('LIKE' == $exp || 'NOT LIKE' == $exp) {
        // 模糊匹配
        if (is_array($value)) {
            foreach ($value as $item) {
                $array[] = $key . ' ' . $exp . ' ' . $this->parseValue($item, $field);
            }
            $logic = isset($val[2]) ? $val[2] : 'AND';
            $whereStr .= '(' . implode($array, ' ' . strtoupper($logic) . ' ') . ')';
        } else {
            $whereStr .= $key . ' ' . $exp . ' ' . $this->parseValue($value, $field);
        }
    } elseif ('EXP' == $exp) {//进入
        // 表达式查询
        //$key为''，$value为id=1) and 1=1 and (1)=(1
        //到此结束，$whereStr为(  id=1) and 1=1 and (1)=(1 )
        $whereStr .= '( ' . $key . ' ' . $value . ' )';

    } elseif (in_array($exp, ['NOT NULL', 'NULL'])) {
        // NULL 查询
        $whereStr .= $key . ' IS ' . $exp;
    } elseif (in_array($exp, ['BETWEEN TIME', 'NOT BETWEEN TIME'])) {
        if (is_string($value)) {
            $value = explode(',', $value);
        }

        $whereStr .= $key . ' ' . substr($exp, 0, -4) . $this->parseDateTime($value[0], $field, $options, $bindName . '_between_1', $bindType) . ' AND ' . $this->parseDateTime($value[1], $field, $options, $bindName . '_between_2', $bindType);
    }
    // var_dump($whereStr);
    return $whereStr;
}
```

* 执行sql语句(tp5/thinkphp/library/db/Query.php)

```
//执行查询 返回数据集
public function query($sql, $bind = [], $master = false, $class = false)
{
    return $this->connection->query($sql, $bind, $master, $class);
}
```
