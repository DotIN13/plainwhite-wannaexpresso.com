---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- FFmpeg
- Intel QSV
- Jellyfin
title: Enabling FFmpeg to Use QSV Encoder (Manual Mode)
---

> Uncomfortable with manual compiling? Switch to automatic transmission: [Elegantly Using QSV Acceleration for Jellyfin Video Transcoding on Manjaro (Automatic Transmission)](/2023/05/03/how-to-elegantly-enable-qsv-for-jellyfin-on-manjaro/)!

In the [Jellyfin x Manjaro Series Part 3](/2022/01/24/jellyfin-quick-sync-qsv-transcode/), it was mentioned that the management of graphics drivers in Manjaro is not foolproof, as it fails to install the necessary QSV-supporting graphics drivers during setup. However, in other distributions, you might need to install them manually or even compile them yourself!

But then again, manual compilation has its value in certain situations, such as:

1. When the packaged software versions are too low and you desire the efficiency of higher versions, like FFmpeg.
2. When the packaged software versions are too high and cannot meet the dependencies of other software, like FFmpeg.
3. When the compilation options used by the packaged software are not satisfactory and lack the necessary features you desire, for example, FFmpeg.

On a lighter note, this issue is not limited to FFmpeg alone. For instance, recently there was a major announcement about the [security risks posed by the low release version of Chrome](https://www.reddit.com/r/debian/comments/pgv3wc/debian_chromium_package_has_many_security_issues/). However, for FFmpeg to utilize QSV perfectly, you really need to install all the correct dependencies and ensure that each version is flawless.

Here, we present a tutorial on how to compile and use FFmpeg with QSV transcoding capability on Ubuntu, squeezing out the potential of the UHD graphics card. [^1]

> Note: The road ahead is the manual transmission route, so expect some bumps along the way. You may need to bring your own oxygen mask (to tackle any possible suffocation issues).

## Preparing the Environment

On Ubuntu, run the following commands to ensure your system is up to date and to install some necessary software packages (including OpenCL headers).

```shell
sudo apt update && sudo apt -y upgrade && sudo apt -y dist-upgrade
sudo apt-get -y install autoconf automake build-essential ccache flex bison cmake g++ patch libass-dev libtool pkg-config texinfo zlib1g-dev libva-dev mercurial libdrm-dev libvorbis-dev libogg-dev git libx11-dev libperl-dev libpciaccess-dev libpciaccess0 xorg-dev intel-gpu-tools opencl-headers libwayland-dev xutils-dev ocl-icd-* libssl-dev libz-dev clinfo
```

Next, add a software source and install the latest libva headers.

```shell
sudo add-apt-repository ppa:oibaf/graphics-drivers
sudo apt-get update && sudo apt-get -y upgrade && sudo apt-get -y dist-upgrade
```

### Directory Structure

```shell
<workspace>
    |- intel
    |- ffmpeg-sources
    |- ffmpeg-build
```

All graphics driver-related compilations take place in the `intel` folder, FFmpeg and its source code are stored in `ffmpeg-sources`, and the libraries resulting from compiling FFmpeg dependencies are stored in `ffmpeg-build`.

Add `$HOME/bin` to the PATH environment variable so that any executable files generated during the compilation process can be automatically invoked in subsequent steps.

```shell
export PATH="$HOME/bin:$PATH"
```

### libdrm

Next, compile libdrm to enable the [cl_intel_va_api_media_sharing](https://www.khronos.org/registry/OpenCL/extensions/intel/cl_intel_va_api_media_sharing.txt) plugin, allowing FFmpeg to utilize OpenCL.

First, install meson and ninja to compile libdrm.

```shell
sudo apt install meson ninja-build
```

```shell
cd <workspace>/intel
git clone https://gitlab.freedesktop.org/mesa/drm.git libdrm
cd libdrm
# Compile and install directly into the system's /usr folder
meson --prefix=/usr -D udev=true builddir/
sudo ninja -C builddir/ install
sudo ldconfig -vvvv
```

## Installing Driver Files

Intel released a new iHD driver for CPUs after the sixth generation (Broadwell), providing QSV encode and decode acceleration through the VAAPI interface, known as [Intel Media Driver](https://github.com/intel/media-driver). To compile this driver, libva and gmmlib, upon which it depends, first need to be compiled.

### libva

libva is an implementation of VA-API (Video Acceleration API).

VA-API is an open-source library containing API definitions that applications can use to call on the GPU for video processing. In addition to VA-API itself, the software package provides separate acceleration driver backends for various generations of GPU hardware, which will be used during driver compilation.

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

Both Intel(R) Graphics Compute Runtime for OpenCL(TM) and Intel(R) Media Driver for VAAPI depend on the Intel(R) Graphics Memory Management Library (gmmlib) to allocate GPU cache.

gmmlib is a prerequisite library for graphics drivers.

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

Now, proceed to compile and install the GPU driver itself.

The Intel Media Driver is a user driver developed recently by Intel to accelerate video decoding, encoding, and post-processing. The software package is released under the MIT license.

```shell
cd <workspace>/intel
git clone https://github.com/intel/media-driver.git
mkdir build-media && cd build-media
# Enable non-free encode-decode features, install driver files to /usr/lib/x86_64-linux-gnu/dri
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

Add the user utilizing the driver to the video and render user groups.

```shell
sudo usermod -a -G video $USER
sudo usermod -a -G render $USER
```

Add the GPU driver files to the environment variables for other applications to access.

```shell
# /etc/profile.d/libva.sh
LIBVA_DRIVERS_PATH=/usr/lib/x86_64-linux-gnu/dri
LIBVA_DRIVER_NAME=iHD
```

## Installing Application Layer

At the application layer, you need to install libva-utils to easily check if the driver files are correctly installed. You will also need to install the Intel Media SDK to provide APIs for encoding and decoding that software can directly call.

### libva-utils

libva-utils offers a range of test scripts for VA-API, such as the `vainfo` command, allowing you to verify the hardware's supported encoding and decoding functions.

```shell
cd <workspace>/intel
git clone https://github.com/intel/libva-utils.git
cd libva-utils
./autogen.sh --prefix=/usr --libdir=/usr/lib/x86_64-linux-gnu
make -j$(nproc)
sudo make -j$(nproc) install
```

It's recommended to restart your computer at this point.

```shell
sudo systemctl reboot
```

Additionally, after the restart, it's advisable to install the [Intel Neo OpenCL Runtime](https://github.com/intel/compute-runtime) to compile the OpenCL backend of the Intel Media SDK.

Manual compilation is quite complex, so you can directly install the software packages to save time.

```shell
sudo add-apt-repository ppa:intel-opencl/intel-opencl
sudo apt-get update
sudo apt install intel-*
```

You can use `clinfo` to verify if OpenCL is functioning properly.

### MediaSDK

The Intel Media SDK provides API interfaces for video encoding, decoding, and post-processing, now supporting DG1 and DG2 processors.

```shell
cd <workspace>/intel
git clone https://github.com/Intel-Media-SDK/MediaSDK.git msdk
cd msdk
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release -DENABLE_WAYLAND=ON -DENABLE_X11_DRI3=ON -DENABLE_OPENCL=ON ..
make -j$(nproc)
sudo make -j$(nproc) install
```

Add the Media SDK library directory to the list of directories.

```shell
# /etc/ld.so.conf.d/msdk.conf
/opt/intel/mediasdk/lib
```

Update the system's library files list and restart.

```shell
sudo ldconfig -vvvv
sudo systemctl reboot
```

## FFmpeg and Its Dependencies

Finally, it's time for the much-awaited compilation of FFmpeg.

### nasm

Firstly, we need to install the assembler nasm, which can provide x86 optimization for the compiled programs, enhancing the efficiency of FFmpeg's operation.

```shell
cd <workspace>/ffmpeg-sources
wget https://www.nasm.us/pub/nasm/releasebuilds/2.15.04/nasm-2.15.04.tar.gz
tar -xzf nasm-2.15.04.tar.gz
cd nasm-2.15.04
# The resulting library files are stored in $HOME/ffmpeg-build for later use, while the executable files are placed in $HOME/bin
./configure --prefix="$HOME/ffmpeg-build" --bindir="$HOME/bin"
make -j$(nproc)
make -j$(nproc) install
```

### libx264

The H.264 encoder required by FFmpeg. When compiling FFmpeg, it is necessary to include `--enable-gpl --enable-libx264` to enable this.

```shell
cd <workspace>/ffmpeg-sources
git clone https://code.videolan.org/videolan/x264.git
cd x264
./configure --prefix="$HOME/ffmpeg-build" --enable-static --enable-pic --bit-depth=all
make -j$(nproc)
make -j$(nproc) install
```

### libx265

The H.265/HEVC encoder.

```shell
cd <workspace>/ffmpeg-sources
hg clone http://hg.videolan.org/x265
cd x265/build/linux
cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$HOME/ffmpeg-build" -DENABLE_SHARED:bool=off ../../source
make -j$(nproc)
make -j$(nproc) install
```

### libfdk-aac

Provides the AAC audio encoder. When compiling FFmpeg, it is necessary to include `--enable-libfdk-aac` to enable it. If `--enable-gpl` is also enabled during compilation, `--enable-nonfree` must be added.

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
# If used with Jellyfin 10.7.7, version n4.4.1 should be compiled instead of the latest version
# wget https://github.com/FFmpeg/FFmpeg/archive/refs/tags/n4.4.1.tar.gz
git clone https://github.com/FFmpeg/FFmpeg.git
cd FFmpeg
# If used with Jellyfin, additional dependencies should be compiled according to https://hub.docker.com/r/jellyfin/ffmpeg/dockerfile, and configure FFmpeg accordingly
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

If debugging functionality needs to be enabled, `--enable-debug=3` can be added as a compilation option.

Check if the compilation was successful using `~/bin/ffmpeg`.

## The Significance of Manual Mode

During the operation of a program, it needs the correct software dependencies to ensure that these dependencies have the right versions. These two aspects are crucial and directly affect whether the software can function properly. That's where the ultimate purpose of package managers lies.

However, package managers are not without flaws. There are always situations where conflicts arise, causing software packages to clash with each other. The most common scenario is different software requiring the same prerequisite but demanding different versions of it. The biggest issue with modern package managers is their inability to handle version conflicts well – a software can exist in the system environment in only one version.

Perhaps there is a way to place each application in a sandbox, where different versions of a software reside in separate sandboxes. Then, by setting sandbox access permissions based on dependency relationships, everything might become much simpler. This concept seems somewhat akin to Docker, but Docker is an independent system environment, whereas software sandboxes are part of the main system. If this dream comes true, Linux users could effortlessly install various versions of software packages without worrying about conflicts. They could also boldly experiment with manual compilation, linking to the corresponding dependency sandbox for testing, without damaging system files or having to install and call library files in a cramped workspace every single time.

Nevertheless, regardless of how package management evolves, it can never replace compilation, similar to automatic and manual transmission in vehicles – automatic transmission integrates, standardizes, and automates manual transmission, but the principle of manually engaging with the vehicle remains at the core. Package management requires distribution packages, which necessitate someone to compile them.

To use another analogy, even as automatic transmission becomes increasingly popular, some still drive manual vehicles, and experienced drivers claim that manual transmission is more intuitive. Sometimes, compilation serves this purpose effectively.
