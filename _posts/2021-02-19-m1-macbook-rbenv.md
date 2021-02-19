---
layout: post
title: "在M1 Macbook上优雅地安装Rbenv+Ruby"
subtitle: "Using Rbenv+Ruby on M1 Macbook"
author: "DotIN13"
tags:
  - Apple Silicon
  - Macbook
  - Rbenv
  - Ruby
  - Homebrew
typora-root-url: ../
locale: zh_CN
---

## Ruby on M1 Macbook

看起来有不少尝鲜购入M1 Macbook的朋友装上了x86的homebrew，导致在编译Ruby时遇到了错误。事实上，如果使用了正确的arm64 Homebrew，就已经可以正常地编译使用rbenv+Ruby了。

{% include image.html link="in-post/post-macbook/ruby-versions.png" alt="My Ruby Environment" %}

系统自带的是Ruby-2.6.3，我已经成功使用rbenv安装了2.7.2用来写作Jekyll，并且准备用3.0.0来继续开发我的Rails项目。

## 安装步骤

### 1. Homebrew

Ruby编译需要安装arm64版本的openssl，所以需要安装3.0.0以上版本适用于Apple Silicon的Homebrew。默认运行[官方网站]([
Homebrewbrew.sh](https://brew.sh/))的脚本即可安装正确版本的Homebrew，新版Homebrew的工作目录在`/opt/homebrew`。

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

脚本全自动运行，按照提示安装即可，可以使用`brew -v`查看brew版本，并确保brew被安装到了`/opt/homebrew`。

```shell
$ brew -v
Homebrew 3.0.1-93-g53d840c
Homebrew/homebrew-core (git revision 70345; last commit 2021-02-17)
Homebrew/homebrew-cask (git revision 0ab858; last commit 2021-02-18)
$ which brew
/opt/homebrew/bin/brew
```

### 2. 安装rbenv、readline和openssl

接下来使用上一步安装的Homebrew安装rbenv。

```shell
brew install rbenv
```

使用ruby-build编译arm64的Ruby还需要安装对应的arm64版本readline和openssl。

```
brew install readline
brew install openssl
```

然后将下述的环境变量添加到`~/.zshrc`的末尾。

```bash
# ~/.zshrc
# rbenv
export RBENV_ROOT=/opt/homebrew/opt/rbenv
export PATH=$RBENV_ROOT/bin:$PATH
eval "$(rbenv init -)"
# Use native openssl libraries for building
export PATH="/opt/homebrew/opt/openssl@1.1/bin:$PATH"
export LDFLAGS="-L/opt/homebrew/opt/openssl@1.1/lib"
export CPPFLAGS="-I/opt/homebrew/opt/openssl@1.1/include"
export PKG_CONFIG_PATH="/opt/homebrew/opt/openssl@1.1/lib/pkgconfig"
export RUBY_CONFIGURE_OPTS="--with-openssl-dir=/opt/homebrew/opt/openssl@1.1"
```

运行`source ~/.zshrc`或者重启Terminal来使环境变量生效。

### 3. 安装Ruby

此时安装2.7.2及以上版本Ruby只需直接运行`rbenv install (version)`即可。

```shell
# Example
rbenv install 2.7.2
rbenv global 2.7.2
rbenv rehash
```

如果需要安装更低版本的Ruby，则要额外添加一个FLAG。

```shell
# Example
RUBY_CFLAGS="-Wno-error=implicit-function-declaration" rbenv install 2.5.3
```

### 代理

如果安装过程出现SSL错误，那么你可能需要代理来下载Ruby源码。将下面的代码添加到`~/.zshrc`的末尾，将`ip:port`替换成你的代理服务器ip与端口。

```bash
# ~/.zshrc
export http_proxy="http://ip:port"
export HTTP_PROXY=${http_proxy}
export https_proxy=${http_proxy}
export HTTPS_PROXY=${http_proxy}
```

同样地，运行`source ~/.zshrc`或者重启Terminal来使环境变量生效，然后再重复上一步。

## 皆大欢喜

此刻运行`ruby -v`，就可以发现刚才安装的ruby已经可以运行，开始愉快的`bundle`吧！

开工是不会开工的，只会装好了环境就开始摸鱼这样子。

参考：[GitHub/ruby-build#1691](https://github.com/rbenv/ruby-build/issues/1691)





