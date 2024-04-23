---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Pi
- Life
title: Raspberry Pi Drop Dead
---

## Previous Life

I have been running [Raspberry OS + Aria2](/2020/04/21/aria-pi/) on my Raspberry Pi 4B as a download machine.

Unexpectedly, **the greatest enemy of electronic products is Mom**. During an urgent air conditioning repair operation, my mom directly unplugged the power strip with the Raspberry Pi plugged in — causing damage to the system disk.

Thus, the past life of the Raspberry Pi came to an end.

## Current Life

Learning from the past, I immediately spent a huge sum of 120 yuan to purchase the [Waveshare UPS-HAT](https://www.waveshare.net/wiki/UPS_HAT) on a certain e-commerce platform to prevent power outages from causing file system faults.

I thought I could rest easy now, but to my surprise, less than half a month later, the Raspberry Pi crashed again.

At 4 o'clock in the afternoon, I opened Aria2NG as usual, added a 70GB movie download link, and it failed. Staring at the failed download task for a few seconds, I was puzzled, but didn't think too much of it. Trying to add the task again, it still showed a red cross. Growing suspicious, I ran `df -h` and found that the partition where the download directory was located was no longer mounted.

Feeling a bit flustered, but with the confidence of a *senior Linux user*, I tried to remount the hard drive using `sudo mount -a` to use `fstab`. The system reported that it could not mount. Feeling determined, I shut down and restarted.

Little did I know, this would be the last time I would see my hard drive.

Plugging the Seagate hard drive that had worked with me for over two years into the ORICO hard drive enclosure, connecting it to the Raspberry Pi, and running `lsblk`, it was nowhere to be found. After several attempts to access it using SATA on a desktop computer, I only read a 3.7GB partition, running `fdisk`, `xfs_repair`, and so on, all resulted in a bleak `Input/Output Error`.

Thus, the current life of the Raspberry Pi came to an end.

## Successor

Feeling disheartened, I thought that maybe checking the logs could reveal whether the notorious ORICO hard drive enclosure had an issue or if Aria2's `falloc` file allocation method was the culprit.

To my surprise, running `journalctl -b-1` threw an error.

```shell
Specifying boot ID or boot offset has no effect, no persistent journal was found.
```

It turned out that the [default setting](https://askubuntu.com/a/864771) of `journalctl` is `Storage=auto` (`/etc/systemd/journald.conf`), which means that the logs stored in `/run/log/journal/<machine-id>/*.journal[~]` get deleted after a restart. To make journald store logs from the last boot, `Storage` must be set to `persistent`, or manually create `/var/log/journal/` under the `Storage=auto` condition.

Since the journald logs were lost, I had to manually check the log files under `/var/log/`.

```shell
pi@dottypi:/var/log $ ls
alternatives.log    daemon.log.2.gz  kern.log.2.gz  syslog.3.gz
...
```

The useful logs for me were the kernel logs `kern` and the system logs `syslog`. Checking the `aria2c` logs in `syslog.7.gz`, it appeared that an error occurred when I was downloading a movie in the afternoon:

```yaml
Aug 26 16:01:14 dottypi aria2c[498]: 08/26 16:01:14 [#033[1;32mNOTICE#033[0m] Download completed: [MEMORY][METADATA]Almost.Famous.2000.EXTENDED.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.5.1-FGT
Aug 26 16:01:14 dottypi aria2c[498]: 08/26 16:01:14 [#033[1;31mERROR#033[0m] Captured an exception
Aug 26 16:01:14 dottypi aria2c[498]: Exception: [AbstractDiskWriter.cc:224] errNum=5 errorCode=15 Failed to open file /mnt/Videos/Downloads/Almost.Famous.2000.EXTENDED.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.5.1-FGT/Almost.Famous.2000.EXTENDED.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.5.1-FGT.mkv, reason: Input/output error
Aug 26 16:01:14 dottypi aria2c[498]: 08/26 16:01:14 [#033[1;32mNOTICE#033[0m] Item with GID 437ddbc0a6eb7f5a did not complete: /mnt/Videos/Downloads/Almost.Famous.2000.EXTENDED.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.5.1-FGT
```

However, there were no hard drive error messages around 4 o'clock. Checking `syslog.1`, I found that the hard drive had already encountered problems around 9 o'clock in the morning.

According to the logs, it seemed that the sequence of events was as follows:

1. The hard drive encountered bad blocks;
2. The USB Attached SCSI system attempted a reset to solve the issue, but failed, leading to an immediate disconnection of the USB connection;
3. The XFS system logged an error, attempted to forcibly close and unmount the hard drive through systemd, but also failed.

However, it was unknown which step ultimately rendered the hard drive unreadable.

## Fourth Life

If the Raspberry Pi's journey was a convergence of the past, present, and successor, we can take our eyes off the object itself. Do things only involve my past self, present self, and future self? Perhaps not necessarily.

"I" am just "I", the Raspberry Pi only knows what happened to itself, or perhaps it might know what happened in the world around it — through sensors. We won't discuss omniscient beings here, but it can be foreseen that the Raspberry Pi cannot sense how others perceive it. The Raspberry Pi and the hard drive both suffered, and I would feel sad, shed tears, and fret over the lost data, and at times, when alone, reminisce about old photos that can no longer be seen. The biggest flaw of an ordinary person's third life is the inability to empathize with others' feelings, which is something the three lives cannot reconcile. Even if I feel like I understand someone else's thoughts, what I gain is merely my perception of their emotions, not pure, original feelings.

Writing this, I don't know what I'm saying.

As the "Visuddhimagga" says, "To know the past, find out its present results; to know the future, look at its present causes." Since this loss spanned three lives, it must be compensated for in the fourth life. Purchasing two hard drives for mutual backup, that's all.


## Appendix

<details>
<summary>
Logs
</summary>
{% highlight yaml %}
Aug 26 09:12:55 dottypi kernel: [808772.369054] sd 0:0:0:0: [sda] tag#1 UNKNOWN(0x2003) Result: hostbyte=0x00 driverbyte=0x08 cmd_age=12s
Aug 26 09:12:55 dottypi kernel: [808772.369096] sd 0:0:0:0: [sda] tag#1 Sense Key : 0x3 [current] 
Aug 26 09:12:55 dottypi kernel: [808772.369132] sd 0:0:0:0: [sda] tag#1 ASC=0x11 ASCQ=0x0 
Aug 26 09:12:55 dottypi kernel: [808772.369163] sd 0:0:0:0: [sda] tag#1 CDB: opcode=0x88 88 00 00 00 00 00 9d 76 33 e8 00 00 00 28 00 00
Aug 26 09:12:55 dottypi kernel: [808772.369195] blk_update_request: critical medium error, dev sda, sector 2641769448 op 0x0:(READ) flags 0x80700 phys_seg 5 prio class 0
Aug 26 09:13:19 dottypi kernel: [808797.156003] sd 0:0:0:0: [sda] tag#0 UNKNOWN(0x2003) Result: hostbyte=0x00 driverbyte=0x08 cmd_age=24s
Aug 26 09:13:19 dottypi kernel: [808797.156050] sd 0:0:0:0: [sda] tag#0 Sense Key : 0x3 [current] 
Aug 26 09:13:19 dottypi kernel: [808797.156078] sd 0:0:0:0: [sda] tag#0 ASC=0x11 ASCQ=0x0 
Aug 26 09:13:19 dottypi kernel: [808797.156107] sd 0:0:0:0: [sda] tag#0 CDB: opcode=0x88 88 00 00 00 00 00 9d 76 33 e8 00 00 00 08 00 00
Aug 26 09:13:19 dottypi kernel: [808797.156139] blk_update_request: critical medium error, dev sda, sector 2641769448 op 0x0:(READ) flags 0x0 phys_seg 1 prio class 0
Aug 26 09:18:23 dottypi kernel: [809100.323200] sd 0:0:0:0: [sda] tag#6 UNKNOWN(0x2003) Result: hostbyte=0x00 driverbyte=0x08 cmd_age=10s
Aug 26 09:18:23 dottypi kernel: [809100.323250] sd 0:0:0:0: [sda] tag#6 Sense Key : 0x7 [current] 
Aug 26 09:18:23 dottypi kernel: [809100.323278] sd 0:0:0:0: [sda] tag#6 ASC=0x27 ASCQ=0x0 
Aug 26 09:18:23 dottypi kernel: [809100.323308] sd 0:0:0:0: [sda] tag#6 CDB: opcode=0x88 88 00 00 00 00 00 9e 7f 5c 08 00 00 00 28 00 00
Aug 26 09:18:23 dottypi kernel: [809100.323340] blk_update_request: critical target error, dev sda, sector 2659146760 op 0x0:(READ) flags 0x80700 phys_seg 5 prio class 0
Aug 26 09:18:53 dottypi kernel: [809130.469818] sd 0:0:0:0: [sda] tag#4 uas_eh_abort_handler 0 uas-tag 2 inflight: CMD IN 
Aug 26 09:18:53 dottypi kernel: [809130.469841] sd 0:0:0:0: [sda] tag#4 CDB: opcode=0x88 88 00 00 00 00 00 9e 7f 5c 08 00 00 00 08 00 00
Aug 26 09:18:53 dottypi kernel: [809130.509834] scsi host0: uas_eh_device_reset_handler start
Aug 26 09:18:53 dottypi kernel: [809130.660965] usb 2-2: reset SuperSpeed Gen 1 USB device number 2 using xhci_hcd
Aug 26 09:18:53 dottypi kernel: [809130.696317] scsi host0: uas_eh_device_reset_handler success
Aug 26 09:19:28 dottypi kernel: [809165.669971] sd 0:0:0:0: [sda] tag#5 uas_eh_abort_handler 0 uas-tag 1 inflight: CMD OUT 
Aug 26 09:19:28 dottypi kernel: [809165.669993] sd 0:0:0:0: [sda] tag#5 CDB: opcode=0x8a 8a 08 00 00 00 00 e0 c2 ab 36 00 00 00 02 00 00
Aug 26 09:19:28 dottypi kernel: [809165.670222] xhci_hcd 0000:01:00.0: WARNING: Host System Error
Aug 26 09:19:33 dottypi kernel: [809170.689977] xhci_hcd 0000:01:00.0: xHCI host not responding to stop endpoint command.
Aug 26 09:19:33 dottypi kernel: [809170.689994] xhci_hcd 0000:01:00.0: USBSTS: HCHalted HSE EINT
Aug 26 09:19:33 dottypi kernel: [809170.690038] xhci_hcd 0000:01:00.0: xHCI host controller not responding, assume dead
Aug 26 09:19:33 dottypi kernel: [809170.690081] xhci_hcd 0000:01:00.0: HC died; cleaning up
Aug 26 09:19:33 dottypi kernel: [809170.690742] usb 1-1: USB disconnect, device number 2
Aug 26 09:19:33 dottypi kernel: [809170.691922] usb 2-2: USB disconnect, device number 2
Aug 26 09:19:33 dottypi kernel: [809170.692504] sd 0:0:0:0: [sda] tag#6 uas_zap_pending 0 uas-tag 2 inflight: CMD 
Aug 26 09:19:33 dottypi kernel: [809170.692523] sd 0:0:0:0: [sda] tag#6 CDB: opcode=0x88 88 00 00 00 00 00 9e 7f 5c 08 00 00 00 08 00 00
Aug 26 09:19:33 dottypi kernel: [809170.730039] sd 0:0:0:0: Device offlined - not ready after error recovery
Aug 26 09:19:33 dottypi kernel: [809170.730059] sd 0:0:0:0: Device offlined - not ready after error recovery
Aug 26 09:19:33 dottypi kernel: [809170.769999] blk_update_request: I/O error, dev sda, sector 2659146760 op 0x0:(READ) flags 0x0 phys_seg 1 prio class 0
Aug 26 09:19:33 dottypi kernel: [809170.770042] blk_update_request: I/O error, dev sda, sector 3770854198 op 0x1:(WRITE) flags 0x29800 phys_seg 1 prio class 0
Aug 26 09:19:33 dottypi kernel: [809170.770062] blk_update_request: I/O error, dev sda, sector 3770854198 op 0x1:(WRITE) flags 0x29800 phys_seg 1 prio class 0
Aug 26 09:19:33 dottypi kernel: [809170.770084] XFS (sda2): log I/O error -5
Aug 26 09:19:33 dottypi kernel: [809170.770166] XFS (sda2): xfs_do_force_shutdown(0x2) called from line 1196 of file fs/xfs/xfs_log.c. Return address = 23be8862
Aug 26 09:19:33 dottypi kernel: [809170.770181] XFS (sda2): Log I/O Error Detected. Shutting down filesystem
Aug 26 09:19:33 dottypi kernel: [809170.770208] XFS (sda2): Please unmount the filesystem and rectify the problem(s)
Aug 26 09:19:34 dottypi kernel: [809171.347113] sd 0:0:0:0: [sda] Synchronizing SCSI cache
Aug 26 09:19:34 dottypi systemd[1]: Stopped target Local File Systems.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Documents...
Aug 26 09:19:34 dottypi kernel: [809171.534981] XFS (sda1): Unmounting Filesystem
Aug 26 09:19:34 dottypi kernel: [809171.535137] XFS (sda1): log I/O error -5
Aug 26 09:19:34 dottypi kernel: [809171.535181] XFS (sda1): xfs_do_force_shutdown(0x2) called from line 1196 of file fs/xfs/xfs
{% endhighlight %}
</detail>
