---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Jekyll
- Blog
- Plugin
title: Writing Jekyll Excerpt Plugin
typora-root-url: ../
---

## Jekyll Plugin

Jekyll plugins are categorized as follows:

1. Generators: Used to generate content, such as Feed and Sitemap plugins.
2. Converters: Convert programming languages, for example, transforming CoffeeScript or Ruby into Javascript.
3. Commands: Add more options to the `jekyll` command, like directly creating a new article through a command.
4. Tags: Provide shortcuts for Liquid, making it easier to add videos, images, and other content like `{% raw %}{{ video }}{% endraw %}`.
5. Filters: Commonly used to process text in Liquid, such as `{% raw %}{{ "Hello World" | remove: "Hello" }}{% endraw %}`.
6. Hooks: Modify the build process, the most complex but powerful type of plugins.

I aim to remove insignificant content like titles and code blocks from `{% raw %}{{ post.content }}{% endraw %}` and display it as an excerpt on the homepage. This functionality is not achievable through Liquid alone, but with a Filter plugin, it's quite simple.

## Creating a Plugin

Due to GitHub's `--safe` option during compilation, plugin usage is restricted. Options include compiling and uploading afterward or opting for [Vercel](https://vercel.com/) (formerly Zeit).

Jekyll plugins are stored in the `_plugins/` folder. If it doesn't exist, create one. Then, create a `*.rb` file within the folder. As you may have guessed, Jekyll plugins are written in Ruby. If you're new to Ruby, refer to "Head First Ruby" and you'll learn in just a week.

I used `_plugin/excerpt.rb` and started with the framework:

```ruby
module Excerpt
  def excerpt(html)
    # Ruby Code Here
  end
end

Liquid::Template.register_filter(Excerpt)
```

The `module` indicates a module for Jekyll's framework, and `def` defines a filter method callable by Liquid. To add a function not for Liquid use, include `private` after public methods.

The last line `Liquid::Template.register_filter(Excerpt)` registers our Filter module with Jekyll.

## Failed Regex Attempt

Initially, I tried using Regex to match `<figure class="highlight">Code</figure>` with the following code:

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

Regex worked for headings, but for code blocks, it matched almost the entire page. For example, if the original HTML looked like:

```html
<figure class="highlight">
    code
</figure>
<p>Paragraph</p>
<figure class="highlight">
    code
</figure>
```

My regex would match that entire segment, deviating from the expected outcome. So, I decided to abandon Regex matching and switched to using Nokogiri.

## Nokogiri Solution

Nokogiri is a Ruby framework for handling HTML/XML, offering convenient HTML object query and editing functions. It has more than 300 million downloads, making it the most downloaded gem according to the Wiki.

Since I need to handle `{% raw %}{{ post.content }}{% endraw %}`, which is HTML, Nokogiri can convert it to an HTML object. By utilizing the css method to find headers and code block tags, replacing their content with an empty string, and combining it with Liquid's `strip_html` Filter, the goal can be easily achieved.

```ruby
# Call Nokogiri
# Add gem "nokogiri" to the Gemfile
require 'nokogiri'

module Excerpt
  def excerpt(html)
    @doc = Nokogiri::HTML html # Convert the input HTML to an object
    # Using nokogiri's css method with CSS selection syntax to return all nodes that match
    remove_tags = %w[figure.highlight div.highlight h1 h2 h3 h4 h5 h6 em]

    remove_tags.each do |tag| # Iterate over each tag to remove
      @doc.css(tag).each { |node| node.content = '' } # Set their content to an empty string
    end

    @doc.to_html # Return the object's HTML
  end
end

Liquid::Template.register_filter(Excerpt)
```

Next, apply the newly added `excerpt` Filter to the HTML file of the blog.

```liquid
{% raw %}{{ post.content | excerpt | strip_html | truncate:200 }}{% endraw %}
```

Run `jekyll serve` to see the effect.

Being self-reliant makes you stronger at all times!
