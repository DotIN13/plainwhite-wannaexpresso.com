---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- MateBook
- Huawei
- Life
title: Changing a Screen, Changing a Mood
typora-root-url: ../
---

## Stripes

Whenever I open my precious MateBook on the desk, horizontal and vertical stripes start frolicking playfully on the Windows desktop. Adjusting the opening angle is like a camel finding its balance point, restoring to its original state.

## Difficult to Please

Initially, I had no intention of replacing the screen for my darling. First of all, from a technical standpoint, adjusting the laptop's opening angle to display properly, I thought it was simply a screen cable issue that could be solved by replacing the cable. Secondly, whether it's an official service center or a repair shop, they all follow a one-stop process from purchasing parts to assembling them. Usually, when you buy a screen, there's no need to take it home for replacement. Moreover, for such a minor task like screen replacement, it didn't really require a tech-savvy person like me to handle it (even though the reality proved otherwise, but exams still need to be taken).

However, reality always catches one off guard and goes against one's wishes.

Both the third-party store and the official service center believed it was screen damage rather than a cable issue (of course, not ruling out the possibility that they were too lazy to dismantle and replace the cable for a mere $50). What's more frustrating is that my darling's laptop had been dropped, no warranty, and the official service center quoted $1300—almost half the cost of a new laptop; the local store didn't have the screen in stock, and several days passed without any supply updates.

## Determination

After checking a repair video for the [Ryzen version of Matebook 14](https://www.bilibili.com/video/BV1Xv411E72i/), it didn't seem too complicated and didn't require a heat gun and glue removal. I instantly felt confident.

A quick search on a certain e-commerce site showed the same store as in the video, offering the screen and cable for half the price of the official service center, claiming to be original and fitting perfectly just like the official one.

Without hesitation, I took a gamble, directly contacted the customer service, and got the screen and cable for $590 (in hindsight, I probably got ripped off since the same store now offers the screen alone for $550, simple math, that coaxial cable cost me $40).

## Heart-Pounding Moments

After tearing down the laptop, I realized that the internals were significantly different between the Intel version and the Ryzen version. Despite that, I had already started, so I proceeded cautiously (looking back, if I had damaged my darling's laptop, I would have ended up buying a MacBook).

Shut down the laptop and removed the battery... Oops, wrong scene, here, you just need to disconnect the battery cable.

{% include post-image.html link="post-fixit/matebook-main-components.png" alt="Main Components of The MateBook 14 2019" %}

Then, disconnect the screen cable.

Lift the BTB cable from the fan and pull out the main and auxiliary Wi-Fi antennas.

Opened up the screen to a level where the bottom shell could be removed, unscrewed the four screws of the hinge, and separated the screen from the bottom shell.

At this point, I thought I had reached a dead-end. The upper part of the machine seemed seamless, like a solid piece of metal. However, with careful observation for half an hour, I found a breakthrough—removing the hinge cover plate first, followed by the plastic tabs on the left and right sides of the hinge, the bottom edge of the screen became visible.

{% include post-image.html link="post-fixit/matebook-hinge.png" alt="Disassembling The Display" %}

There was an adhesive tab pointing downwards at the bottom right corner of the screen, unknown to me that the tape inside was horizontal, I accidentally tore it off while pulling.

At that moment, half of my confidence vanished, thinking I had to go directly to Huawei and pay up. However, with my darling's enthusiastic encouragement and support, I managed to wedge a pick into the bottom right corner of the screen, trying to separate the screen from the frame. Surprisingly, it worked!

{% include post-image.html link="post-fixit/matebook-front.png" alt="Adhesives under The Screen" %}

I pried open the loosened screen from the top and found the horizontally aligned adhesive strip at the bottom still sticking firm. Trying to pry the screen directly would most likely shatter it, so I had to remove the tape first. Fortunately, the adhesive strip could be pulled out with tweezers, and after accidentally sticking the screen back to the frame five times, I finally "easily" removed the screen.

Calmly, I connected the new coaxial cable and screen to the motherboard, powered on, and everything worked perfectly. Then, I disconnected the battery, unhooked the coaxial cable from the motherboard, replaced the adhesive tape provided by the store to the previous adhesive position (the seller didn't provide adhesive tape, so there shouldn't be another screen replacement in the future), removed the double-sided adhesive around the screen, and attached the new screen to the frame.

Next was simple—reassembled the hinge cover plate and plastic tabs on both sides, reconnected the upper and lower parts through the hinge, connected the screen cable, Wi-Fi antennas, BTB cable, and finally, the battery cable.

Plugged in, powered on, lit up. Double-tap on the phone screen, exactly two hours.

## Lonely Heart

A scarlet blossom bloomed on the screen, four petals on the left, four on the right, symmetrically delightful. There was a sense of accomplishment for a moment, but it quickly dissipated, leaving only a lonely heart.

Often, when you achieve something, you can only admire it alone. In a military camp, even if you can't hold on, you still face the sun, endure the pouring sweat, withstand the chaotic and restless thoughts, and be a good soldier in the ranks; lying on a hospital bed, the anesthesia wears off, enduring the pain of the surgery, frowning in silence; sitting in front of a computer, solving a monumental coding problem, only to realize it was merely self-amusement.

Not everything is an exam where someone grades me or evaluates me among others. Many difficult tasks, when accomplished, do not receive applause, and not achieving them only results in receiving some ridicule.

Furthermore, some who failed to accomplish something receive rewards for remedying the situation, while those who succeeded are engulfed in the crowd. As Huang Teacher sharply and profoundly pointed out in ["Thoughts on Life Education Inspired by the Wuhan Disaster and the Zhengzhou Flood "](https://mp.weixin.qq.com/s/dnnRj_p9VMfnh6_ayw6yxg), heroes emerge in flood disaster areas, while those who prevented disasters from entering the doorstep are neglected.

Those who step forward are indeed admirable, but those who persist for years also deserve applause. ["They" in 2008](https://learning.sohu.com/20080619/n257598504.shtml), are they still the same?
