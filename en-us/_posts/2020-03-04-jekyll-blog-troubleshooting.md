---
author: DotIN13
catalog: true
header-img: _webpack/images/post-jekyll-troubleshooting/jekyll.png
header-mask: 0.6
layout: post
locale: en-us
subtitle: null
tags:
- Linux
- Jekyll
- Blog
- Highlight.js
- Lightbox
- GitHub Pages
- Coding Pages
title: Troubleshooting Jekyll Blog Setup
---

## Core Issues

This post aims to help solve various problems encountered during the setup of a Jekyll blog, including:

1. Jekyll: command not found
2. Importing posts from Blogger
3. Using highlight.js
4. Implementing fancybox
5. Unable to issue certificates for dual-line deployment
6. Testing the blog on mobile and other devices in the local network

Hope you can benefit from this article and take fewer detours.

## Preface

I used to write on `Blogger`, but there were always issues affecting the blogging experience:

1. Boring themes, catering more to a straight male aesthetic
2. Outdated WYSIWYG editor, annoyingly replacing `<p>` with `<div>` when switching windows
3. Poor internet connectivity
4. Feeling like I didn't have full control over my content

Due to these reasons, I decided to take advantage of the convenience of the newly installed Manjaro environment to build my own blog. Initially, I chose `Hexo`, but it seemed less active compared to `Jekyll`. After discovering that the beloved [Hux Blog](huangxuan.me) theme was a `Jekyll` theme, and learning that `Jekyll` is widely used abroad and endorsed by `GitHub` as a static site generator, I finally decided to build a dual-line blog using `Jekyll+GitHub+Coding`.

Encountering numerous problems throughout the process, I almost searched `Google` to its limits. Therefore, I've compiled a list here to help others avoid some of the pitfalls.

For a complete guide on building a blog, you may refer to [qiubaiyin's tutorial](https://github.com/qiubaiying/qiubaiying.github.io/wiki/博客搭建详细教程) and the [dual-line tutorial](https://blog.cotes.info/posts/dual-deployment-Jekyll-Blog-on-GithubPages-n-CodingPages/).

## Command Not Found

During the installation of `Jekyll`, you may encounter a `Command not found` issue, which is due to the `ruby` folder not being added to the global variable. To fix this, add the `ruby` path to `.bashrc` using the following commands.

Firstly, edit `~/.bashrc`.

```shell
$ sudo nano .bashrc
```

Add `PATH=$PATH:~/.gem/ruby/2.7.0/bin` at the end of the file and save it.

Then run:

```shell
$ source ~/.bashrc
```

This will add `ruby` to the environment variables, allowing you to smoothly run `jekyll` related commands.

## Importing Posts from Blogger

If you're migrating from `Blogger` to `Jekyll`, the first step is to import your posts.

You can refer to this [StackOverflow thread](https://stackoverflow.com/questions/37371947/importing-my-blogger-blog-into-jekyll).

### Exporting XML Backup from Blogger

Firstly, go to the `Settings` -> `Other` section on `Blogger` and click `Back up Content` to download the backup file.

### Using the jekyll-import Tool

Next, create a `*.rb` file in your Jekyll site folder.

Edit the file and insert the commands below, replacing `/path/to/blog-MM-DD-YYYY.xml` with your XML backup file address and save it:

```ruby
require "jekyll-import";
        JekyllImport::Importers::Blogger.run({
          "source"                => "/path/to/blog-MM-DD-YYYY.xml",
          "no-blogger-info"       => false, # not to leave blogger-URL info (id and old URL) in the front matter
          "replace-internal-link" => false, # replace internal links using the post_url liquid tag.
        })
```

Navigate to this folder using `cd` in the command line, then run:

```shell
$ gem install jekyll-import
$ ruby -rubygems nameoffile.rb
```

Here, `nameoffile.rb` is the `.rb` file you created. After running the command, you can find your imported `Blogger` posts in the `_post` folder in `.html` format, which can be viewed using the `jekyll s` command.

## Using Highlight.js

Since `Jekyll` 3.0, it has incorporated the `rouge` code highlight engine, but it seems to only recognize `fenced code` identified by <code>```</code>. This leads to issues where code embedded within `<summary>` for collapsing cannot be correctly identified.

Therefore, I decided to return to using `Highlight.js`. The integration is simple, just add the following HTML code to `_layouts/post.html`. Here, I used the Shades of Purple theme, but you can customize it based on [the official demo](https://highlightjs.org/static/demo/).

```html
<link rel="stylesheet"
      href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/shades-of-purple.min.css">
<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js"></script>
<script>hljs.initHighlightingOnLoad();</script>
```

To disable `rouge` in `_config.yml`:

Find `highlighter: rouge` and change it to `highlighter: none`.

Below the `kramdown:` section, add the following lines:

```yaml
kramdown:
  ...
  syntax_highlighter_opts:
    disable: true
  ...
```

This solution fixes the issue of code highlighting in HTML.

## Lightbox

The `Hux Blog` theme I used didn't include a Lightbox feature for enlarging images. To add this functionality, I discovered that `Fancybox` looked the best (after all, aesthetics matter). To implement it, simply add the following code to `_includes/footer.html`:

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

When writing an article, use the `<a href="path/to/original/img" data-fancybox="nameofgallery" data-caption="caption"><img src="path/to/thumbnail"></a>` format to add images.

For specific documentation, refer to the [Fancybox official website](http://fancyapps.com/fancybox/3/).

## Dual-Line Deployment Certificate Issuance

Refer to [Cote's Blog](https://blog.cotes.info/posts/enable-https-on-githubpages-and-codingpages/) for detailed steps.

To provide faster access to my blog for viewers, I utilized the `GitHub+Coding` approach for blog deployment and used `dnspod` for distinct domestic and overseas domain resolution. When attempting to obtain a certificate from Coding, I faced continuous failures but eventually succeeded by pausing GitHub resolution.

After suspending GitHub resolution, Let's Encrypt successfully created the certificate, enabling secure access to the blog.

{% include post-image.html link="post-jekyll-troubleshooting/dnspod.jpg" alt="Pause GutHub DNS Resolution" %}*Pause GitHub DNS Resolution, Screenshot from Cote's Blog*

## Testing the Blog on a Mobile Device

During blog writing, you might need to test `css/js` using a mobile device. If accessing the blog via `192.168.*.*:4000` on a mobile or other device prompts `Access Denied` when running `jekyll s`, it's because Jekyll's server defaults to run only on `127.0.0.1:4000`.

In this case, switch to using `jekyll s --host=0.0.0.0`.

> In server terms, 0.0.0.0 refers to all IPV4 addresses on a machine. If a host has two IP addresses, 192.168.1.1 and 10.1.2.1, and a service on the host listens on 0.0.0.0, both IP addresses can access the service.

By using this command, you can access the blog for testing via `localhost:4000` or `192.168.*.*:4000`, resolving the issue of mobile device access.

