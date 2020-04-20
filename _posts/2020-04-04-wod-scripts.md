---
layout: post
title: "给WoD写Tampermonkey脚本的那些事儿"
subtitle: "WoD Scripting Experience"
author: "DotIN13"
tags:
  - WoD
  - Tampermonkey
  - Javascript
---

## 再写脚本我就剁手

目前我已经断断续续地给WoD写了5个Tampermonkey脚本，可惜真正受到玩家欢迎的只有两款。又因为WoD的玩家数量实在是太少，太少。往多了算，或许全国的14亿人里能有300人在玩WoD？

<iframe width="100%" height="325" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" src="https://www.google.com/publicdata/embed?ds=d5bncppjof8f9_&amp;ctype=l&amp;strail=false&amp;bcs=d&amp;nselm=h&amp;met_y=sp_pop_totl&amp;scale_y=lin&amp;ind_y=false&amp;rdim=world&amp;idim=country:CHN:IND:USA&amp;ifdim=world&amp;hl=en_US&amp;dl=en&amp;ind=false"></iframe>

我说，ZZZ，你要是再写WoD脚本，要不你就剁手吧。行，不过剁手有点疼，要不还是剁希莉娅吧……

## Function Scope

调用函数的Scope可以说是我在编写脚本中遇到的第一个问题。当你在Tampermonkey中信心满满地写好函数，希望把它添加到一个button的onclick事件中，却在调试中始终无法触发，你的内心是不是充满了纠结？

其实问题非常简单，Tampermonkey的脚本默认模板本身就是一个anonymous function。

```javascript
(function() {
    //your script
})();
```

以上的这段代码等同于：

```javascript
function a() {
    //your script
}
a();
```

那么既然你的整个脚本都身处这个function的scope中，你叫浏览器怎么定位到这个function中的另一个function呢？所以一种解决方案是直接抛弃这个Tampermonkey默认提供的function外壳，在global scope中完成你的脚本，但这样难免会遇到你的variable与网站其他variable冲突的可能。所以你可以通过window对象来定义你的global function，像这样...

```javascript
(function(){
    window.a = function() {
        //your function
    }
})();
```

这样，你就可以在global环境中通过`a()`来直接在事件中调用这个函数了。

## RegExp

我是一个货真价实的Coding Rookie，所以当我在编写我的第一个脚本WoD Jumpbox Enhanced的时候，看到网站js中所用的一串不明所以的代码，瞬间蒙了圈儿：`/^\s*\[\s*([^:]+?)\s*:\s*(.+?)\s*\]\s*$/`。

热心群友Hyt和Eric鸽鸽亲切地帮我解答了疑惑：原来这就是大名鼎鼎的正则表达式。不查不知道，一查吓一跳，原来正则表达式的规矩这么多。在翻阅了[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp)的资料之后，才算对这种匹配字符串的神器有了些许了解。

不过对于什么时候利用`g`进行全局匹配，什么时候需要利用`m`来多行匹配，我还是处于**随心所欲**的状态……

## XMLHttpRequest

在宝库好感度这个脚本中，涉及到要读取WoD提供的宝库物品列表，翻看了一圈，要么用JQuery的`$().load`，要么利用javascript内建的XMLHttpRequest。

读取宝库列表是一次性的操作，我非常简单地建立了一个`display: none`的div来存放`$().load`拉取的信息，蒙混过关。

但当我在制作装备最低要求拉取这个脚本时，却发现`$().load`在for循环中完全无法工作，猜想是上一个load还没有完成，for已经进入了下一次循环，导致了所有load动作都被跳过。无奈的我只好硬着头皮研究XMLHttpRequest，好在StackOverflow和MDN网站上的资料还是非常丰富的，不久我便明白了XMLHttpRequest来获取网页内容是一种定死的异步操作，即可以同时有多个拉取的操作在进行。这给数据的记录带来了问题，因为遍历所有装备时，我按照装备的位置记录了它们的i值，以有序地将各个装备信息存入数组，但这个i值应该怎么传递给XMLHttpRequest的Callback函数呢？

万能的[StackOverflow](https://stackoverflow.com/questions/25220486/xmlhttprequest-in-for-loop)给出了解答：

```javascript
window.onload = function(){

    var f = (function(){
        var xhr = [], i;
        for(i = 0; i < 3; i++){ //for loop
            (function(i){
                xhr[i] = new XMLHttpRequest();
                url = "closure.php?data=" + i;
                xhr[i].open("GET", url, true);
                xhr[i].onreadystatechange = function(){
                    if (xhr[i].readyState === 4 && xhr[i].status === 200){
                        console.log('Response from request ' + i + ' [ ' + xhr[i].responseText + ']'); 
                    }
                };
                xhr[i].send();
            })(i);
        }
    })();

};
```

网络大神利用anonymous function，轻松地将i传递给了callback函数，我的插件编写也得到了拯救。

## 后记

剁手？只是说着玩玩的。确实开发脚本遇到了很多问题，我的用户群体也非常的少，但我在这个过程中也收获很多。为自己喜欢的东西而付出，这种幸福又还能持续多久呢？

最后的最后，必须要感谢首席脚本测试员lnsh02……