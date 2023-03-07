---
layout: post
title: "Ununtu虚拟机，但KVM+RDP"
subtitle: "Ubuntu KVM + RDP Test Run"
author: "DotIN13"
tags:
  - Linux
  - Ubuntu
  - KVM
  - RDP
locale: zh_CN
---

## 只因不够用

办公室的服务器刚好够用。

但大约有45.67%的原因是有一个野蛮之人强取豪夺，妄图再霸占一台；也有大约62.72%的原因是因为有一个胆小之人装聋作哑，不愿牺牲自己的机子。于是，在这个108.39%概率发生的世界线上，多了一个甘愿贡献自己的只因，甘愿吃亏的好心人。

只因终究还是太少。

## 无中生有

胆小鬼虽然也有些小气，但听说好心人没有机用，心里不是滋味，却也不好凭空变一台出来。

“既然不能无中生有，那就只能试试‘螺蛳壳里做道场’‘宰相肚里能撑船’了。”

胆小鬼决定，用KVM把一台机子拆两部，一部自己用，一部留给好心人。就算野蛮人再横，也没法再找理由来抢了。

## 使用KVM运行Ubuntu Server

### 安装libvirt

依据胆小鬼的理解，KVM只是一种虚拟机的虚拟化方式，而真正模拟出硬件来供虚拟机使用的依旧是QEMU，真正管理虚拟机的依旧是Libvirt命令。也因此只好先安装QEMU与libvirt。

```shell
sudo apt install --no-install-recommends qemu-system libvirt-clients libvirt-daemon-system qemu-utils
```

`--no-install-recommends`：不安装推荐程序包。如果不需要图形化管理工具，可选择此选项。

胆小鬼也怕事，想让自己的非root用户也能管理虚拟机，于是运行以下命令：

```shell
sudo adduser <youruser> libvirt
```

