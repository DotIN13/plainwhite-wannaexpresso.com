---
layout: post
title: "如何优雅地在OpenWrt使用UU加速器"
subtitle: "Using UU Router with OpenWrt"
author: "DotIN13"
tags:
  - UU Router
  - OpenWrt
typora-root-url: ../
locale: zh_CN
---

## UU加速器OpenWrt插件

家中购买酷安人均的斐讯K2P已有多时，原先刷入了OpenWrt系统用于加速上网，后来不怎的稳定，于是作罢，就仅仅做个拨号+AP。

后来添置Switch，意欲安装UU加速器插件为舞力全开作嫁衣，却无奈网易官方只支持梅林、华硕固件，便又作罢。

没想到，前几日网上冲浪，竟发现UU加速器已经有了OpenWrt的插件，[官方教程](https://router.uu.163.com/app/baike/public/5f963c9304c215e129ca40e8.html)于2020年12月26日更新。按奈不住，立马依照教程上手操作，遇到一些小挫折，却也算是山重水复疑无路，柳暗花明又一村。

## 操作路由器

### 连接路由器

首先自然是ssh连接路由器，由于光猫占据了`192.168.1.1`的IP地址，我家的K2P便只得屈居`192.168.2.1`了。

``` shell
ssh root@192.168.2.1
# root是路由器管理界面登陆时的用户名
# 192.168.2.1便是网关地址，因人而异，linux系统用ip addr命令，windows用ipconfig命令确定
# 回车后要求输入密码，也就是路由器管理页面登陆时的密码
```

### 安装加速器插件

加速器插件安装相当简单，官方提供了脚本自动安装。首先，下载安装脚本到当前目录。

```shell
wget http://uu.gdl.netease.com/uuplugin-script/202010221713/install.sh -O install.sh
```

然后直接运行脚本。

```shell
/bin/sh install.sh openwrt $(uname -m)
# Output:
# sn=xx:xx:xx:xx
```

### 安装kmod-tun

#### Opkg换源

首先更新包管理器目录。我的OpenWrt是20.4.8的预览版本，使用Snapshots包，在用`opkg update`命令更新包列表时非常慢，因为官方源在国外。

转了一圈却发现[清华的Snapshots源](https://mirrors.tuna.tsinghua.edu.cn/openwrt/snapshots/targets/)404错误，[交大源](https://mirror.sjtu.edu.cn/openwrt/snapshots/)没有同步Snapshots包，[中科大的镜像网站](http://mirrors.ustc.edu.cn/openwrt/snapshots/targets/)居然没有自动HTTPS，导致无法打开，手动把地址改成HTTPS之后总算打开了。

```shell
# 方法一，一条命令换源
sed -i 's_downloads.openwrt.org_openwrt.proxy.ustclug.org_' /etc/opkg/distfeeds.conf
# 方法二，手动修改/etc/opkg/distfeeds.conf为如下内容
src/gz openwrt_core https://openwrt.proxy.ustclug.org/snapshots/targets/ramips/mt7621/packages
src/gz openwrt_base https://openwrt.proxy.ustclug.org/snapshots/packages/mipsel_24kc/base
src/gz openwrt_luci https://openwrt.proxy.ustclug.org/snapshots/packages/mipsel_24kc/luci
src/gz openwrt_packages https://openwrt.proxy.ustclug.org/snapshots/packages/mipsel_24kc/packages
src/gz openwrt_routing https://openwrt.proxy.ustclug.org/snapshots/packages/mipsel_24kc/routing
```

换源后运行更新命令更新包列表。

```shell
opkg update
```

#### 安装kmod-tun

我的OpenWrt内核版本已经老旧，仍然在运行4.4版本的linux内核。因此运行`opkg install kmod-tun`安装kmod-tun时提示内核版本过旧。

```shell
Collected errors:
satisfy_dependencies_for: Cannot satisfy the following dependencies for kmod-tun:
kernel (= 5.4.xx.x - xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
```

搜索OpenWrt论坛了解到，可以通过强制安装指令越过内核版本检测。

```shell
opkg install --force-depends kmod-tun
```

成功安装kmod-tun。

### 操作手机

加速仍旧在手机端控制，需要下载UU加速器主机版的手机APP。

{% include post-image.html link="post-uu/download.png" alt="下载链接" %}

通过上面的QR或者[下载链接](https://adl.netease.com/d/g/uu/c/uu_router?from=qr)下载安装后，按照提示连接路由器。

{% include post-image.html link="post-uu/img-app-screenshot-OpenWrt.jpg" alt="进入APP连接到路由器" %}

连接之后，将Switch连接到路由器的无线网络，在APP中找到Switch，选择游戏就可以加速了。

似乎有些许不稳定，群魔乱舞2020舞至第二首便掉线，只得重连。OpenWrt的插件还亟待长期的测试，不过群魔乱舞的年卡与UU加速器的年卡也实非小数目，拟至寒假过后依着实际的体验与需求再做打算。