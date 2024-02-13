---
layout: post
title: "RoR开发日志四"
subtitle: "Ruby on Rails Development Log Four"
author: "DotIN13"
tags:
  - Linux
  - Ruby
  - Ruby on Rails
  - WoD
typora-root-url: ../
locale: zh-cn
---

## 未竟之业

学期结束，满目B+，也不是说开发HoE多大程度上影响了学习，只是觉得心里少了些什么东西，一时间对继续开发失了兴趣。暑假开始，便用剧集与游戏麻木自己的神经。不知是谁用指头点醒了我？不知是何处来的风吹散了遮眼尘烟？某一天从床上醒来，发现自己过去的一个月，一事无成。多少的电视剧烂了尾，多少游戏永远上不去的分，何必当真？

{% include post-image.html link="post-rails-development/reminiscence.png" alt="重拾" %}

于是，重拾未竟之业，尝试寻找自己对自己的一种认可。

## 本地调试PostgreSQL

开发许久，终于意识到将游戏配置存在数据库中是多大的一个relief。于是决定将英雄属性列表、攻击类型列表一类游戏核心配置全部存进一张表里。数据类型，要不就用数组吧。不过Rails自带的SQLite并不能支持原生的Array，与我在production环境中所用的PostgreSQL不一。于是决定在本地建立一个psql用作调试。

检查软件列表，发现12.3的PostgreSQL不知何时已然装好，于是尝试运行`postgres`命令，却发现报错，表示必须要使用单独的用户来运行postgres相关命令，以保证数据的安全。由于尚在摸索中，不当心用`userdel`删除了安装PostgreSQL时自动创建的`postgres`用户。也罢，只得自己再创建一个新的。

```shell
sudo useradd -m -d /var/lib/pgsql
sudo chown -R postgres:postgres /var/lib/pgsql
```

依照[PostgreSQL Documentation](https://www.postgresql.org/docs/current/creating-cluster.html)，我把postgres用户的home目录设置到了`/var/lib`，没学过Unix文件结构，姑且这么干了。然后切换到新用户，创建数据库文件。

```shell
sudo -i -u postgres # 切换到postgres用户
mkdir /var/lib/pgsql/data
initdb -D /var/lib/pgsql/data # 创建数据库文件
```

我试图直接运行`pg_ctl`开启服务器，缺发现缺少对`/run/postgresql`的权限。于是只好创建文件夹并赋予`postgres`相应权限。

```shell
# Error: "/run/postgresql/.s.PGSQL.5432.lock": No such file or directory
sudo mkdir /run/postgresql
sudo chown -R postgres:postgres /run/postgresql
```

此时`pg_ctl start -l logfile -D  /var/lib/pgsql/data`就可以非常合理地启动服务器了。

我还为pg_ctl配置了systemd的开机自启，方便调试。

```shell
# /etc/systemd/system/postgresql.service
[Unit]
Description=PostgreSQL database server
Documentation=man:postgres(1)

[Service]
Type=notify
User=postgres
ExecStart=/usr/bin/postgres -D /var/lib/pgsql/data
ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT
TimeoutSec=0

[Install]
WantedBy=multi-user.target
```

然后就是配置Rails了。

```yaml
# config/database.yml
default: &default
  adapter: postgresql
  encoding: unicode
  username: postgres
  pool: 5
  timeout: 5000
  host: localhost

development:
  <<: *default
  database: ezantoh-development

# Warning: The database defined as "test" will be erased and
# re-generated from your development database when you run "rake".
# Do not set this db to the same as development or production.
test:
  <<: *default
  database: ezantoh-test

production:
  <<: *default
  # database: db/production.sqlite3
  adapter: postgresql
  encoding: unicode
  database: <%= ENV['RDS_DATABASE'] %>
  username: <%= ENV['RDS_USERNAME'] %>
  password: <%= ENV['RDS_PASSWORD'] %>
  host: <%= ENV['RDS_HOST'] %>
  post: 5432
```

最后收尾，运行`rails db:setup`就可以建立development和test所需的数据库了。

可以用pgAdmin GUI方便地查看刚刚建立的数据库。

> 友情提示：如果`rails console`还没反应过来，还在使用SQLite，那么就需要运行`bin/spring stop`来点醒他了。

如此一来，我在本地和AWS上的数据库就能保持统一，做到同步使用`array: true`了。

## 数组表单

数据库的部分完成之后，就要考虑怎么创建表单了。

阅读[Rails Guides Form Helpers](https://guides.rubyonrails.org/form_helpers.html#basic-structures)，我了解到使用形如`game_rule[value][]`的name就可以使params获取到数组。例如：

```html
<input name="person[phone_number][]" value="0" type="text"/>
<input name="person[phone_number][]" value="0" type="text"/>
<input name="person[phone_number][]" value="0" type="text"/>
```

这样的三个输入框会形成一个如下的params：

```ruby
{ 'person' => { 'phone_number' => ['0', '0', '0'] } }
```

但Rails原生没有合适的helper可以创建这样的表单，在不断的尝试下，终于找到了一个折中的方案，同时满足了新建与修改两个action的需求。

```erb
<% (person.phone_number || [nil]).each do |val| %>
<div class="field form-group col-6 col-md-3">
  <%= form.label :value %>
  <%= text_field_tag 'person[phone_number][]', val, class: "form-control" %>
</div>
<% end %>
```

## 根据字符串定义方法

在创建游戏配置的时候，想要批量定义多个方法，于是便从万能的`StackOverflow`了解，可以利用字符串数组来批量`define_method`。

```ruby
class Foo
  %w[method_a method_b].each do |method_name|
    define_method method_name do |args|
      # Do something
    end
  end
end
```

如此一来就建立了`#method_a(arg)`和`#method_b(arg)`两个instance method。那么想要建立class method的话，只需要调用`self.class.defind_method`即可，例如：

```ruby
class Foo
  %w[method_a method_b].each do |method_name|
    self.class.define_method method_name do |args|
      # Do something
    end
  end
end
```

## 总结

不断地学习，不断地成长，不要对结果抱有太多的胜负心，享受过程。