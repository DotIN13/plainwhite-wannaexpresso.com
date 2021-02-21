---
layout: post
title: "如何在Manjaro Linux优雅地使用EasyConnect"
subtitle: "Elegantly Use EasyConnect on Manjaro Linux"
author: "DotIN13"
tags:
  - Linux
  - EasyConnect
  - Manjaro
typora-root-url: ../
locale: zh_CN
---

## 不会开发就不要开发

多数EasyConnect的Linux用户都遇到了一系列怪问题，在论坛发帖也鲜有回复，偶有客服搭话，也大多采用“您的系统不支持”、“我帮您查查”之类的托词推脱干系。

在网络遨游3个小时之后，总算找到了一些Workarounds，气不过，在此与大家分享。

## 版本不一致

在AUR安装最新版7.6.7之后，登陆时居然提示软件与服务器版本不一致，要求我“更新”。打开更新链接，下载了链接里的deb包，一安装，发现居然是降级到了7.6.3。也是不得不服。

如果你也遇到了同样的问题，首先需要到企业的EasyConnect下载页面下载对应版本的deb。由于各个企业服务端所用版本不同，所以下载页面都是由企业自行提供的。

### 使用debtap安装deb包

首先安装AUR包管理器yay。

```shell
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```

然后使用yay安装debtap。

```shell
yay -S debtap
```

请确保系统中已经安装了bash、binutils、pkgfile和fakeroot这几项debtap的依赖。

如果你身在国内，建议给debtap换源，否则软件包列表下载速度会让你怀疑人生。

```
# /usr/bin/debtap
替换：http://ftp.debian.org/debian/dists
为：https://mirrors.ustc.edu.cn/debian/dists

替换：http://archive.ubuntu.com/ubuntu/dists
为：https://mirrors.ustc.edu.cn/ubuntu/dists/
```

执行更新命令，更新debtap的包列表。

```shell
sudo debtap -u
```

然后使用debtap转化刚才下载的deb包为Arch Linux软件包。

```shell
# 需要填写包名EasyConnect和证书类型
debtap <easyconnect>.deb
# 或者使用静默模式跳过问题
debtap -q <easyconnect>.deb
```

Arch Linux软件包会生成在当前目录，以`.tar.xz`/`.tar.zst`为后缀。此时使用`pacman`安装转化后的软件包。

```shell
sudo pacman -S <easyconnect>.tar.zst
```

## 不能启动

首先遇到的问题是不能启动。

此时cd到`/usr/share/sangfor/EasyConnect`。

```shell
cd /usr/share/sangfor/EasyConnect
# 在终端运行EasyConnect
./EasyConnect
```

如果看到终端出错`Harfbuzz version is too old`，就代表系统的pango包版本过高，这是开发者没有更新软件的依赖所导致的。

由于不希望改变系统的运行库，我们可以把旧版的pango运行库放置到`/usr/share/sangfor/EasyConnect`，让EasyConnect能够调用。在没有进行额外操作的情况下，EasyConnect调用的是系统中的pango 1.44。

```shell
ldd EasyConnect | grep pango
	libpangocairo-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpangocairo-1.0.so.0 (0x00007f9713518000)
	libpango-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpango-1.0.so.0 (0x00007f971337e000)
	libpangoft2-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpangoft2-1.0.so.0 (0x00007f97116d8000)
```

我们需要下载旧版的`libpango`、`libpangocairo`和`libpangoft`的deb包，然后解压运行库文件到`/usr/share/sangfor/EasyConnect`。以下给出1.42的下载链接。

> [libpango下载地址](https://packages.debian.org/buster/libpango-1.0-0)
>
> [libpangocairo下载地址](https://packages.debian.org/buster/libpangocairo-1.0-0)
>
> [libpangoft下载地址](https://packages.debian.org/buster/libpangoft2-1.0-0)

下载deb包后，打开deb包中的`data.tar.xz`，提取`data.tar.xz`中`/./usr/lib/x86_64-linux-gnu/`下的`.so.0`与`.so.0.4200.3`文件到`/usr/share/sangfor/EasyConnect`。

此时运行`ldd`命令输出如下。

```shell
ldd EasyConnect | grep pango
	libpangocairo-1.0.so.0 => /usr/share/sangfor/EasyConnect/./libpangocairo-1.0.so.0 (0x00007f16ce009000)
	libpango-1.0.so.0 => /usr/share/sangfor/EasyConnect/./libpango-1.0.so.0 (0x00007f16cde72000)
	libpangoft2-1.0.so.0 => /usr/share/sangfor/EasyConnect/./libpangoft2-1.0.so.0 (0x00007f16cc1cb000)
```

再从桌面打开EasyConnect，就能够正常启动了。

参考[CNBLOG](https://www.cnblogs.com/cocode/p/12890684.html)。

## 登陆闪退

登陆后小图标闪动数秒后闪退，是由于svpnservice没有正常启动。

首先打开EasyConnect和一个终端，在终端输入：

```shell
sudo /usr/share/sangfor/EasyConnect/resources/shell/sslservice.sh
```

登陆时，当登陆进度条运行至70%左右，在终端回车运行命令。

终端提示：

```shell
sslservice.sh start ...
start CSClient seccess!
start svpnservice seccess!
```

此时SSLVPN就能够正常连接了。

## 总结

开发的时候，还需多一点完美主义。