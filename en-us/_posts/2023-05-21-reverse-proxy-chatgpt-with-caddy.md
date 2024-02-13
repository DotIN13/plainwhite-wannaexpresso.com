---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- ChatGPT
- OpenAI
- Caddy
title: 'This Article Is Not Too Late: Caddy Reverse Proxy for ChatGPT'
---

Sometimes, forgetting to bring an umbrella when it rains heavily leads to carrying one every day until the day before the next heavy rain.

Missed out on the California Gold Rush, missed out on Bitcoin, and it seems like we are about to miss out on the large language models again. But it's okay, what we miss is just this parallel universe.

## Reverse Proxy for ChatGPT, Is It Too Late?

Not too late, silently thinking in your heart, someone will definitely find it useful.

## Proxying ChatGPT with Caddy

Due to strict control by Cloudflare on the web end, there may be a risk of being blocked when reverse proxying. So, we turned to reverse proxying the OpenAI API.

It is quite easy to set up the proxy. First, [install Caddy 2](https://www.wannaexpresso.com/2020/04/21/aria-pi/#%E4%BE%9D%E7%85%A7%E5%AE%98%E6%96%B9%E6%8C%87%E5%8D%97%E5%AE%89%E8%A3%85caddy).

Write `/etc/Caddyfile`:

```shell
<host>:<port> {
  reverse_proxy https://api.openai.com {
    header_up Host api.openai.com
  }
}
```

Where `<host>` should be replaced with the IP or domain of the proxy server, and `<port>` should be replaced with the listening port.

It is worth noting that OpenAI API's Cloudflare defense mechanism checks the Host value in the request to determine if the request is indeed sent to OpenAI. If it is not `api.openai.com`, a 403 Forbidden error will be returned.

Therefore, you must set `header_up Host api.openai.com` to modify the Host in the request header to the corresponding value.

Run `sudo systemctl start caddy` to start the Caddy server. You can test if the proxy server is working properly using `curl`:

```shell
$ curl curl https://<host>:<port>/v1/models
{
  "error": {
    "message": "You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY), or as the password field (with blank username) if you're accessing the API from your browser and are prompted for a username and password. You can obtain an API key from https://platform.openai.com/account/api-keys.",
    "type": "invalid_request_error",
    "param": null,
    "code": null
  }
}
```

The returned message indicates that an API Key is required, indicating successful configuration.

If reverse proxying WOD had a difficulty level of 13, reverse proxying ChatGPT would only score a mere 4!

## Just a Thought

If you prefer using JSON configuration for Caddy, you can also refer to the following configuration:

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

## One More Thing

Going back to the initial question, why did we miss out (please forgive me, I am someone who always likes to ask why)?

It seems there are two main aspects: the initial drive and the perseverance. Just like the recent nuclear fusion experiment that successfully ignited and converted energy greater than the energy input, it is destined to be an indelible success—a good start is half the battle. However, the most difficult part of fusion is to sustainably control plasma, maintain a high-temperature and high-pressure environment, and ensure stable fusion occurs (please forgive me, I am not good at giving examples).

Doing something does not have much of a difference. To do something well, you first need a conviction from within yourself, coupled with some determined efforts, which is already very challenging. For example, to use ChatGPT, you need to purchase a mobile number, outwit the Russian telephone number provider, prepare proxy links, contend with domestic network proxy providers, evade OpenAI's regulation, and compete intellectually with capitalist enemies across the sea. Finally, when you open the interface, you still need to figure out what to ask and how to ask. It's like going back to the Neolithic era, relearning how to use a stone hammer, stone hoe, how to smelt iron...

It may sound complex, but it's not that complicated. After putting in the effort to use ChatGPT, you can always accomplish something, right? Well, that's uncertain. Open the Q&A interface: no desire to ask questions. Open the work document: can't find a starting point. Open VSCode: not sure what the API can do.

Empty, utterly empty.

Although starting something is not easy, it's just a moment of effort. However, persistence is a week, a month, or a decade of waiting. Moreover, persistence is not just a slogan; it involves continuous complex reasoning and creativity—no one can survive without surprises every day. And if there are really no surprises, you have to create them yourself.

After all the talking, it boils down to these two sentences: the beginning is always difficult, but to succeed is not just beginning. Many successful individuals have probably walked down this path.
