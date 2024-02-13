---
layout: post
title: 又一次树莓派的宕机
subtitle: Another Drop Dead of Raspberry Pi
author: DotIN13
tags:
  - Pi
  - Life
locale: zh-cn
---

## 前世

一直在我的树莓派4B上运行[Raspberry OS+Aria2](/2020/04/21/aria-pi/)作下载机。

万万没想到，**电子产品最大的天敌是妈妈**，在一次空调漏水紧急维修行动中，妈妈直接拔掉了插着树莓派的插线板——系统盘损坏。

至此，树莓派的前生告终。

## 今生

既有前车之鉴，我随即斥巨资120元在某宝购入[微雪UPS-HAT](https://www.waveshare.net/wiki/UPS_HAT)，防止断电造成文件系统故障。

{% include post-image.html link="post-pi-reboot/methode-sundaytimes.jpeg" alt="Sundaytimes by Rob Murray" %}

我本以为已经高枕无忧，没想到，未及半月，树莓派再一次宕机。

下午4点，我像往常一样打开Aria2NG，添加一个70GB的电影下载链接，报错。对着失败的下载任务呆了几秒钟，心里奇怪，却也没想太多。再次添加任务，依旧显示红色叉号。疑心加重，运行`df -h`，发现下载目录所在分区已经不在挂载状态。

有些慌张，但本着一个*资深Linux用户*的自信，我重新`sudo mount -a`尝试利用`fstab`挂载硬盘。系统提示无法挂载。心一横，关机重启。

没想到这是我最后一次见到我的硬盘。

共事两年有余的希捷硬盘再插入ORICO硬盘盒，连接树莓派，运行`lsblk`已经不见踪迹。又周折几番利用SATA在台式电脑上尝试访问，却只读得一个3.7GB的分区，运行`fdisk`、`xfs_repair`等等，均报一个漠然的`Input/Output Error`。

至此，树莓派的今生落幕。

## 后身

心灰意冷之余，心想或许看看日志，便可知究竟是臭名远扬的ORICO硬盘盒出了问题，还是Aria2的`falloc`文件分配方式犯了忌讳。

没想到，运行`journalctl -b-1`报错。

```shell
Specifying boot ID or boot offset has no effect, no persistent journal was found.
```

原来`journalctl`的[默认设置](https://askubuntu.com/a/864771)是`Storage=auto`（`/etc/systemd/journald.conf`），也就是说，存储在`/run/log/journal/<machine-id>/*.journal[~]`的日志在重启后就会被删除。如果要使journald存储上次开机的日志，就必须将`Storage`设置为`persistent`，或者在`Storage=auto`的条件下手工创建`/var/log/journal/`。

既然journald的日志已经丢失，那么就只好人工查看`/var/log/`下的日志文件了。

```shell
pi@dottypi:/var/log $ ls
alternatives.log    daemon.log.2.gz  kern.log.2.gz  syslog.3.gz
alternatives.log.1  daemon.log.3.gz  kern.log.3.gz  syslog.4.gz
apt                 daemon.log.4.gz  kern.log.4.gz  syslog.5.gz
auth.log            debug            lastlog        syslog.6.gz
auth.log.1          debug.1          lightdm        syslog.7.gz
auth.log.2.gz       debug.2.gz       messages       unattended-upgrades
auth.log.3.gz       debug.3.gz       messages.1     user.log
auth.log.4.gz       debug.4.gz       messages.2.gz  user.log.1
boot.log            dpkg.log         messages.3.gz  user.log.2.gz
bootstrap.log       dpkg.log.1       messages.4.gz  user.log.3.gz
btmp                faillog          private        vncserver-x11.log
btmp.1              fontconfig.log   samba          vncserver-x11.log.bak
cups                hp               syslog         wtmp
daemon.log          kern.log         syslog.1       Xorg.0.log
daemon.log.1        kern.log.1       syslog.2.gz    Xorg.0.log.old
```

对我[有用的是内核日志`kern`以及系统日志`syslog`](https://askubuntu.com/a/26253)。从`syslog.7.gz`中的`aria2c`日志中看出，我下午下载电影时出错如下：

```yaml
Aug 26 16:01:14 dottypi aria2c[498]: 08/26 16:01:14 [#033[1;32mNOTICE#033[0m] 下载已完成：[MEMORY][METADATA]Almost.Famous.2000.EXTENDED.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.5.1-FGT
Aug 26 16:01:14 dottypi aria2c[498]: 08/26 16:01:14 [#033[1;31mERROR#033[0m] 捕捉到异常
Aug 26 16:01:14 dottypi aria2c[498]: Exception: [AbstractDiskWriter.cc:224] errNum=5 errorCode=15 打开文件 /mnt/Videos/Downloads/Almost.Famous.2000.EXTENDED.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.5.1-FGT/Almost.Famous.2000.EXTENDED.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.5.1-FGT.mkv 失败，原因：输入/输出错误
Aug 26 16:01:14 dottypi aria2c[498]: 08/26 16:01:14 [#033[1;32mNOTICE#033[0m] GID 为 437ddbc0a6eb7f5a 的下载项未完成：/mnt/Videos/Downloads/Almost.Famous.2000.EXTENDED.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.5.1-FGT
```

但事实上，四点附近没有硬盘报错消息。参看`syslog.1`发现，早上9点时，硬盘就已经出现问题。

根据日志，似乎事情发生的顺序是：

1. 硬盘出现坏块；

2. [USB Attached SCSI](https://en.wikipedia.org/wiki/USB_Attached_SCSI)系统尝试reset解决问题，但遭遇失败，随即USB连接断开。

3. XFS系统出现日志错误，尝试强制关闭并通过systemd卸载硬盘，但同样失败。

但至于是哪一步使得硬盘最终无法读写，不得而知。

## 四世

如果说，树莓派此番，是由前世、今生、后身三者归一，但不妨将眼眸从事物本身拿开一些，事物只有过去的我、现在的我与未来的我吗？我想或许并不一定。

“我”仅仅是“我”，树莓派仅仅知道它自己身上发生了什么，或者更多地，它或许会知道它周边的世界发生了什么——通过传感器。我们这里不讨论全能全知者，那么可以预见的是，树莓派无法感知到他人对它的感知。树莓派和硬盘一起受了伤，我会伤心、落泪、为丢失的数据而急的跳脚，也会一个人的时候，想起不能再见的老照片坐着发呆。一个普通人的三世，最大的缺，就是无法通感他人之所感，这是三世所不能兼容并包的。就算心里觉着熟谙了他人的想法，我所获的也不过是我感之他感，并非纯粹的、原发的情感。

写到此，不知所云。

《心地观经》云：“欲知过去因，见其现在果；欲知未来果，见其现在因”。既然此番丢了三世，必需从第四世弥补前世之孽缘。购置两块硬盘互作备份，尔尔。

## 附录

<details>
<summary>
日志
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
Aug 26 09:19:34 dottypi kernel: [809171.535181] XFS (sda1): xfs_do_force_shutdown(0x2) called from line 1196 of file fs/xfs/xfs_log.c. Return address = 23be8862
Aug 26 09:19:34 dottypi kernel: [809171.535188] XFS (sda1): Log I/O Error Detected. Shutting down filesystem
Aug 26 09:19:34 dottypi kernel: [809171.535201] XFS (sda1): Please unmount the filesystem and rectify the problem(s)
Aug 26 09:19:34 dottypi kernel: [809171.535232] XFS (sda1): Unable to update superblock counters. Freespace may not be correct on next mount.
Aug 26 09:19:34 dottypi umount[10749]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Documents.mount: Succeeded.
Aug 26 09:19:34 dottypi systemd[1]: Unmounted /mnt/Documents.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10751]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10752]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10753]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10754]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10755]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10756]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10757]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10758]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10759]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10760]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10761]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10762]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10763]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10764]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10765]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device. Stopping, too.
Aug 26 09:19:34 dottypi systemd[1]: Unmounting /mnt/Videos...
Aug 26 09:19:34 dottypi umount[10766]: umount: /mnt/Videos: target is busy.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Mount process exited, code=exited, status=32/n/a
Aug 26 09:19:34 dottypi systemd[1]: Failed unmounting /mnt/Videos.
Aug 26 09:19:34 dottypi systemd[1]: mnt-Videos.mount: Unit is bound to inactive unit dev-disk-by\x2dpartuuid-d6d003c5\x2dce0f\x2d4af1\x2da18b\x2dd82175e41a10.device, but not stopping since we tried this too often recently.
Aug 26 09:19:34 dottypi kernel: [809171.940001] sd 0:0:0:0: [sda] Synchronize Cache(10) failed: Result: hostbyte=0x07 driverbyte=0x00
Aug 26 09:19:34 dottypi kernel: [809172.000572] xhci_hcd 0000:01:00.0: WARN Can't disable streams for endpoint 0x82, streams are being disabled already
{% endhighlight %}
</details>
