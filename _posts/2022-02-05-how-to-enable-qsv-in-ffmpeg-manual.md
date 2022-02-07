---
layout: post
title: "让FFmpeg用上QSV编码器（手动挡）"
subtitle: "How to Enable QSV in FFmpeg (Manual)"
author: "DotIN13"
tags:
  - FFmpeg
  - Intel QSV
  - Jellyfin
locale: zh_CN
---

[Jellyfin x Manjaro系列第三回](/2022/01/24/jellyfin-quick-sync-qsv-transcode/)说到，Manjaro显卡驱动管理百密一疏，没能在安装时就打上支持QSV的显卡驱动；但话又说回来，别的发行版可能还要手动安装，甚至手动编译呢！

但话又说回话又说回来，手动编译在某些情况下有其存在的价值，比如：

1. 发行软件包版本太低，想要体验高版本的工作效率，比如FFmpeg；
2. 发行软件包版本太高，无法满足其他软件的依赖关系，比如FFmpeg；
3. 发行软件包所使用的编译选项不合心意，缺少自己需要的功能，例如FFmpeg；

开个玩笑。这个问题不止出在FFmpeg身上，举个例子🌰，最近就有同志提出，[发行版本过低的Chrome带来了大量安全隐患](https://www.reddit.com/r/debian/comments/pgv3wc/debian_chromium_package_has_many_security_issues/)。但FFmpeg要完美地利用QSV还真的是要安装好所有正确的依赖，还个个版本都不能出错。

这里就转载一则教程，教教大家怎么在Ubuntu上编译使用带QSV转码功能的FFmpeg，压榨一下消极怠工的UHD小核显。

> 注意：接下来这段路我们开的是如假包换的手动挡，会有些颠簸，您可能需要自备氧气瓶（来解决一切可能遇到的窒息问题）。

## 准备环境

在Ubuntu上，运行以下命令来保证系统最新，并安装一些必要的依赖软件包（OpenCL头文件也包含在内）。

```shell
sudo apt update && sudo apt -y upgrade && sudo apt -y dist-upgrade
sudo apt-get -y install autoconf automake build-essential ccache flex bison cmake g++ patch libass-dev libtool pkg-config texinfo zlib1g-dev libva-dev mercurial libdrm-dev libvorbis-dev libogg-dev git libx11-dev libperl-dev libpciaccess-dev libpciaccess0 xorg-dev intel-gpu-tools opencl-headers libwayland-dev xutils-dev ocl-icd-* libssl-dev libz-dev clinfo
```

然后添加软件源，安装最新的libva头文件。

```shell
sudo add-apt-repository ppa:oibaf/graphics-drivers
sudo apt-get update && sudo apt-get -y upgrade && sudo apt-get -y dist-upgrade
```

### 目录结构

```shell
<workspace>
    |- intel
    |- ffmpeg-sources
    |- ffmpeg-build
```

所有显卡驱动相关的编译在`intel`文件夹中进行，ffmpeg及其依赖的源码存放在`ffmpeg-sources`，编译ffmpeg的依赖得到的库文件存放在`ffmpeg-build`中。

添加`$HOME/bin`到PATH环境变量，这样如果编译产生了可执行文件，在之后的步骤中就可以自动调用。

```shell
export PATH="$HOME/bin:$PATH"
```

### libdrm

然后编译libdrm，用于开启[cl_intel_va_api_media_sharing](https://www.khronos.org/registry/OpenCL/extensions/intel/cl_intel_va_api_media_sharing.txt)插件，赋予FFmpeg使用OpenCL的能力。

我们首先需要安装meson与ninja来编译libdrm。

```shell
sudo apt install meson ninja-build
```

```shell
cd <workspace>/intel
git clone https://gitlab.freedesktop.org/mesa/drm.git libdrm
cd libdrm
# 直接编译安装到系统/usr文件夹
meson --prefix=/usr -D udev=true builddir/
sudo ninja -C builddir/ install
sudo ldconfig -vvvv
```

## 安装驱动文件

英特尔针对第六代（Broadwell）之后的CPU发布了新的iHD驱动程序，通过VAAPI接口，提供QSV编解码加速，称作[Intel Media Driver](https://github.com/intel/media-driver)。编译这一驱动程序，首先需要编译其依赖的libva和gmmlib。

### libva

libva是VA-API（Video Acceleration API，视频加速接口）的实现。

VA-API是一个开源库，包含了API定义，应用程序可以通过它调用显卡处理视频。除了VA-API自身，软件包还针对各代显卡硬件提供了单独的加速驱动后端，之后编译驱动时就会用到。

```shell
cd <workspace>/intel
git clone https://github.com/intel/libva.git
cd libva
./autogen.sh --prefix=/usr --libdir=/usr/lib/x86_64-linux-gnu
make -j$(nproc)
sudo make -j$(nproc) install
sudo ldconfig -vvvv
```

### gmmlib

Intel(R) Graphics Compute Runtime for OpenCL(TM)（英特尔针对OpenCL的显示计算运行时）与Intel(R) Media Driver for VAAPI（英特尔针对VAAPI的媒体驱动程序）都要依靠Intel(R) Graphics Memory Management Library（gmmlib，英特尔显示存储管理库）来调配显卡的缓存。

gmmlib库是显卡驱动的前置库。

```shell
cd <workspace>/intel
git clone https://github.com/intel/gmmlib.git
cd gmmlib
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release -DARCH=64 ..
make -j$(nproc)
sudo make -j$(nproc) install
```

### intel-media-driver

然后即可编译安装显卡驱动本动。

Intel Media Driver是英特尔新近开发的用户驱动程序，用于加速视频解码、编码与后处理，软件包是基于MIT协议发布的。

```shell
cd <workspace>/intel
git clone https://github.com/intel/media-driver.git
mkdir build-media && cd build-media
# 开启non-free编解码功能，安装驱动文件到/usr/lib/x86_64-linux-gnu/dri
cmake ../media-driver \
  -DBS_DIR_GMMLIB=$PWD/../gmmlib/Source/GmmLib/ \
  -DBS_DIR_COMMON=$PWD/../gmmlib/Source/Common/ \
  -DBS_DIR_INC=$PWD/../gmmlib/Source/inc/ \
  -DBS_DIR_MEDIA=$PWD/../media-driver \
  -DCMAKE_INSTALL_PREFIX=/usr \
  -DCMAKE_INSTALL_LIBDIR=/usr/lib/x86_64-linux-gnu \
  -DINSTALL_DRIVER_SYSCONF=OFF \
  -DLIBVA_DRIVERS_PATH=/usr/lib/x86_64-linux-gnu/dri \
  -DENABLE_KERNELS=ON -DENABLE_NONFREE_KERNELS=ON
make -j$(nproc)
sudo make -j$(nproc) install
```

将使用驱动的用户添加到video与render用户组。

```shell
sudo usermod -a -G video $USER
sudo usermod -a -G render $USER
```

将显卡驱动文件添加到环境变量，以便其他应用调用。

```shell
# /etc/profile.d/libva.sh
LIBVA_DRIVERS_PATH=/usr/lib/x86_64-linux-gnu/dri
LIBVA_DRIVER_NAME=iHD
```

## 安装应用层

在应用层，我们需要安装libva-utils来方便我们检查驱动文件是否安装正确。然后需要安装Intel Media SDK（英特尔媒体开发套件）来提供软件可以直接调用的编解码API接口。

### libva-utils

libva-utils提供了一系列针对VA-API的测试脚本，例如`vainfo`命令，方便我们检测硬件所支持的编解码功能。

```shell
cd <workspace>/intel
git clone https://github.com/intel/libva-utils.git
cd libva-utils
./autogen.sh --prefix=/usr --libdir=/usr/lib/x86_64-linux-gnu
make -j$(nproc)
sudo make -j$(nproc) install
```

建议在此时重启计算机。

```shell
sudo systemctl reboot
```

同时建议在重启后安装[Intel Neo OpenCL Runtime](https://github.com/intel/compute-runtime)（英特尔NEO OpenCL运行时），用于编译Intel Media SDK的OpenCL后端。

手动编译非常复杂，我们可以直接安装软件包来节省一些时间。

```shell
sudo add-apt-repository ppa:intel-opencl/intel-opencl
sudo apt-get update
sudo apt install intel-*
```

可以使用`clinfo`来检测OpenCL是否工作正常。

### MediaSDK

Intel Media SDK提供了视频编解码、后处理的API接口，现更支持DG1、DG2～

```shell
cd <workspace>/intel
git clone https://github.com/Intel-Media-SDK/MediaSDK.git msdk
cd msdk
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release -DENABLE_WAYLAND=ON -DENABLE_X11_DRI3=ON -DENABLE_OPENCL=ON ..
make -j$(nproc)
sudo make -j$(nproc) install
```

将Media SDK库文件目录添加到目录列表。

```shell
# /etc/ld.so.conf.d/msdk.conf
/opt/intel/mediasdk/lib
```

更新系统库文件列表，并重新启动。

```shell
sudo ldconfig -vvvv
sudo systemctl reboot
```

## FFmpeg及其依赖

最后，到了万众期待的编译FFmpeg环节。

### nasm

我们首先需要安装汇编器nasm，它能够为编译出来的程序提供x86优化，提高FFmpeg的运行效率。

```shell
cd <workspace>/ffmpeg-sources
wget https://www.nasm.us/pub/nasm/releasebuilds/2.15.04/nasm-2.15.04.tar.gz
tar -xzf nasm-2.15.04.tar.gz
cd nasm-2.15.04
# 编译得到的库文件存放到$HOME/ffmpeg-build备用，可执行文件放置到$HOME/bin
./configure --prefix="$HOME/ffmpeg-build" --bindir="$HOME/bin"
make -j$(nproc)
make -j$(nproc) install
```

### libx264

FFmpeg所需的H.264编码器。编译FFmpeg时需要加入`--enable-gpl --enable-libx264`来启用。

```shell
cd <workspace>/ffmpeg-sources
git clone https://code.videolan.org/videolan/x264.git
cd x264
./configure --prefix="$HOME/ffmpeg-build" --enable-static --enable-pic --bit-depth=all
make -j$(nproc)
make -j$(nproc) install
```

### libx265

H.265/HEVC编码器。

```shell
cd <workspace>/ffmpeg-sources
hg clone http://hg.videolan.org/x265
cd x265/build/linux
cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$HOME/ffmpeg-build" -DENABLE_SHARED:bool=off ../../source
make -j$(nproc)
make -j$(nproc) install
```

### libfdk-aac

提供AAC音频编码器。编译FFmpeg时需要加入`--enable-libfdk-aac`来启用，如果编译时同时启用了`--enable-gpl`，那么还需要加入`--enable-nonfree`。

```shell
cd <workspace>/ffmpeg-sources
git clone https://github.com/mstorsjo/fdk-aac
cd fdk-aac
./configure --prefix="$HOME/ffmpeg-build" --disable-shared
make -j$(nproc)
make -j$(nproc) install
```

### libvpx

```shell
cd <workspace>/ffmpeg-sources
git clone https://github.com/webmproject/libvpx
cd libvpx
./configure --prefix="$HOME/ffmpeg-build" \
  --enable-runtime-cpu-detect --cpu=native --as=nasm --enable-vp8 --enable-vp9 \
  --enable-postproc-visualizer --disable-examples --disable-unit-tests \
  --enable-static --disable-shared \
  --enable-multi-res-encoding --enable-postproc --enable-vp9-postproc \
  --enable-vp9-highbitdepth --enable-pic --enable-webm-io --enable-libyuv 
make -j$(nproc)
make -j$(nproc) install
```

### libvorbis

```shell
cd <workspace>/ffmpeg-sources
git clone https://github.com/xiph/vorbis.git
cd vorbis
./configure --enable-static --prefix="$HOME/ffmpeg-build"
make -j$(nproc)
make -j$(nproc) install
```

### sdl

```shell
cd ~/ffmpeg-sources
hg clone https://github.com/libsdl-org/SDL.git
cd SDL
./configure --prefix="$HOME/ffmpeg-build" --with-x --with-pic=yes \
  --disable-alsatest --enable-pthreads --enable-static=yes --enable-shared=no
make -j$(nproc)
make -j$(nproc) install
```

### FFmpeg

```shell
cd ~/ffmpeg-sources
# 如果配合Jellyfin 10.7.7使用，应该编译n4.4.1版本，而不是最新版本
# wget https://github.com/FFmpeg/FFmpeg/archive/refs/tags/n4.4.1.tar.gz
git clone https://github.com/FFmpeg/FFmpeg.git
cd FFmpeg
# 如果配合Jellyfin使用，应该另外参照https://hub.docker.com/r/jellyfin/ffmpeg/dockerfile编译依赖，并配置FFmpeg
PKG_CONFIG_PATH="$HOME/ffmpeg-build/lib/pkgconfig:/opt/intel/mediasdk/lib/pkgconfig" ./configure \
  --pkg-config-flags="--static" \
  --enable-static --disable-shared \
  --prefix="$HOME/ffmpeg-build" \
  --bindir="$HOME/bin" \
  --extra-cflags="-I$HOME/ffmpeg-build/include" \
  --extra-ldflags="-L$HOME/ffmpeg-build/lib" \
  --extra-cflags="-I/opt/intel/mediasdk/include" \
  --extra-ldflags="-L/opt/intel/mediasdk/lib" \
  --enable-libmfx \
  --enable-vaapi \
  --enable-opencl \
  --disable-debug \
  --enable-libvorbis \
  --enable-libvpx \
  --enable-libdrm \
  --enable-gpl \
  --enable-runtime-cpudetect \
  --enable-libfdk-aac \
  --enable-libx264 \
  --enable-libx265 \
  --enable-openssl \
  --enable-pic \
  --extra-libs="-lpthread -lm -lz -ldl" \
  --enable-nonfree

make -j$(nproc)
make -j$(nproc) install
hash -r
```

如果需要开启调试功能，可以添加`--enable-debug=3`编译选项。

使用`~/bin/ffmpeg`查看是否编译成功。

## 手动挡的意义

在程序运行的过程中，程序需要正确的软件依赖，还要确保这些依赖都具有正确的版本，这两点缺一不可，这直接决定了软件是否能够正常工作。这也就是包管理器存在的终极意义。

但包管理器也绝非万无一失，总是会遇到这样那样的情况，导致软件包之间产生冲突，最为通常的情况就是不同的软件需要同一个软件作为前置，但它们要求的却是不同的版本。掣肘现代包管理器的最大问题就在于，它们不能很好地处理版本冲突——一个软件在系统环境中只能以一个版本存在。

或许有一种办法，可以将每个应用放置在沙盒中，一个软件的不同版本处于不同的沙盒中，再将沙盒按照依赖关系设置沙盒间访问的权限，一切可能会简单很多。这似乎与docker有些类似，但docker是一个独立系统环境，软件沙盒是主系统的一部分。如果梦想成真，Linux用户就可以轻松地安装各种不同版本的软件包，不用担心冲突；也可以大胆尝试手动挡编译，连接对应的依赖沙盒进行测试，不必损坏系统文件，也不必每次编译都要在一个小小的workspace里缩手缩脚地安装调用库文件。

但无论包管理如何发展，都无法替代编译，就好比自动挡与手动挡，自动挡是手动挡的整合、规范化与程序化，但最终与车辆打交道的还是手动挡的原理。包管理要有发行包，就必须有人编译。

再换一个比喻，虽然自动挡不断普及，但仍然有人开手动挡，也有老师傅说手动挡更加得心应手。编译，有的时候，也就是起的这个作用。
