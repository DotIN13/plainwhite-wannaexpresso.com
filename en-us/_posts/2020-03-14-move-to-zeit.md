---
author: DotIN13
header-img: _webpack/images/post-jekyll-troubleshooting/jekyll.png
header-mask: 0.6
layout: post
locale: en-us
subtitle: null
tags:
- Linux
- Jekyll
- Blog
- GitHub Pages
- Zeit Now
title: Moving Jekyll Blog to Zeit Now
---

## Background

After noticing that other blogs have search bars, I wanted to add one to my own. So, I decided to use the `Simple-Jekyll-Search` plugin, similar to [Spotlog](https://soptq.me/2019/04/03/implement-search). Unexpectedly, the compilation on Coding using `jekyll build --safe` was successful, but it failed on GitHub. I mistakenly assumed that GitHub did not support the plugin (later, after migrating to Zeit, I found that the compilation mysteriously passed the last two times). Therefore, I made the decision to migrate to the more autonomous platform of [Zeit](https://zeit.co/). Zeit has many advantages, of which I will briefly mention a few:

1. Zeit has over 20 CDN servers distributed globally, solving the problem of unstable access on GitHub Pages. My network ping is around 40ms, which is already at a decent level.
2. Through GitHub Integration, Zeit can link with GitHub, automatically deploying whenever there is a Push on GitHub. This surpasses the direct use of GitHub Pages.
3. The free plan offers 20GB of traffic, which is sufficient for a small blog.
4. Domain configuration is done automatically, making it relatively convenient.
5. Freed from the constraints of `--safe`, more plugins can be utilized to enhance the blogging experience.
6. The customer service is very dedicated. I received a response to my ticket within a few hours, helping me resolve the issue.

## Migration Process

The migration to Zeit is relatively straightforward. It begins with the step-by-step process of linking Zeit with your GitHub account, granting Zeit access to your repository.

After linking is complete, Zeit will automatically deploy once. If your files are in order, your blog will be deployed directly to a domain with a `.now.sh` suffix, allowing you to preview the outcome.

Finally, you need to cancel the previous DNS resolution, replace the Name Servers on GoDaddy/Freenom with Zeit's, add your domain to Zeit's domain list, and Zeit will handle the domain resolution automatically (although the downside is that you cannot modify the resolution records on the free plan). Then, you can access your blog through your domain.

## Side Story

Previously, I attempted to install `Jekyll-Sitemap` to generate a Sitemap. I created a `Gemfile` in the root directory and encountered a `jekyll command not found` compilation error on Coding. Consequently, I had to delete the `Gemfile` and use liquid to create a `sitemap.xml`.

After migrating to Zeit, the `jekyll command not found` error resurfaced. Upon consulting the Jekyll Docs, I discovered that a clean Blog directory should have a `Gemfile` to identify Dependencies. Thus, I added the `Gemfile` back to the root directory and included the following code:

```ruby
gem "jekyll"
gem "jekyll-paginate"
```

After pushing the changes, The blog compiled successfully on Zeit.

Regarding the mechanism, since I am not particularly familiar with Jekyll and can run `jekyll serve` locally with or without a `Gemfile`, I was unaware of the necessity of `Gemfile`. However, for those facing the same issue, you can follow this resolution method.
