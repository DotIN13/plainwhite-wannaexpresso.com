---
author: DotIN13
catalog: true
layout: post
locale: en-us
subtitle: null
tags:
- Programming Language
- Linux
- Ruby
title: Learning Ruby
---

## Why Ruby

Why learn Ruby? Among the myriad of backend languages, why choose to delve into the unfamiliar territory of Ruby? In fact, my first encounter with Ruby was when setting up this Jekyll site. I needed to change the gem source, and migrating from Blogger to Jekyll required a complex four-line code. The first impression was not that great. However, as I explored various backend languages, it seemed that none really captured my interest.

C and C++ were languages I struggled with, one challenge being the predefined size of arrays, and the other being my failure to fully grasp the mechanism of `namespace`. As for Java, even a simple "Hello World" output required defining a class and writing three lines of code. Talking about Python, some mentioned its widely-used frameworks being outdated. So, I circled back to Ruby, where many reviews labeled it as an "elegant" language, advocating for accomplishing more with less code. Perhaps, this is exactly what I, as a beginner, needed. Thus, I embarked on my journey with Ruby.

## Ruby as A Vivid Language

The textbook I chose, as always, was from the Head First series. This series is very lively and easy to understand, making it perfect for someone like me, a novice.

After studying several chapters, Ruby completely shattered my preconceived notions. I discovered that it is a programming language dedicated to Simplify Everything. It is a late-stage Object+Method-oriented language where anything can be an Object, be it a String, Number, or Array. This aspect strangely resonated with what I learned in Javascript.

Another interesting feature is that Ruby's Methods have easily understandable and memorable names, such as `:include?` to check for string inclusion, and `:even?` to determine if a number is even. Each little question mark adds a touch of liveliness.

Ruby also offers many conveniences, like not needing parentheses when calling methods, omitting semicolons for statement separation, skipping curly braces for code blocks, and not requiring variable typing, among others. If C language is like a middle-aged man with a long beard, then Ruby is like a lively and cheerful boy. It is simple, progressive, convenient, and easy to use, truly a programmer-friendly language.

## Problems?

Of course, perfection itself does not exist. Learning Ruby presented me with various challenges.

### Forceful Object Orientation

While writing Javascript, I noticed a significant difference between my scripts and those of other programmers. When I wrote code like this:

```javascript
function a() {
    ...
}

function b() {
    ...
}

a();
b();
```

Some seasoned programmers wrote it like this:

```javascript
var tool = {
    a: function () {
        ...
    }

    b: function () {
        ...
    }
}

tool.a();
tool.b();
```
So far, I remain unsure of how to balance the Object-oriented and Function-oriented approaches to handling code. Some code written using Objects immediately caught my attention due to its strong logic, but other programmers suggested that this style is not always necessary. Faced with Ruby, yet another language that strongly emphasizes Objects, I still find myself perplexed.

### Confusing Variables

Ruby has four types of variables: `local variable`, `global variable`, `class variable`, `instance variable`, each with a different scope. My concern centers around `instance variables`. While defining a class, I noticed that Ruby allows referencing `self.variable` as simply `variable` in the code, enabling the calling of `variable` and `variable=` methods to read and write to the `@variable` class variable smoothly.

This convenience in using class settings for instance variables, though, introduced new challenges to code writing:

```ruby
class Example
    attr_accessor :variable
    
    def process
        variable = - variable
        variable
    end
end

instance = Example.new
instance.variable = 1
instance.process
```

In this code example, it appears that `Class.process` should return -1, but in reality, you will encounter an error:

```
NoMethodError (undefined method `-@' for nil:NilClass)
```

The reason behind this remains a mystery. Changing `variable = - variable` to `@variable = - variable` resolves the issue and allows the program to run smoothly again.

> 2020/04/07 EDIT: Reading page 219 of "The Ruby on Rails Tutorial 6th Ed." says, "In fact, inside the String class, the use of self. is optional on a method or attribute (unless we’re making an assignment)". This means that Ruby does not automatically add `self.` when assigning Instance Variables, causing the variable to be recognized as `nil`. Therefore, it is better to remember to add `self.` or `@` when assigning values.

This issue requires further learning to resolve. However, in its essence, Ruby's well-intentioned features sometimes end up causing confusion.

## Conclusion

As a programming language, Ruby indeed has its share of challenges that require in-depth study to overcome. Yet, considering all aspects of this language, it truly prioritizes the convenience of programmers in writing code. If I were to choose the most user-friendly language I have encountered, it would undoubtedly be Ruby (although this statement lacks gravitas since I have only just started learning my fifth programming language, including HTML). Nevertheless, I believe I will continue learning Ruby and further explore Ruby on Rails. Someday, I will truly grasp how to build wheels from scratch.
