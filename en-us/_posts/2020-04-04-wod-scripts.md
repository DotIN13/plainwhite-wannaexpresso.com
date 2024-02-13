---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- WoD
- Tampermonkey
- Javascript
title: The Stories of Writing Tampermonkey Scripts for WoD
---

## If I Keep Writing Scripts, I'll Have to Sacrifice a Hand

I have been intermittently writing 5 Tampermonkey scripts for WoD, unfortunately, only two of them have been truly appreciated by players. And since the number of WoD players is incredibly low. To give you a rough idea, out of China's 1.4 billion population, maybe just 300 people are playing WoD?

I mean, if you continue writing WoD scripts, you might as well prepare to sacrifice a hand. Well, sacrificing a hand does sound painful, how about sacrificing Xilia instead...

## Function Scope

The scope of calling functions is probably the first issue I encountered while scripting. Have you ever confidently written a function in Tampermonkey, hoping to add it to an onclick event of a button, but struggled to trigger it during debugging?

Well, the problem is quite simple: the default template for Tampermonkey scripts is an anonymous function.

```javascript
(function() {
    //your script
})();
```

The above code segment is equivalent to:

```javascript
function a() {
    //your script
}
a();
```

So, when your entire script is within the scope of this function, how can the browser locate another function within this function? One solution is to abandon the default function shell provided by Tampermonkey, and complete your script in the global scope. However, this might lead to conflicts between your variables and other variables on the website. You can define your global function using the window object, like this...

```javascript
(function(){
    window.a = function() {
        //your function
    }
})();
```

Now, you can directly call this function in the global environment through `a()` in events.

## RegExp

As a genuine Coding Rookie, when I was writing my first script, WoD Jumpbox Enhanced, I came across a perplexing line of code in the website's js file that left me confused: `/^\s*\[\s*([^:]+?)\s*:\s*(.+?)\s*\]\s*$/`.

Friendly community members Hyt and Eric generously helped me decipher this mystery: it turned out to be the famous regular expression. Not knowing about it was one thing, but learning about its many rules was an eye-opener. After going through [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp), I gained some understanding of this powerful tool for string matching.

However, when to use `g` for global matching and when to use `m` for multiline matching, I am still in a **go-with-the-flow** state...

## XMLHttpRequest

In the Treasure Vault Reputation script, it involved reading the list of items provided by WoD. I initially created a `display: none` div to store the information fetched by `$().load`, to pass through smoothly.

But, while creating the script for fetching the minimum equipment requirements, I discovered that `$().load` simply didn't work within a for loop. Speculated that the previous load was not completed, and the for loop had moved on to the next iteration, causing all load actions to be skipped. I reluctantly delved into XMLHttpRequest, luckily, resources on StackOverflow and MDN were rich, and soon I understood that using XMLHttpRequest for fetching web content is a fixed asynchronous operation, allowing multiple fetch operations to run concurrently. This posed an issue for recording data since I was tracking the 'i' value of each equipment as I traversed through all the equipment to sequentially store their information in an array. But how could I pass this 'i' value to the XMLHttpRequest's Callback function?

The all-knowing [StackOverflow](https://stackoverflow.com/questions/25220486/xmlhttprequest-in-for-loop) provided an answer:

```javascript
window.onload = function(){

    var f = (function(){
        var xhr = [], i;
        for(i = 0; i < 3; i++){ //for loop
            (function(i){
                xhr[i] = new XMLHttpRequest();
                url = "closure.php?data=" + i;
                xhr[i].open("GET", url, true);
                xhr[i].onreadystatechange = function(){
                    if (xhr[i].readyState === 4 && xhr[i].status === 200){
                        console.log('Response from request ' + i + ' [ ' + xhr[i].responseText + ']'); 
                    }
                };
                xhr[i].send();
            })(i);
        }
    })();

};
```

Using an anonymous function, the internet wizard effortlessly passed 'i' to the callback function, ultimately saving my plugin creation process.

## Epilogue

Sacrificing a hand? Just kidding. Indeed, developing scripts presented many challenges, and my user base is very small. But, in this process, I gained a lot. How long can this happiness of dedicating to something I love last?

At the very end, I must express my gratitude to the chief script tester lnsh02...
