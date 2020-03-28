---
layout: post
title: "从GitHub Page迁移到Zeit Now"
subtitle: "Moving Jekyll Blog to Zeit Now"
header-img: "img/in-post/post-jekyll-troubleshooting/jekyll.png"
author: "DotIN13"
header-mask: 0.6
tags:
  - Linux Dev
  - Jekyll
  - Blog
  - GitHub Pages
  - Zeit Now
---

## 来龙

看到别家的博客都有搜索栏，于是便也想给自家添加一个。于是便使用了[Spotlog](https://soptq.me/2019/04/03/implement-search)同款的`Simple-Jekyll-Search`插件。阴差阳错，Coding上`jekyll build --safe`编译成功，GitHub却编译失败，误以为是GitHub不支持该插件（事实上我迁移到Zeit后发现后两次编译又莫名地通过了），于是便决定迁移到有着更高自主权的[Zeit](https://zeit.co/)。Zeit的优势有许多，下面略微列举几项：

1. Zeit拥有分布在全球各地的20余个CDN服务器，解决了GitHub Page访问不稳定的问题，我的网络Ping大约40ms左右，已经是不错的水平了。
2. Zeit可以通过GitHub Integration做到与GitHub连结，每当GitHub接到Push，Zeit就会自动部署，与直接使用GitHub Page相比有过之而无不及。
3. 免费Plan有20GB的流量，对小型Blog来说足够使用。
4. 配置域名是自动完成的，相对比较便利。
5. 摆脱`--safe`的束缚，可以利用更多的插件来优化博客体验。
6. 客服非常热心，我发送工单几小时后就回信联系，帮助解决问题。

## 去脉

迁移到Zeit相对来说是比较容易的，首先要做的就是一步步完成Zeit与GitHub帐号的绑定，Zeit需要借此获取Access Repo的权限。

在绑定完成后，Zeit会自动进行一次部署，如果你的文件没有问题，你的博客就会被直接部署到`.now.sh`为后缀的域名上，可以先行预览效果。

最后要做的就是取消先前的DNS解析，将GoDaddy/Freenom上的Name Server替换为Zeit家的，然后将你的域名添加到Zeit的域名列表中，Zeit会自动帮你做好域名解析（虽然坏处是免费Plan是不能修改解析记录的），然后你就可以通过你的域名访问博客了。

## 插曲

此前试图安装`Jekyll-Sitemap`来生成Sitemap，在根目录下创建了`Gemfile`，结果发现在Coding上收到了`jekyll command not found`的编译错误。于是只得删除了`Gemfile`，利用liquid来创建`sitemap.xml`。

在迁移到Zeit后，发现又出现了`jekyll command not found`错误。查询Jekyll Docs后发现干净的Blog目录是应当有`Gemfile`来识别Dependencies的，于是又将`Gemfile`添加回根目录，添加代码：

```ruby
gem "jekyll"
gem "jekyll-paginate"
```

再进行Push操作，发现Zeit编译通过。

其中的机理，由于对Jekyll还不是特别地熟悉，且有无`Gemfile`在本地都能正常`jekyll serve`，因此不能知晓。但遇到相同问题的小伙伴，可以依照解决。