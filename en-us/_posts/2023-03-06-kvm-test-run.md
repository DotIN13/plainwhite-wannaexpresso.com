---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Linux
- Ubuntu
- KVM
- RDP
title: Ubuntu Virtual Machine, but with KVM+RDP
---

## Just because it's not enough

The office server is just enough.

But about 45.67% of the reason is that there is a barbarian who is trying to snatch a machine, wanting to occupy another one; and about 62.72% of the reason is that there is a coward who pretends to be deaf and dumb, unwilling to sacrifice his own machine. So, in this world line where the probability is 108.39%, there is an individual who is willing to contribute, willing to be the benevolent one who takes a loss.

But it turns out to be still too little.

## Making something out of nothing

Although the coward is a bit stingy, hearing that the good-hearted person has no machine to use, it feels uncomfortable, but it's not easy to conjure a machine out of thin air.

"Since you can't make something out of nothing, then you can only try 'building a pagoda in a snail shell' or 'sailing a boat in the prime minister's belly.'"

The coward decides to use KVM to split one machine into two, one for themselves and one for the kind-hearted individual. Even if the barbarian acts up again, they won't be able to find a reason to snatch it again.

## Running Ubuntu Server with KVM

### Installing libvirt

According to the timid one's understanding, KVM is just a way of virtualizing a virtual machine, and the actual simulation of hardware for virtual machines to use is still done by QEMU, with Libvirt commands being the true managers of virtual machines. Therefore, it is necessary to first install QEMU and libvirt.

```shell
sudo apt install --no-install-recommends qemu-system libvirt-clients libvirt-daemon-system qemu-utils
```

`--no-install-recommends`: Do not install recommended packages. If graphical management tools are not needed, this option can be selected.

As the timid one is cautious, they want their non-root user to be able to manage virtual machines as well. Therefore, run the following command:

```shell
sudo adduser <youruser> libvirt
```

But that's not enough. If running virtual machine management command `virsh`, it manages virtual machines under the current username. In order to manage virtual machines under the root name, some adjustments need to be made.

```shell
virsh --connect qemu:///system list --all
```

As a result, every time a command is used, you have to enter `--connect qemu:///system`. How inconvenient is that? Luckily, environment variables can be imported to allow `virsh` to manage the system's virtual machines only.

```shell
# Place the following environment variable declaration in ~/.bashrc or ~/.zshrc
export LIBVIRT_DEFAULT_URI='qemu:///system'
```

