---
layout: post
title: "Jekyll博客搭建答疑解惑"
subtitle: "Jekyll Blog Troubleshooting"
header-img: "img/in-post/post-jekyll-troubleshooting/jekyll.png"
author: "DotIN13"
header-mask: 0.6
catalog: true
tags:
  - Linux Dev
  - Jekyll
  - Blog
  - Highlight.js
  - Lightbox
  - GitHub Pages
  - Coding Pages
---

## 核心问题

本篇期望使用简单的方法来帮助解决搭建Jekyll博客时遇到的种种问题，包括：

1. Jekyll: command not found
2. 从Blogger导入文章
3. 使用highlight.js
4. 使用fancybox
5. 双线部署无法签发证书
6. 用手机等其他局域网设备测试博客

希望你能借助这篇文章，少走些弯路。

## 前言

过去一直在`Blogger`自己写一些东西，但`Blogger`总有一些问题使得博客体验不佳：

1. 主题太过单调，有些直男审美
2. 落后的WYSIWYG编辑器，并且致命的是在HTML窗口编辑完切换回WYSIWYG窗口时，会自动将`<p>`替换为`<div>`，非常恼人
3. 网络连接不佳
4. 总有一种没有完全掌控的受害者心理作祟

由于上述原因，决定利用新安装的Manjaro环境的便利性，自己搭建一个博客。我一开始选择的是`Hexo`，虽然有诸多中文教程，但我发现似乎这一平台的活跃期已经过去；主题虽多，但多数已经年久失修；并且`Hexo`本身也不稳定，添加`$PATH`环境变量总是失败。在搭建尝试之后，发现喜欢的[Hux Blog](huangxuan.me)主题原版是`Jekyll`主题，进一步搜索资料发现`Jekyll`在国外比较活跃，又是`GitHub`钦定静态网站生成器，于是，便最终决定利用`Jekyll+GitHub+Coding`搭建一个双线Blog。

期间遇到非常多的问题，走了不少弯路，几乎把`Google`搜爆。在此，将问题做一个集合总结，建站的诸位可各取所需，绕坑而行。

