---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Linux
- Cross Compile
title: The First GCC Cross Compiler for Young People in "The Demi-Gods and Semi-Devils"
---

Standing out from the crowd, unique and unparalleled. Blocking our sight, with birds standing among chickens, white feathers crowning the sky.

In a poetic verse, it says, "Differences" often bring indifference and discrimination. However, what the verse describes is just an extreme case. Life is usually a mixture of various things, blending and coordinating different elements to bring diversity, possibilities, and fresh days that are never the same.

Cross-compilation is a cooperative process of "harmony in diversity."

"I have poor performance, can you help me?"

"Of course, but what can you offer me in return?"

"I consume less power, and I don't get hot."

Some may question why we can't achieve everything at once. The truth is, sacrifices must be made to achieve gains. Nothing is perfect, and different trade-offs lead to the enduring differences between "us" and "them." Communication, coordination, and cooperation are necessary, albeit being seasonings.

Cross-compilation, calling it a bridge, is more like the collaboration itself.

## Compiling GCC Cross-Compiler

We, young people, always want to compile FFmpeg for Raspberry Pi, or compile a graphics card driver for a Celeron NAS. Hold on, my friend! Such high computational tasks are not suitable for these "electronic trash" devices. We need to use a high-performance processor to compile, which is where cross-compilation comes into play.

As the name suggests, a cross-compiler is used in cross-compilation to generate target machine code, an essential tool in the compilation process. Today, let's compile a lovely...compiler!

## Prologue: Three Machine Names

During a compilation process, three machine names are generally provided: the build system, the host system, and the target system. These names help the compiler generate binary code for the corresponding machines. The "build" refers to the machine used for compiling, the "host" is the machine on which the **compiled** code will run, while the "target" is the machine where the **final generated** code will run (not necessarily the code being compiled). When configuring GCC, we need to provide these names through the `--build=`, `--host=`, and `--target=` options.

Machine names (triplets) generally follow the format of "machine-vendor-operatingsystem." "Machine" refers to the machine architecture, such as "x86_64," "arm64." "Vendor" refers to the manufacturer, like "pc," "apple," and "operatingsystem" refers to the operating system, like "linux-gnu," "darwin21.2.0."

Machine names can usually be viewed with `gcc -dumpmachine`.

```shell
$ gcc -dumpmachine
x86_64-pc-linux-gnu # On a 64-bit linux platform
```

```shell
$ gcc -dumpmachine
arm64-apple-darwin21.2.0 # On a M1 MacBook
```

Based on the compilation purpose, different combinations of machine names are set, and each combination has its own name.

| Compilation Type       | Build System (build) | Host System (host) | Target System (target) | Remarks                      |
| ---------------------- | -------------------- | ------------------- | ---------------------- | ---------------------------- |
| Native Compilation     | A                    | A                   | A                      | Compilation and execution on machine A |
| Cross Compilation      | A                    | A                   | B                      | Compilation for machine B using high-performance A |
| Crossed Native Compilation | A                    | B                   | B                      | Compilation on machine B using pre-compiled cross-compiler on machine A |
| Canadian Compilation   | A                    | B                   | C                      | Compilation on machine A with unique compiler |
| Crossback Compilation  | A                    | B                   | A                      | Same as above                |

Today, what we will compile is the GCC cross-compiler used in cross-compilation.

As an example this time, we will use an arm64 Ubuntu machine to create a GCC cross-compiler for compiling code on an x86_64 Linux system. In this compilation, since the GCC cross-compiler we are about to compile will run directly on our local machine, both our "build" and "host" are `aarch64-linux-gnu`, replaced by Linux's `MACHTYPE` environment variable; while the "target" is the object on which our cross-compiler will generate code, which is `x86_64-pc-linux-gnu`.

## Part One: Setting Up the Environment

### Installing Compilation Tools

First, use the system package manager to install some tools needed for compilation, such as g++, make, etc.

```shell
sudo apt-get update
sudo apt-get install g++ make gawk -y
sudo apt-get install vim wget xz-utils -y
```

