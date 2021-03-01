---
layout: post
title: "Onclick Not Working after Switching Pages? stopPropagation Saves the Day!"
subtitle: "切换页面后onclick不工作 stopPropagation来救场"
author: "DotIN13"
multilingual: true
tags:
  - JavaScript
  - Blog
typora-root-url: ../
locale: en_US
---

## Plainwhite Theme

After surfing the NET for a while, I found that there were really a lot of people using Hux Blog Jekyll theme, which was a solid proof the theme stands out both visually and pragmatically. But as it seemed everyone's using it, I thought it would be a loss of personality if I kept it as well. So I scrolled through the Internet and switched to [@thelehhman's Plainwhite](https://github.com/thelehhman/plainwhite-jekyll). The theme itself was great, however, it's so simple that I had to add manually many features, such as the search bar.

{% include post-image.html link="post-searchbar/searchbar.gif" alt="Plainwhite Searchbar" %}

I have previously implemented [search module on Hux Blog](/2020/03/14/jekyll-blog-searchbar/), so I had the experience. However, you can see that the Plainwhite theme is so minimalistic that I couldn't decide where to hoist a search bar. Finally I decided to go with the `posts` label on the top of the page.

## Dropdown Not Working on Mobile Safari

My goal was to show the search bar and the results when I hover on the search sector, so naturally I thought of using CSS pseudoclass `:hover` & `:hoverwithin` to implement such animations.

```html
# HTML
<li class="posts-labelgroup" id="posts-labelgroup">
  <h1 id="posts-label" style="width: 50px;">posts</h1>
  <div class="search-container">
    <div class="search-section"><i class="icon-search"></i><input type="text" name="search" id="searchbar"
        autocomplete="off" aria-label="search in posts"></div>
    <div class="search-results" id="search-results" data-placeholder="NO RESULTS" style="display: none;"></div>
  </div>
</li>
```

```scss
# SCSS
.posts-labelgroup {
  // searchbar style
  &:focus-within {
    // searchbar style on focus
  }
}
```

It actually worked on PC and Android browsers, but sadly it doesn't when it comes to Mobile Safari -- when I clicked the results in the dropdown, no redirect was triggered. It looks like clicking stuff outside the search bar canceled `:focus` and `:focus-within`, rendering my clicks on the results futile. That's a bit weird for it only appears on Safari.

After going through some posts on line, I learned other developer suggests that `:hover` doesn't really make sense on mobile devices, and recommends JavaScript alternatives to cope with such issues.

Alas, VSCode, here I come!

## Onclick "Sometimes Not Working"

I started with a simple onclick event adding `focus-within` class to the outer `$labelGroup`, hoping the class could help render the desired animation with CSS.

```javascript
# JavaScript Excerpt
window.onload = function () {
  // add click eventlistener
  $labelGroup.addEventListener("click", function () {
    // animation to expand search results
  }, false);

  $labelGroup.addEventListener("mouseleave", function () {
    document.body.onclick = searchCollapse;
  });

  var searchCollapse = function () {
    // animation to collapse search results
  };
}
```

But when testing, I found that sometimes when I clicked `$labelGroup`, nothing happened other than the `input` getting focus. Shadows, search result dropdown and other animations didn't work. I had to double click the search `input` to actually trigger the animation. The bug happens mostly when I switched to other browser tabs and went back. Though it's not easy to trigger, it still bothers me, who is obviously an OCD patient.

## Try to Find A Workaround

I added `console.log()` to the callback of the click event, and it turned out that although the animation were not shown, the callback actually did get run. Most similar issues online didn't have a running callback, so that made my issue even more mysterious. I tried numerous browsers and found that the issue wasn't browser specific.

After trying hundreds of solutions I could find online, almost accidentally, I copied a chunk of code online, and I was astonished that the issue was gone! **One will search high and low only to find it when one least expects to.** The magic was with the `e.stopPropagation()`. 

## Dig Hard

I had to mention JavaScript [Bubbling](https://javascript.info/bubbling-and-capturing) to better illustrate the issue.

```html
<style>
  body * {
    margin: 10px;
    border: 1px solid blue;
  }
</style>

<form onclick="alert('form')">FORM
  <div onclick="alert('div')">DIV
    <p onclick="alert('p')">P</p>
  </div>
</form>
```

<style>
  #code-tryout {
    border: solid 2px #f4f4f4;   
  }
  #code-tryout * {
    margin: 10px;
    border: 1px solid #268bd2;
  }
</style>

<div id="code-tryout">
  <form onclick="alert('form')">FORM
    <div onclick="alert('div')">DIV
      <p onclick="alert('p')">P (Click Me!)</p>
    </div>
  </form>
</div>
When you trigger an event on an element, it would get passed to its parent elements (ancestors), all the way back to `document.body`, triggering the event on all of the elements on its way. The example above explains Bubbling well -- when `<p>` is clicked, the click event on `<p>` would be triggered, then `<div>`, then `<form>`.

Then what does that have to do with my search bar issue?

Following was two examples, one with `stopPropagation`, one without. In the falty example, the JavaScript first adds a click event for `input`, shows a sting when clicked, and then added a `mouseleave` event to the `input`, which would attach a click event to outer `div` to cancel the string display.

The problem here is as follows: when your mouse moves in and out the `input` without clicking it, JavaScript will add the `click` event to outer `div` anyways. Now you click the search bar, the click event of `input` triggers and show the string, however, in a time of milliseconds, the event gets bubbled to the outer `div` and triggers its event to cancel the string display. Two canceling events were triggered so close that human eye could never notice neither one of them.

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="js,result" data-user="DotIN13" data-slug-hash="qBOXjWJ" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="stopPropagation">
  <span>See the Pen <a href="https://codepen.io/DotIN13/pen/qBOXjWJ">
  stopPropagation</a> by DotIN13 (<a href="https://codepen.io/DotIN13">@DotIN13</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

Moving back to our blog search bar, when switching pages, the mouse was likely to pass the bar, creating a unwanted `click` event for the `document.body`. When switching back to the blog page, click on the search bar would trigger both the `search bar` and `document.body` events, canceling the effect of each other.

After getting to know the source of the issue, it would be easy to get rid of it. We just need to add a line of `e.stopPropagation();` to the search bar click callback, in order to stop the bubbling when search bar gets clicked.

## Later

Of course, the issue had other possible solutions, for instance, place `mouseleave` in the search bar `click` event to make sure it only gets created after click, and add code to remove `mouseleave` on `document.body.click`.

Coding is special itself. It is always a open question. The boundary of such a question is the infinite creativity and imagination of mankind.