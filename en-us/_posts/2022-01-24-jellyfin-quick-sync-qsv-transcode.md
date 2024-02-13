---
author: DotIN13
layout: post
locale: en-us
series: Jellyfin x Manjaro
subtitle: null
tags:
- Jellyfin
- Manjaro
- Intel QSV
title: 'Chapter 3: High Definition Video Compatibility Issues - Quick Sync Comes to Rescue'
---

> This product does not contain preservatives, additives, and complete configuration tutorials. If needed, please refer to [How to Elegantly Enable QSV for Jellyfin on Manjaro (Automatic)](/2023/05/03/how-to-elegantly-enable-qsv-for-jellyfin-on-manjaro/).

What's the deal with the Celeron G5905? It's already 2022, and it's still stuck on dual-core dual-thread. Can it handle the task at hand?

Seems somewhat decent (whispers 🤫), with its built-in UHD 610 seemingly capable of transcoding streaming videos... but... it's a bit temperamental. If the drivers aren't properly installed, this integrated graphics card will immediately shift the blame to the CPU - causing the CPU to overload and the transcoding to fail.

Speaking quietly again: Why call video encoding acceleration "Quick Sync" 😮‍💨... 

## QSV Transcoding Failure

I selected the `Intel Quick Sync` hardware accelerator and tried playing my 4K HDR HEVC video under the `Playback` tab in the `Dashboard`. However, after a series of attempts, I realized it wasn't playing. An error message popped up, stating that the provided video from the server was incompatible with the client.

```plaintext
This client isn't compatible with the media, and the server isn't sending a compatible media format.
```

Feeling quite distraught - what's the use if it can't play? Your UHD 610 is no different from my J3160's HD400! But then, I had another thought; maybe it's due to insufficient network speed, as the transcoding 4K 120Mbps video bitrate might be too high. So, I connected to my beloved Z490i UNIFY Thunderbolt bridge, tried playing the video in Jellyfin, and it still froze.

## Manjaro GPU Driver Stumbling

It dawned on me that the logs could save the day. So, I directly accessed the FFmpeg logs on the web interface and saw the following error:

```plaintext
Failed to initialise VAAPI connection: -1 (unknown libva error).
```

Could it be that even Manjaro, the dapper of Linux distros, can falter with GPU drivers?

Believe it or not, it's true. Linux's QSV relies on the VAAPI interface, hence the failure to initialize VAAPI likely indicates a driver installation issue; the `unknown libva` error also points in the same direction.

So, I swiftly navigated to the [Intel Media Driver GitHub project](https://github.com/intel/media-driver) page, only to discover that it required compilation. Heading back, I searched Pacman and found that Manjaro already provides the `intel-media-driver` package for everyone to download.

```shell
sudo pacman -S intel-media-driver
```

After installation, the `vainfo` command could now recognize the GPU driver.

## Teamwork Makes the Dream Work

Another play attempt? Still an error.

```plaintext
Device creation failed: -1313558101.
Failed to set value 'qsv@va' for option 'init_hw_device': Unknown error occurred
Error parsing global options: Unknown error occurred
```

Since the driver was recognized, the issue must lie with FFmpeg. The FFmpeg package that comes with Manjaro lacks support for libva, causing issues with invoking qsv acceleration.

However, the official jellyfin-ffmpeg transcoding package is only available for Ubuntu and Debian. When used in Manjaro, it results in compatibility issues with library files; for example, the latest Manjaro systems have upgraded `libva.6.so` to `libva.7.so`, while the package lacks this updated file, rendering it unusable. Manually downloading and installing each library file is feasible but overly complex.

Hence, I reluctantly resorted to self-compilation. After compiling following the [jellyfin-ffmpeg dockerfile](https://hub.docker.com/r/jellyfin/ffmpeg/dockerfile), I selected the self-compiled ffmpeg in Jellyfin's Playback settings.

Opening the web client, I chose `Settings` -> `Playback` and enabled `Prefer fMP4-HLS Media Container`, and turned on the HEVC support, allowing for the transcoding of 4K HDR HEVC videos at reduced bitrates for viewing.

{% include post-image.html link="post-jellyfin/hevc-container.png" alt="Enable fMP4 Container for HEVC Streaming" %}

With hardware drivers and software compatibility, teamwork makes the dream work.

## Epilogue

About half a month after installing the driver, I checked the GPU usage with `sudo intel_gpu_top` - everything was back to zero - not a good sign.

Reviewing the FFmpeg logs revealed no abnormalities, just that the video transcoding speed had decreased to around `0.5x`. The transcoding command was different from the typical one.

Perplexed, I revisited the main program logs and discovered the issue with `ffprobe`. `ffprobe` failed to correctly identify the video format, leading to erroneous transcoding commands. Through **careful investigation and thinking**, I realized that I had compiled FFmpeg using the latest source code version 5.0, yet Jellyfin only supported up to version 4.4.1 - the version difference caused Jellyfin's internal `ffprobe` command to incorrectly recognize the video format.

After recompiling FFmpeg 4.4.1, the video played smoothly. Victory is mine!
