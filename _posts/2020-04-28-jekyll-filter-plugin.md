---
layout: post
title: "编写Jekyll摘要插件"
subtitle: "Homemade Jekyll Excerpt Plugin"
author: "DotIN13"
tags:
  - Jekyll
  - Blog
  - Plugin
typora-root-url: ../
locale: zh_CN
---

## Jekyll插件

Jekyll插件分为如下几类：

1. Generators：生成器，顾名思义，是用于生成内容的，例如Feed、Sitemap插件都属于这一类。
2. Converters：转换器，可以在编程语言中进行转换，例如将CoffeeScript、Ruby转化为Javascript等。
3. Commands：命令，为`jekyll`命令添加更多选项，比如直接用命令新建文章。
4. Tags：标签，形如`{% raw %}{{ video }}{% endraw %}`，可以为liquid添加一些快捷方式，方便添加视频、图片等内容。
5. Filters：筛选器，形如`{% raw %}{{ "Hello World" | remove: "Hello" }}{% endraw %}`，较为常见，为liquid添加处理文本的工具。
6. Hooks：挂钩，修改build过程，是最为复杂但也最为强大的一类插件。

我呢，希望在`{% raw %}{{ post.content }}{% endraw %}`中去除标题、代码块等缺乏语意的内容，然后将其作为文章摘要呈现在主页中。这一功能利用Liquid自身是无法完成的，但利用Filter插件就非常容易了。

## 新建插件

GitHub由于在编译时使用了`--safe`选项，导致不能使用插件，如果想要使用，可以编译后上传，或者选择使用[Vercel](https://vercel.com/)（原Zeit）。

Jekyll的插件都放置在`_plugins/`文件夹中，如果没有应当新建一个。然后在文件夹中创建一个`*.rb`文件。看到这里，你应该猜到了，Jekyll插件是使用Ruby语言编写的。如果你还不会的话，翻阅`Head First Ruby`，一周就能学会。

我这里使用了`_plugin/excerpt.rb`，首先搭好框架：

```ruby
module Excerpt
  def excerpt(html)
    # Ruby Code Here
  end
end

Liquid::Template.register_filter(Excerpt)
```

`module`代表这是一个供Jekyll框架使用的模块，`def`意味着定义一个供liquid调用的filter方法。如果希望添加一个不供liquid使用的函数，可以在公共方法后添加一行`private`，将私域方法跟在其后。

最后一行`Liquid::Template.register_filter(Excerpt)`就是向Jekyll注册我们的Filter模块。

## 失败的Regex尝试

一开始，我想使用Regex来匹配`<figure class="highlight">Code</figure>`，编写了如下的代码：

```ruby
# frozen_string_literal: true

module Excerpt
  def excerpt(html)
    headers = [%r{<h1[^<]*</h1>}, %r{<h2[^<]*</h2>}, %r{<h3[^<]*</h3>},
               %r{<div\sclass=\"highlight\">\s*<pre\sclass=\"highlight\">.*</pre>\s*</div>}, %r{<figure\sclass=\"highlight\".*</figure>}m]

    headers.each do |tag|
      html.gsub!(tag, '')
    end

    html
  end
end

Liquid::Template.register_filter(Excerpt)

```

对于标题来说，Regex尚且还能完成任务，但到了代码块，我编写的Regex几乎匹配了整个页面。举个例子，原始html长这样：

```html
<figure class="highlight">
    code
</figure>
<p>Paragraph</p>
<figure class="highlight">
    code
</figure>
```

我的正则表达就会匹配上述整段HTML，完全偏离了预期。于是我决定放弃正则匹配，转而使用Nokogiri。

## Nokogiri解决方案

Nokogiri是Ruby中处理HTML/XML的一个框架，提供方便的HTML对象查询、编辑功能，据Wiki称，其下载量已经超过了3亿次，是下载次数最多的gem。

由于我要处理的`{% raw %}{{ post.content }}{% endraw %}`就是HTML，因此我们可以用Nokogiri将其转化为HTML对象，利用css方法直接查找标题和代码块tag，把他们的内容赋值为空字符串，再配合Liquid自带的`strip_html` Filter，就可以轻松达成目的。

```ruby
# 调用nokogiri
# 需要在Gemfile中添加gem "nokogiri"
require 'nokogiri'

module Excerpt
  def excerpt(html)
    @doc = Nokogiri::HTML html # 将读入的html转化为对象
    # nokogiri的css方法直接使用css的选取语法，以类数组形式返回符合的所有node
    remove_tags = %w[figure.highlight div.highlight h1 h2 h3 h4 h5 h6 em]

    remove_tags.each do |tag| # 对每个想要去除的tag运行block
      @doc.css(tag).each { |node| node.content = '' } # 将其内容设置为空字符串
    end

    @doc.to_html # 返回对象的HTML
  end
end

Liquid::Template.register_filter(Excerpt)

```

接下来，将excerpt这个新添加的Filter运用到博客的HTML文件中。

```liquid
{% raw %}{{ post.content | excerpt | strip_html | truncate:200 }}{% endraw %}
```

运行`jekyll serve`就可以看到效果了。

自力更生，不愁吃，不愁穿！