---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Sideload
- macOS
- iOS
title: 'A Side Dish: Sideloadly IPA Sideload'
---

There are numerous movies stored on the hard drive at home, but without a suitable player, it's as good as useless. The user-friendly infuse player for iOS comes at a high price, and the popular Kodi among enthusiasts is not available on the Apple Store. The only way out is sideloading—installing IPA software packages directly from the computer to iOS devices.

As Professor Jiang Zhongding once said, competitive analysis is the crucial process to determine product demand. So, we won't take any shortcuts here; we'll go the usual route:

1. Xcode: Direct installation always prompts "Unable to install", and a solution is currently unavailable.
2. PP Assistant: With complex functionality, it automatically installs bundled apps when connected and is quickly uninstalled.
3. AltStore: Free developer accounts can only sideload 3 apps on one device, with AltStore taking up one spot, so sacrifices must be made. Additionally, AltStore currently does not support Kodi installation, although the [AltStore developer claims the bug is fixed](https://github.com/rileytestut/AltStore/issues/7). However, when I tried installing, AltStore crashed and failed.

Therefore, Sideloadly becomes the great savior, lacking only the iOS resinging function AltStore has. It boasts all other functionalities, is relatively easy to operate, and can perfectly install Kodi—a side dish.

{% include post-image.html link="post-sideloadly/sidedishly.png" alt="A Side Dish with Sideloadly Toppings" %}

## Sideloading IPA from macOS

Sideloadly supports both Windows and macOS, and I happen to have a regular M1 MacBook on hand. I used it to install the ordinary Kodi on my basic iPad mini.

### Setting up a Developer Account

Since Sideloadly requests an Apple ID password to log into Apple's servers and obtain a certificate file, I even saw an unknown iMac under my Apple account the first time I used it, which made me feel my life was hanging by a thread (scary.jpg).

So, I created a dedicated Gmail and Apple ID to prevent personal privacy and payment information from being stolen.

> Official Sideloadly recommendation: [We also recommend using Sideloadly on a disposable Apple account for now](https://sideloadly.io/). Better safe than sorry.

Next, configure the developer certificate in Xcode.

#### Creating a Personal Development Team

Open Xcode preferences from the top toolbar, go to the Accounts tab, click the "+" button in the bottom left corner to add an Apple account.

{% include post-image.html link="post-sideloadly/developer-account.png" alt="New Developer Account" %}

Following the prompts, click Manage Certificates, and add an Apple Development certificate.

{% include post-image.html link="post-sideloadly/developer-certificates.png" alt="Creating Developer Certificates" %}

> According to Apple's policy, a free personal developer account can sign 10 apps simultaneously. Signed apps cannot be removed; they will auto-expire after 7 days.

### Signing the App Package with iOS App Signer

If the software package is a .ipa file, it can be signed and installed directly through Sideloadly. However, if it's a .deb file, signing with iOS App Signer beforehand is necessary to package it into an IPA file.

iOS App Signer can be downloaded and used from the [official website](https://www.iosappsigner.com/).

I opened the iOS App Signer, selected the Kodi package to sign, chose my developer ID, selected "Re-sign Only", clicked start, and obtained the IPA file in a moment.

{% include post-image.html link="post-sideloadly/ios-app-signer.png" alt="Signing with iOS App Signer" %}

### Sideload!

"Successfully installed!"

I also [downloaded Sideloadly from the official website](https://sideloadly.io/).

Next, I opened Sideloadly, clicked the top left icon to select the IPA file just signed.

{% include post-image.html link="post-sideloadly/sideloadly-interface.png" alt="Sideload!" %}

Connect the iPad to the computer and select it from the dropdown menu. Interestingly, Sideloadly also supports app sideloading to M1 laptops.

Then enter the developer account in the Apple account section.

If modifications to the app name, Bundle ID, etc., are needed, click on advanced options for configuration.

Click start, watch the log scroll, and voila, successful installation!

### Trust the Developer Account

After installation, I could see Kodi on my iPad. But when I tried to open it, a prompt to trust the developer account appeared.

Go to Settings -> General -> VPN & Device Management, click on the developer account used previously, and click trust.

Now, I could use Kodi smoothly.

## Sideloading Apps with Chinese Names

Both AltStore and Sideloadly seem to have trouble with Chinese app names.

For example, when attempting to install the Fei Niao Downloader, Sideloadly gives an error directly.

```shell
Guru Meditation e05fe0@132:a45007 could not find executable for /var/folders/lw/ncc3_c9j7l70dny_3fpd25lr0000gn/T/tmpt0_8s1og/Payload/%CE%98%C3%BA%E2%82%A7%CE%98%E2%95%95%C6%92%CE%A3%E2%95%95%C3%AF%CE%A6%E2%95%9C%E2%95%9C%CF%83%C3%96%C2%BF.app
```

Seeing this long encoding string made me realize it translates to "Fei Niao Downloader." It seems Sideloadly struggles with recognizing Chinese app names, causing encoding errors.

So, I unpacked the IPA, opened the Payload folder, changed the software package `Fei Niao Downloader` to the English name `Bridy`.

Inside the package, I renamed the executable file `Fei Niao Downloader` to `Bridy`.

In Xcode, I modified the `Info.plist`, ensuring the `Bundle Name` matches the software package and the `Executable Name` matches the executable file.

{% include post-image.html link="post-sideloadly/bridy-plist.png" alt="Modifying Bundle Name" %}

After saving the `.plist` file and repackaging Payload into a `.zip` file with the extension changed back to `.ipa`, I could successfully install it using Sideloadly without encountering any errors.

## Is it Safe?

Apple advocates downloading apps from the App Store.

However, humans are never content and always linger in the orchard.

The full impact of taste-testing sideloaded fruits is unknown, not known to the orchard's snake, and perhaps even unbeknownst to Apple.

Yet, at this moment, it seems this is how the story must unfold. Human desires tend to overshadow everything, no matter the risks, no matter the consequences. What people want, they will find ways to obtain, by any means necessary.

The key difference between real-world sideloading and biblical stories is that God seems to accept this, while the "capitalist gods" never will because manipulating human desires is their way to make a living. But one misstep can cut off their financial path. Only controlled desires, or desires never fully satisfied, are their treasure trove.

However, this control is not necessarily entirely malevolent. The world requires a relentless pursuit of truth, goodness, and beauty to develop continuously. If human subjectivity keeps expanding, then the capitalist gods become mere tools, servants.

We always hold a kind and determined expectation for better, cheaper, and more fulfilling apps to enhance our quality of life. Even trying methods like sideloading, jailbreaking, and investing in development to get closer is not just about self-realization; it's also about affirming consumer desires and needs to the capital industry. People may not need to control capital, but they should make capital work for them, or else everything is in jeopardy.
