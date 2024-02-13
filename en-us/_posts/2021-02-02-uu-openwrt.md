---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- UU Router
- OpenWrt
title: null
typora-root-url: ../
---


# How to Use UU Accelerator Gracefully on OpenWrt

## UU Accelerator OpenWrt Plugin

It's been a while since I purchased the fairly popular Phicomm K2P router at home. Originally flashed with OpenWrt system for faster internet speed, but later it became unstable. So, I abandoned that idea and decided to simply set it up for dial-up + AP.

Later on, I added a Switch and wanted to install the UU Accelerator plugin to enhance the dance game experience. Unfortunately, NetEase only supports Merlin and ASUS firmware, so I had to give up on that idea too.

To my surprise, I was surfing the internet a few days ago and found out that the UU Accelerator now has a plugin for OpenWrt, with the [official tutorial](https://router.uu.163.com/app/baike/public/5f963c9304c215e129ca40e8.html) updated on December 26, 2020. Unable to resist, I immediately followed the tutorial, faced some minor setbacks, but it all worked out in the end - where there's a will, there's a way!

## Router Management

### Connecting to the Router

Naturally, the first step is to SSH into the router. Since the ONT occupies the `192.168.1.1` IP address, my K2P had to settle for `192.168.2.1`.

```shell
ssh root@192.168.2.1
# root is the username for logging into the router management interface
# 192.168.2.1 is the gateway address, varies for different setups. Use 'ip addr' on Linux or 'ipconfig' on Windows to determine
# Upon hitting Enter, it will prompt you to enter the password, which is the password used for logging into the router management page
```

### Installing the Accelerator Plugin

Installing the accelerator plugin is quite simple as the official script automates the process. First, download the installation script to the current directory.

> The script link may change, please refer to the [official tutorial](https://router.uu.163.com/app/baike/public/5f963c9304c215e129ca40e8.html).

```shell
wget http://uu.gdl.netease.com/uuplugin-script/202012111056/install.sh -O install.sh
```

Then run the script directly.

```shell
/bin/sh install.sh openwrt $(uname -m)
# Output:
# sn=xx:xx:xx:xx
```

### Installing kmod-tun

#### Opkg Repository Update

First, update the package manager directory. My OpenWrt is a 20.4.8 preview version, using Snapshots packages. Updating the package list with the `opkg update` command was very slow because the official source is overseas.

After checking around, I found out that the [Tsinghua Snapshots repository](https://mirrors.tuna.tsinghua.edu.cn/openwrt/snapshots/targets/) gave a 404 error, the [SJTU repository](https://mirror.sjtu.edu.cn/openwrt/snapshots/) had not synchronized the Snapshots package, and the [USTC Mirror Site](http://mirrors.ustc.edu.cn/openwrt/snapshots/targets/) didn't automatically offer HTTPS, so I had to manually change the address to HTTPS until it finally opened.

```shell
# Method 1, change repository in one command
sed -i 's_downloads.openwrt.org_openwrt.proxy.ustclug.org_' /etc/opkg/distfeeds.conf
# Method 2, manually modify /etc/opkg/distfeeds.conf to the following content
src/gz openwrt_core https://openwrt.proxy.ustclug.org/snapshots/targets/ramips/mt7621/packages
src/gz openwrt_base https://openwrt.proxy.ustclug.org/snapshots/packages/mipsel_24kc/base
src/gz openwrt_luci https://openwrt.proxy.ustclug.org/snapshots/packages/mipsel_24kc/luci
src/gz openwrt_packages https://openwrt.proxy.ustclug.org/snapshots/packages/mipsel_24kc/packages
src/gz openwrt_routing https://openwrt.proxy.ustclug.org/snapshots/packages/mipsel_24kc/routing
```

After changing the source, run the update command to refresh the package list.

```shell
opkg update
```

#### Installation

My OpenWrt kernel version is quite outdated, still running on the 4.4 version of the Linux kernel. So, when I tried to install kmod-tun with `opkg install kmod-tun`, it said the kernel version was too old.

```shell
Collected errors:
satisfy_dependencies_for: Cannot satisfy the following dependencies for kmod-tun:
kernel (= 5.4.xx.x - xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
```

After researching on the OpenWrt forum, I found out that I could force the installation command to bypass the kernel version check.

```shell
opkg install --force-depends kmod-tun
```

kmod-tun was successfully installed.

### Managing the Mobile App

The accelerator is still controlled on the mobile end. You need to download the UU Accelerator host app on your phone.

{% include post-image.html link="post-uu/download.png" alt="Download Link" %}

Download and install with the above QR code or [download link](https://adl.netease.com/d/g/uu/c/uu_router?from=qr), then follow the instructions to connect to the router.

{% include post-image.html link="post-uu/img-app-screenshot-OpenWrt.jpg" alt="Connect to the Router in App" %}

Once connected, connect the Switch to the router's wireless network, find the Switch in the app, select the game, and you're all set to accelerate.

It seems a bit unstable, as during my Just Dance 2020 gameplay, the connection dropped right after the second song and I had to reconnect. The OpenWrt plugin obviously still requires extensive testing.

To be honest, the annual pass for Just Dance and the UU Accelerator are not cheap, so I plan to think again on purchasing both after the winter break.
