---
author: DotIN13
layout: post
locale: en-us
series: Jellyfin x Manjaro
subtitle: null
tags:
- Jellyfin
- Manjaro
- Caddy
title: "Chapter One: Tricky Subpath Reverse Proxy Configuration Files Are a Must-Have"
---

Is it not easy to play Jellyfin on Manjaro?

Actually, it's not.

When installing via AUR, I couldn't connect to GitHub, and that had me worried, no, it had me holding my breath.

But that was relatively easy to resolve. After installation, there were three hurdles to overcome, luckily not as difficult as nine times nine eighty-one challenges.

The Jellyfin x Manjaro series consists of three chapters. We won't discuss the installation process but rather what happens after the installation is complete.

## Caddy Reverse Proxy

It's quite absurd, I wasn't home when installing Jellyfin, and after installation, I read in the documentation that I had to initialize Jellyfin by opening the network management interface. Therefore, I had to resort to using Caddy reverse proxy to access it remotely.

"Well, here we go again! Another Caddyfile edit!"

I was quite annoyed. I didn't want to set up a new domain name, so I decided to configure Jellyfin using a subpath method in Caddyfile, as shown below:

```shell
jellyfin.mydomain.com {
  reverse_proxy /jellyfin/* localhost:8096
}
```

## Jellyfin Subpath

You might think this wraps everything up nicely, right? I believe readers on my channel might have already spotted the issue before me 🧐. How can you access the server if there's no subpath setting to begin with!

So, if you can't access the configuration interface, how do you set the subpath? And if there's no subpath setting, how do you initialize the configuration...

Just kidding.

Overall, either remove the subpath in Caddyfile first or SSH in to modify the configuration files.

I chose the latter.

Since I couldn't find any documentation on the XML configuration file, I inferred that all network-related settings were stored in the configuration folder.

```xml
<!-- /var/lib/jellyfin/config/network.xml !-->
...
<BaseUrl>/jellyfin</BaseUrl>
...
```

After changing the value of BaseUrl to `jellyfin`, you can now access it using the subpath.

> A quick note: With the condition `reverse_proxy /jellyfin/*`, Caddyfile strictly reverse proxies requests under the `/jellyfin/` path. Accessing `/jellyfin` will not automatically redirect to `/jellyfin/`, but you can use `rewrite /jellyfin /jellyfin/` as a workaround.

## Documentation

Perhaps the network management system was deemed efficient, as Jellyfin did not provide documentation for configuration files.

Humans are never flawless, hence there's no perfect documentation.

Rambling: Maybe one day, I'll personally update the reverse proxy section... Since the thought crossed my mind, I might as well do it now.

Submitting [pull request](https://github.com/jellyfin/jellyfin-docs/pull/629)...

Merged.
