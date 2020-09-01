---
layout: post
title: "RoR开发日志五"
subtitle: "Ruby on Rails Development Log Five"
author: "DotIN13"
tags:
  - Linux Dev
  - Ruby
  - Ruby on Rails
  - WoD
typora-root-url: ../
locale: zh_CN
---

## Development must go on...

前几日观摩Web Dev，与会嘉宾口若悬河，称道自己两天内写了两千行代码，还故作谦虚，惊诧之余，暗暗感叹自己边学边写，速度实在有如龟行。一段代码，改了又改，改了又改，遇到难写处，我便喜欢起身倒水，一天能喝上十数杯。倒也不是企图从杯水中得些什么灵感，只不过是给自己僵住的大脑来上那么点distraction罢了。话虽然这么说，不断的refactoring确确实实相当痛苦，但最终看到自己的新设想得到实现，心中总有那么一点说不出的喜。

有时会对自己说，万一真的遇到我和我的老伙计——`StackOverflow`都解决不了的问题该怎么办。说真的，我还确实没怎么想过这个问题，不过也许那时候，我还可以请教我的朋友，我还可以一遍一遍地去思索。有人说要用有限的生命去做无限的为人民服务，我倒是想说，我或许会用无限的时间去解决那么几个有限的问题，如果我告诉你这是勇于追寻真理，那么朋友，或许你应该点醒我：那是因为当下你有的，除了时间，还是时间。

## 全局Logger

我正在制作的战斗系统包括战场、人员两大主要的对象，我的目标是在任何地方使用日志时，都能获取到同一个日志变量，并对战斗进行记录。似乎在类与类之间没法做到这一点，不过凑巧的是[StackOverflow](https://stackoverflow.com/questions/917566/ruby-share-logger-instance-among-module-classes)上已经有了靠谱的解决方法——Module。

有趣之处在于，在将Module包含到Class中时，Instance methods会被加载到Class中，而Module中的Class methods（事实上并不存在Module methods，他们应该被叫做Class methods）仍然可以直接在Module上直接调用。

```ruby
module Foo
  # Instance method of module Foo
  def method_a
    puts "a"
  end

  # Class method of module Foo
  def self.method_b
    puts "b"
  end
end

class Bar
  include Foo
end
```

上面的例子中，运行以下代码会有如下的输出。

```ruby
irb(main):001:1> bar = Bar.new
irb(main):002:1> bar.method_a
# => a
irb(main):003:1> bar.method_b
# => undefined method `method_b' for #<Bar:0x000055ac39b5d020>
irb(main):004:1> Bar.method_b
# => undefined method `method_b' for #<Bar: Class>
irb(main):004:1> Foo.method_b
# => b
```

可见，Module中的Class Methods不会被添加到include该Module的Class中，仍然可以正常对Module调用，而这些Class Methods中的Class Variable也相应的可以留存在Module中，从而可以通过`Module.accessor_method`顺利地读写。如此以来，以下的写法就可以让我们在多个Class中用同样的方法来读写同一个变量了：

```ruby
module Logging
  def logger
    Logging.logger
  end

  def self.logger
    @logger ||= Logger.new
  end
end

class Battlefield
  include Logging
end

class Combatant
  include Logging
end
```

如此一来，两个类中的`#logger`方法便都指向了`Logging.logger`，而后者正是Module Logging中的`@logger`。简单的说，我们可以在两个类中操作同一个`@logger`了。

上面的代码还可以用[Skeleton Class](https://ruby-doc.org/core-2.7.1/doc/syntax/modules_and_classes_rdoc.html#label-Singleton+Classes)的写法`class << self`来改写：

```ruby
module Logging
  # 相当于定义了self.logger与self.logger=两个accessor
  class << self
    attr_accessor :logger
  end

  def logger
    Logging.logger
  end

  def logger=(logger)
    Logging.logger = logger
  end
end
```

这个办法不仅仅可以用来读写日志，在我的实践中，我还用他记录战斗的回合数，相信他还有更多的妙用，等你去发现。

## 控制器名称

我知道给View加上太多logic是不合理的，不过有的时候还是想这么干，比如只有在技能的View里才显示增益效果的表单。这时候可以读取resource的`class.name`，不过我还是做了做功课，看了看有没有更好的办法。

结果是，并没有，不过[热心的网友](https://stackoverflow.com/questions/3757491/can-i-get-the-name-of-the-current-controller-in-the-view)告诉我，也可以用Controller的名称来辨别。

```ruby
controller.controller_name
```

`controller.controller_name`包含了当前控制器的名称，例如你的控制器叫`SkillsController`，那么这一方法的返回值就是字符串`skills`。配合判断语句，可以在不用到resource的情况下判断当前View的位置。

## Custom Seeding

上次问我的攻城狮朋友，该怎么处理游戏的基础数据，例如升级所需经验、英雄属性的种类，他告诉我存数据库方便修改。一开始我并不确信，不过在几个月的实践之后，我发现似乎确实如此，当你想添加一个属性，一种技能类型的时候，如果你没有把他们存在一个地方，那么这一次refactoring将让你难忘至少半个月。

问题就在于，Development和Production并不共用数据库，这意味着我把基础数据存进开发数据库后，我还得手动到Production创建另一份，况且我把这些基础数据用来作了Enum，如果这些数据不存在，服务器甚至没法启动，这时候只能用Seed来代劳了。但Seed文件只能有`db/seeds.rb`一个，想要分模块导入数据应该怎么做呢？

万能的[Stacky](https://stackoverflow.com/questions/7130334/is-there-any-way-to-have-multiple-seeds-rb-files-any-kind-of-versioning-for-s)告诉了我一个完美的方案，只消建立一个Rake task！

```ruby
# lib/tasks/custom_seed.rake
namespace :db do
  namespace :seed do

    Dir[File.join(Rails.root, 'db', 'seeds', '*.rb')].each do |filename|
      task_name = File.basename(filename, '.rb').intern

      task task_name => :environment do
        load(filename)
      end
    end

    task :all => :environment do
      Dir[File.join(Rails.root, 'db', 'seeds', '*.rb')].sort.each do |filename|
        load(filename)
      end
    end

  end
end
```

创建Rake task之后，我把我的多个Seed文件放到`db/seeds`文件夹下，如此一来，只要用`rails db:seed:file_name`就可以Seed一个单独的文件，而不必将整个`db/seeds.rb`都更新到数据库中了。

而`rails db:seed:all`则会导入整个`db/seeds`文件夹中的Seed。

另一个值得一提的地方是，Rails的`find_or_create_by`方法让更新基础数据非常方便。

```ruby
Game.find_or_create_by(name: "initial_experience").update(value: 100000)
```

这样的Seed可以在没有找到条目的时候自动创建，而如果条目已经存在时则直接更新，相当人性化。

## 时间

我有的是时间吗？似乎也不尽然，开学在即，不知道此后还有多少时间供我挥霍。身边的同学不是在实习，就是在找寻工作，求索落脚之处，或许不知何时起，我也当开始珍惜，珍惜逝去的秋水。

只不过现下还可略作最后的狂欢罢了。