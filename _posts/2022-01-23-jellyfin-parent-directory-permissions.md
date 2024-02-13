---
layout: post
title: "第二回 目录添加总失败 权限设置有名堂"
subtitle: "Jellyfin on Manjaro: Parent Directory Permissions"
author: "DotIN13"
series: "Jellyfin x Manjaro"
tags:
  - Jellyfin
  - Manjaro
  - File Permission
locale: zh-cn
---

第二回说到，向Jellyfin添加电影目录时报错。

点击添加时，或者是弹出对话框报错：

```plaintext
The path could not be found. Please ensure the path is valid and try again.
```

或者是下方出现报错提示：

```plaintext
There was an error adding the media path. Please ensure the path is valid and Jellyfin has access to that location.
```

{% include post-image.html link="post-jellyfin/media-path-error.png" alt="Media Import Error" %}

## 父目录权限

我尝试将电影目录权限修改为`drwxrwxrwx`，所有者修改为`jellyfin:jellyfin`，并没有作用。

再尝试用`setfacl`修改ACL，发现我的ZFS目录根本没有打开ACL。

我想起过去曾经学到，在陈列目录内容时，用户需要父目录（parent directory）的执行权限，于是我尝试了一下，将电影目录的上级目录修改为`drwxr-xr-x`，再从Jellyfin增加电影目录，便已经可以正常添加了。

## 大家测不如我测

我尝试将`testdrive`目录移动到根目录，将电影存放目录`movies`置于其中。修改`testdrive`目录的权限，再尝试在Jellyfin中添加`movies`目录。

在测试中，Jellyfin服务的用户是`jellyfin`，用户组也为`jellyfin`。测试的初始状态如下：

```shell
/
└── [drwx------ brustier jellyfin   ]  testdrive
    └── [drwxr-xr-x jellyfin jellyfin]  movies
```

只考虑对读取有影响的`read`与`execute`权限，总共有16种情况，测试结果如下：

| 父目录权限   | Jellyfin是否能够添加子目录 |
| ------- | ----------------- |
| \-\-\-\-\-\- | ❌                 |
| r\-\-\-\-\-  | ❌                 |
| \-\-x\-\-\- | ✔️                |
| \-\-\-r\-\- | ❌                 |
| \-\-\-\-\-x | ❌                 |
| r\-x\-\-\-  | ✔️                |
| r\-\-r\-\-  | ❌                 |
| r\-\-\-\-x  | ❌                 |
| \-\-xr\-\- | ✔️                |
| \-\-x\-\-x | ✔️                |
| \-\-\-r\-x | ❌                 |
| r\-xr\-\-  | ✔️                |
| r\-x\-\-x  | ✔️                |
| r\-\-r\-x  | ❌                 |
| \-\-xr\-x | ✔️                |
| r\-xr\-x  | ✔️                |

测试结果说明，只要父目录有“用户组执行权限”（g+x），Jellyfin就能够正确读取子目录。

但问题在于，如果父目录仅有“所有人执行权限”（o+x），Jellyfin就不能正常访问子目录，个中缘由，仍需探索究竟。

## 不求甚解？

上回说到，想到什么想做的，就该立刻去做。

搜索这个问题的答案，或许就是几秒钟的事情，搜索关键词我都已经想好了，就叫“parent folder excecution permission”。

但就是不想打开那个搜索界面，不知道为什么。

为什么总是那些简单透顶的事，做起来就那么难？
