---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- macOS
- VLESS
- XLTS
title: Gracefully Understanding Xray+VLESS+XTLS
---

## Xray

Xray is a brand-new network toolset that originates from the V2Ray project and is used for constructing basic communication networks. Compared to traditional VMESS and TLS protocols, VLESS and XTLS protocols supported by Xray greatly improve performance, enabling higher communication efficiency under unchanged network infrastructure. In theory, Xray has significant advantages in transmission speed and resource utilization.

### VLESS

VLESS is a newly emerging data transmission protocol, and according to the [developers' introduction](https://github.com/v2ray/v2ray-core/issues/2636), its data structure is as follows.

#### Request

| 1 byte | 16 bytes | 1 byte         | M bytes            | 1 byte | 2 bytes | 1 byte | S bytes | X bytes |
| ------ | -------- | -------------- | ------------------ | ------ | ------ | ------ | ------ | ------ |
| Protocol Version | Equivalent UUID | Additional Info Length M | Additional Info ProtoBuf | Instruction | Port | Address Type | Address | Request Data |

#### Response

| 1 byte             | 1 byte        | N bytes           | Y bytes |
| ------------------ | -------------- | ----------------- | ------- |
| Protocol Version, consistent with request | Additional Info Length N | Additional Info ProtoBuf | Response Data |

Compared to other transmission protocols, VLESS protocol is more concise and can achieve more efficient data transmission. Based on past experiences, its main advantages include:

1. VLESS protocol does not depend on system time. In a Windows + Linux dual system environment, users no longer need to worry about time zone differences.
2. VLESS protocol does not encrypt data during data transmission. When used in conjunction with other encrypted transmission protocols, it can achieve higher performance.
3. Allows for fallback, enabling non-proxy data received to be forwarded without the need for additional forwarding services to be deployed.
4. VLESS protocol may have a unified export format in the future, making it convenient for transmission and use across different endpoints.

### XTLS

According to the [developers' Release Notes](https://github.com/rprx/v2ray-vless/releases/tag/xtls), the XTLS protocol ensures that already encrypted inner layer TLS data is not redundantly decrypted and encrypted on top of the already TLS encrypted HTTP/HTTPS data. This greatly reduces node compute pressure and enhances data throughput.

Its main advantages include:

1. Reducing decryption and encryption workload to improve data transmission efficiency under the same infrastructure.
2. Decreasing compute pressure on communication infrastructure, reducing heat generation and power consumption.
3. Only requiring encryption once in multi-layered nested XTLS applications, optimizing multi-node forwarding.

## Usage

Currently on macOS, the available clients mainly include the iOS version of Shadowrockets compatible with M1 and [Qv2ray](https://github.com/Qv2ray/Qv2ray).

A simple configuration example for the client is as follows:

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
                        "address": "REDACTED", // Server IP Address or Domain
                        "port": "REDACTED", // Server Port
                        "users": [
                            {
                                "id": "REDACTED", // Client Key
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
                    "serverName": "REDACTED" // Server Domain
                }
            }
        }
    ]
}
```

### Shadowrockets

Shadowrockets uses the old version 4.27 V2Ray kernel to be compatible with XTLS, and manual import of the configuration JSON enables its usage.

On the M1 MacBook, the application implements proxy through creating a global VPN and can achieve split tunneling through built-in routing. However, switching the proxy on must be done manually through the software interface originally designed for touchscreens, lacking a convenient status bar icon.

In terms of proxy efficiency, there do not seem to be major issues.

### Qv2ray

Qv2ray allows for self-replacing the V2Ray kernel with the Xray kernel. After downloading the corresponding binary file from [xray-core](https://github.com/XTLS/Xray-core/releases) and filling in the location of the `xray` file in the software settings, users can proceed with using it. Similarly, after inputting the client configuration JSON, it can be utilized.

Compared to Shadowrockets, Qv2ray does not mandate global proxy usage and provides a status bar icon for convenient control. However, Qv2ray's routing system seems to have some deficiencies. When using third-party `.dat` routing tables, noticeable delays occur when opening webpages, especially evident on local websites that do not require proxy.

However, a major advantage of VLESS is that the server nativity supports fallback, allowing for the simultaneous establishment of servers for other protocols that can then be connected with suitable clients. For example, on macOS, a more efficient connection can be established using `Trojan`.

## New Innovations and Old Ecosystems

**Innovation** and **ecosystems** always come hand in hand, yet they also balance each other out. New innovations often lack appropriate ecosystems to thrive at the onset, such as the software ecosystem for M1 MacBook or the Android tablet application ecosystem.

Xray brings forth excellent new technology but also provides a fallback mechanism, allowing different devices to easily enter the communication tunnel using suitable clients and protocols. This back compatibility can greatly assist users in transitioning to new technologies, but does it inadvertently disrupt its own ecosystem?

On one hand, it forces itself to be compatible with the old ecosystem to attract users' favor, yet this may make it subject to various upstream projects. On the other hand, once users enter the new ecosystem, it means they accept the innovations corresponding to that ecosystem. In this scenario, excessive compatibility seems to risk being counterproductive.

A good ecosystem not only supports users but also restrains them from fleeing.
