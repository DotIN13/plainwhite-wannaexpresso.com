---
layout: post
title: 如何优雅地开启Google Feed
subtitle: How To Enable Google Feed in China
date: '2020-01-12T20:36:00.005+08:00'
author: DotIN13
tags:
- Android Dev
- Google
- Google Feed
modified_time: '2020-01-12T20:45:09.995+08:00'
blogger_id: tag:blogger.com,1999:blog-7275524089009887162.post-4817984860099133336
blogger_orig_url: https://dotin13laf.blogspot.com/2020/01/google-feed.html
locale: zh-cn
---

<h2 id="准备工作">准备工作</h2>通过Magisk Manager下载安装Riru-Core与Riru-Location Report Enabler两个模块，用以伪装成非大陆的运营商，便能稳定开启Google位置报告、Google
Feed、Pixel桌面天气、完整显示Play Store应用等功能。<br />
<hr />
<h2 id="开启Google Feed和天气">开启Google Feed和天气</h2>
如果你手机的桌面支持侧拉拉出Feed，或者你的 Pixel Launcher/Android One Launcher等谷歌系的启动器应用已经在system分区，机身也已经装有
Google（即Google 搜索）App，而且登陆了Google账户，但是Feed就是刷不出来，那么你需要：<br />
<ol>
    <li>开启飞行模式（拔出SIM卡）；</li>
    <li>点进设置 → 系统 → 语言和输入法（Android 7是设置→语言和输入法），把系统语言切换成英语；</li>
    <li>在设置 → Security &amp; Location → Location（Android 7是设置→Location）里把定位服务关闭（off）；</li>
    <li>如果已经登录了谷歌账户，负一屏内容为空白，麻烦接着从第5步开始执行，如果未登录可直接到第8步。</li>
    <li>进入设置里 → Apps &amp; Notifcation 选项 → See All Apps（Android 7是设置→Apps）；</li>
    <li>点右上角的竖省略号，选择Show System；</li>
    <li>清除Google Services Framework 、GooglePlay Services 、Google 这三个应用数据，清除就是点Storage 选项，再点Clear Data（Google Play
        Services是Clear Storage → Clear all data）；</li>
    <li>把你WiFi和代理打开；</li>
    <li>启动 Google App（未登录谷歌账户的需要在此步骤按照指引登录），Feed就能刷新出来了；</li>
</ol>之后你再设回中文，Feed依然会存在。此时你再开启系统的定位权限和Google App的定位权限，刷新一下或等一会儿，Feed、桌面和通知栏就会显示当地天气。（如果没有，就使用 Google
搜索并点进当地天气里，不久后就有了。）如果执行过一次还不行，你也可以到设置→账户里移除掉Google的登录账号，再进行上述操作。<br />
<p>转载自<a href="https://bbs.mokeedev.com/t/topic/10903">https://bbs.mokeedev.com/t/topic/10903</a>，有修改。</p>