### Determining Versions

Next, we need to determine the software versions of the target machine, including Binutils, Glibc, system header files needed to compile GCC, and GCC itself. Because after compiling and obtaining the cross-compiler, the generated program needs to run on the target machine, requiring support from the target machine's program libraries. Therefore, it's best to compile according to the program library versions on the target machine to avoid compatibility issues.

For example, using a GCC cross-compiler with a higher version of Glibc to compile binary programs could lead to errors when running on a machine with a lower Glibc version, resulting in an error like:

```shell
$ ./hello
./hello: /usr/lib/libc.so.6: version `GLIBC_2.34' not found (required by ./hello)
```

Running the following commands can help us determine the software versions in the **target machine** environment.

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

Alternatively, you can visit the [DistroWatch website](https://distrowatch.com/dwres.php?resource=package-in-distro&pkg=binutils) to check the software package versions for each distribution as a reference.

We should ensure that the version combinations of Binutils, Glibc, GCC, and Linux Kernel we compile are reasonable. They could be combinations on the target machine or from a specific distribution, as these verified combinations can help us avoid compatibility issues.

### Setting Up Working Directory

Create a working directory `<workspace>` and store the source code of Binutils, GCC, Glibc, and Linux kernel in the `<workspace>/src` directory. Create separate build directories for Binutils, GCC, and Glibc within the `src` directory. The compiled files will be stored in the `<workspace>/build` directory.

> In practical operations, all occurrences of `<workspace>` in this document should be replaced with the actual directory paths.

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

### Downloading Source Code

You can download the source code from the [GNU FTP site](https://ftp.gnu.org/) or from domestic mirror sites.

| Package      | Mandatory  | Download Link                                               | Domestic Mirror                                                  | Purpose                               |
| ------------ | ---------- | -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| Binutils     | TRUE       | [GNU FTP](https://ftp.gnu.org/gnu/binutils/)           | [USTC Mirror](https://mirrors.ustc.edu.cn/gnu/binutils/)       | Includes linkers, assemblers, and other tools. |
| GCC          | TRUE       | [GNU FTP](https://ftp.gnu.org/gnu/gcc/)                | [USTC Mirror](https://mirrors.ustc.edu.cn/gnu/gcc/)            | GNU Compilation Collection, includes compilers for C and C++. |
| Glibc        | TRUE       | [GNU FTP](https://ftp.gnu.org/gnu/glibc/)              | [USTC Mirror](https://mirrors.ustc.edu.cn/gnu/glibc/)          | Basic C library, contains basic functions for C programs. |
| Linux Kernel | TRUE       | [GNU FTP](https://www.kernel.org/)                     | [USTC Mirror](https://mirrors.ustc.edu.cn/kernel.org/linux/kernel/) | Glibc depends on Linux kernel headers.   |
| mpfr         | TRUE       | [GNU FTP](https://ftp.gnu.org/gnu/mpfr/)               | [USTC Mirror](https://mirrors.ustc.edu.cn/gnu/mpfr/)           | Contains some functions for multiple precision arithmetic. |
| gmp          | TRUE       | [GNU FTP](https://ftp.gnu.org/gnu/gmp/)                | [USTC Mirror](https://mirrors.ustc.edu.cn/gnu/gmp/)            | Contains some functions for multiple precision arithmetic. |
| mpc          | TRUE       | [GNU FTP](https://ftp.gnu.org/gnu/mpc/)                | [USTC Mirror](https://mirrors.ustc.edu.cn/gnu/mpc/)            | Contains some functions for multiple precision arithmetic. |
| ISL          | FALSE      | [GitHub](https://github.com/Meinersbur/isl/tags)       | N/A                                                            | Optional for compiler optimization.       |
| cloog        | FALSE      | [GitHub](https://github.com/periscop/cloog/tags)       | N/A                                                            | Optional for compiler optimization.       |

Place the source code in the `<workspace>/src` directory. Afterwards, go into the GCC source code folder and link the source code of mpfr, gmp, isl, and cloog needed for compiling GCC to the GCC source code folder.

```shell
cd <workspace>/src/gcc
ln -s ../mpfr mpfr
ln -s ../gmp gmp
ln -s ../mpc mpc
ln -s ../isl isl
ln -s ../cloog cloog
```

Later, we will enter the `build-binutils`, `build-gcc`, `build-glibc` directories for compilation.

### Setting Environment Variables

Next, let's set up some environment variables to facilitate our compilation. Since these variables are only for this particular compilation, we want them to automatically restore the next time we open the terminal. Therefore, we only need to use the `export` command to set them in the current terminal session.

First, configure a few important environment variables to streamline our compilation process.

```shell
export PREFIX="<workspace>"
export TARGET=x86_64-pc-linux-gnu
export PATH="$PREFIX/bin:$PATH"
```

The `PREFIX` directory will be used to store the generated files.

The `TARGET` is our target machine.

The `PATH` adds the directory where the generated binary code will be located. Before compiling GCC, we also need to compile the necessary binutils libraries to the `PREFIX` directory, so we need to add it to the path variable beforehand. This way, when compiling GCC later, the system can automatically locate the required binutils programs.

## Part Two: Compiling Binutils

The Binutils library contains essential tools required during GCC compilation, such as the assembler `as`, the linker `ld`, etc.

Enter the Binutils compilation folder and run the following commands to configure and compile.

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

`--prefix=` configures the directory where the generated programs will be stored. The binary executable files will be in the `$PREFIX/bin` directory, and library files will generally be placed in the `$PREFIX/include` directory.

`--build=`, `--host=`, `--target=` configures the three machine names. Here, we used the `MACHTYPE` system variable to call the system's name.

`--with-sysroot=` specifies the location of Linux header files. Since our target machine is a Linux system with a different architecture, we need to provide the corresponding Linux header files during compilation.

`--disable-multilib` disables Multilib support. Since we don't need to support 32-bit machines simultaneously, we can disable this feature.

`--disable-shared` forces static linking of internal libraries during compilation to prevent compatibility issues from using the local program libraries.

`--disable-nls` disables multi-language support. Since we are compiling only the compiler tool, there is no need to enable it.

## Part Three: Installing Linux Headers

Since GCC relies on the C runtime library Glibc, and Glibc requires the Linux Program Interface to run, we need to extract Linux headers from the Linux kernel for its use.

```shell
cd <workspace>/src/linux-kernel
make ARCH=x86_64 INSTALL_HDR_PATH="$PREFIX/$TARGET/sys-root/usr" headers_install
```

## Part Four: First GCC Compilation

Why is it called the first time? Because everything has a first time, right? Some first times may be tough, but they must be done. Without the first time, there won't be a second, third, or fourth time, and life won't be as colorful and rich.

Hold on.

Since GCC and Glibc libraries depend on each other, when compiling GCC for the first time, it can compile, but only a bit. After compiling, then compile Glibc, but only a bit. Then turn back to compile the complete GCC.

So, this marks the start of the first wave of GCC compilation.

Navigate to the GCC source folder and run the following commands to configure and compile.

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

The `--with-zstd` option enables the use of the more efficient Zstandard compression algorithm instead of the default Zlib. Link-Time Optimization (LTO) in the compilation process typically involves handling a large amount of data, requiring efficient compression algorithms. Reportedly, the Zstd compression algorithm can [improve link speed by 4-8 times](https://www.phoronix.com/scan.php?page=news_item&px=GCC-Eyeing-Zstd-LTO) under similar compression ratios.

The `--enable-languages=` option configures the languages supported by the final GCC cross compiler. Choose according to your needs, usually selecting c and c++ is sufficient.

## Part Five: First Glibc Compilation

With the initial compilation of GCC as the foundation, we can further compile the first wave of Glibc. Start by configuring:

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

Setting `CC=`, `LD=`, `AR=`, `RANLIB=` ensures that the Binutils tools compiled in the second part are used during compilation, instead of the system's default toolset.

The `--prefix=` specifies the directory for installing program files. Since Glibc files need to be installed in the directory containing Linux headers at `$PREFIX/$TARGET/sys-root/usr/`, we initially set `--prefix` to `/usr`, and specify the directory prefix as `$PREFIX/$TARGET/sys-root` when installing with the `make` command.

Unlike in the previous parts, `--host=` here specifies the target machine, as Glibc is the runtime library required by the target program to run on the target machine.

`--disable-werror` ensures that warnings are not treated as errors during GCC compilation, preventing compilation from being aborted due to warnings.

`libc_cv_forced_unwind=yes` skips the test for forced stack unwinding during compilation. Since the Binutils linker compiled in the second part is a cross-linker and cannot be used until Glibc is fully compiled, it does not yet support forced stack unwinding, so detection for this needs to be disabled here.

After configuration, some Glibc headers need to be installed for GCC compilation:

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

In the above steps, we installed `csu/crt1.o`, `csu/crti.o`, `csu/crtn.o`, and created temporary `libc.so` and `stubs.h` files for future use.

## Part Six: Compiling libgcc

Next, we need to use the GCC obtained in the fourth part to compile some support libraries that will be used in the second Glibc compilation.

```shell
cd <workspace>/src/build-gcc
rm gcc/stmp-fixinc
make -j$(nproc) all-target-libgcc
make install-target-libgcc
```

`rm gcc/stmp-fixinc` is to prevent an error related to the [PATH_MAX definition](https://gcc.gnu.org/legacy-ml/gcc-help/2020-01/msg00035.html) that may occur during the final GCC compilation, such as `'PATH_MAX' was not declared in this scope`.

## Part Seven: Second Glibc Compilation

In this part, we need to complete the compilation of Glibc, generating the static library libc.a and dynamic library libc.so.

```shell
cd <workspace>/src/build-glibc
make -j$(nproc)
make install_root="$PREFIX/$TARGET/sys-root" install
```

## Part Eight: Second GCC Compilation

"The Demi-Gods and Semi-Devils" are all set, now all that's left is... completing the compilation of GCC.

```shell
cd <workspace>/src/build-gcc
make -j$(nproc)
make install
```

## Finale

If everything went smoothly (which is highly unlikely, if there is an error, refer to the "Notes" section at the end), you can now use `<workspace>/build/$TARGET-gcc -v` to check the cross-compiler we just compiled, and even use it to compile some small projects!

As a side note, after spending a whole week figuring out how to compile a cross-compiler, I realized that I had only just reached the starting line of cross-compilation. In order to cross-compile FFmpeg, I needed to first compile all the libraries required by the target machine, including x264, x265, libfdk-aac, libass, and about ten others. By the time I encountered an error due to a multilib issue while compiling the fifth library, x265, I was already feeling disheartened.

And guess what?

I went back to local compilation.

Are harmony and differences really that simple? Idioms like "speaking a different language" and "casting pearls before swine" are not just for fun. "Can you help me then?" may seem casual, but behind it lies so much negotiation, so much effort, and who really understands that?

## Notes

Visit the world's largest online university [www.Google.com](https://www.google.com/), search for error codes, real programmers, online Q&A...

## References

[1] [How to Build a GCC Cross-Compiler *by Jason*](https://jasonblog.github.io/note/raspberry_pi/how_to_build_a_gcc_cross-compiler.html)

[2] [Linux From Scratch](https://bf.mengyan1223.wang/lfs/zh-cn/8.3/chapter05/generalinstructions.html)

[3] [GCC Fails to Build *from Mailing list for the GCC project*](https://gcc.gnu.org/legacy-ml/gcc-help/2020-01/msg00057.html)

[4] [A guide to cross-compiling applications](https://blog.jgosmann.de/posts/2021/02/07/a-guide-to-crosscompiling-applications/#building-and-installing-a-minimal-gcc-for-static-linking)

