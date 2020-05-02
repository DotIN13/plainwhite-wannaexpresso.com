---
layout: post
title: "切换页面后onclick不工作 stopPropagation来救场"
subtitle: "Onclick Not Working after Switching Pages? stopPropagation Saves the Day!"
author: "DotIN13"
tags:
  - JavaScript
  - Blog
typora-root-url: ../
locale: zh_CN
categories: [default]
---

## Plainwhite主题

在网上兜兜转转，发现用Hux主题的朋友实在是非常多，可见这一主题观感、实用度上还是很能笼络人心的。不过既然大家都在用，难免显得有些缺乏个性，于是便又上网搜刮，更换到了[@thelehhman制作的Plainwhite](https://github.com/thelehhman/plainwhite-jekyll)。主题本身很棒，不过非常简单，很多功能都需要手动添加，比如——搜索功能。

{% include image.html link="/img/in-post/post-searchbar/searchbar.gif" alt="Plainwhite Searchbar" %}

搜索功能，之前已经在Hux主题上折腾过了，为Hux Blog添加了一个[简单的Bootstrap风格搜索框](/2020/03/14/jekyll-blog-searchbar/)。不过，Plainwhite主题本身非常简洁，简洁到我不知道该往哪里加搜索框才能保证页面的纯净，思来想去，最后决定放在Page页面的顶部。

## Dropdown在Safari不能工作

我的目标是能够在鼠标点击搜索区域时显示搜索框与搜索结果区域，因此很自然地想到用CSS的pseudoclass selector来实现hover与focus-within的时候显示内容。

```html
# HTML
<li class="posts-labelgroup" id="posts-labelgroup">
  <h1 id="posts-label" style="width: 50px;">posts</h1>
  <div class="search-container">
    <div class="search-section"><i class="icon-search"></i><input type="text" name="search" id="searchbar"
        autocomplete="off" aria-label="search in posts"></div>
    <div class="search-results" id="search-results" data-placeholder="NO RESULTS" style="display: none;"></div>
  </div>
</li>
```

```scss
# SCSS
.posts-labelgroup {
  // searchbar style
  &:focus-within {
    // searchbar style on focus
  }
}
```

在PC和Android浏览器上的显示效果非常好，操作也正常。但到了IOS Safari却出了问题，点击下拉菜单中的结果条目并不能正常跳转。似乎是点按搜索框外的目标使得`focus`丢失，`:focus-within`选择器失效，下拉菜单消失，然后才触发点击结束事件，导致了不能打开链接。Safari差评！

了解到一些开发者的意见是`:hover`在触屏设备上往往不能正常运作，建议使用JavaScript调节`class`来解决这一问题。既然如此，VSCode，启动！

## Onclick偶尔失效

我先使用JavaScript编写了onclick事件，在点击后为最外层的`$labelGroup`添加`focus-within`类，以配合CSS达到动画效果。

```javascript
# JavaScript Excerpt
window.onload = function () {
  // add click eventlistener
  $labelGroup.addEventListener("click", function () {
    // animation to expand search results
  }, false);

  $labelGroup.addEventListener("mouseleave", function () {
    document.body.onclick = searchCollapse;
  });

  var searchCollapse = function () {
    // animation to collapse search results
  };
}
```

但是，在测试过程中我却发现，点击搜索框时偶尔会出现仅仅是搜索框获得focus，阴影、显示结果列表等其他动画“没有运行”的情况。此时只有双击搜索框，才能重新触发动画。这一bug通常出现在切换到其他页面再切换回博客的情况下，虽然不容易触发，但对于我这个强迫症来说非常难受。

## 尝试解决

我在click事件的回调函数中增加了`console.log()`，却发现即便动画没有显示，回调函数的的确确得到了执行。网络上大多数相关的问题都是因为其他情况，回调函数没有得到执行，这就让我遇到的问题显得愈发神秘，甚至让我以为是浏览器的问题，然而经过测试，发现并非如此，另有其因。

找到问题的原因是在我尝试了无数可能的解决方案之后。几乎是巧合地，我照搬了网络上的一段代码，其`click`事件回调函数中包含了一句`e.stopPropagation()`，经过尝试，我发现之前困扰我的问题竟然解决了，简直是踏破铁鞋无觅处，得来全不费功夫。

## 剥丝抽茧

这一问题要从头说起，就不得不提JavaScript处理事件时的[Bubbling（冒泡）](https://javascript.info/bubbling-and-capturing)。

```html
<style>
  body * {
    margin: 10px;
    border: 1px solid blue;
  }
</style>

<form onclick="alert('form')">FORM
  <div onclick="alert('div')">DIV
    <p onclick="alert('p')">P</p>
  </div>
</form>
```

<style>
  #code-tryout {
    border: solid 2px #f4f4f4;   
  }
  #code-tryout * {
    margin: 10px;
    border: 1px solid #268bd2;
  }
</style>

<div id="code-tryout">
  <form onclick="alert('form')">FORM
    <div onclick="alert('div')">DIV
      <p onclick="alert('p')">P</p>
    </div>
  </form>
</div>

当你在一个元素上触发事件时，该事件会向父级元素一路传递，一直传递到`document.body`，对所有沿途的元素触发该事件。上面的这个例子非常直观，当点击`<p>`元素后，先触发了`<p>`自身的click事件，然后是`<div>`，最后是`<form>`。这就是JavaScript事件的冒泡。

那么在我们的搜索框中这一问题是如何体现的呢？原理其实很简单（虽然我想了很久才相通）。

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="js,result" data-user="DotIN13" data-slug-hash="qBOXjWJ" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="stopPropagation">
  <span>See the Pen <a href="https://codepen.io/DotIN13/pen/qBOXjWJ">
  stopPropagation</a> by DotIN13 (<a href="https://codepen.io/DotIN13">@DotIN13</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

上面是有和没有`stopPropagation()`的两个示例，在错误示例中，首先是为`input`添加了一个`click`事件，显示一串字符，然后又添加了一个`mouseleave`事件，检测到鼠标离开后，再为外围`div`添加一个`click`事件，取消字符串显示。这就会导致问题：当你的鼠标不经意经过`input`时，JavaScript不管你有没有点击输入框，都会为你创建一个外围`div`点击事件。此时你再点击输入框，输入框点击事件触发，显示字符串，但随即又冒泡触发`div`点击事件，隐藏字符串，导致了视觉上无法观察到字符串的显示。

对应到我们的博客搜索框，在切换页面后鼠标一旦经过搜索框，就会为`document.body`创建`click`事件，此时再点击搜索框，就会出现动画不出现的问题——因为`searchbar`与`document.body`的两个事件几乎同时触发，效果相互抵消了。

理解了问题的源头，解决就非常简单了，`e.stopPropagation();`是为这类问题量身定做的，只要在搜索框事件中添加，就可以防止点击搜索框时发生冒泡。

## 后话

当然，这一问题也有其他可能的解决路径，将`mouseleave`事件放在搜索框的`click`中，保证点击后才创建`mouseleave`事件，当点击外围后，再将`mouseleave`事件同`body.click`事件统统移除，毁尸灭迹。

编程开发不像很多人想的那样，它永远是一道开放题，人类无穷的创造力与想象力，才是这张答卷的边界。