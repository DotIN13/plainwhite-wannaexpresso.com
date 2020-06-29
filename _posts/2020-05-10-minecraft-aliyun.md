---
layout: post
title: "在阿里云ECS上搭建Minecraft原版服务器"
subtitle: "Vanilla Minecraft Server on Alibaba Cloud ECS"
author: "DotIN13"
tags:
  - Linux Dev
  - Game
  - Minecraft
  - Alibaba Cloud
typora-root-url: ../
locale: zh_CN
---

## 阿里云ECS

由于新冠疫情，阿里云推出了[“在家实践”计划](https://developer.aliyun.com/adc/college/)，高校学生、教师可以免费领取6个月的云服务器。

> 新冠肺炎疫情防控持续推进，为全力配合教育部延期开学，高校师生在家上课共同抗击疫情，阿里云弹性计算联合开发者社区、阿里云大学紧急上线高校“在家实践”计划，向全国高校学生、教师免费提供2.68亿小时云服务器ECS算力，及多样化在线课程等资源。

[ECS（弹性计算服务）](https://www.alibabacloud.com/help/zh/doc-detail/25367.htm)是什么呢，其实它就是一种虚拟服务器，与VPS（Virtual Private Server）的最大区别就在于它并非基于一台专有服务器，因此，只要你有钱（雾），就可以随时升级各项配置来满足你不断改变的即时性能需求。

羊毛不褥白不褥，我在了解之后立马申请到了一台ECS。性能还算不错，Intel Xeon×2 + 4GB RAM，不过，学习是不可能学习的，只有打打MC才能维持得了生活这样子。于是，这台服务器就顺理成章地被我改造成了一台MC原版服务器。

## 配置实例安全组

我将Minecraft服务器直接架设在了默认的25565端口，因此首先需要在阿里云的安全组中开启25565端口TCP入站的规则。首先打开实例页面，进入实例当前安全组进行设置，如下图。

{% include image.html link="/img/in-post/post-minecraft-aliyun/security-group.png" alt="Security Group" %}

然后在访问规则的入规则下点击手动创建。

{% include image.html link="/img/in-post/post-minecraft-aliyun/manual.png" alt="Create Manually" %}

填入Minecraft端口并保存。

{% include image.html link="/img/in-post/post-minecraft-aliyun/value.png" alt="Set Rule" %}

## 配置服务端

系统上我选择了Debian 9.9 x64。

### 下载服务端

首先，在[Minecraft官网找到服务端下载地址](https://www.minecraft.net/zh-hans/download/server/)。

{% include image.html link="/img/in-post/post-minecraft-aliyun/download-server-jar.png" alt="Acquire Server Download Link" %}

然后，通过SSH登陆你的服务器，用以下命令创建`/srv/minecraft`文件夹，并下载服务端文件。

```shell
mkdir /srv/minecraft # 创建minecraft文件夹
cd /srv/minecraft # 移动到上述文件夹
# 使用wget下载服务端，地址请用你刚才复制的地址，这里的示例是1.15.2的服务端
wget https://launcher.mojang.com/v1/objects/bb2b6b1aefcd70dfd1892149ac3a215f6c636b07/server.jar
```

### 安装Java与screen

首先更新软件源与系统。

```shell
sudo apt update && sudo apt upgrade
```

然后安装OpenJDK 8与screen。OpenJDK是Minecraft的必须运行环境，而screen是linux的会话管理软件，可以保证会话在SSH断开后仍然保持运行。

```shell
sudo apt install openjdk-8-jre-headless screen
```

> **备注**：Minecraft 1.13及以上只兼容OpenJDK 8，如果你的服务器上有OpenJDK 7的残余，请用`sudo apt remove openjdk-7-\*`卸载。

### 初次运行

用以下命令初次运行服务端。

```shell
java -Xmx2048M -Xms3572M -jar server.jar nogui
# -Xmx 最小内存 -Xms 最大内存 nogui 以命令行形式运行
```

初次运行会很快退出，要求你同意EULA协议。

```shell
nano eula.txt # 用nano编辑器打开协议文件
```

设置`eula=true`，表示你同意EULA协议：

```yaml
#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://account.mojang.com/documents/minecraft_eula).
#Fri May 08 12:30:29 CST 2020
eula=true
```

### 设置bash脚本

你肯定不想每次开服都输入上面这串代码，这时就可以利用脚本来完成开服工作。

在当前文件夹新建`run.sh`脚本文件。

```shell
touch run.sh # 新建run.sh文件
nano run.sh # 编辑run.sh文件
```

修改run.sh内容为如下：

```bash
#!/bin/sh

java -Xms2048M -Xmx3572M -jar server.jar nogui
```

这里我使用了2048M最小内存与3572M最大内存，可以根据你的喜好增减。

将run.sh设置为可执行：

```shell
chmod +x /home/minecraft/run.sh
```

然后使用screen新建一个会话并启动Minecraft服务器。

```shell
screen ./run.sh # 在一个新的会话中运行bash脚本
# 或者
screen -S "Minecraft" # 建立一个新的名为“Minecraft”的会话
./run.sh # 运行脚本
```

此时你的服务器就会开始运行，当你看到`done`时，意味着服务器启动已经完成。

此时你可以关闭服务器，修改同目录下的`server.properties`来关闭正版验证、配置地图种子、修改游戏难度、打开白名单。

```yaml
# 主要的配置如下
white-list=true # 开启白名单
difficulty=easy # 设置难度
max-players=20 # 设置最大人数
online-mode=false # 关闭正版验证
```

更多设置请见[Minecraft Wiki](https://minecraft-zh.gamepedia.com/index.php?title=Server.properties&variant=zh-cn)。

### 添加白名单

在启动服务器后，可以利用`whitelist add Name`命令在后台添加白名单，但有时会出现添加了白名单也无法加入的情况，可能是大小写或者UUID对不上。这时可以手动修改`whitelist.json`。

```shell
nano whitelist.json # 用nano编辑whitelist.json
```

修改json中的信息，uuid修改为后台登陆失败信息中的id，name修改为玩家的名字。

```json
# JSON 示例
[  
  {
    "uuid": "ba5d0d26-54b5-3e43-a4de-xxxxxxxxxxxx",
    "name": "GHModius"
  },
  {
    "uuid": "55b632d1-44f6-3116-asdd-xxxxxxxxxxxx",
    "name": "ParkMoonJ"
  }
]
```

后台刷新白名单：

```shell
whitelist reload
```

这样就能够正常登陆了。

## 总结

原版服务器的搭建还是非常容易的，注意不要贪玩，记得写期中作业哦！