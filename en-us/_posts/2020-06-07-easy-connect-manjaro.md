---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Linux
- EasyConnect
- Manjaro
title: How to Use EasyConnect Elegantly on Manjaro Linux
typora-root-url: ../
---

## If You Can't Develop, Don't Develop

Most Linux users of EasyConnect have encountered a series of strange issues, with few replies on the forums. Occasionally, customer service might chime in, often using excuses like "your system does not support it" or "let me check for you".

After surfing the internet for 3 hours, I finally found some workarounds. Hoping to save others from the same trouble, I decided to share them with all of you.

## Version Inconsistency

After installing the latest version 7.6.7 from AUR, I was surprised to see a message during login saying that the software version did not match the server version, requesting an "update". Upon clicking the update link and downloading the deb package, I discovered that it actually downgraded to 7.6.3. Quite a surprising turn of events.

If you encounter the same problem, you first need to download the corresponding version of the deb package from the enterprise's EasyConnect download page. Since different enterprise servers use different versions, each enterprise provides its own download page.

### Using debtap to Install Deb Packages

First, install the AUR package manager, yay.

```shell
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```

Then use yay to install debtap.

```shell
yay -S debtap
```

Make sure that your system already has bash, binutils, pkgfile, and fakeroot, which are dependencies of debtap.

If you are in China, it is recommended to change the source for debtap, as otherwise, the software package list download speed may make you doubt life.

```shell
# /usr/bin/debtap
Replace: http://ftp.debian.org/debian/dists
With: https://mirrors.ustc.edu.cn/debian/dists

Replace: http://archive.ubuntu.com/ubuntu/dists
With: https://mirrors.ustc.edu.cn/ubuntu/dists/
```

Execute the update command to update the package list of debtap.

```shell
sudo debtap -u
```

Then use debtap to convert the deb package downloaded earlier into an Arch Linux package.

```shell
# Need to fill in the package name EasyConnect and the type of certificate
debtap <easyconnect>.deb
# Or use quiet mode to skip questions
debtap -q <easyconnect>.deb
```

The Arch Linux package will be generated in the current directory, with a `.tar.xz`/`.tar.zst` extension. At this point, use `pacman` to install the converted package.

```shell
sudo pacman -S <easyconnect>.tar.zst
```

## Unable to Launch

The first problem encountered was the inability to launch.

At this point, navigate to `/usr/share/sangfor/EasyConnect` in the terminal.

```shell
cd /usr/share/sangfor/EasyConnect
# Run EasyConnect in the terminal
./EasyConnect
```

If you see the error `Harfbuzz version is too old`, it means that the system's pango package version is too high, which is caused by the developer not updating the software's dependencies.

Since we do not want to change the system's running libraries, we can place the old version of the pango runtime library in `/usr/share/sangfor/EasyConnect` for EasyConnect to call. Without any additional operations, EasyConnect calls pango version 1.44 in the system.

```shell
ldd EasyConnect | grep pango
    libpangocairo-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpangocairo-1.0.so.0 (0x00007f9713518000)
    libpango-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpango-1.0.so.0 (0x00007f971337e000)
    libpangoft2-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpangoft2-1.0.so.0 (0x00007f97116d8000)
```

Download the old versions of the `libpango`, `libpangocairo`, and `libpangoft` deb packages, then extract the runtime library files from `data.tar.xz` in the deb package to `/usr/share/sangfor/EasyConnect`. Below is the download link for version 1.42.

> [libpango Download Link](https://packages.debian.org/buster/libpango-1.0-0)
>
> [libpangocairo Download Link](https://packages.debian.org/buster/libpangocairo-1.0-0)
>
> [libpangoft Download Link](https://packages.debian.org/buster/libpangoft2-1.0-0)

After downloading the deb package, open the `data.tar.xz` in the deb package, extract the `.so.0` and `.so.0.4200.3` files under `/./usr/lib/x86_64-linux-gnu/` in `data.tar.xz` to `/usr/share/sangfor/EasyConnect`.

Running the `ldd` command at this point would output as follows.

```shell
ldd EasyConnect | grep pango
    libpangocairo-1.0.so.0 => /usr/share/sangfor/EasyConnect/./libpangocairo-1.0.so.0 (0x00007f16ce009000)
    libpango-1.0.so.0 => /usr/share/sangfor/EasyConnect/./libpango-1.0.so.0 (0x00007f16cde72000)
    libpangoft2-1.0.so.0 => /usr/share/sangfor/EasyConnect/./libpangoft2-1.0.so.0 (0x00007f16cc1cb000)
```

You can now open EasyConnect from the desktop, and it should start up correctly.

Reference: [CNBLOG](https://www.cnblogs.com/cocode/p/12890684.html).

## Login Crash

After logging in, the small icon flashes for a few seconds and then crashes, likely due to svpnservice not starting properly.

First, open EasyConnect and a terminal. In the terminal, enter:

```shell
sudo /usr/share/sangfor/EasyConnect/resources/shell/sslservice.sh
```

During login, when the progress bar reaches about 70%, hit Enter in the terminal to run the command.

The terminal will display:

```shell
sslservice.sh start ...
start CSClient seccess!
start svpnservice seccess!
```

At this point, SSLVPN should connect properly.

## Conclusion

When developing, a little perfectionism doesn't hurt.
