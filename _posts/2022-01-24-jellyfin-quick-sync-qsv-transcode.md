---
layout: post
title: "第三回 高清视频难兼容 快速同步急救场"
subtitle: "Jellyfin on Manjaro: Intel Quick Sync Video Transcode"
author: "DotIN13"
series: "Jellyfin x Manjaro"
tags:
  - Manjaro
  - Jellyfin
  - Intel QSV
locale: zh_CN
---

菜羊G5905是什么乐色，2202年了，还只有双核双线程，能用吗？

好像还行（小声🤫），自带的UHD610好像还能用来转码串流视频……就是……好像不太好伺候，要是不给打好驱动，这小核显立马甩锅CPU——CPU满载，转码失败。

再小点声：为什么视频编码加速要取个名叫快速同步😮‍💨……

## QSV转码失败

我直接打开`Dashboard`->`Playback`下的转码功能，硬件加速器选取`Intel Quick Sync`，打开我的4K HDR HEVC视频。一顿操作，发现无法播放，提示服务器提供的视频与客户端不兼容。

```plaintext
This client isn't compatible with the media and the server isn't sending a compatible media format.
```

心里难过得很，不能播放要你何用，你个UHD610跟我J3160的HD400有什么区别！不过转念又一想，说不定是网络速度不足，转码的4K 120Mbps视频码率过高。于是我连接上我亲亲亲亲亲爱的Z490i UNIFY雷电网桥，再打开Jellyfin尝试播放，仍然卡死。

## Manjaro显卡驱动马失前蹄

一拍脑袋，想起来还有日志能救我。于是我直接打开网页端的FFmpeg日志，看到如下错误：

```plaintext
Failed to initialise VAAPI connection: -1 (unknown libva error).
```

难道大内皮衣客Manjaro也有失手显卡驱动的一天？

您别说，还真是。Linux的QSV是依赖于VAAPI接口的，因此无法初始化VAAPI很可能意味着驱动没有安装好；`unknown libva`也同样指向这一点。

于是我一路杀到[Intel Media Driver GitHub项目](https://github.com/intel/media-driver)主页，发现要编译，直接再杀回来，到Pacman搜索，发现Manjaro已经准备好了`intel-media-driver`软件包供大家下载。

```shell
sudo pacman -S intel-media-driver
```

安装完成后，`vainfo`命令已经能够识别显卡驱动。

## 男女搭配，干活不累

再试试播放？仍然报错。

```plaintext
Device creation failed: -1313558101.
Failed to set value 'qsv@va' for option 'init_hw_device': Unknown error occurred
Error parsing global options: Unknown error occurred
```

既然驱动已经识别，那么问题只能出在FFmpeg上，Manjaro自带的FFmpeg包缺乏对libva的支持，导致了无法正确调用qsv加速。

然而，官方只提供了Ubuntu和Debian的jellyfin-ffmpeg专属转码包，放在Manjaro使用会出现库文件不兼容的问题，例如jellyfin-ffmpeg要求的库文件`libva.6.so`在最新的Manjaro系统中已经迭代至`libva.7.so`，而软件包中又没有附带，导致无法运行。逐一下载手动安装库文件虽说可行，但实在是极为复杂。

于是，只好哭唧唧地自己去编译。在按照[jellyfin-ffmpeg的dockerfile](https://hub.docker.com/r/jellyfin/ffmpeg/dockerfile)进行编译之后，在Jellyfin的Playback设置中选用自行编译的ffmpeg。

打开网页客户端，选中`Settings`->`Playback`下的`Prefer fMP4-HLS Media Container`，开启HEVC支持，就可以转码4K HDR HEVC视频，降低码率观看了。

{% include post-image.html link="post-jellyfin/hevc-container.png" alt="Enable fMP4 Container for HEVC Streaming" %}

硬件驱动，配上软件兼容，男女搭配，才能干活不累。

## 后记

驱动打上之后大约半个月，用`sudo intel_gpu_top`查看GPU占用，发现全部“归零”，大事不妙。

检查FFmpeg日志，没有异常，只是视频转码速度降为了`0.5x`左右。视频转码的命令与正常转码的命令有所不同。

摸不着头脑的我再回头查看主程序日志，发现问题出在`ffprobe`。`ffprobe`没有正确识别视频格式，导致生成的转码命令有误。通过**一点点排查与思考**，我发现，我在编译FFmpeg时使用了最新源码，版本号已经来到5.0，而Jellyfin官方仅支持到4.4.1，版本差别导致了jellyfin内部的`ffprobe`命令不能正确获取视频格式。

重新编译FFmpeg 4.4.1，视频已经可以正常播放。还得是我！