这还不够，如果直接运行虚拟机管理命令[`virsh`](https://packages.debian.org/virtinst)，管理的是当前用户名下的虚拟机，如果要管理root名下的虚拟机，还需要作以下调整。

```shell
virsh --connect qemu:///system list --all
```

这样一来，每次一用命令就得输入一遍`--connect qemu:///system`，那还得了？还好可以导入环境变量，让`virsh`一心一意管理系统的虚拟机。

```shell
# 将以下环境变量声明放进~/.bashrc或者~/.zshrc中
export LIBVIRT_DEFAULT_URI='qemu:///system'
```

> 参考[Debian Wiki/KVM](https://wiki.debian.org/KVM)。

### 配置虚拟网络

办公室不仅只因不够用，网线也不够。胆小鬼的机器只插着一根网线，得想办法让那一根网线同时供主机和客机上网才行。而且，还得让客机也能分配到内网IP地址，不然还得给好心人做端口映射，那多麻烦事儿！

libvirt的网络配置大致分为三种：

1. 桥接网络（bridged network）。主机与所有客机共享一个网络接口，处于同一网段，各自有各自的内网IP，可以直接从外部访问。
2. NAT网络（NAT-based network）。主机与所有客机共享一个网络接口，处于不同网段，由主机作为所有客机的DHCP服务器。libvirt默认的网络模式就是NAT模式。
3. 路由网络（routed network）。主机与所有客机共享一个网络接口，处于同一网段，各自有各自的内网IP，但外部网络并不知晓内部的网络情况，需要在外部的路由器配置静态路由来允许外部外部设备直接访问虚拟机。

胆小鬼不出所料，选了最简单的桥接网络。

```shell
sudo ip link add br0 type bridge # 添加一个名为br0的网桥
sudo ip link set <device> up # 启用一个网络设备，如网口enp0s2
sudo ip link set <device> master br0 # 将设备添加到网桥
sudo ip address add dev br0 192.168.1.142/24 # 将主机网桥的IP设置为192.168.1.142
```

如此，桥接已经配置好，但重启就会失效，要叫他保持下去，得用`bridge-utils`软件包。

```shell
sudo apt install bridge-utils
```

随后，配置网络界面。例如原先使用的网口为enp0s2，那么就将原有的`iface enp0s2 inet dhcp`一行替换为如下内容：

```shell
# 将网络接口enp0s2设置为手动配置，以防与NetworkManager产生冲突
iface enp0s2 inet manual

# 配置网桥br0
auto br0
iface br0 inet static
    bridge_ports enp0s2
        address 192.168.1.142
        broadcast 192.168.1.255
        netmask 255.255.255.0
        gateway 192.168.0.1
```

使用systemd重启network服务，网络配置就生效了。

```shell
sudo systemctl restart network
```

接下来，要让libvirt的虚拟机使用网桥br0，还需要对网桥进行声明。

首先创建一个`br0-bridge.xml`文件，内容如下：

```xml
<network>
    <name>br0-bridge</name>
    <forward mode="bridge" />
    <bridge name="br0" />
</network>
```

然后运行`virsh`命令导入声明配置。

```shell
virsh net-define br0-bridge.xml
```

使用`virsh net-list --all`就可以看到现有的全部网络。

> 参考[Bridged Networking with libvirt](https://linuxconfig.org/how-to-use-bridged-networking-with-libvirt-and-kvm)。

### 安装Ubuntu Server

虽说胆小怕事，但胆小鬼也是出了名的心细。好心人一直以来用的都是正黄旗的Ubuntu Desktop，gnome桌面环境。这次是为了好心人有机用才硬着头皮捣鼓KVM，可不得把只因做成他爱用的样子？

不巧，胆小鬼自己的只因原本运行着没有图形界面的Debian，而Ubuntu Desktop安装时又恰好需要图形界面，无奈之下，只好退而求其次，安装Ubuntu Server，图形界面另外解决。

首先下载好系统镜像，然后安装`libosinfo-bin`软件包，帮助`virt-install`命令识别系统版本：

```shell
sudo apt install libosinfo-bin
```

可以运行`osinfo-query os`命令来查看`virt-install`支持的系统版本。由于[Ubuntu 22.04不在`libosinfo-bin`软件包自带的列表中](https://askubuntu.com/questions/1070500/why-doesnt-osinfo-query-os-detect-ubuntu-18-04)，还需要从[libosinfo](releases.pagure.org)托管网站手动下载更新osinfo的数据库。

```shell
wget -O "/tmp/osinfo-db.tar.xz" "https://releases.pagure.org/libosinfo/osinfo-db-20221130.tar.xz"
osinfo-db-import --user "/tmp/osinfo-db.tar.xz"
```

`--user`：数据库导入位置。如果选择`--user`，数据库将会存储在`~/.config/osinfo`，如果选择`--local`，数据库将存储在`/etc/osinfo`，如果选择`--system`，数据库将存储在`/usr/share/osinfo`。

编辑虚拟机安装命令：

```shell
virt-install --virt-type kvm --name <domain-name> \
  --location <path/to/ubuntu-22.04.iso>,kernel=casper/vmlinuz,initrd=casper/initrd \
  --os-variant ubuntu22.04 \
  --vcpu 10,maxvcpus=20 --cpu host \
  --disk size=120 --memory 4096 \
  --network br0-network \
  --graphics none \
  --console pty,target_type=serial \
  --extra-args "console=ttyS0"
```

`--name`：虚拟机的名字，也称作域名（domain name）。

`--location`：系统镜像位置。可以是网络位置，如`https://cn.archive.ubuntu.com/ubuntu/dists/jammy/main/installer-amd64/`，也可以是本地路径；`--cdrom`参数同样可以指定系统镜像，但只支持本地路径。在没有图形界面的环境中，必须使用`--extra-args`的自定义内核参数开启串行控制台（Serial console）来安装系统，而`--cdrom`又恰好不支持自定义内核参数，因此只能使用`--location`参数。由于[`--location`选项不能自动识别镜像中的内核位置](https://askubuntu.com/questions/789358/virt-install-using-location-with-iso-image-no-longer-working)，所以需要手动指定`kernel=casper/vmlinuz,initrd=casper/initrd`。

`--os-variant`：操作系统类型。可以运行`osinfo-query os`命令来查看支持的版本。

`--vcpus`：初始CPU线程数。KVM虚拟机中的每一个虚拟线程绑定一个真实线程，所以设置超过真实线程数的虚拟CPU数量是没有意义的。但一个真实线程可以被同时分配到多个虚拟机中，通过调度器完成多个虚拟机指派的工作，这也是CPU可以超售（CPU oversell）的由来。

`--cpu`：CPU配置。可以配置CPU的型号与特性。当型号设置为`host`时，虚拟机将拥有主机CPU的所有特性，但也可能会导致无法在线迁移（live migration）。

`--disk opt1=val1,opt2=val2,...`：虚拟机存储设备。可以通过`size`选项设置大小，也可以通过`path`选项设置路径。

`--memory`：内存大小。

`--network`：选择网络。选择刚才创建的桥接网络br0-network。

`--graphics`、`--console`、`--extra-args`：为虚拟机配置一个串行控制台，用于在没有图形界面的情况下从主机直接操作虚拟机。

运行上述命令，进入安装界面，选择基本模式（basic mode），就可以通过文本控制台安装系统了。

> 参见[virt-install(1)](https://linux.die.net/man/1/virt-install)。

### 安装VNC

原本好心人可以直接坐到自己的服务器面前，泡杯水，就着温吞的开水不紧不慢地点亮屏幕，配置环境或是运行代码。

但由于胆小鬼没有安装桌面环境，好心人也就没法打开虚拟机的图形界面。胆小鬼虽说怕事，但心里一衡量，如果把远程桌面装好，那还比原来坐到服务器面前操作更方便，收益大于成本。于是便咬咬牙开始帮好心人配置。

首先VNC需要一个桌面环境——别忘了刚才安装的是Ubuntu Server！胆小鬼为好心人量身选择了他爱用的gnome。

```shell
sudo apt install gnome-session gdm3 # 安装gnome桌面环境与窗口管理器gdm3
sudo apt install ubuntu-desktop # 安装桌面环境必须的各个软件包
sudo systemctl set-default multi-user.target # 不要默认启动图形环境
```

VNC服务端选用了TigerVNC。

```shell
sudo apt install tigervnc-standalone-server dbus-x11
```

配置`~/.vnc/xstartup`：

```shell
#!/bin/sh

[ -x /etc/vnc/xstartup ] && exec /etc/vnc/xstartup
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources
vncconfig -iconic &
export DESKTOP_SESSION=/usr/share/xsessions/ubuntu.desktop
export XDG_CURRENT_DESKTOP=ubuntu:GNOME
export GNOME_SHELL_SESSION_MODE=ubuntu
export XDG_DATA_DIRS=/usr/share/ubuntu:/usr/local/share/:/usr/share/:/var/lib/snapd/desktop
dbus-launch --exit-with-session /usr/bin/gnome-session --systemd --session=ubuntu
```

`--systemd`：如果gnome-shell版本低于3.40，则需要省去该参数。

配置`~/.vnc/config`：

```shell
session=ubuntu
geometry=1920x1080
alwaysshared
```

`alwaysshared`：所有客户端都会连接到同一个会话。

配置`/etc/systemd/system/vncserver@.service`：

```shell
[Unit]
Description=Start TigerVNC server at startup
After=syslog.target network.target

[Service]
Type=forking
User=<youruser>
Group=<youruser>
WorkingDirectory=/home/<youruser>
PIDFile=/home/<youruser>/.vnc/%H:%i.pid
ExecStartPre=-/bin/sh -c "/usr/bin/vncserver -kill :%i > /dev/null 2>&1"
ExecStart=/usr/bin/vncserver -depth 24 -geometry 1920x1080 -localhost :%i
ExecStop=/usr/bin/vncserver -kill :%i
Restart=on-success
RestartSec=10

[Install]
WantedBy=multi-user.target
```

`-localhost`：仅允许从本机访问VNC。如果需要远程访问，则需要配合SSH安全隧道进行转发。

`Restart`、`RestartSec`：[当客户端进行注销操作时，服务端就会自行退出](https://unix.stackexchange.com/questions/43398/is-it-possible-to-keep-a-vnc-server-alive-after-log-out)，如果希望服务端继续运行，则需要添加上述重启参数。

最后，通过systemd开启VNC服务端：

```shell
sudo systemctl enable --now vncserver@1
```

`@1`：会话编号。会话编号设为1，则端口号为5901；编号为2，端口号为5902，以此类推。

最后，建立SSH安全隧道，连接VNC：

```shell
ssh <youruser>@<serverip> -L 9901:localhost:5901
```

用VNC客户端连接`localhost:5901`，画面似乎有些模糊，将客户端的质量设为“高”，一切都很美好。

## 只是因为在人群中多看了你一眼

到这里，胆小鬼已经花了整整一天的时间，就为了给好心人装配一台KVM虚拟机（而且是带远程访问的那种）。如果你要问他为什么要做这些，他或许会回答你，“只是因为在人群中多看了你一眼，我就知道你是好心人。对好心人，自然不能太差劲。”

胆小鬼鼓足勇气，想告诉好心人自己为他准备了一个非常好用的虚拟机。但看见好心人在专心忙活别的事情，胆小鬼走到他边上，欲言又止，转身又走了开去，好像什么也没发生过。
