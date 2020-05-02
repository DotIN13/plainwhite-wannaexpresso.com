---
layout: post
title: "用Caddy2反向代理地下城世界"
subtitle: "Reverse Proxy World of Dungeons with Caddy 2"
author: "DotIN13"
tags:
  - WoD
  - Caddy
  - Reverse Proxy
typora-root-url: ../
locale: zh_CN
categories: [default]
---

## Caddy 2

之前已经利用Caddy 2尝试了搭建Aria2下载站，不过没有好好介绍，这里就再唠叨几句，谈谈Caddy 2的优点。

1. 安装简单到令人发指。
   Caddy 2将整个程序封装为了一个二进制文件，安装就是直接把`caddy`文件拷贝到`/usr/bin`，卸载就是删除，更新就是替换，方便到一种境界了。
2. Caddy是唯一一个自动支持HTTPS的网站服务器。
   只要你告诉Caddy 2你要部署的域名或者IP，Caddy就会自动签发自签证书或者Let's Encrypt证书，并且自动将80端口的访问重定向到443端口，免去了大量设置过程。
3. 功能丰富。
   你可以利用Caddy 2的`file_server`搭建静态网站，用` file_server browse`搭建文件分享站，用`reverse_proxy`搭建反向代理，甚至直接让Caddy帮你渲染`.md`文件搭建博客。
4. 配置简单。
   Caddy从第一代开始就提供简单易学的Caddyfile配置方式，用JSON数十行才能搞定的配置，在Caddyfile里可能只需要寥寥几行。当然，它也同时支持JSON配置来完成复杂的工作。

## 反向代理

想法很简单，WoD是一个服务器假设在德国的网页游戏，平时的访问时常遇到速度慢、加载卡顿的问题，分享代理工具又合适，因此，我想到可以直接利用VPS反向代理，来加快访问。

> A proxy server is a go‑between or intermediary server that forwards requests for content from multiple clients to different servers across the Internet. A **reverse proxy server** is a type of proxy server that typically sits behind the firewall in a private network and directs client requests to the appropriate backend server. A reverse proxy provides an additional level of abstraction and control to ensure the smooth flow of network traffic between clients and servers.

代理服务器就是一个中间、中介服务器，它会将众多客户端的内容请求转发到网络上不同的服务器中。**反向代理服务器**就是代理服务器的一种，通常它处于一个私人网络的防火墙中，将客户端请求引导到合适的后端服务器中。反向代理提供更好的抽象度与管理，来保证服务器与用户间平滑的网络连接。

{% include image.html link="/img/in-post/post-reverse-proxy/reverse-proxy.jpg" alt="Reverse Proxy" %}

从图中可以清楚地看到，反向代理就是通过中间服务器代理后端服务器，用户访问时直接访问中间服务器，由中间服务器从后端服务器获得回应后将回应返回给用户。

{% include image.html link="/img/in-post/post-reverse-proxy/forward-proxy.jpg" alt="Forward Proxy" %}

上图中的则是正向代理，我们平时使用的VPN就属于正向代理，通过中间服务器代理客户端，由中间服务器代客户端发送内容请求，获得回应后再返回给用户。简单来说，反向代理和正向代理最直接的区别就是中间服务器究竟代理了谁。

## Caddy 2反代WoD

了解了原理，我们是骡子是马，拉出来溜溜。

<details><summary>我的Caddyfile</summary>

{% highlight bash %}
login.wannaexpresso.com {
  encode gzip
  # 将root设置到登陆页面所在的文件夹
  root * /home/wod
  file_server
  # 请求头transparent设置
  header X-Real-IP {http.request.remote.host}
  header X-Forwarded-For {http.request.remote.host}
  header X-Forwarded-Port {http.request.port}
  header X-Forwarded-Proto {http.request.scheme}
}

canto.wannaexpresso.com {
  encode gzip
  reverse_proxy * http://canto.world-of-dungeons.org {
    # 请求头Host设置
    header_up Host canto.world-of-dungeons.org
    # 请求头transparent设置
    header_up X-Real-IP {http.request.remote.host}
    header_up X-Forwarded-For {http.request.remote.host}
    header_up X-Forwarded-Port {http.request.port}
    header_up X-Forwarded-Proto {http.request.scheme}
    header_down Set-Cookie world-of-dungeons.org wannaexpresso.com
  }
}

zhao.wannaexpresso.com {
  encode gzip
  reverse_proxy * http://zhao.world-of-dungeons.org {
    header_up Host zhao.world-of-dungeons.org
    header_up X-Real-IP {http.request.remote.host}
    header_up X-Forwarded-For {http.request.remote.host}
    header_up X-Forwarded-Port {http.request.port}
    header_up X-Forwarded-Proto {http.request.scheme}
    header_down Set-Cookie world-of-dungeons.org wannaexpresso.com
  }
}
{% endhighlight %}
</details>

### 登陆

WoD的登陆系统全部由JavaScript构成，获取到玩家填写的表单之后利用`.submit()`提交，但问题是，Christian（WoD作者）hard-coded（写死了）提交对象为`world-of-dungeons.org`。

解决方法也很简单（虽然我想了很久），将登陆页面保存到本地，并用另一个域名`login.wannaexpresso.com`提供服务。将JavaScript中的提交对象改为`canto.wannaexpresso.com`就能正常登陆了。缺点是每次登陆都要登陆登陆站，而不能直接在`canto.wannaexpresso.com`登陆。

> 一点思考：如果使用Nginx，或许可以使用sub_filter功能来替换表单提交对象，就可以直接在游戏站点登陆了。但Caddy尚且没有相关的功能。

然而，提交了正确的表单，却发现提交之后被直接重定向到了`world-of-dungeons.org`，这是请求头没有设置Host的缘故。在Caddyfile中添加`header-up Host canto.wannaexpresso.com`之后，一切正常。

### 使用

登陆之后，发现问题，任何操作都会导致弹出“请允许Cookie”的警示页面。

翻阅大量资料之后了解到，服务器返回的Cookie会被浏览器保存为后端服务器域名名下的cookie，导致再次访问时不能正常调取，需要将回应头中的Set-Cookie的domain值调整为代理服务器的域名。

依照Caddy的语法编写`header_down Set-Cookie world-of-dungeons.org wannaexpresso.com`之后遇到了问题，服务器返回的回应头变成了乱码。到Caddy社区一问，热心的开发者Matt一看便知问题处在Caddy 2身上，于是花了[1分钟修复+Commit](https://caddy.community/t/set-cookie-manipulation-in-reverse-proxy/7666/5)，直接让我下载即时编译版测试。

我甚至不知道什么是CI，蠢蠢地档下git源码自行编译了刚刚出炉的新caddy文件，替换了服务器上的`/usr/bin/caddy`，重新开启服务器。

一次成功，现在所有WoD的功能都可以通过我的反向代理服务器访问了！

是不是非常简单呢 ;)