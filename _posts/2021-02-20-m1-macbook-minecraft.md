---
layout: post
title: "在M1 Macbook上不使用Rosetta优雅地游玩Minecraft+Forge"
subtitle: "Messing with Native Minecraft w/ Forge on M1 MacBook"
author: "DotIN13"
tags:
  - Apple Silicon
  - MacBook
  - Minecraft
  - Forge
typora-root-url: ../
locale: zh_CN
---

> 根据最新情报，本文方法已过时，达文西同志已经研制出了最新启动方法，通杀Minecraft 1.7至今所有版本，这款终极武器的名字就叫做：**黑了他-3000**。呃……不好意思，走错片场，但是船新启动方法是真的，[M1-HMCL-Hack](/2022/08/07/m1-hmcl-hack/#m1-hmcl-hack)现已上线！

## No Rosetta

暑假的尾巴，姐妹们说，这是最后一次大家都这么有空，能在一起玩Minecraft了。某位腐竹（不错，正是在下）听了，不免有些哽咽。

不料寒假刚开始，又有姐妹在群里喊着开服。哎，毕竟放假了，要麻醉自我的嘛，真香。

房间里2700X+GTX960的中塔已经被我嫌占地儿，扔给了废品站；Windows的i7-7200U+940MX笔电玩Minecraft又卡顿。那么就只好在我的M1 MacBook上尝试尝试跑Minecraft咯。

既然已经在折腾了，不如玩ARM架构的原生Minecraft，不仅流畅，还高端大气（才不是因为不知道Rosetta怎么用呢）。

## 运行的关键：LWJGL

根据[Tanmay Bakshi的教学视频](https://www.youtube.com/watch?v=Ui1MAhBYIdk)以及他的[教程Gist](https://gist.github.com/tanmayb123/d55b16c493326945385e815453de411a)，Minecraft不能在M1 Macbook上直接运行的最大问题就在于Minecraft自带的[LWJGL库](https://github.com/LWJGL/lwjgl3)还不能良好地兼容macOS-ARM64架构，因此需要从源码编译最新的LWJGL库。Tanmay已经编译好了运行原生MC需要使用的库，不过他搭配使用的命令行启动器hardcode了Minecraft版本。[yusefnapora](https://github.com/yusefnapora)基于Tanmay的库文件制作了[Python自动脚本](https://github.com/yusefnapora/m1-multimc-hack)。

不过既然都折腾了，我想用上自己经常使用的Hello Minecraft Launcher启动器（HMCL），无奈yusefnapora的脚本仅支持MultiMC启动器，这是由于MultiMC集中管理库文件的方式与其他Minecraft启动器不同。在花了一些时间研究之后，我找到了使用HMCL启动器在M1 MacBook上下载并启动Minecraft Forge客户端的方法。

安装运行方法结录如下。

## 1. 安装Java

第一步，安装Java，既然要抛开Rosetta使用Minecraft，那么必然要用到ARM原生JavaSE。

Minecraft使用的是在macOS上比Oracle Java更加高效的Zulu Java 11 JDK for macOS ARM64；由于HMCL调用JavaFX渲染界面，需要使用JavaFX，因此这里我下载JDK FX版本，打开[下载页面](https://www.azul.com/downloads/zulu-community/?version=java-11-lts&os=macos&architecture=arm-64-bit&package=jdk-fx)，如下图选择版本，下载DMG安装。

{% include post-image.html link="post-macbook/zulu11.png" alt="Zulu Java 11 JDK Download" %}

安装好之后，可以运行`/usr/libexec/java_home -V`查看系统中所有Java的版本。

```shell
$ /usr/libexec/java_home -V
Matching Java Virtual Machines (3):
    11.0.10 (arm64) "Azul Systems, Inc." - "Zulu 11.45.27" /Library/Java/JavaVirtualMachines/zulu-11.jdk/Contents/Home
```

`Zulu 11.xx.xx`一行就是我们需要的Zulu JDK 11的安装目录，我通过修改`~/.zshrc`的方式来设置JAVA_HOME环境变量，告诉终端`java`命令应当运行哪个Java版本。

将下面的内容添加到`~/.zshrc`末尾。

```bash
# ~/.zshrc
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-11.jdk/Contents/Home
```

使用`source ~/.zshrc`或者重启终端使设置生效。

## 2. 下载HMCL

在[HMCL官方网站](https://hmcl.huangyuhui.net/download)下载启动器，然后运行以下命令，建立一个游戏目录（例如`~/Games/Minecraft`），将启动器放置其中。

```shell
mkdir -p ~/Games/Minecraft/ # 建立游戏目录
mv ~/Downloads/HMCL-3.3.181.jar ~/Games/Minecraft # 将HMCL移动到游戏目录
java -jar HMCL-3.3.181.jar # 打开HMCL
```

HMCL已经可以正常打开，此时如同往常一样，进入`版本列表`->`安装新游戏版本`，安装1.16.5版本Minecraft，并同时安装Forge。

{% include post-image.html link="post-macbook/HMCL.png" alt="Download 1.16.5 w/ Forge with HMCL" %}

## 3. 下载预编译的库文件

如前述，要运行Forge版本的Minecraft，需要最新的LWJGL与经过[修正后的GLFW库](https://github.com/glfw/glfw/pull/1833)。两个重要的库文件分别由Tanmay与[0xQSL](https://github.com/0xQSL/m1-multimc-hack/tree/fix-forge)进行了修改与编译。

运行以下命令下载库文件，并将其移动到对应位置。

```shell
cd ~/Games/Minecraft # 进入游戏目录
git clone https://github.com/DotIN13/m1-multimc-hack.git # 克隆所需的库文件到本地
mv m1-multimc-hack/lwjglfat.jar .minecraft/libraries/org/lwjgl/lwjgl/3.2.1/lwjgl-3.2.1.jar # 将下载的LWJGL库放入Minecraft运行目录
```

## 4. 使用HMCL导出启动脚本

直接在HMCL启动不能另外指定库文件目录，因此，我们不能直接在HMCL软件内启动，需要导出启动脚本，使用脚本启动。

点击侧边栏中我们刚才安装的游戏版本，如`1.16.5-forge`，点击上方工具栏中的`扳手🔧`，确保下方的Java版本选中了刚才安装的Zulu JDK 11，并设置合适的内存大小。然后点击`生成启动脚本`，可以将脚本保存到`~/Games/Minecraft/start.sh`。

{% include post-image.html link="post-macbook/minecraft-script.png" alt="导出启动脚本" %}

如下编辑`start.sh`并保存。

```bash
# 找到-Djava.library.path一段
# 修改为"-Djava.library.path=/Users/你的用户名/Games/Minecraft/m1-multimc-hack/lwjglnatives/"
# 让Java调用我们刚才下载的原生库文件
```

## 5. 使用脚本启动Minecraft！

进入终端，运行如下命令启动Minecraft。

```shell
cd ~/Games/Minecraft # 进入游戏目录
./start.sh # 美妙的Minecraft启动界面映入眼帘
```

{% include post-image.html link="post-macbook/minecraft-starting.png" alt="启动中..." %}

{% include post-image.html link="post-macbook/minecraft-splashscreen.png" alt="主界面" %}

打开Minecraft的过程很快，经过我的尝试，安装30个模组之后启动速度大约在一分钟以内；切换语言大约20秒内完成。游戏过程也较为稳定，没有出现过崩溃现象。

仅安装Forge进入游戏大约有110-120FPS，此时CPU占用100%，配置内存2GiB时实际占用2.8GiB。

{% include post-image.html link="post-macbook/minecraft-cpu.png" alt="CPU占用100%" %}

{% include post-image.html link="post-macbook/minecraft-mem.png" alt="内存占用2.8GiB" %}

## 一个Minecraft的梦想

人类的想象力总是无穷的，有想象的地方，又总有将它们付诸实践的双手。众多玩家在M1上离开Rosetta运行Minecraft的梦想实现了，在M1上脱离虚拟机运行原生GNU/Linux的梦想似乎也不远了。

离开舒适圈，你我的梦想又驶向何方？
