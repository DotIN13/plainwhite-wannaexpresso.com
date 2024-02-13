---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Life
- Raspberry Pi
- OpenWrt
title: 'Share The Unsharable: Bridging 802.1x Wireless Network'
---

Mid-autumn evening, sharing a mooncake with two people; dining together, sharing a lobster among four people; sitting in Starbucks, sharing a cigarette with a room full of people. Most of the time, scarcity is the ultimate reason for sharing. It is almost instinctual for humans that when I have something you don't, there is often an impulse to share, of course, this impulse can be suppressed through learning and training.

There are also very few cases where sharing is considered highly inappropriate, such as physical illnesses, chickenpox, or COVID, which is internal, from one's own willingness, do not do unto others what you do not want done to yourself. There are also external situations where those in power who change rules, use violence, refuse to share with the governed, or even more directly, are unwilling or unable to share their resources with others.

802.1x belongs to the latter. For some reasons that I cannot understand for now, enterprise-level wireless networks generally use the 802.1x protocol to isolate different clients (Client Isolation), which means that clients on the same network segment cannot communicate directly with each other. Interestingly, this technology seems to possess a certain duality, not only does it prevent the sharing of messages between clients, but it also cannot be shared through relaying. As an open wireless network in schools, companies, hotels, and other areas, the use of this protocol gives it a slightly closed-off aura.

Not that I am determined to go against the tide - after all, I do not wish to disrupt any network systems - but if I could bridge the campus wireless network around the dormitory, then I could directly connect to the campus network in the dormitory, perhaps even avoiding the expense of the dormitory network, which would be an interesting experiment. Of course, all this is based on the premise that the school won't be blown up :P.

## Preparation

### Raspberry 4B + OpenWrt

For the device, I used a regular Raspberry 4B with a basic OpenWrt system installed.

### wpad

The OpenWrt compilation by [SuLingGG](https://mlapp.cn/) comes with [wpad-basic-wolfssl](https://openwrt.org/packages/pkgdata/wpad-basic-wolfssl) that does not support WPA2-EAP, thus it needs to be uninstalled and the full version of [wpad](https://openwrt.org/packages/pkgdata/wpad) needs to be installed.

```shell
# First, follow the instructions at https://mirrors.ustc.edu.cn/help/openwrt.html to change the source, speeding up the software package download
opkg update
opkg remove wpad-basic-wolfssl
opkg install wpad
```

After installation, the WPA2-EAP protocol can be selected in the WiFi connection interface.

### Network Cards

Since sharing 802.1x wireless networks cannot be done via relaying, two network cards must be used to configure [Double NAT](https://openwrt.org/docs/guide-user/network/switch_router_gateway_and_nat#openwrt_as_cascaded_router_behind_another_router_double_nat).

I attempted to use the Raspberry Pi's internal wireless card to connect to the campus wireless network, but after configuring it, I couldn't connect to the Internet no matter what, **I thought there was an issue with my configuration**. After trying to restart dozens of times and flashing the system a few times, I discovered that in the dormitory, the campus wireless network only had a signal strength of 29%, which was the reason why the RPi's internal network card couldn't connect. This meant that an external USB network card was needed to receive the signal, and then the RPi's network card could be used to broadcast the signal.

At first, **greedily seeking high gain**, I spent 39.9999 yuan buying a 10dBi gain [COMFAST 150Mbps CF WU770N V2](https://www.aliexpress.com/item/32805650319.html), with a built-in RTL8188GU wireless chip, the good news is, it didn't recognize when plugged in. So, it was all returned.

After consulting, SuLingGG, an OpenWrt compiler, mentioned a famous saying, [“Cherish life, stay away from crabs”](https://mlapp.cn/1009.html#USB-%E6%97%A0%E7%BA%BF%E7%BD%91%E5%8D%A1), so after careful searching on a certain e-commerce platform, I spent a whopping 69 yuan, and purchased a 6dBi gain [EDUP 1691 wireless card](http://www.edup.cn/202102011054-2/) with the MTK solution. As expected, plug and play.

## Let's Start

### Client Configuration

In the `Network` -> `Wireless` interface, I clicked on the `Scan` button for the RPi's built-in wireless antenna, selected the wireless network I wanted to connect to, and clicked `Connect`.

{% include post-image.html link="post-wpa-eap/01.radios.png" alt="Dual Radios" %}

Then, in the network joining interface, I set the firewall zone to wan.

{% include post-image.html link="post-wpa-eap/02.join.png" alt="Join 802.1x Wireless Network" %}

Returning to the wireless overview page, I clicked the `Edit` button to modify the previously joined wireless network. In the `Basic Settings` page, set mode to `Client`; in the `Wireless Security` page, set encryption to WPA2-EAP, fill in EAP type, authentication, and password as usual, where authentication is equivalent to username.

{% include post-image.html link="post-wpa-eap/03.security.png" alt="WPA2-EAP Security Settings" %}

### AP Configuration

Next, I began configuring the EDUP 1691 wireless antenna, clicked `Add`, and directly added a wireless AP (Master) mode wireless network, setting the network zone to lan, and configuring the `Wireless Security` as needed.

## Mission Accomplished?

After searching through dozens of articles, I was still puzzled. **In my understanding, a special mechanism is needed between two network cards to allow them to communicate with each other**. However, in actual practice, all that was needed was to set one network card in the firewall's wan zone and the other in the lan zone, and they could start working together. All the steps combined were less than ten lines.

Destiny flows like a river, a boat, a leaf, uncertain of its destination.

{% include post-image.html link="post-wpa-eap/04.results.png" alt="Results" %}

Attempting to bridge networks that cannot be bridged can be exhilarating, but in the end, it can also be disheartening. The negotiated connection rate is only 27Mbps, and after testing, the actual Internet access speed is only 4Mbps, far from suitable for daily use in 1202. In addition, the devices behind the double NAT cannot obtain an IPv6 address. Therefore, it had to be abandoned.

## To Do Good Work, Utilize the Right Tools

The 802.1x protocol has been written as a shackle on an open network.

During my attempt to bridge the 802.1x network, almost everyone seemed to be trying to tell me that it is not open, it cannot be shared. I could hardly find any information on bridging 802.1x wireless networks, **what I originally thought, almost all of it proved to be wrong in practice**. It can almost be said that the limitations and isolation of protocol-related knowledge, along with the isolating and non-shareable nature of the 802.1x protocol itself, constitute a new duality.

I realized that many times, academia is like using a wireless network with the 802.1x protocol, where knowledge flows like wireless signals. Knowledge is open, but its dissemination and sharing are limited to academia. If you wish for knowledge to flow in a different space-time, you have only two choices, either compromise, sit in academia, and then bring knowledge out, or resist, draw knowledge's flow out of a fixed space-time, but someone must voluntarily be that "bridge," someone must make extra effort.

In essence, every professional field seems like a walled city, where there is far more knowledge that cannot be shared than can be. The basic structure of this walled city is education.

