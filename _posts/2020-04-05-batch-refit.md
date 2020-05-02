---
layout: post
title: "用Batch Replacer轻松切换到Rouge高亮引擎"
subtitle: "Fix Highlighting in Imported Posts with Batch Replacer"
author: "DotIN13"
tags:
  - Batch Replacer
  - VSCode
  - Jekyll
  - Rouge
  - RegExp
typora-root-url: ../
locale: zh_CN
categories: [default]
---

## 问题

从Blogger迁移到Jekyll+Zeit之后，由于Jekyll不支持在HTML中渲染Markdown，所以像下面这样嵌在`details`中的代码段不会被高亮显示。

{% highlight HTML%}
<details>
    <summary>BlahBlah</summary>
    ```lang
    ...
    ```
</details>
{% endhighlight %}

跟别提我从Blogger导入的代码段，还都使用着Highlight.js的语法，这样的代码会直接被Rouge无视：

```html
<pre><code class="lang">
    ...
</code></pre>
```

于是，迁移到Jekyll后，为了在`<details>`中插入代码，仍然选用了highlight.js作为代码高亮引擎。

但在更换主题到plainwhite之后，我作为强迫症患者，想保留Rouge，摆脱Highlight.js，与时俱进。这就涉及到怎么将上面的代码段替换成Rouge支持的语法。

## 解决

在网上翻阅Rouge的资料，发现Rouge除了兼容Markdown的代码块之外，还兼容liquid。其语法如下：

```liquid
{% raw %}{% highlight lang %}
...
{% endhighlight %}{% endraw %}
```

所以只要将上面提到的`<pre>`替换成这边的{% raw %}`{% highlight lang %}`{% endraw %}就阔以了。但我可不想手动操作，抱着试一试的心态，在Eric鸽鸽吹上天的VSCode里寻找批量替换的插件。没想到还真的给我找着了，[Batch Replacer](https://marketplace.visualstudio.com/items?itemName=angelomollame.batch-replacer)这一插件支持一键替换Workspace中所有的文件内容，并且语法还支持RegExp。

{% include image.html link="/img/in-post/post-batch-replacer/batch-replacer.png" alt="Batch Replacer Extension" %}

刚学会了RegExp的我摩拳擦掌，跃跃欲试，编写了下面这段替换代码。

```plaintext
{% raw %}replace-regex "<pre>\s*<code class="([^"]*)">"
with "{% highlight $1 %}"

replace-regex "</code>\s*</pre>"
with "{% endhighlight %}"{% endraw %}
```

在Workspace添加_post文件夹，按下`Ctrl+Shift+P`，键入`Batch Refit`，回车，大功告成。

现在所有的Highlight.js语法的代码块都已经被替换成了Rouge代码块，即便被包裹在HTML代码中，也能够被轻松识别渲染，是不是很机智呢，哈哈哈哈哈！