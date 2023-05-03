---
layout: post
title: "在Manjaro上优雅地使用QSV加速Jellyfin视频转码（自动挡）"
subtitle: "How to Elegantly (And Automatically) Enable QSV for Jellyfin on Manjaro"
series: "Jellyfin x Manjaro"
author: "DotIN13"
tags:
  - FFmpeg
  - Intel QSV
  - Jellyfin
locale: zh_CN
---

FFmpeg啊，真的是天天都想搞个大新闻——你们看，这才一年没到，已经刷了俩大版本了，把版本号直接干到了6.0。

那咋办，打不过就加入呗，咱们`Jellyfin x Manjaro`系列也刷个版本号。

[Jellyfin x Manjaro系列第三回](/2022/01/24/jellyfin-quick-sync-qsv-transcode/)只讨论了使用QSV中出现的部份问题；而[让FFmpeg用上QSV编码器（手动挡）](/2022/02/05/how-to-enable-qsv-in-ffmpeg-manual/)所介绍的安装方法实在曲折繁琐，只适用于我这样的“五菱高手”——自动挡才是大趋势，手动党难成大业！

说白了，就是缺一篇完整实现QSV加速、使用FFmpeg 6.0、方便快捷干净卫生的教程呗！

## 只要这样，再这样，再那样...

开个玩笑，其实，在Manjaro上使用QSV非常容易，因为你需要的、你想要的、你不要的软件包，都有大神半仙提前准备好了。

