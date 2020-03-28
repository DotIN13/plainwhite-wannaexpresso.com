---
layout: post
title: Ruby学习心得
subtitle: Learning Ruby
author: DotIN13
catalog: true
tags:
  - Programming Language
  - Linux Dev
  - Ruby
---

## Why Ruby

为什么要学习Ruby？在茫茫多的后端语言中，为什么要选择接触陌生的Ruby？事实上，我第一次接触Ruby还是在搭建这个Jekyll的时候，gem需要换源，从Blogger迁移到Jekyll需要一条四行的复杂代码，第一印象事实上并不怎么样。但当我遍览后端语言，似乎没有任何一款能够入我的法眼。

C语言和C++是我所学过的语言，让我感到困难之处其一在于数组大小预先设定，其二在于最终都没有搞清楚`namespace`的机制。而对于Java，我了解到即便是要写一个输出`Hello World`都需要定义类，写整整三行的代码。再谈到Python，有些人提到其泛用的框架年久失修。于是，我又回到了Ruby上，有许多评论都称其为一款“优雅”的语言，倡导用更少的代码完成更多的事情。我想，这也许就是我作为一个代码初学者所需要的吧。于是，我开始了与Ruby之间的结缘。

## Ruby as A Vivid Language

我选择的教材，一如既往地，是Head First系列。这一系列非常生动易懂，很适合像我这样的三脚猫。

在学习了数章之后，Ruby完全打破了我此前对其的印象，我发现这是一个致力于Simplify Everything的编程语言。他是一款Object+Method化晚期的语言，任何东西都可以是Object，无论是String，还是Number，还是Array，这倒也是与我此前学习的Javascript有一些异曲同工之妙。

另一个有趣之处在于，Ruby的Methods都采用了非常容易理解、容易记忆的名字，比如`:include?`就是判断是否包含字符串，`:even?`就是判断数字是否为偶数，一个个小问号特别有活力。

Ruby还有很多方便之处，比如调用Methods不需要括号，分割语句不需要分号，代码块不需要大括号，定义变量不需要类型，等等。如果说C语言像是一个胡子拉渣的中年人，Ruby就是一个活泼开朗的男孩。他简单，开明，便捷，易于使用，确实可以说是一款Programmer-friendly的语言。

## Problems?

当然，完美本身就是不存在的。Ruby的学习还是让我产生了很多的问题。

### 强行Object Oriented

在编写Javascript的时候，我就发现自己编写的脚本与其他程序员的作品有相当的差距，当我写出的代码是这个架构的时候：

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

有一些资深的程序员是这么写的：

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
我到目前为止还不知道应该怎样平衡Object-oriented与Function-oriented这两种处理代码的方式。有一些代码用Object来写逻辑性非常强，让我一见倾心，但也有程序员也告诉我并不一定要遵循这样的书写。面对Ruby这一同样非常强调Object的语言，我仍然有些迷茫。

### 混乱的Variables

Ruby的变量有四类：`local variable`, `global variable`, `class variable`, `instance variable`，他们四者的scope都不同。而我的问题聚焦于`instance variable`，在class定义的过程中，我发现，Ruby为了方便，使用变量，允许代码中使用`variable`来代指`self.variable`，进而调用`variable`与`variable=`方法，以做到写入与读取`@variable`类变量。

这一本来应当方便使用class的设置却给代码书写带来了新的麻烦：

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

在这个代码实例中，似乎`Class.process`能够得到-1的返回值，但事实上你会得到错误：

```
NoMethodError (undefined method `-@' for nil:NilClass)
```

其中原委，不得而知，当将`variable = - variable`修改为`@variable = - variable`时，程序就又能正常运行了。

这一问题，还需要进一步的学习来解决。但就Ruby本身来说，这也是其好心却添了乱的一种表现。

## 总结

Ruby作为一款编程语言，的确，他有他自己的一些问题，需要我们深入地学习才有可能化解，但从这门语言的各个方面来看，他的确是在处处为程序员书写代码的便利考虑。如果说要选出我所接触的最人性化的语言，那非Ruby莫属（这句话事实上并没有什么分量，因为加上HTML我才刚刚接触了五种编程语言）。但无论如何，我认为我还会继续学习Ruby，并且进一步探索Ruby on Rails，总有一天，能真正地学会如何造轮子。