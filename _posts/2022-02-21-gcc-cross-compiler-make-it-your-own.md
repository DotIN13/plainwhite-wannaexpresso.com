---
layout: post
title: "「天龙八部」年轻人的第一个GCC交叉编译器"
subtitle: "GCC Cross Compiler, Make It Your Own"
author: "DotIN13"
tags:
  - Linux
  - Cross Compile
locale: zh_CN
---

鹤立鸡群，曲高和寡。遮望眼，鸡立鹤群，白羽千冠不见天。

赋词一首，极言“差异”常常带来冷漠与歧视。但词中所述的只是一种极端情况，生活往往是多种事物揉杂而成的，不同的东西混合协调，带来了多样化，带来了可能性，带来了每天都不一样的新鲜日子。

交叉编译就是这样一个“和而不同”的合作过程。

“我性能差，那你能帮帮我吗？”

“当然可以，那你又能给我什么回报呢？”

“我用电少，还不烫。”

有人说为什么不能一步到位，那么不得不说的就是，有舍才有得，没有任何一件东西是完美无缺，一步到位的，不同的取舍导致了“我们”和“他们”之间恒久的差异，交流、协调与合作是不得已，却也是调味料。

交叉编译，说它是桥梁，倒不如说是合作本身。

## 编译GCC交叉编译器

我们年轻人啊，总会想要给树莓派编译一个FFmpeg，又或者是给赛扬NAS编译一个显卡驱动。等一等，宝友！这样高运算量的工作可不兴在这些“电子垃圾”上跑啊，我们得用大力出奇迹的高性能处理器来编译啊。这时候，就需要交叉编译上场了。

交叉编译器，顾名思义，就是在交叉编译中用于生成目标机器代码的编译器，是编译过程中必备的工具。今天，我们就一起来做爱心小……编译器吧！

## 前传 三个机器名称

在一次编译过程中，一般需要给出三个机器名称，即编译系统（build）、运行系统（host）与目标系统（target），以便编译器生成对应机器的二进制代码。“build”是指目前我们正在用来编译的机器，“host”指的是用来运行我们**正在编译**的代码的机器，而“target”指的是运行**最终生成**的代码（不一定是我们正在编译的代码）的机器。我们在配置GCC的时候，需要通过`--build=`、`--host=`、与`--target=`选项来提供这些名称。

机器名称（triplet）一般遵循“machine-vendor-operatingsystem”的格式。“machine”指机器架构，如“x86_64”、“arm64”。“vendor”指制造商，如“pc”、“apple”等。“operatingsystem”指操作系统，如“linux-gnu”、“darwin21.2.0”。

通常机器名称可以通过`gcc -dumpmachine`来查看。

```shell
$ gcc -dumpmachine
x86_64-pc-linux-gnu # On a 64-bit linux platform
```

```shell
$ gcc -dumpmachine
arm64-apple-darwin21.2.0 # On a M1 MacBook
```

根据编译的用途，我们会设置不同的机器名称组合，各种组合也有各自的称呼。

| 编译类型 | 编译系统（build） | 运行系统（host） | 目标系统（target） | 备注 |
| --- | --- | --- | --- | --- |
| 本地编译（native） | A | A | A | A机器本地编译运行 |
| 交叉编译（cross） | A | A | B | 通常是利用性能较强的A为性能较差或缺少特定编译器的B机器编译 |
| 交叉本地编译（crossed native） | A | B | B | 使用A机器上预先编译好的交叉编译器在B机器上编译代码 |
| 加拿大编译（canadian） | A | B | C | 通常是A机器性能较差，但具有独有的编译器 |
| 交叉回编译（crossback） | A | B | A | 同上 |

今天，我们要编译的，就是在交叉编译中用到的GCC交叉编译器。

