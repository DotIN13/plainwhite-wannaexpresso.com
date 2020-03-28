---
layout: post
title: "为博客添加简单的全局搜索"
subtitle: "Adding Simple Global Search to Jekyll Blog"
header-img: "img/in-post/post-jekyll-troubleshooting/jekyll.png"
author: "DotIN13"
header-mask: 0.6
tags:
  - Linux Dev
  - Jekyll
  - Blog
  - Searchbar
---

## 这不是一篇教程

看到[Spotlog](https://soptq.me/2019/04/03/implement-search/#jekyll-feature)有非常酷炫的搜索功能，虽然心里知道Hux在创造`Hux Blog`这个主题的时候就是本着简介明了的原则来创作的，但是还是手痒。无奈Spotq同学没有放出具体实现的代码，况且又封了仓（GitHub），于是便只能自己动手来制作。

## 前端苦手

Hux在创作主题的时候使用的是`Bootstrap 3.3`，于是便想利用便利的框架来直接将搜索框插入Navbar。无奈，多次尝试之后以失败告终，网上copy来的代码要不就是根本不起效，要不就是不够美观。

失败了一个下午之后，只好决定将搜索框放到右侧的侧边栏中，唯一的问题就是在移动设备上搜索框会出现在界面的最下方。我设想的形式是左边有一个搜索标志，右侧是输入框，结果直接在下方的`<ul>`中显示。

首先遇到的问题是，Hux Blog的侧边栏有一个bug，也就是Featured Tags栏目下方的elements也被计算作了tags，导致这一`<section>`下方的`<hr>`以及我添加的`<input>`都被套上了`<a>`，搜索框每次被点击都会自动跳转。经过长时间的研究，发现问题应该就在这一句中：

```html
{% raw %}
{{ tags | split:'</a>' | sort | join:'</a>'}}
{% endraw %}
```

但——我解决不了，因为我的liquid知识实在太少。最后，折衷的办法是，从不存在这一bug的旧版的Hux Blog主题中拷贝代码，最后的结果就是侧边栏的tags不能再自动排序。

> Edit：这一问题在最新的Hux Blog主题中已经由Hux修复，解决的方法是将_includes/featured-tags.html中的部分代码修改为：
>
> ```html
> {% raw %}
> ...
> <a>...</a>__SEPARATOR__
> {% endif %}{% endfor %}
> {% endcapture %}
> {{ tags | split:'__SEPARATOR__' | sort }}
> {% endraw %}
> ```
>
> 具体的做法请参阅Hux Blog的Commits。

解决了这一问题之后，便着手编写搜索框的代码。结构很简单，一个`<div>`里装着搜索glyph，一个`<input>`用于输入。我想像Bootstrap Docs一样使得左边的`<div>`与右边的`<input>`同高，但始终做不到，传统的`display: inline-block`写法在PC上同高，但到了移动设备上又不同高了。查阅资料发现，要让两者同高，得采用`display: flex`的方式，让两个元素同处一个限位`<div>`之中，并以盒模型的方式显示，才能够让两者真正保持统一高度。

于是，就有了以下的的代码：

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="css,result" data-user="DotIN13" data-slug-hash="dyomaqQ" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Search Bar">
  <span>See the Pen <a href="https://codepen.io/DotIN13/pen/dyomaqQ">
  Search Bar</a> by DotIN13 (<a href="https://codepen.io/DotIN13">@DotIN13</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

## 造轮子

有的时候，造轮子真的对一个蹩脚的木匠来说，比登天还难，但有一位伟大的哲人Hyt曾经说过：“我觉得造轮子就是一个学习的过程，等你会造轮子了，也就真正知道轮子怎么用了”。

在不断的尝试、不断的试错中，人才能成长，不是吗。