> 友情提示，本篇教程只适用于支持`intel-media-driver`的Intel显卡，具体型号列表见[Intel Media Driver GitHub仓库](https://github.com/intel/media-driver#supported-platforms)。

## 第一步：安装Intel显卡驱动

Intel显卡驱动包括驱动程序`intel-media-driver`和前端API`intel-media-sdk`或`onevpl`。其中，较新的`OneVPL`仅支持11代及以后的核显/独显。

```shell
# 11代及以上
sudo pacman -S intel-media-driver onevpl-intel-gpu

# 其余型号
sudo pacman -S intel-media-driver intel-media-sdk
```

安装完成后，编辑`/etc/profile.d/libva.sh`，添加下面两行，告诉系统使用最新的iHD显卡驱动（即`intel-media-driver`），而不是已经过时的i965驱动，重启系统使配置生效：

```shell
LIBVA_DRIVERS_PATH=/usr/lib/dri
LIBVA_DRIVER_NAME=iHD
```

随后安装`libva-utils`查看驱动识别情况。

```shell
sudo pacman -S libva-utils
```

运行`vainfo`命令，如果出现类似下述的输出，则表示驱动已经安装成功。

```shell
$ vainfo
Trying display: wayland
Trying display: x11
error: can't connect to X server!
Trying display: drm
vainfo: VA-API version: 1.18 (libva 2.17.1)
vainfo: Driver version: Intel iHD driver for Intel(R) Gen Graphics - 22.5.2 (ccc137c92)
vainfo: Supported profile and entrypoints
      VAProfileNone                   : VAEntrypointVideoProc
      VAProfileNone                   : VAEntrypointStats
      VAProfileMPEG2Simple            : VAEntrypointVLD
      VAProfileMPEG2Simple            : VAEntrypointEncSlice
      VAProfileMPEG2Main              : VAEntrypointVLD
      VAProfileMPEG2Main              : VAEntrypointEncSlice
      VAProfileH264Main               : VAEntrypointVLD
      VAProfileH264Main               : VAEntrypointEncSlice
      VAProfileH264Main               : VAEntrypointFEI
      VAProfileH264Main               : VAEntrypointEncSliceLP
      VAProfileH264High               : VAEntrypointVLD
      VAProfileH264High               : VAEntrypointEncSlice
      VAProfileH264High               : VAEntrypointFEI
      VAProfileH264High               : VAEntrypointEncSliceLP
      VAProfileVC1Simple              : VAEntrypointVLD
      VAProfileVC1Main                : VAEntrypointVLD
      VAProfileVC1Advanced            : VAEntrypointVLD
      VAProfileJPEGBaseline           : VAEntrypointVLD
      VAProfileJPEGBaseline           : VAEntrypointEncPicture
      VAProfileH264ConstrainedBaseline: VAEntrypointVLD
      VAProfileH264ConstrainedBaseline: VAEntrypointEncSlice
      VAProfileH264ConstrainedBaseline: VAEntrypointFEI
      VAProfileH264ConstrainedBaseline: VAEntrypointEncSliceLP
      VAProfileVP8Version0_3          : VAEntrypointVLD
      VAProfileVP8Version0_3          : VAEntrypointEncSlice
      VAProfileHEVCMain               : VAEntrypointVLD
      VAProfileHEVCMain               : VAEntrypointEncSlice
      VAProfileHEVCMain               : VAEntrypointFEI
      VAProfileHEVCMain10             : VAEntrypointVLD
      VAProfileHEVCMain10             : VAEntrypointEncSlice
      VAProfileVP9Profile0            : VAEntrypointVLD
      VAProfileVP9Profile2            : VAEntrypointVLD
```

> 如果你的电脑有多张显卡，那么直接运行`vainfo`很可能会报错。此时不妨试试`vainfo --display drm --device /dev/dri/renderD12x`，将`/dev/dri/renderD12x`替换为正确的显卡文件路径。只要有任意一张显卡支持iHD驱动即可，FFmpeg通常会自动识别并使用其中支持QSV的显卡。

## 第二步：安装Intel OpenCL后端

Intel显卡驱动的OpenCL后端目前由[`intel-compute-runtime`](https://github.com/intel/compute-runtime)提供，用于将HDR视频转换为SDR播放，Manjaro官方源的版本较老，因此我们使用AUR源安装。

AUR软件源是一个软件包共享平台，用户可以自行提交发布软件包与安装脚本供其他用户使用。使用AUR软件源一般需要首先安装yay包管理工具。

```shell
sudo pacman -S --needed git base-devel yay
```

随后使用yay安装`intel-compute-runtime`。

```shell
yay intel-compute-runtime
```

在yay展示的各个选项中选择编译好的[`intel-compute-runtime-bin`](https://aur.archlinux.org/packages/intel-compute-runtime-bin)即可。安装完成后，可以使用`clinfo`命令查看是否安装成功。

## 第三步（也是最后一步）：安装Jellyfin与Jellyfin FFmpeg

最新发布的Jellyfin 10.8.10修复了两个重要安全漏洞，并且推荐与jellyfin-ffmpeg6组合使用。

AUR已有编译好的`jellyfin-bin`软件包供下载，也有[nyanmisaka](https://github.com/nyanmisaka)上传的最新版`jellyfin-ffmpeg6`。

```shell
yay jellyfin-bin jellyfin-ffmpeg6
```

最后，使用`systemd`启动jellyfin，打开`http://localhost:8096`即可食用。

```shell
# 立刻启动，并配置开机自启
sudo systemctl enable --now jellyfin
```

在Jellyfin网页界面中进入`Dashboard -> Playback`，将硬件加速（Hardware Acceleration）设置为`Intel Quick Sync (QSV)`。

参照下图勾选转码相应功能。

{% include post-image.html link="post-jellyfin/playback-settings.png" alt="Jellyfin Hardware Acceleration Settings" %}

`Enable hardware decoding for`：对以下视频格式开启硬件解码。应根据[显卡实际支持情况](https://github.com/intel/media-driver#decodingencoding-features)进行选择。

`Prefer OS native DXVA or VA-API hardware decoders`：解码时使用DXVA或VA-API硬件解码，而不使用QSV加速。使用QSV解码出错时可以勾选。

`Enable hardware encoding`：开启硬件解码。需要勾选。

`Enable Intel Low-Power H.264 hardware encoder`与`Enable Intel Low-Power HEVC hardware encoder`：开启低功耗H.264/HEVC硬件编码器。9代以上的CPU可以尝试勾选这两个选项，以加速HDR转SDR播放。在12代核显上不需要额外进行配置，其他型号请看[Jellyfin官方文档](https://jellyfin.org/docs/general/administration/hardware-acceleration/intel#low-power-encoding)。

`Allow encoding in HEVC format`：允许使用HEVC格式编码视频。如果你用来观看视频的设备支持HEVC编码，则建议勾选。

参照下图勾选HDR色调映射（Tone Mapping）相关功能，用于HDR视频转SDR播放。

{% include post-image.html link="post-jellyfin/tone-mapping-settings.png" alt="Jellyfin Tone Mapping Settings" %}

`Enable VPP Tone mapping`：VPP色调映射。效率比OpenCL更高，但仅支持HDR10，兼容性较差，不建议勾选。

`Enable Tone mapping`：OpenCL色调映射。建议勾选。

到此配置完成。

## 简单的是不是最好的

大环境总是去繁就简的。我小学的时候，家长接送孩子学的都还是手动挡。十年以后的今天，一眼望去，手动挡已经一车难觅。你问我手动挡和自动挡能做的事情有什么不同？我会说，差不离。但自动挡好上手，容易学，让更多的人能够在很短的时间里学会开车，成为自己的旅途的主人。

对于操作系统而言，同样如此——那些开着“自动挡”的操作系统在吸引用户方面具有天然的优势。但Linux不是轿车也不是巴士，而是载人航天——一个永远离不开“手动挡”的地方。[Manjaro Linux正在迅速流失用户](https://www.oschina.net/news/237615/manjaro-is-losing-user)这个问题是一个悖论——Manjaro不是Steam OS，作为Linux发行版，它的目标不可能，也不应该是服务大多数人。它更像是一个带教员、掌门人，提供便捷的包管理系统，帮助对Linux真正感兴趣的人了解这个操作系统，并基于此了解计算机的工作原理。用户数量究竟多少并不重要，甚至用户的减少意味着有更多的用户已经“出师”，开始使用更加底层的Arch Linux，或者开始使用更加稳定的Linux发行版进行生产工作，甚至可能已经融会贯通，学会了在一些“自动挡”操作系统上实现各种“手动超控”。

或许，现在的我们离不开Manjaro，只是因为我们还是书生。

不如珍惜当下的简单，因为不知何时总要告别。