这一次，作为例子，我们就用一台arm64的Ubuntu机器来制作一个为x86_64 Linux系统编译代码的GCC交叉编译器。在这次编译中，由于我们即将编译的GCC交叉编译器就直接运行在本机，所以我们的“build”和“host”都是`aarch64-linux-gnu`，用Linux自身的`MACHTYPE`环境变量代替；而“target”则是我们的交叉编译器要生成代码的对象，也就是`x86_64-pc-linux-gnu`。

## 第一部 配置环境

### 安装编译工具

首先使用系统包管理器安装一些编译中需要用到的工具，如g++、make等。

```shell
sudo apt-get update
sudo apt-get install g++ make gawk -y
sudo apt-get install vim wget xz-utils -y
```

### 确定版本

其次我们需要确定目标机器（target）的软件版本，包括编译GCC所需的Binutils、Glibc、系统头文件，以及GCC本身。因为我们编译得到交叉编译器后，生成的程序要在目标机器上运行，需要目标机器的程序库支持，所以我们在编译中最好按照目标机器的程序库版本来进行编译，可以避免不支持的情况。

举例来说，使用一个高版本Glibc的GCC交叉编译器编译得到的二进制程序，在低版本Glibc的目标机器上，很可能会出现如下错误，无法运行：

```shell
$ ./hello
./hello: /usr/lib/libc.so.6: version `GLIBC_2.34' not found (required by ./hello)
```

运行如下命令，可以帮助我们确定**目标机器**环境中的软件版本。

```shell
$ ld --version
GNU ld (GNU Binutils) 2.36.1
$ ldd --version
ldd (GNU libc) 2.33
$ gcc -v
GCC version 11.1.0 (GCC)
$ uname -r
5.15.16-1-MANJARO
```

或者可以访问[DistroWatch网站](https://distrowatch.com/dwres.php?resource=package-in-distro&pkg=binutils)，查询每个发行版的软件包版本作为参考。

我们要尽量保证我们编译的Binutils、Glibc、GCC和Linux内核版本是一个合理的组合，可以是我们目标机器上的组合，也可以是某个发行版中的组合，这些经过检验的组合可以帮助我们避免兼容问题。

### 建立工作目录

建立工作目录`<workspace>`，将Binutils、GCC、Glibc、Linux内核的源码都存放在`<workspace>/src`目录下，在`src`目录下再为Binutils、GCC、Glibc创建各自的编译目录。编译生成的文件存放在`<workspace>/build`目录下。

> 在实际操作中，本文中所有的`<workspace>`都应当用实际目录路径替代。

```shell
<workspace>
    |- build
    |- src
        |- binutils
        |- gcc
        |- glibc
        |- mpfr
        |- gmp
        |- isl
        |- cloog
        |- build-binutils
        |- build-gcc
        |- build-glibc
        |- linux-kernel
