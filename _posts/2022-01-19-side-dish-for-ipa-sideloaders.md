---
layout: post
title: "小菜一碟：Sideloadly IPA侧载"
subtitle: "A Sideloadly Side Dish for IPA Sideloaders"
author: "DotIN13"
tags:
  - Sideload
  - macOS
  - iOS
locale: zh-cn
---

家里的硬盘装了众多电影，但如果没有合适的播放器也等于白搭。iOS好用的infuse播放器要价不菲，风靡发烧友圈子的Kodi又没有上架Apple Store，没有办法的办法，只好侧载——从电脑端直接向iOS设备安装IPA软件包。

姜钟鼎老师曾说过，竞品分析是确定产品需求的必经之路，那么我们这儿也不走捷径，走走寻常路：

1. Xcode：直接安装一直提示“Unable to install”，目前找不到办法解决。
2. PP助手：功能繁杂，连接自动安装捆绑App，直接卸载伺候。
3. AltStore：免费开发者账户只能在一台设备上侧载3个App，AltStore需要占用一个，需要取舍；且AltStore目前尚且不支持安装Kodi，虽然[AltStore开发者认为bug已经修复](https://github.com/rileytestut/AltStore/issues/7)，但我尝试安装时AltStore直接闪退失败。

所以，Sideloadly成为了伟大的救世主，相比AltStore仅仅缺少了iOS端的续签功能，其他功能一应俱全，操作相对简单，可以完美安装Kodi，小菜一碟。

{% include post-image.html link="post-sideloadly/sidedishly.png" alt="A Side Dish with Sideloadly Toppings"%}

## 从macOS侧载IPA

Sideloadly同时支持Windows与macOS，我手头的就是一台普普通通的M1 MacBook。我用它给我普普通通的iPad mini安装了平平无奇的Kodi。

### 配置开发者账户

由于Sideloadly会要求输入Apple ID密码来登陆苹果服务器获取证书文件，我第一次使用时甚至在我的Apple账户名下出现了一台未知的iMac，顿时感到自己的生命安全悬于一线（害怕.jpg）。

因此，我又注册了一个专用的Gmail和Apple ID，来防止个人隐私与支付方式被盗用。

> Sideloadly官方提醒：[我们推荐大家使用一次性Apple ID（We also recommend using Sideloadly on a disposable Apple account for now）](https://sideloadly.io/)。属于是此地无银三百两了属于是。

接下来在Xcode配置开发者证书。

#### 创建个人开发团队

从顶部工具栏打开Xcode首选项（Preferences），打开账户（Accounts）标签页，点击左下角“+”号添加Apple账户。

{% include post-image.html link="post-sideloadly/developer-account.png" alt="New Developer Account" %}

按照提示添加后，点击管理证书（Manage Certificates），添加一个苹果开发者证书（Apple Development）。

{% include post-image.html link="post-sideloadly/developer-certificates.png" alt="Creating Developer Certificates" %}

> 根据Apple政策，一个免费个人开发账户只能同时对10个应用进行签名，签名不能删除，只能等待7天自动失效。

### 使用iOS App Signer签名应用包

如果软件包是`.ipa`文件，可以直接通过Sideloadly签名安装，但如果是`.deb`文件，就需要使用iOS App Signer事先签名，打包为IPA文件。

iOS App Signer可以从[官方网站下载使用](https://www.iosappsigner.com/)。

打开后，我选择需要签名的Kodi软件包，选取了我的开发者ID，选择仅重新签名（Re-sign Only），点击开始，片刻后就获得了IPA文件。

{% include post-image.html link="post-sideloadly/ios-app-signer.png" alt="Signing with iOS App Signer" %}

### Sideload!

“赛（第三声）夺楼的！”

Sideloadly同样[从官方网站下载](https://sideloadly.io/)。

随后我打开了Sideloadly，点击左上角图标选取了刚才签名得到的IPA文件。

{% include post-image.html link="post-sideloadly/sideloadly-interface.png" alt="Sideload!" %}

将iPad连接电脑，在下拉菜单中进行选择。有趣的是，Sideloadly还支持向M1笔记本侧载应用。

然后在Apple账户一栏输入开发者账户。

如果需要修改App名称、Bundle ID等，可以点击高级选项进行配置。

点击开始，日志滚动，安装成功！

### 信任开发者账户

安装后我已经可以在iPad中看到Kodi了。但我一点开就提示需要信任开发者账户。

打开设置（Settings）->通用（General）->VPN与设备管理（VPN & Device Management），点击刚才使用的开发者账户，点击信任。

打开Kodi，已经可以正常使用。

## 侧载带有中文名的应用

无论是AltStore还是Sideloadly，似乎都不能很好地兼容中文应用名。

例如在[安装飞鸟下载器](https://app.feiniaobt.com/ios_go)时，Sideloadly会直接报错。

```shell
Guru Meditation e05fe0@132:a45007 could not find executable for /var/folders/lw/ncc3_c9j7l70dny_3fpd25lr0000gn/T/tmpt0_8s1og/Payload/%CE%98%C3%BA%E2%82%A7%CE%98%E2%95%95%C6%92%CE%A3%E2%95%95%C3%AF%CE%A6%E2%95%9C%E2%95%9C%CF%83%C3%96%C2%BF.app
```

看到这一长串编码，猜想转换成中文就是“飞鸟下载器”。似乎Sideloadly并不能正确识别应用的中文名称，产生了编码错误。

于是我解压IPA，打开Payload文件夹，修改软件包`飞鸟下载器`为英文名称`Bridy`。

进入软件包，再修改可执行文件`飞鸟下载器`为英文名称`Bridy`。

用Xcode打开`Info.plist`，修改`Bundle Name`，使之与软件包相同；修改`Executable Name`与可执行文件相同。

{% include post-image.html link="post-sideloadly/bridy-plist.png" alt="Modifying Bundle Name" %}

将`.plist`文件保存后将Payload重新打包为`.zip`文件，修改后缀名为`.ipa`。

然后再使用Sideloadly安装，便不再出错。

## 安全吗

Apple说，人应当从App Store下载应用。

但凡人却总是不满足，在果园徘徊。

偷尝侧载的果实究竟有什么实质的损害，人一定不知道，果园的蛇未必知道，或许Apple也不知道。

但似乎时间走到这一刻，故事就应该这样发展，人的欲望总是压倒一切的，不管危害有多大，不管后果多严重，人想要的东西，人一定会去想尽办法得到。

现实世界的侧载与圣经故事的最大不同就在于，上帝似乎接受了这一点，而“资本家上帝”们绝不会接受，因为虽说操纵人的欲望是他们的生财之道，但只要稍有不慎，就会断了自己的财路。只有受控的欲望，或者说，永远得不到全然的满足的欲望，才是他们的聚宝盆。

但这种控制不一定是全然恶性的，人的世界需要不断更新的对真善美的追求才能够得以发展，如果人的主体性不断地扩张，那么资本家上帝最终扮演的是工具，是奴仆。

我们对更优质、更便宜、更能满足我们美好生活需要的App始终抱有良善而决绝的期待，甚至于尝试通过侧载、Jailbreak、自己投入开发等等办法去努力靠近，这不仅仅是自我价值的实现，更将向资本产业宣誓消费者的愿望与需求。人不一定需要控制资本，但要让资本为我所用，本末倒置则殆矣。
