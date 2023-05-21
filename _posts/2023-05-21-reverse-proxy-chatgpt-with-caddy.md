---
layout: post
title: "这篇文章来得不太晚：Caddy反向代理ChatGPT"
subtitle: "ChatGPT Reverse Proxy with Caddy"
author: "DotIN13"
tags:
  - ChatGPT
  - OpenAI
  - Caddy
locale: zh_CN
---

有的时候，大雨来了忘记带伞，于是之后每天都带着伞出门，直到下次大雨的前一天。

加州淘金错过了，比特币错过了，大语言模型仿佛又要错过。不过也无妨，错过的只是这个平行宇宙。

## 反向代理ChatGPT，晚哉？

不晚呼——心里默念，总有人会用得上罢。

## 使用Caddy代理ChatGPT

网页端由于Cloudflare管的比较严，估摸着反向代理有封号风险，于是转而反向代理OpenAI API。

代理起来相当容易，首先[安装Caddy 2](https://www.wannaexpresso.com/2020/04/21/aria-pi/#%E4%BE%9D%E7%85%A7%E5%AE%98%E6%96%B9%E6%8C%87%E5%8D%97%E5%AE%89%E8%A3%85caddy)。

编写`/etc/Caddyfile`：

```shell
<host>:<port> {
  reverse_proxy https://api.openai.com {
    header_up Host api.openai.com
  }
}
```

其中，`<host>`应当替换为代理服务器的IP或者域名，`<port>`应当替换为监听的端口。

值得注意的是，OpenAI API的Cloudflare防御机制会检测请求中的Host值，以判断请求是否确实发向OpenAI。如果不为`api.openai.com`，将返回403 Forbidden错误。

因此必须设置`header_up Host api.openai.com`，将请求头中的Host修改为对应值。

运行`sudo systemctl start caddy`开启Caddy服务器，可以使用`curl`测试代理服务器是否工作正常：

```shell
$ curl curl https://<host>:<port>/v1/models
{
  "error": {
    "message": "You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY), or as the password field (with blank username) if you're accesing the API from your browser and are prompted for a username and password. You can obtain an API key from https://platform.openai.com/account/api-keys.",
    "type": "invalid_request_error",
    "param": null,
    "code": null
  }
}
```

返回值提示需要提供API Key，表示已经配置成功。

如果说[反向代理WOD](https://www.wannaexpresso.com/2020/04/26/wod-reverse-proxy/)的难度是13，反向代理ChatGPT的难度只能勉强打4分！

## 多嘴

如果喜欢使用JSON配置Caddy，也可以参考以下配置：

```json
{
  "admin": {
    "disabled": true
  },
  "logging": {
    "logs": {
      "log0": {
        "writer": {
          "output": "stdout"
        },
        "encoder": {
          "format": "console"
        },
        "level": "WARN"
      }
    }
  },
  "apps": {
    "http": {
      "servers": {
        "srv0": {
          "listen": [":<port>"],
          "routes": [
            {
              "match": [{ "host": ["<host>"] }],
              "handle": [
                {
                  "handler": "subroute",
                  "routes": [
                    {
                      "handle": [
                        {
                          "handler": "reverse_proxy",
                          "headers": {
                            "request": {
                              "set": {
                                "Host": ["api.openai.com"]
                              }
                            }
                          },
                          "transport": {
                            "protocol": "http",
                            "tls": {}
                          },
                          "upstreams": [{ "dial": "api.openai.com:443" }]
                        }
                      ]
                    }
                  ]
                }
              ],
              "terminal": true
            }
          ]
        }
      }
    }
  }
}
```

## 再多嘴几句

回到开头的问题，究竟为什么（请原谅，我总是一个喜欢问为什么的人）会错过？

似乎有两个主要的方面，一个是开始的动力，一个是持续的毅力。就好比前段时间大火的核聚变试验，点火成功，能量转化大于能量输入，这注定是一次不可磨灭的成功——一个好的开始是成功的一半。但同时，聚变最为困难的就是持续控制等离子体，保持高温高压环境，确保聚变稳定发生（请原谅，我是一个不太会举例子的人）。

人做一件事也没有太大的差别，要做好一件事，首先需要一个自己确信的由头，再加上一些破釜成舟的劲头，这已经是极难的了。例如要用上ChatGPT，要买上手机号，与俄罗斯电话号商斗智斗勇，又要准备代理链接，和国内网络代理商斗志斗勇，又要逃避OpenAI的监管，和对岸资本主义斗智斗勇，最后到头来打开了界面，还要头疼得问些什么、怎么问。仿佛是回到新石器时代，重新学怎么使用石锤、石锄，怎样炼铁……

说复杂，倒也不复杂，费劲心思用上了ChatGPT，总能做些什么吧？那倒也说不准。打开问答界面：没有提问的欲望。打开工作文档：找不到提问点。打开VSCode：不知道API能做什么。

空，空空的。

虽说开始做一件事不容易，但它也就是那么一瞬的事。而坚持，是一个周、一个月，是十年的冷板凳。况且，坚持不是一句口号，坚持的途中是不间断的复杂思维与发明创造——没有惊喜的日子谁都过不下去，再要是真的没有惊喜，那就只能自己动手创造。

翻来覆去说了那么多，也就无非那么两句话：万事开头难，修行靠自身。不少成功者恐怕都是这样走来的。