```

### 下载源码

我们可以从[GNU FTP站](https://ftp.gnu.org/)或者国内镜像网站下载源码。

| 软件包      | 是否必须  | 下载链接                                               | 国内镜像                                                            | 作用                                      |
| -------- | ----- | -------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------- |
| Binutils | TRUE  | [GNU FTP](https://ftp.gnu.org/gnu/binutils/)     | [中科大镜像](https://mirrors.ustc.edu.cn/gnu/binutils/)            | 包含了链接器与汇编器等其他工具。                        |
| GCC      | TRUE  | [GNU FTP](https://ftp.gnu.org/gnu/gcc/)          | [中科大镜像](https://mirrors.ustc.edu.cn/gnu/gcc/)                 | GNU Compilation Collection，包含C、C++的编译器。 |
| Glibc    | TRUE  | [GNU FTP](https://ftp.gnu.org/gnu/glibc/)        | [中科大镜像](https://mirrors.ustc.edu.cn/gnu/glibc/)               | 基础C程序库，包含C程序运行的基本函数。                    |
| Linux内核  | TRUE  | [GNU FTP](https://www.kernel.org/)               | [中科大镜像](https://mirrors.ustc.edu.cn/kernel.org/linux/kernel/) | Glibc运行需要依赖Linux内核的头文件。                 |
| mpfr     | TRUE  | [GNU FTP](https://ftp.gnu.org/gnu/mpfr/)         | [中科大镜像](https://mirrors.ustc.edu.cn/gnu/mpfr/)                | 包含了一些多精度数值运算的函数。                        |
| gmp      | TRUE  | [GNU FTP](https://ftp.gnu.org/gnu/gmp/)          | [中科大镜像](https://mirrors.ustc.edu.cn/gnu/gmp/)                 | 包含了一些多精度数值运算的函数。                        |
| mpc      | TRUE  | [GNU FTP](https://ftp.gnu.org/gnu/mpc/)          | [中科大镜像](https://mirrors.ustc.edu.cn/gnu/mpc/)                            | 包含了一些多精度数值运算的函数。                        |
| ISL      | FALSE | [GitHub](https://github.com/Meinersbur/isl/tags) | N/A                                                             | 编译优化，可选。                                |
| cloog    | FALSE | [GitHub](https://github.com/periscop/cloog/tags) | N/A                                                             | 编译优化，可选。                                |

我们将源码都存放到`<workspace>/src`目录下，然后进入GCC源码文件夹，将编译GCC所需的mpfr、gmp、isl、cloog源码链接到GCC源码文件夹里。

```shell
cd <workspace>/src/gcc
ln -s ../mpfr mpfr
ln -s ../gmp gmp
ln -s ../mpc mpc
ln -s ../isl isl
ln -s ../cloog cloog
```

稍后，我们将进入`build-binutils`、`build-gcc`、`build-glibc`这三个编译目录进行编译。

### 设置环境变量

接下来我们着手配置一些环境变量，方便我们在本次编译中使用。由于这些变量只针对本次编译，我们希望下次打开终端时自动还原这些变量，所以我们只需要用`export`命令在当前终端会话中设置即可。

我们首先配置几个重要环境变量来方便我们的编译。

```shell
export PREFIX="<workspace>"
export TARGET=x86_64-pc-linux-gnu
export PATH="$PREFIX/bin:$PATH"
```

`PREFIX`目录会被用来存放编译生成的文件。

`TARGET`就是我们的目标机器。

`PATH`中则添加了我们编译生成的二进制代码文件所在目录。因为编译GCC之前，我们还需要把其所需的binutils程序库也编译到`PREFIX`目录下，所以我们要预先将其加入路径变量，稍后编译GCC时，系统就能自动查找到所需的binutils程序。

## 第二部 编译Binutils

Binutils程序库包含了编译GCC过程中必须的一些程序，例如汇编器`as`、连接器`ld`等等。

进入Binutils编译文件夹，运行下述命令配置、编译。

```shell
cd <workspace>/src/build-binutils
../binutils/configure --prefix=$PREFIX \
    --build=$MACHTYPE --host=$MACHTYPE \
    --target=$TARGET \
    --with-sysroot="$PREFIX/$TARGET/sys-root" \
    --disable-multilib \
    --disable-shared --disable-nls
