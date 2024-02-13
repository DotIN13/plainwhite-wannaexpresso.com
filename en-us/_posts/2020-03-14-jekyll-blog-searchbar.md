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
- Searchbar
title: Adding Simple Global Search to Jekyll Blog
---

## This is not a tutorial

After seeing the cool search feature on [Spotlog](https://soptq.me/2019/04/03/implement-search/#jekyll-feature), although I knew that Hux created the `Hux Blog` theme with a principle of simplicity and clarity, I couldn't resist. Unfortunately, Spotq didn't release the specific implementation code, and the repository on GitHub was also closed. So, I had to roll up my sleeves and do it myself.

## Not skilled in frontend

Hux used `Bootstrap 3.3` when creating the theme, so I tried to directly insert the search box into the Navbar using the convenient framework. However, after multiple attempts, it ended in failure. The code I copied from the internet either didn't work at all or wasn't aesthetically pleasing.

After failing for an afternoon, I decided to put the search box in the right sidebar. The only problem was that on mobile devices, the search box appeared at the very bottom of the page. My idea was to have a search icon on the left and an input box on the right, but it ended up displaying directly in the `<ul>` below.

The first problem encountered was a bug in the sidebar of Hux Blog, where the elements below the Featured Tags section were mistakenly treated as tags. This caused the `<hr>` below this `<section>` and my added `<input>` to be wrapped in `<a>`, making the search box automatically redirect every time it was clicked. After a long study, I found the issue in this line:

```html
{% raw %}
{{ tags | split:'</a>' | sort | join:'</a>'}}
{% endraw %}
```

However, I couldn't fix it because my knowledge of Liquid was too limited. In the end, the compromise was to copy the code from an older version of the Hux Blog theme without this bug, resulting in the tags in the sidebar no longer being automatically sorted.

> Edit: This issue has been fixed by Hux in the latest version of the Hux Blog theme. The solution involves modifying part of the code in `_includes/featured-tags.html` to:

> ```html
> {% raw %}
> ...
> <a>...</a>__SEPARATOR__
> {% endif %}{% endfor %}
> {% endcapture %}
> {{ tags | split:'__SEPARATOR__' | sort }}
> {% endraw %}
> ```

> For specific instructions, please refer to the Hux Blog Commits.

After solving this problem, I proceeded to write the code for the search box. The structure was simple, with a `<div>` containing a search glyph and an `<input>` for input. I wanted to make the left `<div>` and the right `<input>` the same height, similar to the Bootstrap Docs, but I couldn't achieve it. The traditional `display: inline-block` approach made them the same height on PC but different on mobile devices. I found that to make them the same height, I needed to use `display: flex`, allowing both elements to be within the same container `<div>` and displayed using the box model, ensuring they maintained a uniform height.

So, I ended up with the following code:

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="css,result" data-user="DotIN13" data-slug-hash="dyomaqQ" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Search Bar">
  <span>See the Pen <a href="https://codepen.io/DotIN13/pen/dyomaqQ">
  Search Bar</a> by DotIN13 (<a href="https://codepen.io/DotIN13">@DotIN13</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

## Reinventing the wheel

Sometimes, reinventing the wheel is truly harder for a clumsy carpenter than reaching the sky. However, a great philosopher named Hyt once said, "I think reinventing the wheel is a learning process. By the time you know how to reinvent the wheel, you truly understand how to use it."

Through continuous trials and errors, isn't that how people grow?
