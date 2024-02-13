---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- WoD
- Caddy
- Reverse Proxy
title: Reverse Proxy World of Dungeons with Caddy 2
typora-root-url: ../
---

## Caddy 2

Previously, I tried setting up an Aria2 download site with Caddy 2 without providing a proper introduction. So, let's talk a bit more about the advantages of Caddy 2.

1. Installation is unbelievably easy.
   Caddy 2 wraps the entire program into a binary file, making installation as simple as copying the `caddy` file to `/usr/bin`. Uninstallation is just deletion, and updating is merely replacement, making it remarkably convenient.
2. Caddy is the only web server that automatically supports HTTPS.
   Just inform Caddy 2 of the domain name or IP address you want to deploy, and Caddy will automatically issue a self-signed certificate or Let's Encrypt certificate. Moreover, it automatically redirects visits from port 80 to port 443, eliminating a lot of configuration steps.
3. Abundant functionalities.
   You can use Caddy 2's `file_server` to build static websites, `file_server browse` for a file sharing site, `reverse_proxy` for reverse proxy, or even let Caddy render `.md` files to create a blog.
4. Simple configuration.
   Since the first generation, Caddy has provided a simple and easy-to-learn Caddyfile configuration method. What might require dozens of lines in JSON to configure, might only take a few lines in a Caddyfile. Of course, it also supports JSON configuration to handle complex tasks.

## Reverse Proxy

The idea is simple. WoD is a web game server, presumably in Germany. It often faces issues with slow speed and lag during normal visits. A suitable solution is a shared proxy tool. Therefore, I thought of utilizing a VPS for reverse proxy to expedite access.

> A proxy server is a go-between or intermediary server that forwards requests for content from multiple clients to different servers across the Internet. A **reverse proxy server** is a type of proxy server that typically sits behind the firewall in a private network and directs client requests to the appropriate backend server. A reverse proxy provides an additional level of abstraction and control to ensure the smooth flow of network traffic between clients and servers.

{% include post-image.html link="post-reverse-proxy/reverse-proxy.jpg" alt="Reverse Proxy" %}

From the image, it is evident that the reverse proxy operates by proxying through an intermediate server to the backend server. When users access, they directly connect to the intermediate server, which then fetches the response from the backend server to return to the user.

{% include post-image.html link="post-reverse-proxy/forward-proxy.jpg" alt="Forward Proxy" %}

On the other hand, this image illustrates a forward proxy, with VPN being a typical example. It acts by proxying clients through an intermediary server, with the server making content requests and sending responses back to the clients. In simple terms, the main distinction between reverse and forward proxies is which server the intermediate server is proxying for.

## Reverse Proxying WoD with Caddy 2

Now that we understand the concept, let's put it into practice.

### Login

The initial hurdle to overcome is the login issue. WoD's login system is entirely built with JavaScript, submitting the form filled by players using `.submit()`. However, Christian (the WoD author) hardcoded the submission object as `world-of-dungeons.org`.

The solution is straightforward (although it took me a while to think of), save the login page locally and provide the service using a different domain, `login.wannaexpresso.com`. By changing the submission object in JavaScript to `canto.wannaexpresso.com`, logging in works as expected. The downside is having to log in via the login site every time, rather than directly at `canto.wannaexpresso.com`.

> Food for thought: With Nginx, perhaps the sub_filter function could be used to replace the form submission object, enabling direct login on the game site. But Caddy does not yet have this feature.

However, after submitting the correct form, I found that the redirection after submission goes directly to `world-of-dungeons.org` due to the Host not being set in the request header. Adding `header-up Host canto.wannaexpresso.com` in the Caddyfile resolved this issue.

### Usage

Post-login, I encountered another issue where every action triggered a "Please allow cookies" warning page.

After extensive research, I learned that the cookies returned by the server are saved by the browser under the cookie domain of the backend server. This prevents proper retrieval upon subsequent visits, necessitating adjustment of the Set-Cookie domain value in the response header to the proxy server's domain.

After writing `header_down Set-Cookie world-of-dungeons.org wannaexpresso.com` following Caddy's syntax, I faced a problem where the server's response headers turned into garbled text. Upon consulting the Caddy community, the helpful developer Matt quickly spotted the issue lying with Caddy 2. He spent a minute fixing it and committed it, allowing me to test the immediately compiled version.

I didn't even know what CI was, so foolishly downloaded the Git source code and compiled the freshly baked new Caddy file on my server, replacing the `/usr/bin/caddy`, and rebooting the server.

One successful attempt, and now all WoD functionalities can be accessed through my reverse proxy server!

### Caddyfile

After all that discussion, let's take a look at the final Caddyfile.

```bash
# Setting up an additional login site for making subtle modifications to internal web pages
login.wannaexpresso.com {
  encode gzip
  # Setting root to the folder containing the login page
  root * /home/wod
  file_server
  # Setting the transparent request header
  header X-Real-IP {http.request.remote.host}
  header X-Forwarded-For {http.request.remote.host}
  header X-Forwarded-Port {http.request.port}
  header X-Forwarded-Proto {http.request.scheme}
}

# Reverse proxying WoD's two game servers
canto.wannaexpresso.com {
  encode gzip
  reverse_proxy * http://canto.world-of-dungeons.org {
    # Setting the Host request header
    header_up Host canto.world-of-dungeons.org
    # Setting the transparent request header
    header_up X-Real-IP {http.request.remote.host}
    header_up X-Forwarded-For {http.request.remote.host}
    header_up X-Forwarded-Port {http.request.port}
    header_up X-Forwarded-Proto {http.request.scheme}
    header_down Set-Cookie world-of-dungeons.org wannaexpresso.com
  }
}

zhao.wannaexpresso.com {
  encode gzip
  reverse_proxy * http://zhao.world-of-dungeons.org {
    header_up Host zhao.world-of-dungeons.org
    header_up X-Real-IP {http.request.remote.host}
    header_up X-Forwarded-For {http.request.remote.host}
    header_up X-Forwarded-Port {http.request.port}
    header_up X-Forwarded-Proto {http.request.scheme}
    header_down Set-Cookie world-of-dungeons.org wannaexpresso.com
  }
}
```

Isn't it exceptionally straightforward? ;)
