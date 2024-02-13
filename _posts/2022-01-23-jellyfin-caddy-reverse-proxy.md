---
layout: post
title: "第一回 反代难识子路径 配置文件需配套"
subtitle: "Jellyfin on Manjaro: Caddy Reverse Proxy"
author: "DotIN13"
series: "Jellyfin x Manjaro"
tags:
  - Jellyfin
  - Manjaro
  - Caddy
locale: zh-cn
---

Manjaro玩转Jellyfin，还不简单？

还真就不。

用AUR安装的时候连不上GitHub，愁死我了，不，憋死我了。

不过这还算容易解决的，装好之后还遇到三道坎，好在没有九九八十一难。

Jellyfin x Manjaro这个系列是一个一共三回的小说，我们不讲怎么装，只讲装完会发生的那些事。

## Caddy反向代理

说来也挺离谱的，安装Jellyfin的时候并不在家，装完一看文档里赫然写着，打开网络管理界面初始化Jellyfin。于是，只得乖乖用Caddy反向代理来远程访问。

“好家伙！又要改Caddyfile！”

我拧巴得很，不想再单独配置一个域名，决定用子路径的方式来配置Jellyfin，于是修改Caddyfile如下：

```shell
jellyfin.mydomain.com {
  reverse_proxy /jellyfin/* localhost:8096
}
```

## Jellyfin子路径

大家是不是觉得这样就大功告成了？我相信以我这个频道的读者水平，应该已经比我先发现了问题🧐。服务端没有配套设置子路径怎么访问嘛！

那么请问，如果没办法进入配置界面怎么设置子路径，如果没设置子路径怎么初始化配置……

开玩笑的。

总之，要不先取消Caddyfile的子路径，要不先SSH修改配置文件。

我选择后者。

没有查到关于XML配置文件的文档，依靠只言片语，我判断网络相关设置就存放在配置文件夹中。

```xml
<!-- /var/lib/jellyfin/config/network.xml !-->
...
<BaseUrl>/jellyfin</BaseUrl>
...
```

修改BaseUrl的值为`jellyfin`之后便可以通过子路径访问了。

> 多嘴一句，在`reverse_proxy /jellyfin/*`的条件下，Caddyfile只会严格反向代理`/jellyfin/`路径下的请求，访问`/jellyfin`是不会自动跳转到`/jellyfin/`的，可以通过`rewrite /jellyfin /jellyfin/`来作为workaround。

## 文档

或许是自觉网管系统做的不错，Jellyfin没有提供配置文件的文档。

人总是不能考虑周全，故而没有完美的文档。

碎碎念：也许哪天去反向代理的页面，亲自补上……既然想到了，那么现在就去做。

Submitting [pull request](https://github.com/jellyfin/jellyfin-docs/pull/629)...

Merged.
