---
layout: post
title: 优雅地理解Xray+VLESS+XTLS
subtitle: Understanding and Utilizing Xray, VLESS and XLTS
author: DotIN13
tags:
  - macOS
  - VLESS
  - XLTS
locale: zh_CN
---

## Xray

Xray是由V2Ray项目分支而来的一个全新网络工具集，用于基础通讯网络的搭建。Xray所支持的VLESS与XTLS协议相比传统的VMESS、TLS协议性能大幅提升，有助于在网络基础设施不变的情况下获得更高的通讯效率，理论上在传输速度、资源占用上有极大优势。

### VLESS

VLESS是一种新晋的数据传输协议，其数据结构根据[开发者的介绍](https://github.com/v2ray/v2ray-core/issues/2636)，如下所示。

#### 请求 Request

| 1 字节   | 16 字节   | 1 字节         | M 字节            | 1 字节 | 2 字节 | 1 字节   | S 字节 | X 字节   |
| -------- | --------- | -------------- | ----------------- | ------ | ------ | -------- | ------ | -------- |
| 协议版本 | 等价 UUID | 附加信息长度 M | 附加信息 ProtoBuf | 指令   | 端口   | 地址类型 | 地址   | 请求数据 |

#### 响应 Response

| 1 字节               | 1 字节         | N 字节            | Y 字节   |
| -------------------- | -------------- | ----------------- | -------- |
| 协议版本，与请求一致 | 附加信息长度 N | 附加信息 ProtoBuf | 响应数据 |

相比其他传输协议，VLESS协议更加简洁，能够达到更加高效的数据传输，就以往的经验来说，其主要优势在于：

1. VLESS协议不依赖于系统时间，在Windows+Linux双系统环境下，可以不再困扰于时区时差；
2. VLESS协议在传输数据时不会加密数据，配合其他加密传输协议使用时可以达到更高的性能；
3. 允许进行回落，可以将接收到的非代理数据进行转发，无需另外架设转发服务；
4. VLESS协议在未来可能出现统一的导出格式，方便在各个终端间传递使用。

### XTLS

依据[开发者的Release Notes](https://github.com/rprx/v2ray-vless/releases/tag/xtls)，普通的TLS加密传输协议是在已经TLS加密的HTTP/HTTPS数据基础上进一步进行TLS加密，而XTLS协议则保证不对已经过加密的内层TLS数据进行重复加解密，这样能够极大地减少节点运算压力，强化数据吞吐量。

其主要的优势在于：

1. 减少加解密运算量，提高相同基础设施下的数据传输效率；
2. 降低通讯基础设施的运算压力，减少发热、用电量；
3. 在多层嵌套的XTLS应用中只需要加密一次，优化多节点转发。

## 使用

目前在macOS上，可以使用的客户端主要是M1可用的iOS版Shadowrockets，以及[Qv2ray](https://github.com/Qv2ray/Qv2ray)。

客户端的最简配置案例如下：

```json
{
    "log": {
        "loglevel": "warning"
    },
    "inbounds": [
        {
            "port": 10809,
            "listen": "127.0.0.1",
            "protocol": "socks",
            "settings": {
                "udp": true
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "vless",
            "settings": {
                "vnext": [
                    {
                        "address": "REDACTED", // 服务端IP地址或域名
                        "port": "REDACTED", // 服务端端口
                        "users": [
                            {
                                "id": "REDACTED", // 客户端密钥
                                "flow": "xtls-rprx-direct",
                                "encryption": "none",
                                "level": 0
                            }
                        ]
                    }
                ]
            },
            "streamSettings": {
                "network": "tcp",
                "security": "xtls",
                "xtlsSettings": {
                    "serverName": "REDACTED" // 服务端域名
                }
            }
        }
    ]
}
```



### Shadowrockets

Shadowrockets使用了旧版4.27的V2Ray内核以兼容XTLS，手动导入配置JSON即可使用。

在M1 MacBook上，应用通过创建全局VPN的方式实现代理，并且可以通过内置的路由功能实现分流，但开关代理必须手动打开软件操作原本适用于触摸屏的界面，没有快捷的状态栏图标，并不方便。

在代理效率方便似乎没有重大问题。

### Qv2ray

Qv2ray可以自行替换V2Ray内核为Xray内核，到[xray-core](https://github.com/XTLS/Xray-core/releases)下载相应指令集的二进制文件之后，在软件设置中填写`xray`文件的位置即可。同样填入客户端配置的JSON之后，就可以使用。

相对Shadowrockets而言，Qv2ray不强制进行全局代理，有状态栏图标方便控制。但Qv2ray的路由系统似乎有一些缺陷，在配合第三方`.dat`路由表使用时，打开网页的延迟较为明显，这一延迟尤其体现在无需代理的本地网站上。

不过VLESS的一大优势就在于服务端原生支持回落，可以同时增开其他协议的服务端，用合适的客户端进行连接，如在macOS上可以使用更为高效的`Trojan`进行连接。

## 新事物与旧生态

**创新**与**生态**总是成对出现，但又相生相克。新事物往往不能在诞生之初就拥有合适的生态来生长，例如M1 MacBook的软件生态，例如Android平板应用生态。

Xray带来了很好的新技术，但同时又提供了回落手段，让不同的设备能够轻松地以合适的客户端、协议进入通讯隧道，这种Back Compatibility能够很好地帮助用户向新技术的迁移，但是否它又破坏了自己的生态？

一方面，它逼迫自己兼容旧生态以获取用户的青睐，但这会使之受制于各个上游项目；另一方面，用户既然进入了新生态，就代表其接受生态所对应的创新，在这种条件下，过分的兼容似乎容易弄巧成拙。

一个好的生态不仅托举用户，同时也扼住用户逃离的手。
