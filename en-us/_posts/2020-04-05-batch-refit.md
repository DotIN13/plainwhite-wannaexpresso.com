---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Batch Replacer
- VSCode
- Jekyll
- Rouge
- RegExp
title: Switching to Rouge Highlighting Engine with Ease using Batch Replacer
typora-root-url: ../
---

## Issue

After migrating from Blogger to Jekyll+Zeit, I encountered a problem where code blocks embedded in `details` like the one below were not highlighted because Jekyll does not support rendering Markdown in HTML.

```html
<details>
    <summary>BlahBlah</summary>
    ```lang
    ...
    ```
</details>
```

Not to mention the code blocks imported from Blogger were using Highlight.js syntax, which directly ignored by Rouge:

```html
<pre><code class="lang">
    ...
</code></pre>
```

Therefore, post-migration to Jekyll, to insert code within `<details>`, I continued using Highlight.js as the code highlighting engine.

However, after switching themes to plainwhite, being a perfectionist, I wanted to stick with Rouge, bidding farewell to Highlight.js and moving forward. This involved replacing the code blocks mentioned above with Rouge-supported syntax.

## Solution

While exploring Rouge documentation online, I discovered that Rouge not only supports Markdown code blocks but also liquid syntax:

```liquid
{% raw %}{% highlight lang %}
...
{% endhighlight %}{% endraw %}
```

Therefore, by replacing the mentioned `<pre>` with `{% raw %}`{% highlight lang %}`{% endraw %}, it should work. But I didn't want to do it manually. With an experimental mindset, I searched for a batch replace plugin in Eric's beloved VSCode. Surprisingly, I found one: [Batch Replacer](https://marketplace.visualstudio.com/items?itemName=angelomollame.batch-replacer). This plugin supports batch replacement of all file contents in the Workspace with RegExp syntax.

{% include post-image.html link="post-batch-replacer/batch-replacer.png" alt="Batch Replacer Extension" %}

Armed with my newfound RegExp knowledge, eager to try it out, I crafted the following replacement code snippet:

```plaintext
{% raw %}replace-regex "<pre>\s*<code class="([^"]*)">"
with "{% highlight $1 %}"

replace-regex "</code>\s*</pre>"
with "{% endhighlight %}"{% endraw %}
```

Add the `_post` folder to the Workspace, press `Ctrl+Shift+P`, type `Batch Refit`, hit Enter, and voilà!

Now all code blocks using Highlight.js syntax have been replaced with Rouge code blocks. Even when wrapped within HTML code, they can be easily identified and rendered. Pretty smart, right? Hahaha!