如果需要完整建站教程，可以移步[qiubaiyin的建站教程](https://github.com/qiubaiying/qiubaiying.github.io/wiki/博客搭建详细教程)以及[双线教程](https://blog.cotes.info/posts/dual-deployment-Jekyll-Blog-on-GithubPages-n-CodingPages/)。

## Command Not Found

在安装`Jekyll`的过程中，可能会遇到`Command not found`的问题，这是因为`ruby`文件夹没有被添加到全局变量，通过以下命令，将`ruby`路径添加到`.bashrc`可以解决。

首先编辑`~/.bashrc`。

```shell
$ sudo nano .bashrc
```

在文件最后添加`PATH=$PATH:~/.gem/ruby/2.7.0/bin`，保存。

再运行：

```shell
$ source ~/.bashrc
```

即可将`ruby`添加到环境变量，顺利运行`jekyll`相关命令了。

## 从Blogger导入文章

既然是从`Blogger`迁移到`Jekyll`，首先要做的就是导入文章。

可以参考[StackOverflow的帖子](https://stackoverflow.com/questions/37371947/importing-my-blogger-blog-into-jekyll)。

### 从Blogger导出xml备份

首先，进入`Blogger`后台，侧边栏进入`设置(Settings)-->其他(Other)`，点击`备份(Back up Content)`，即可下载备份文件。

### 使用导入工具jekyll-import

随后，在Jekyll网站文件夹下建立一个`*.rb`文件。

然后编辑该文件，输入以下命令，将`/path/to/blog-MM-DD-YYYY.xml`修改为你的xml备份文件地址，并保存：

```ruby
require "jekyll-import";
        JekyllImport::Importers::Blogger.run({
          "source"                => "/path/to/blog-MM-DD-YYYY.xml",
          "no-blogger-info"       => false, # not to leave blogger-URL info (id and old URL) in the front matter
          "replace-internal-link" => false, # replace internal links using the post_url liquid tag.
        })
```

在命令行中通过`cd`进入该文件夹，运行以下命令

```shell
$ gem install jekyll-import
$ ruby -rubygems nameoffile.rb
```

其中，`nameoffile.rb`为你刚才建立的`.rb`文件。

命令执行完成后，可以在`_post`文件夹中找到你导入的`Blogger`文章，文件格式为`.html`，由于`jekyll`兼容该格式，因此可以直接使用`jekyll s`命令查看效果。

## 调用Highlight.js

自`Jekyll`3.0开始，已经内置了`rouge`代码高亮引擎，但似乎只能识别<code>```</code>标识的`fenced code`，由于`jekyll`的`markdown`渲染器不能识别在`HTML`代码中的`md`代码，这就导致嵌入在`<summary>`中折叠的代码不能正确识别。

于是，决定重回`Highlight.js`的怀抱。调用的方式很简单，在`_layouts/post.html`中加入以下`HTML`代码即可，这里我是用的是Shades of Purple主题，可以依照喜好，根据[官网demo](https://highlightjs.org/static/demo/)修改。

```html
<link rel="stylesheet"
      href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/shades-of-purple.min.css">
<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js"></script>
<script>hljs.initHighlightingOnLoad();</script>
```

然后可以在`_config.yml`中禁用`rouge`：

找到`highlighter: rouge`一行，将其修改为`highlighter: none`。

找到`kramdown:`一行，在下方添加两行，如下

```yaml
kramdown:
  ...
  syntax_highlighter_opts:
    disable: true
  ...
```

如此一来，便可以解决在`HTML`代码中不能代码高亮的问题了。

## Lightbox

我使用的`Hux Blog`主题是没有自带的Lightbox的，不能放大查看图片，于是在`GitHub`上翻找，发现`Fancybox`颜值最高（颜值就是正义），于是便着手添加。

我的做法是直接在`_includes/footer.html`添加

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css" />
<script src="https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js"></script>
<script>
$('[data-fancybox="gallery"]').fancybox({
  buttons : [
    'download',
    'thumbs',
    'close'
  ]
});
</script>
```

在编写文章时以`<a href="path/to/original/img" data-fancybox="nameofgallery" data-caption="caption"><img src="path/to/thumbnail"></a>`形式添加图片即可。

具体的`Documentation`请参阅[Fancybox官网](http://fancyapps.com/fancybox/3/)。

## 双线部署 签发证书

参考[Cote's Blog](https://blog.cotes.info/posts/enable-https-on-githubpages-and-codingpages/)。

为了让自己的小伙伴访问博客的速度更快，我使用了`GitHub+Coding`的方式搭建博客，利用`dnspod`做分境内外的分别解析。在Coding申请证书时发现总是失败，最后通过暂停`GitHub`解析的方式成功申请了证书。

<a href="/img/in-post/post-jekyll-troubleshooting/dnspod.jpg" data-fancybox="gallery" data-caption="Pause GitHub DNS Resolution"><img src="/img/in-post/post-jekyll-troubleshooting/dnspod.jpg" alt="Pause GutHub DNS Resolution"></a>*Pause GitHub DNS Resolution, Screenshot from Cote's Blog*

在暂停`GitHub`解析后，Let's Encrypt就可以正确访问博客，创建证书了。

## 用手机测试博客

在写博客的过程中，可能会遇到需要使用手机测试`css/js`的情景。如果直接使用`jekyll s`命令，发现在手机或者其他设备上上使用`192.168.*.*:4000`的局域网地址访问博客会提示`Access Denied`，这是因为`Jekyll`的服务器默认只在`127.0.0.1:4000`上开启。

这时，应当转而使用`jekyll s --host=0.0.0.0`。

> 在服务器中，0.0.0.0指的是本机上的所有IPV4地址，如果一个主机有两个IP地址，192.168.1.1 和 10.1.2.1，并且该主机上的一个服务监听的地址是0.0.0.0,那么通过两个ip地址都能够访问该服务。

通过这条命令，使用`localhost:4000`或者`192.168.*.*:4000`就都能够访问博客测试了，解决了手机访问的问题。

