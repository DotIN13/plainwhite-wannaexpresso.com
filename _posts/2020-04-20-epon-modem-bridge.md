---
layout: post
title: "将电信EPON光猫切换到桥接模式"
subtitle: "EPON Optical Network Terminal on Bridge Mode"
author: "DotIN13"
tags:
  - Network
  - Modem
  - ONT
  - Brigde
  - Router
typora-root-url: ../
locale: zh_CN
categories: [default]
---

## 购入Raspberry Pi

可能是吃得太饱，最近剁手了一片Raspberry Pi 4B。于是便打算搭建一个Aria2下载站，这就涉及到公网IP和端口转发的问题了。

{% include image.html link="/img/in-post/post-modem-bridge/raspberrypi.jpg" alt="RaspberryPi 4B" %}

于是便兴冲冲给电信打电话，也不知客服是真不知假不知，总之是推说不清楚情况，转单给维修师傅。维修师傅一查，不得了，本就是公网IP，电话那头听上去很忙的样子，随口问了我一句会不会端口转发，也不等我回话，就直接帮我结了单，挂了电话。

我本以为端口转发是动动手指的事，便也没放在心上，不料到真正操作的时候，问题蹦了出来。端口转发需要更改主路由的设置，而家中是光猫作主路由，没有超级管理员密码可没法修改。

不得已，又报障……

## 一回生，二回熟

维修师傅又见我来电，一边心疼重复修障扣掉的工资，心里滴着血，一边给我回复说，“行，我帮你后台修改桥接模式”。

> 此处向维修师傅道歉，折腾不说还让人家受了累。
>
> 此外，对桥接稍作解释：
>
> Bridge mode is the configuration that disables the NAT feature on the modem and allows a router to function as a DHCP server without an IP Address conflict.
>
> 简单来说，桥接模式关闭了调制解调器（猫）上的NAT功能，使得它连接的路由器来充当DHCP服务器管理IP地址租约。可以简单地将这时的光猫理解为带有光信号转换功能的普通网线，所有高级路由设置都将在路由器上生效。

不久师傅又来电，后台修改失败，我便折中地提出由我自己来修改。师傅欣然答应，帮我查找了登陆信息。可当我登陆上`192.168.1.1`的光猫界面，一下傻眼了。这配置界面可比一般的路由器要高端不少，甚至还能看到光纤的光信号特征数据。黑猫里摸瞎子，在网上搜集了不少资料，总算是有了些头绪。

{% include image.html link="/img/in-post/post-modem-bridge/modem.png" alt="ONT Settings" %}

在`网络`->`宽带设置`里找到连接名称，下拉菜单选取名字里带有INTERNET字样的选项。点击可以看到拨号的帐号与密码，将模式修改为Brigde（桥接）。

这些还算简单，这VLAN可是难倒了我，接上路由器一直没法拨号成功。短信维修师傅，可他似是被我气到，再不回消息，在网上搜了半天，最后模模糊糊地看到有41用作桥接的说法，填上一试，竟然直接拨上了号。

然后就简单了，路由器上设置端口转发，DNS设置域名解析，一个aria2终端便大功告成。

功夫不负有心人！