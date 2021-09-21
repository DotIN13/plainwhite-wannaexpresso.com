---
layout: post
title: 享不可享：桥接802.1x协议无线网络
subtitle: "Share The Unsharable: Bridging 802.1x Wireless Network"
author: DotIN13
tags:
  - Life
  - Raspberry Pi
  - OpenWrt
locale: zh_CN
---

## Share The Unsharable

中秋的傍晚，两个人分一块月饼；聚餐的时候，四个人分一只龙虾；坐在星巴克里的时候，一屋子的人分一根香烟。在大部分时候，稀缺总是分享的终极理由，这几乎可以说是人的本能，当我拥有你没有的东西的时候，往往就会产生一种共享的冲动——当然，这种冲动是可以通过后天的学习、锻炼得以压制的。

也有一些极少的情况，分享被视作为极不合适的，比如一些身体疾累，水痘，或是COVID，这是从内部来说的，也就是从人本身的意愿来说，己所不欲，勿施于人；也存在一些外部的情况，掌握权力修变规则、动用暴力的人，拒绝受管辖者的分享行为，或者更加直接地，其本身不愿于或是不能够与他人分享自身所占据的资源。

802.1x就属于后者中的后者。由于一些我暂且不能理解的缘由，企业级的无线网络一般会利用802.1x协议隔绝各个客户端（Client Isolation），也就是让处于同一网段的客户端互相之间不能直接通讯。有趣的是，这一技术似乎具有着某种二元性（duality），它不仅阻止了客户端之间讯息的共享，它自己本身也是不能通过中继（Relay）共享的，作为学校、公司、酒店等领域中的开放无线网络，使用这一协议让它多少沾了一点不开放的焰气。

倒也不是说我一定要逆水行舟——毕竟我也不希望破坏任何网络系统——但若是能桥接宿舍周围的校园无线网络，那么就能够直接在宿舍连接校园网，或许还可免去宿舍网络的开支，也不失为一种有趣的尝试。当然，前面都是建立在不会把学校炸了的前提下 :P 。

## 准备工作

### Raspberry 4B + OpenWrt

设备方面，我使用了刷入了普通OpenWrt系统的普通Raspberry 4B。

### wpad

[SuLingGG](https://mlapp.cn/)的OpenWrt编译自带的[wpad-basic-wolfssl](https://openwrt.org/packages/pkgdata/wpad-basic-wolfssl)并不支持WPA2-EAP，因此需要卸载，重新安装完整版的[wpad](https://openwrt.org/packages/pkgdata/wpad)。

```shell
# 首先根据https://mirrors.ustc.edu.cn/help/openwrt.html的指引换源，加快软件包下载速度
opkg update
opkg remove wpad-basic-wolfssl
opkg install wpad
```

安装完成之后，在WiFi连接界面就可以选择使用WPA2-EAP协议了。

### 网卡

由于不能用中继（Relay）的方式分享802.1x无线网络，因此只能用两张网卡配置成[双重NAT（Double NAT）](https://openwrt.org/docs/guide-user/network/switch_router_gateway_and_nat#openwrt_as_cascaded_router_behind_another_router_double_nat)。

我尝试使用树莓派的内置无线网卡连接校园无线网络，配置完成后却发现怎么都连接不上互联网，**我以为是我的配置出了问题**。在尝试了十几次重启、几次刷写系统之后，我发现，在宿舍搜索校园无线网络，信号强度仅有29%，这才是RPi的内置网卡无法连接的缘由。那也就意味着，需要用外置USB网卡用于接收信号，然后再利用RPi的网卡来广播信号。

一开始，**一味贪图高增益**，花了39.9999大洋购买了10dBi增益的[COMFAST 150Mbps CF WU770N V2](https://www.aliexpress.com/item/32805650319.html)，内置小螃蟹RTL8188GU无线芯片，好消息是，插上不识别。于是，一路退货。

查阅资料，OpenWrt的编译者[SuLingGG](https://mlapp.cn/)提到一句名言，[“珍爱生命，远离螃蟹”](https://mlapp.cn/1009.html#USB-%E6%97%A0%E7%BA%BF%E7%BD%91%E5%8D%A1)，于是仔细翻阅某东，大出血69大洋，购入了6dBi增益搭载了MTK方案的[翼联1691无线网卡](http://www.edup.cn/202102011054-2/)。果然，即插即用。

## 正式开工

### 配置Client

在`网络`->`无线`界面，我点击RPi自带的无线天线的`扫描`键，选中我想要连接的无线网络，点击`连接`。

{% include post-image.html link="post-wpa-eap/01.radios.png" alt="Dual Radios" %}

随后，在加入网络界面中，选择防火墙区域为wan。

{% include post-image.html link="post-wpa-eap/02.join.png" alt="Join 802.1x Wireless Network" %}

回到无线概况页面，我点击`修改`按钮，修改刚才加入的无线网络。在`基本设置`页面中设置模式为`客户端（Client）`，在`无线安全`页面中，设置加密为WPA2-EAP，EAP类型与认证、鉴权与密码按照平时连接的办法填写，其中鉴权就等同于用户名。

{% include post-image.html link="post-wpa-eap/03.security.png" alt="WPA2-EAP Security Settings" %}

### 配置AP

接下来，我开始着手配置EDUP 1691无线天线，点击`添加`，直接添加一个无线AP（Master）模式的无线网络即可，网络区域设为lan，`无线安全`按需配置。

## 大工告成？

在查找数十篇资料之后，依旧摸不着头脑。**在我的理解中，两张网卡之间需要配置一种特别的机制来让他们互相沟通**，结果在实际操作中，只需要将一张网卡设置在防火墙wan区域，一张网卡设置在lan区域，他们就能开始协作。全部步骤加起来竟不足十行。

造化如流水，扁舟一叶，不知将往何方。

{% include post-image.html link="post-wpa-eap/04.results.png" alt="Results" %}

桥接不可能桥接的网络，让人喜极，而究其结果，却也让人兴叹。连接上的网络协商速率只有27Mbps，经过我的测试，实际访问互联网的速率只有4Mbps，完全不堪1202年的日常使用。此外，位于双层NAT背后的终端设备也无法获取到IPv6地址。如此，只得作罢。

## 工欲善其事，必先利其器

802.1x协议，被书写成了一种加在开放网络上的枷锁。

在我尝试桥接802.1x网络的过程中，我也感到几乎所有人都在试图告诉我，它不开放，它不能被共享。我几乎找不到任何关于无线桥接802.1x网络的资料，**我原所以为的，最终几乎都在实践中被证明是错误的**。几乎可以说，协议相关知识的局限、封闭，与802.1x协议本身的隔离作用、不可共享又组成了一种新的二元性。

我意识到在很多时候，学堂就好比使用802.1x协议的无线网络，知识就成了其中流淌的无线信号。知识是开放的，但它的传播与共享又仅限于学堂这一时空，如果你希望让知识在别一个时空发生流动，你只有两种选择，其一，妥协，坐进学堂，再从学堂里将知识带出来，其二，反抗，将知识的流动从固定的时空中引出来，但必须有人自发的去做那个“桥接者”，必须有人付出额外的努力。

说白了，每个专业领域都仿佛是围城，不可共享的知识远多过可共享的，这座围城最基本的建筑，便是教育。