make -j$(nproc)
make install
```

`--prefix=`配置了生成的程序存放的目录，二进制可执行文件会被放在`$PREFIX/bin`目录下，库文件一般会被放到`$PREFIX/include`目录下。

`--build=`、`--host=`、`--target=`则配置了三个机器名称。这里我们用`MACHTYPE`系统变量调用了系统自身的名称。

`--with-sysroot=`指定了Liunx头文件所在的位置。因为我们的目标机器是另一种架构的Linux系统，所以在编译时需要提供对应的Linux头文件。

`--disable-multilib`关闭了对Multilib的支持。由于我们不需要同时支持32位机器，所以可以关闭此项。

`--disable-shared`强制编译时静态链接内部库，以防止本机的程序库被调用，产生兼容问题。

`--disable-nls`关闭了多语言支持。因为我们编译的只是编译器工具，所以无需打开。

## 第三部 安装Linux头文件

由于GCC依赖于C运行库Glibc，而Glibc要运行起来又需要Linux的程序编程接口，因此我们需要从Linux内核中提取Linux头文件供其使用。

```shell
cd <workspace>/src/linux-kernel
make ARCH=x86_64 INSTALL_HDR_PATH="$PREFIX/$TARGET/sys-root/usr" headers_install
```

## 第四部 第一次编译GCC

为什么叫第一次呢？什么事都有第一次，对吧。有些第一次，会很难，但一定要做，不做就不会有下一次，就不会有第三次第四次，就不会有丰富绚烂的人生。

打住。

由于GCC和Glibc程序库存在相互依赖关系，因此一开始编译GCC时，能编译，但只能编译一点点。编译好之后，再编译Glibc，但也只能一点点。然后再回过头来编译完整的GCC。

那么这就开始第一拨的GCC编译。

进入GCC源码文件夹，运行如下命令配置并编译。

```shell
cd <workspace>/src/build-gcc
../gcc/configure --prefix=$PREFIX \
    --build=$MACHTYPE --host=$MACHTYPE \
    --target=$TARGET \
    --with-sysroot="$PREFIX/$TARGET/sys-root" \
    --with-build-sysroot="$PREFIX/$TARGET/sys-root" \
    --disable-multilib \
    --disable-shared --disable-nls \
    --with-zstd \
    --enable-languages=c,c++,fortran
make -j$(nproc) all-gcc
make install-gcc
```

`--with-zstd`可以开启比默认Zlib压缩算法更高效的Zstd压缩算法。编译流程中的链接时优化（LTO, Link-Time Optimization）通常需要处理大量数据，因而需要高效的压缩算法。据报道，Zstd压缩算法可以[在压缩比率相近的条件下，提高4-8倍链接速度](https://www.phoronix.com/scan.php?page=news_item&px=GCC-Eyeing-Zstd-LTO)。

`--enable-languages=`配置了最终的GCC交叉编译器所支持的语言，可以根据需要选择，一般选择c与c++即可。

## 第五部 第一次编译Glibc

有了初次编译的GCC作为基础，我们就可以进一步编译第一拨的Glibc了。首先进行配置：

```shell
cd <workspace>/src/build-glibc
CC=$TARGET-gcc \
    LD=$TARGET-ld \
    AR=$TARGET-ar \
    RANLIB=$TARGET-ranlib \
    ../glibc/configure --prefix=/usr \
    --build=$MACHTYPE --host=$TARGET \
    --target=$TARGET \
    --with-headers="$PREFIX/$TARGET/sys-root/usr/include" \
    --disable-multilib \
    --disable-werror \
    libc_cv_forced_unwind=yes
```

`CC=`、`LD=`、`AR=`、`RANLIB=`确保在编译过程中调用我们第二部中编译的Binutils工具，而非系统自带的工具集。

`--prefix=`指定程序文件安装的目录。由于Glibc文件需要安装到Linux头文件所在的`$PREFIX/$TARGET/sys-root/usr/`目录下，我们先指定`--prefix`为`/usr`，并在使用`make`命令安装时指定目录前缀为`$PREFIX/$TARGET/sys-root`。

`--host=`与前几部时不同，我们在这里指定了运行系统名称为`$TARGET`，也即目标机器。这是因为Glibc是目标程序在运行时所需的运行库，最终将运行在目标机器上。

`--disable-werror`使得编译GCC时，不将警告（warning）作为错误（error），防止因为警告中止编译。

`libc_cv_forced_unwind=yes`跳过了编译过程中对强制栈展开的测试。因为我们第二部中编译的Binutils链接器是交叉链接器，在没有编译完Glibc前无法使用，所以尚且不支持强制栈展开，在此需要关闭对其的检测。

配置完成后，我们需要安装一些Glibc的头文件，供编译GCC使用。

```shell
cd <workspace>/src/build-glibc
make \
    install-bootstrap-headers=yes \
    install_root=$PREFIX/$TARGET/sys-root \
    install-headers
