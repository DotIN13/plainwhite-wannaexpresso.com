---
layout: post
title: "在M1 Macbook上使用SSHFS挂载SFTP协议文件系统"
subtitle: "Mounting SFTP Filesystem on M1 MacBook"
author: "DotIN13"
tags:
  - Apple Silicon
  - MacBook
  - SSHFS
  - SFTP
  - Linux
  - macFUSE
typora-root-url: ../
locale: zh_CN
---

## 无中生有的需求

 \- 其实我并不怎么看电影。

 \- ……好吧，我承认，偶尔想看……又或许只是喜欢拥有的感觉罢了。

欲望，总是在无边无际地扩张。“不得已”买了Raspberry Pi，向辣爸讨了块3TB机械，也算入了NAS的门。

过去用着Manjaro+Windows，可以直接在[Gnome Nautilus](https://gitlab.gnome.org/GNOME/nautilus)中挂载树莓派的SFTP服务器，双击视频就可以通过[Celluloid](https://celluloid-player.github.io/)播放。然而这在macOS上似乎没有完美的解决方案，试用了[Cyberduck](https://cyberduck.io/)、[Tansmit](https://www.panic.com/transmit/)、[Electerm](https://electerm.github.io/electerm/)，却发现统统不能做到Manjaro上那样丝滑的体验。最好的方案也只能用FileZilla右键获取`sftp://`地址后粘贴到VLC播放。

于是，目光转向歪门邪道——尝试挂载服务器到Finder。

## 百无一用的折腾

[SSHFS](https://github.com/libfuse/sshfs)似乎是我能找到的唯一挂载方案。

### 安装macFUSE

从官网下载[macFUSE 4.0.5](https://github.com/osxfuse/osxfuse/releases/download/macfuse-4.0.5/macfuse-4.0.5.dmg)，直接打开`.dmg`文件安装。安装完成后不出意外需要重启macOS。

### 安装编译依赖

老规矩，用`homebrew`安装依赖最为简便快捷。

```shell
# Install Apple Development Tools
xcode-select --install
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

然后安装必须的依赖，包括python与glib。

```shell
brew install python@3.9
brew install glib
```

### 下载并修改SSHFS源码

由于最新版的SSHFS 3.7.1并不支持macOS，因此需要从`GitHub`的[Repo](https://github.com/libfuse/sshfs/releases/tag/sshfs-2.10)下载[2.10版本的源码](https://github.com/libfuse/sshfs/releases/download/sshfs-2.10/sshfs-2.10.tar.gz)。

解压后，根据[Pull Request #58](https://github.com/osxfuse/sshfs/pull/58)的提示，找到`#1724`行，修改`sshfs.sync_read`为0。

```c
// Force async even if kernel claims its doing async.
// MacOS, see https://github.com/osxfuse/sshfs/issues/57
sshfs.sync_read = 0;
```

然后，修改`#18`行的`# include <fuse_darwin.h>`为`#include <fuse.h>`。

### 编译

参照[SSHFS编译指南](https://github.com/osxfuse/sshfs#installing)进行编译。首先`cd`进入解压得到的`sshfs-2.10`文件夹，然后依次运行如下指令进行编译。

```shell
./configure
make
sudo make install
```

### 运行

```shell
sshfs [user@]host:[dir] mountpoint [options]
# sshfs [用户名@]服务器地址:[服务器路径] 本地挂载路径 [选项]
```

初次挂载不成功，因为macFUSE需要向系统添加内核插件。macFUSE提示，要进入`系统设置->安全与隐私`（`System Preferences -> Security and Privicy`）关闭系统安全机制，才能够正确加载挂载所需的内核插件。

依照[Apple官方指南](https://support.apple.com/zh-cn/guide/mac-help/mchl768f7291/11.0/mac/11.0)进入恢复模式进行修改。

1. 在搭载 Apple 芯片的 Mac 上，选取苹果`菜单-关机`。

2. 按住电源按钮直至看到`正在载入启动选项`。

3. 点按`选项`，然后点按`继续`。

   如有要求，请输入管理员帐户的密码。

   Mac 将以恢复模式（Recovery Mode）打开。

4. 在`macOS 恢复`中，选取`实用工具-启动安全性实用工具`（Startup Security Utilities）。

5. 选择要用于设定安全策略的启动磁盘。

   如果磁盘已使用文件保险箱加密，请点按`解锁`，输入密码，然后点按`解锁`。

6. 点按`安全策略`（Security Policy）。

7. 检查以下安全性选项：

   - *完整安全性：*确保只有当前的操作系统或者当前 Apple 信任的签名操作系统软件才能运行。此模式要求在安装软件时接入网络。
   - *降低安全性：*允许运行 Apple 信任过的任何版本的签名操作系统软件。

8. 我们需要选择`降低安全性`来启用macFUSE，输入管理员用户名和密码，然后执行以下一项操作：

   - 选择“允许用户管理来自被认可开发者的内核扩展”复选框以允许使用旧版内核扩展的软件进行安装。
   - 选择“允许远程管理内核扩展和软件自动更新”复选框以授权使用 MDM 解决方案远程管理旧版内核扩展和软件更新。

9. 点按`好`。

10. 重新启动 Mac 以使更改生效。

此时再进入`系统设置->安全与隐私`，发现下方已经多出了一个选项，可以运行任何来源的系统软件。选择后，再次运行`sshfs`命令，已经可以挂载。

## 乏善可陈的疗效

然而，在我花了几个小时安装、挂载成功之后，竟觉食之无味，弃之可惜。

使用FileZilla可以达到30MB/s内网的传输速度，而挂载的SSHFS文件系统仅仅能达到数百KB/s，完全无法流畅串流视频。

不总是止步，不总是成功；不总是成功，不总是止步。