> Reference: [Debian Wiki/KVM](https://wiki.debian.org/KVM).

### Configuring Virtual Networks

The office lacks more than just space; there's also a shortage of network cables. The timid one's machine only has one network cable plugged in, so there must be a way for that single cable to provide internet access for both the host and guest machines. Moreover, the guest machine needs to be able to assign internal IP addresses, or else generous souls will have to handle port mapping, which is quite a hassle!

Network configurations in libvirt are roughly divided into three types:

1. Bridged Network. The host and all guest machines share a network interface, are on the same network segment, each has its own internal IP, and can be accessed directly from the outside.
2. NAT Network. The default network mode in libvirt where the host and all guest machines share a network interface but are on different network segments, with the host serving as the DHCP server for all guest machines.
3. Routed Network. The host and all guest machines share a network interface, are on the same network segment, each has its own internal IP, but external networks are unaware of the internal network configuration. External devices must configure static routes on the router to allow direct access to the virtual machines.

As expected, the timid one chose the simplest Bridged Network configuration.

```shell
sudo ip link add br0 type bridge # Add a bridge named br0
sudo ip link set <device> up # Enable a network device, such as the enp0s2 interface
sudo ip link set <device> master br0 # Add the device to the bridge
sudo ip address add dev br0 192.168.1.142/24 # Set the host bridge's IP to 192.168.1.142
```

With the bridge now configured, but it will become ineffective after a restart. To keep it active, the `bridge-utils` software package must be used.

```shell
sudo apt install bridge-utils
```

Next, configure the network interface. For example, if the original interface used was enp0s2, replace the original `iface enp0s2 inet dhcp` line with the following content:

```shell
# Set network interface enp0s2 to manual configuration to avoid conflicts with NetworkManager
iface enp0s2 inet manual

# Configure bridge br0
auto br0
iface br0 inet static
    bridge_ports enp0s2
        address 192.168.1.142
        broadcast 192.168.1.255
        netmask 255.255.255.0
        gateway 192.168.0.1
```

Use systemd to restart the network service, and the network configuration will take effect.

```shell
sudo systemctl restart network
```

Then, in order for libvirt's virtual machines to use the br0 bridge, the bridge needs to be declared.

First, create a `br0-bridge.xml` file with the following content:

```xml
<network>
    <name>br0-bridge</name>
    <forward mode="bridge" />
    <bridge name="br0" />
</network>
```

Then run the `virsh` command to import the declared configuration.

```shell
virsh net-define br0-bridge.xml
```

Use `virsh net-list --all` to view all existing networks.

> Reference: [Bridged Networking with libvirt](https://linuxconfig.org/how-to-use-bridged-networking-with-libvirt-and-kvm).

### Installing Ubuntu Server

Although the timid one is fearful, they are also known for being meticulous. The generous souls have always used the genuinely popular Ubuntu Desktop with the GNOME desktop environment. This time, in order for the generous souls to have an organic experience, the timid one reluctantly dabbled with KVM without a graphical interface. Shouldn't the virtual machine be configured to their liking?

However, fate has it that the timid one's own system originally ran a non-graphical Debian, and Ubuntu Desktop installation requires a graphical environment. Unfortunately, as a compromise, Ubuntu Server was installed with the graphical interface to be solved separately.

First, download the system image, then install the `libosinfo-bin` package to help the `virt-install` command recognize the system version:

```shell
sudo apt install libosinfo-bin
```

Run the `osinfo-query os` command to view the system versions supported by `virt-install`. Since [Ubuntu 22.04 is not included in the list provided by the `libosinfo-bin` package](https://askubuntu.com/questions/1070500/why-doesnt-osinfo-query-os-detect-ubuntu-18-04), it is necessary to manually download and update the osinfo database from the [libosinfo](releases.pagure.org) hosting site.

```shell
wget -O "/tmp/osinfo-db.tar.xz" "https://releases.pagure.org/libosinfo/osinfo-db-20221130.tar.xz"
osinfo-db-import --user "/tmp/osinfo-db.tar.xz"
```

`--user`: Database import location. Choosing `--user` stores the database in `~/.config/osinfo`, while choosing `--local` stores it in `/etc/osinfo`, and selecting `--system` stores it in `/usr/share/osinfo`.

Edit the virtual machine installation command:

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

`--name`: The name of the virtual machine, also known as the domain name.

`--location`: System image location. It can be a network location, such as `https://cn.archive.ubuntu.com/ubuntu/dists/jammy/main/installer-amd64/`, or a local path; the `--cdrom` parameter can also specify the system image, but only supports local paths. In environments without a graphical interface, it is necessary to use custom kernel parameters to enable a serial console with `--extra-args` for system installation, as `--cdrom` does not support custom kernel parameters, hence the need for `--location`.

Since [`--location` cannot automatically detect the location of the kernel in the image](https://askubuntu.com/questions/789358/virt-install-using-location-with-iso-image-no-longer-working), the `kernel=casper/vmlinuz,initrd=casper/initrd` must be manually specified.

`--os-variant`: Operating system type. Use the `osinfo-query os` command to view supported versions.

`--vcpus`: Initial number of CPU threads. Each virtual thread in a KVM virtual machine is bound to a real thread, so setting the virtual CPU quantity to exceed the real thread count is meaningless. However, a real thread can be simultaneously allocated to multiple virtual machines, with the scheduler handling the assigned tasks of multiple virtual machines, which is why CPU overselling is possible.

`--cpu`: CPU configuration. The CPU model and features can be configured. When the model is set to `host`, the virtual machine will have all the features of the host CPU, but it may also prevent live migration.

`--disk opt1=val1,opt2=val2,...`: Virtual machine storage device. Size can be set using the `size` option or the path can be defined using the `path` option.

`--memory`: Memory size.

`--network`: Select the network. Choose the previously created bridge network br0-network.

`--graphics`, `--console`, `--extra-args`: Configure a serial console for the virtual machine to operate directly from the host without a graphical interface.

By running the above command, you can enter the installation interface, select basic mode, and install the system via a text console.

> See [virt-install(1)](https://linux.die.net/man/1/virt-install).

### Installing VNC

Originally, the generous soul could sit in front of their server, pour a cup of water, leisurely turn on the screen, and configure the environment or run code with lukewarm water in hand.

But since the timid one did not install a desktop environment, the generous soul could not open the virtual machine's graphical interface. After some consideration, the timid one realized that installing remote desktop access would be more convenient than physically sitting in front of the server. Thus, they gritted their teeth and began configuring it for the generous soul.

First, VNC requires a desktop environment—don't forget that Ubuntu Server was just installed! The timid one chose the GNOME desktop environment tailored to the generous soul's preferences.

```shell
sudo apt install gnome-session gdm3 # Install the gnome desktop environment and gdm3 window manager
sudo apt install ubuntu-desktop # Install various packages necessary for the desktop environment
sudo systemctl set-default multi-user.target # Do not start the graphical environment by default
```

For the VNC server, TigerVNC was chosen.

```shell
sudo apt install tigervnc-standalone-server dbus-x11
```

Configure `~/.vnc/xstartup`:

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

`--systemd`: Only required if the gnome-shell version is below 3.40.

Configure `~/.vnc/config`:

```shell
session=ubuntu
geometry=1920x1080
localhost
alwaysshared
```

`alwaysshared`: All clients will connect to the same session.

Configure `/etc/systemd/system/vncserver@.service`:

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

`-localhost`: Allows VNC access only from the local machine. For remote access, SSH secure tunneling is required for forwarding.

`Restart`, `RestartSec`: When a client logs out, the server will automatically exit. If the server should continue running, add the restart parameters specified above.

Lastly, start the VNC server via systemd:

```shell
sudo systemctl enable --now vncserver@1
```

`@1`: Session number. Setting the session number to 1 will use port 5901; number 2 will use port 5902, and so on.

Finally, establish an SSH secure tunnel and connect to VNC:

```shell
ssh <youruser>@<serverip> -L 9901:localhost:5901
```

Connect to `localhost:5901` with a VNC client, set the client's quality to "high" if the screen is somewhat blurry, and everything will be splendid.

## Just because I took a second glance at you in the crowd

Here, the timid one has spent an entire day just to set up a KVM virtual machine for a kind-hearted person (and it's the kind with remote access). If you were to ask him why he's doing all this, he might reply, "Just because I took a second glance at you in the crowd, I knew you were a kind-hearted person. For kind-hearted people, I can't be too incompetent."

With courage, the timid one wanted to tell the kind-hearted person that he prepared a very user-friendly virtual machine for him. But seeing the kind-hearted person busy with other tasks, the timid one hesitated, walked up to him, struggled to speak, then turned and walked away as if nothing had happened.

