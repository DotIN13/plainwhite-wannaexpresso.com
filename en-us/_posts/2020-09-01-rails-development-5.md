---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Linux
- Ruby
- Ruby on Rails
- WoD
title: RoR Development Log Five
typora-root-url: ../
---

## Development must go on...

A few days ago, while observing Web Dev, the speakers were eloquent and proudly claimed to have written two thousand lines of code in just two days. In contrast, I was amazed by their speed and couldn't help but sigh at my slow progress. I find myself constantly tweaking and refining a piece of code, often taking breaks to make multiple cups of tea in a day. Not for inspiration, though, just to distract my stagnant brain a bit. Despite the pain of continual refactoring, there is an indescribable joy when seeing my new ideas come to life eventually.

Sometimes I wonder what I would do if not even my trusted friend, `StackOverflow`, could solve a problem. Frankly, I haven't really dwelled on that question. But perhaps in those moments, I could consult my friends or ponder repeatedly. Some say to dedicate limited life to endless service, but I might just use infinite time to solve a few finite problems. If I tell you it's about courage in the pursuit of truth, then maybe you should remind me - it's all about having nothing but time.

## Global Logger

The battle system I am developing involves two main objects: battlefield and combatants. My goal is to have a single log variable accessible from anywhere to record battles. It seems impossible to achieve this across classes, but fortunately [StackOverflow](https://stackoverflow.com/questions/917566/ruby-share-logger-instance-among-module-classes) has a reliable solution - Modules.

Interestingly, when a Module is included in a Class, the instance methods are loaded into the Class, while the Class methods of the Module (actually, there are no Module methods, they should be called Class methods) can still be directly invoked on the Module.

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

In the example above, running the following code will produce the following output.

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

As observed, the Class Methods within a Module will not be added to the Class that includes the Module. They can still be accessed directly on the Module, and these Class Variables in the Class Methods also remain within the Module. Thus, by using `Module.accessor_method`, we can smoothly read and write the same variable in multiple Classes.

By following the examples above, we can have both classes' `#logger` methods pointing to `Logging.logger`, which is the `@logger` in the Module Logging. In simple terms, we can manipulate the same `@logger` in two classes.

The code above can also be rewritten using the [Skeleton Class](https://ruby-doc.org/core-2.7.1/doc/syntax/modules_and_classes_rdoc.html#label-Singleton+Classes) syntax `class << self`:

```ruby
module Logging
  # Define accessor methods for self.logger and self.logger=
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

This method is versatile, not only for logging but also for recording the number of battle rounds, and surely has more ingenious uses waiting to be discovered.

## Controller Name

I understand that adding excessive logic to Views is not ideal, but sometimes I can't resist the urge, like displaying a form for enhancement effects only in the skill's view. In such cases, reading the `class.name` of the resource is one way, but I did my homework to see if there is a better approach.

The result? Not really, but a [helpful fellow](https://stackoverflow.com/questions/3757491/can-i-get-the-name-of-the-current-controller-in-the-view) informed me that we can also differentiate by the Controller's name.

```ruby
controller.controller_name
```

`controller.controller_name` provides the name of the current Controller. For example, if your Controller is named `SkillsController`, the return value of this method will be the string `skills`. With conditional statements, you can determine the current View without relying on the resource.

## Custom Seeding

When I asked my developer friend how to handle the game's basic data like experience needed for leveling up or types of hero attributes, he suggested storing them in the database for easy modification. Initially skeptical, after months of practice, I realized the convenience. Adding a new attribute or skill type without storing them in one place would make refactoring unforgettable and last at least half a month.

The challenge lies in Development and Production not sharing a database. After storing basic data in the development database, I have to manually create another in Production. Moreover, if these basic data are used as Enums and they are missing, the server might not even start, so it's best to use Seeds. But the Seed file can only be `db/seeds.rb`, how do we import data module-wise?

The omnipotent [Stacky](https://stackoverflow.com/questions/7130334-is-there-any-way-to-have-multiple-seeds-rb-files-any-kind-of-versioning-for-s) gave me a perfect solution - create a Rake task!

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

After creating the Rake task, I placed my multiple Seed files in the `db/seeds` folder. Now, simply use `rails db:seed:file_name` to seed a specific file without updating the entire `db/seeds.rb` to the database.

And `rails db:seed:all` will import all the Seeds from the `db/seeds` folder.

Another noteworthy feature is Rails' `find_or_create_by` method, which makes updating basic data very straightforward.

```ruby
Game.find_or_create_by(name: "initial_experience").update(value: 100000)
```

This form of Seed automatically creates an entry if it does not exist and updates directly if the entry already exists, which is quite user-friendly.

## Time

Do I have time? Perhaps, not quite. As the new school year approaches, I wonder how much time I will have left to squander. My peers are either interning or job hunting, seeking a place to settle. Perhaps without realizing, I too will begin to cherish, cherish the passing autumn waters.

But for now, let's indulge in one last wild celebration.
