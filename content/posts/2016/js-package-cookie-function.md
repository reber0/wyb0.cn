---
draft: false
date: 2016-12-27 11:49:38
title: "[转] JS 操作 cookie 方法的封装"
description: 对 cookie 的增、删、改方法进行封装
categories:
  - JS
tags:
  - js
---

原文链接：http://www.wyzu.cn/2015/0123/107167.html

### 0x00 实现功能
* 添加cookie
* 获取所有cookie
* 根据名字获取单个cookie的值
* 移除所有cookie
* 根据名字移除单个cookie


### 0x01 封装cookie.js源码
```
/*
 * 名称和值传送时必须是经过RUL编码的
 * cookie绑定在指定的域名下，非本域无法共享cookie，但是可以是在主站共享cookie给子站
 * cookie的名称不分大小写；同时建议将cookie URL编码
 * 建议针对cookie设置expires、domain、 path；每个cookie小于4KB
 **/

(function(global){
    function getCookiesObj() {
        //获得cookie对象
        var cookies = {};
        if (document.cookie) {
            var objs = document.cookie.split('; ');
            for (var i in objs) {
                var index = objs[i].indexOf('='),
                    name = objs[i].substr(0,index),
                    value = objs[i].substr(index+1,objs[i].length);
                cookies[name] = value;
            }
        }
        return cookies;
    }

    function set(sName,sValue,Opts) {
        //设置cookie
        // Opts expires,path,domain,secure
        if (sName && sValue) {
            var cookie = encodeURIComponent(sName)+'='+encodeURIComponent(sValue);
            
            if (Opts) {
                if (Opts.expires) {
                    var date = new Date();
                    date.setTime(date.getTime()+Opts.expires*24*3600*1000)
                    cookie += '; expires=' + date.toGMTString();
                }
                if (Opts.path) {
                    cookie += '; path=' + Opts.path;
                }
                if (Opts.domain) {
                    cookie += '; domain=' + Opts.domain;
                }
                if (Opts.secure) {
                    cookie += '; secure';
                }
            }
            document.cookie = cookie;
            return cookie;
        } else {
            return '';
        }
    }

    function getCookie(name) {
        //得到某个cookie
        return decodeURIComponent(getCookiesObj()[name]) || null;
    }

    function getCookies() {
        //得到所有cookie
        return getCookiesObj();
    }

    function remove(name) {
        //移除某个cookie
        if (getCookiesObj()[name]) {
            var date = new Date();
            date.setDate(date.getDate()-1);
            document.cookie = name + '=; expires='+date.toGMTString();
        }
    }

    function clear() {
        // 移除所有cookie
        var cookies = getCookiesObj();
        var date = new Date();
        date.setDate(date.getDate()-1);
        for (var key in cookies) {
            document.cookie = key + '=; expires='+date.toGMTString();
        }
    }

    function noConflict(name) {
        //解决冲突
        if (name && typeof name === 'string') {
            if (name && window['cookie']) {
                window[name] = window['cookie'];
                delete window['cookie'];
                return window[name];
            }
        } else {
            return window['cookie'];
            delete window['cookie'];
        }
    }

    global['cookie'] = {
        'set': set,
        'getCookies': getCookies,
        'getCookie': getCookie,
        'remove': remove,
        'clear': clear,
        'noConflict': noConflict
    };
})(window);
```

### 0x02 利用的a.html源码
```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>cookie example</title>
    </head>
    <body>
        <script type="text/javascript" src="./cookie.js" ></script>
        <script type="text/javascript">
            console.log('----------cookie对象-------------');
            console.log(cookie);
            console.log('----------对象-------------');
            console.log(cookie.getCookies());
            console.log('----------设置cookie-------------');
            console.log(cookie.set('name', 'wlh'));
            console.log('----------设置cookie 123-------------');
            console.log(cookie.set('name', 'wlh123'));
            console.log('----------设置cookie age-------------');
            console.log(cookie.set('age', 20));
            // alert(document.cookie);
            console.log('----------获取cookie-------------');
            console.log(cookie.getCookie('name'));
            console.log('----------获取所有-------------');
            console.log(cookie.getCookies());
            console.log('----------清除age-------------');
            console.log(cookie.remove('age'));
            console.log('----------获取所有-------------');
            console.log(cookie.getCookies());
            console.log('----------清除所有-------------');
            console.log(cookie.clear());
            console.log('----------获取所有-------------');
            console.log(cookie.getCookies());
            console.log('----------解决冲突-------------');
            var $Cookie = cookie.noConflict(true /*a new name of cookie*/);
            console.log($Cookie);
            console.log('----------使用新的命名-------------');
            console.log($Cookie.getCookies());
        </script>
    </body>
</html>
```

### 0x03 结果
![调用封装文件操作cookie](/img/post/js_cookie.png)