# Make and install csu related files
make -j6 csu/subdir_lib
mkdir $PREFIX/$TARGET/sys-root/usr/lib
install csu/crt1.o csu/crti.o csu/crtn.o $PREFIX/$TARGET/sys-root/usr/lib
# Create dummy libc.so and stubs.h
$TARGET-gcc \
    -nostdlib \
    -nostartfiles \
    -shared \
    -x c /dev/null \
    -o $PREFIX/$TARGET/sys-root/usr/lib/libc.so
touch $PREFIX/$TARGET/sys-root/usr/include/gnu/stubs.h
```

在上面的步骤中，我们安装了`csu/crt1.o`、`csu/crti.o`、`csu/crtn.o`，并创建了临时的`libc.so`、`stubs.h`文件，以供下一步使用

## 第六部 编译libgcc

接下来，我们需要使用第四部中得到的GCC来编译一些支持库，这些程序库将会在第二次编译Glibc中用到。

```shell
cd <workspace>/src/build-gcc
rm gcc/stmp-fixinc
make -j$(nproc) all-target-libgcc
make install-target-libgcc
```

`rm gcc/stmp-fixinc`是为了防止在最后一次编译GCC时出现[PATH_MAX定义错误](https://gcc.gnu.org/legacy-ml/gcc-help/2020-01/msg00035.html)，报错类似于`‘PATH_MAX’ was not declared in this scope`。

## 第七部 第二次编译Glibc

这一部中，我们要完成Glibc的编译，生成静态程序库libc.a以及动态程序库libc.so。

```shell
cd <workspace>/src/build-glibc
make -j$(nproc)
make install_root="$PREFIX/$TARGET/sys-root" install
```

## 第八部 第二次编译GCC

天龙八部齐活了，现在只需要……完成GCC的编译。

```shell
cd <workspace>/src/build-gcc
make -j$(nproc)
make install
```

## 完结撒花

如果中途没有出错（应该是不可能的，如果出错，请查看文末锦囊），那么你已经可以使用`<workspace>/build/$TARGET-gcc -v`来查看我们刚才编译的交叉编译器了，甚至还能用它来编译点小玩意！

一些题外话，在我花了整整一个礼拜弄明白怎么编译交叉编译器之后，我发现我才仅仅是来到了交叉编译的起跑线。为了交叉编译FFmpeg，我需要先编译好目标机器所用的所有程序库，包括x264、x265、libfdk-aac、libass等等十来个。当我编译的第五个程序库，也就是x265，因为multilib问题报错时，我已经心灰意冷。

你猜最终怎么着？

乖乖本地编译。

和而不同真的那么简单吗，鸡同鸭讲、对牛弹琴这些成语可不是说着玩玩的。“那你能帮帮我吗？”这句看似轻松的话，背后有多少磨合，需要多少付出，又有谁人知晓。

## 锦囊

登陆全球最大在线大学[www.Google.com](https://www.google.com/)，搜索错误代码，真人程序员，在线发……答疑。

## 参阅

[1] [How to Build a GCC Cross-Compiler *by Jason*](https://jasonblog.github.io/note/raspberry_pi/how_to_build_a_gcc_cross-compiler.html)

[2] [Linux From Scratch](https://bf.mengyan1223.wang/lfs/zh_CN/8.3/chapter05/generalinstructions.html)

[3] [GCC Fails to Build *from Mailing list for the GCC project*](https://gcc.gnu.org/legacy-ml/gcc-help/2020-01/msg00057.html)

[4] [A guide to cross-compiling applications](https://blog.jgosmann.de/posts/2021/02/07/a-guide-to-crosscompiling-applications/#building-and-installing-a-minimal-gcc-for-static-linking)
