---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Life
- macOS
- 126
title: 126 Mailbox Login Error on macOS Mail after Password Reset
---

## macOS Mail

Out of some cleanliness considerations or perhaps due to some self-imposed limitations based on admiration for foreign things, I always prefer original, authentic, and factory-made products. The same goes for email. In the past, when using an Android phone to send and receive emails, I always preferred Google's native Gmail app. I really liked the round Material Design avatars, full of colorful charm; I enjoyed flipping a blue checkmark when long-pressing an avatar, as if I had received great approval.

On Windows, the UWP mail app is a must, and on macOS, the native Mail app is the way to go.

Clean. My first impression of macOS Mail was incredibly simple yet spotlessly clean. Emails were categorized for easy access, no sender avatars cluttered the interface, and the buttons at the top were neatly arranged. Although I wasn't sure about the multitude of arrows that indicated different functionalities, it gave me a sense of security with its "feature-rich" layout.

{% include post-image.html link="post-macos/macos-mail.png" alt="macOS Mail App" %}

I never thought that the peaceful and straightforward Mail would one day clash with the 126 mailbox, causing such a tangled mess.

## 126 Mailbox Login Issue

It wasn't until I tried to log in to my email on my iPad Mini 6 that I remembered forgetting my email password. So, in a rush, while listening to the teacher's lecture, I changed the email password. However, after obtaining the IMAP authorization code, I found that I couldn't log in to the SMTP client on either my iPad or MacBook.

{% include post-image.html link="post-macos/login-error-126.png" alt="Login Error When Using 126 with macOS Mail" %}

I've been using Mail to manage my 126 mailbox for almost a year now. I never imagined, nor did I ever think I would encounter such a problem—this is almost one of the most basic functions of a computer system.

## In the End, I Have No Idea Who Saved Me

The internet's "old Chinese doctors" proposed all sorts of solutions.

Reading through these contradictory and even self-contradictory "folk remedies" in class made me anxious. But with no other choice, I had to make the best of a bad situation.

The macOS bug critics often argue that there is an issue with the [input box design on macOS](https://www.zhihu.com/question/42011333/answer/394663477); you can't paste the password directly. Instead, you have to manually enter the 20-character authorization code - a tedious task. I tried pasting the code directly from a text editor into the password field on both my MacBook and iPad, but all attempts failed. Only manual entry seemed to work for a successful login.

Those critical of NetEase pointed out that NetEase [imposed restrictions on SMTP login](https://discussionschinese.apple.com/thread/252612004?answerId=254921787322#254921787322) to promote their own Mail Master app. To verify this view, I tried logging into the web version and NetEase Mail Master to bypass the so-called first-time login restrictions. However, even after logging into NetEase Mail Master, there was no guarantee that the next SMTP login attempt would be successful.

As I left the classroom, everything remained unresolved. Despite feeling uneasy, I forced myself to have dinner and tried to put it out of my mind.

Who would have thought that upon returning to my dorm and connecting to WiFi, I opened Mail with a hopeful attitude and entered the authorization code letter by letter, only to log in successfully. Faced with the finally loaded email list, I had no idea which step had saved me.

## I Have No Idea

Many times, "I have no idea" is either the first or the last sentence I use to start a conversation. Some might think that I am unwilling to think or act; others might feel that I haven't figured it out yet and need to take steps to explore this world. And then there are those, like myself, who feel that not all questions have answers - although clearly, I don't want to fall into the trap of nihilism. What I mean is that effort and experimentation are necessary, it's not always about overthinking, just do what needs to be done, don't worry about knowing the outcome, or what pulled us through along the way. 

Looking back, it's hard to pinpoint which step saved me and resolved the "I have no idea."
