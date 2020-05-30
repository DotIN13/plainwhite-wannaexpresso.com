---
layout: post
title: "RoR开发日志一"
subtitle: "Ruby on Rails Development Log One"
author: "DotIN13"
tags:
  - Linux Dev
  - Ruby
  - Ruby on Rails
  - WoD
typora-root-url: ../
locale: zh_CN
---

## Rails开发日志

在利用Head First Ruby学习完Ruby之后，又在网上找到了Hartl的The Ruby on Rails Tutorial自学。不能说成才，总算也是对Rails的使用有了一些基本的认识，由于最爱的WoD（World of Dungeons）年久失修，便决定用Rails来做一个Rebuild。Hartl的书相对来说比较基础，很多实际问题都没有涉及到，这也对我的开发产生了很多困扰，但好在Stackoverflow实在太强，踏破铁鞋无觅处，得来全不费功夫的例子实在是太多。

## 企业邮箱

用自己的邮箱来做Devise验证邮箱实在是非常愚蠢（误），于是便决定准备一个企业邮箱。一开始用的是网易免费企业邮箱，却发现连最基本的安全码登陆都做不到，于是便注销了帐号转战腾讯。腾讯企业邮箱相对管理面板更为现代，而且使用微信登陆比较方便，但如果一个人要有多个企业邮箱可能就比较麻烦了。

首先我配置了`app/mailers/application_mailer.rb`的发信地址。

```ruby
class ApplicationMailer < ActionMailer::Base
  default from: <email address>
  layout 'mailer'
end
```

然后我决定按照devise的documentation配置一个新的mailer`app/mailers/ezantoh_mailer.rb`。

```ruby
# frozen_string_literal: true

class EzantohMailer < Devise::Mailer
  helper :application # gives access to all helpers defined within `application_helper`.
  include Devise::Controllers::UrlHelpers # Optional. eg. `confirmation_url`
  default template_path: 'devise/mailer' # to make sure that your mailer uses the devise views
  # If there is an object in your application that returns a contact email, you can use it as follows
  # Note that Devise passes a Devise::Mailer object to your proc, hence the parameter throwaway (*).
  # default from: ->(*) { Class.instance.email_address }
end
```

然后需要在Devise的Initializer里调用我的Mailer。

```ruby
  # ==> Mailer Configuration
  # Configure the e-mail address which will be shown in Devise::Mailer,
  # note that it will be overwritten if you use your own mailer class
  # with default "from" parameter.
  config.mailer_sender = 'admin@wannaexpresso.com'

  # Configure the class responsible to send e-mails.
  config.mailer = 'EzantohMailer'

  # Configure the parent class responsible to send e-mails.
  # config.parent_mailer = 'ActionMailer::Base'
```

最后在`config/environments/production.rb`中配置了详细的邮箱讯息。这时需要从企业邮箱设置页面获取安全码。

```ruby
  # SMTP settings
  config.action_mailer.delivery_method = :smtp
  host = <host>
  config.action_mailer.default_url_options = { host: host }
  ActionMailer::Base.smtp_settings = {
    address: 'smtp.exmail.qq.com',
    port: '587',
    authentication: :login,
    user_name: <email address>,
    password: <email secret>,
    domain: 'exmail.qq.com',
    enable_starttls_auto: true
  }
```

一开始我的设置怎么都不能发送邮件，最后发现是domain的设置问题，需要设置为`exmail.qq.com`。此外，这里的端口设置我尝试过许多，25、465、587似乎都可以使用，但是使用465端口要额外添加`tls: true`。

## Could not find generator

我希望能够给app添加密码强度validation，在网上搜索之后找到了Devise的插件Devise Security。在修改`Gemfile`并且`bundle install`之后，按照documentation使用`rails generate`安装插件，却遇到了`could not find generator`的错误。

在Stackoverflow遨游之后，找到了解决办法。原因是Spring服务器没有记录新安装的gem，需要重启Spring。

```shell
bin/spring stop
```

Spring会在下次使用`rails`命令时自动重启。这时再使用`generate`命令就可以正常安装Devise Security了。

## 提交表单错误信息不显示

我首先在游戏里创建的是英雄职业，职业拥有一些加成（Modification），由于加成还可以被种族、装备所拥有，因此这里我用了Polymorphic Association，而修改种族的表单也因此需要做成Nested Dynamic Form。

一开始我用了Cocoon gem，却发现表单提交错误信息一直不能显示，以为是Cocoon的bug，于是又按照[Gorails教程](https://www.youtube.com/watch?v=qM4ZK0uuZUE)和[Stimulus JS](https://stimulusjs.org/) Documentation用Stimulus重构，问题却仍然存在。

在Stackoverflow上找到的相关问题都是由于表单提交不成功时使用了redirect导致的表单model被重置。而我已经使用了`render 'new'`，所以没能找到答案。

随后，我仔细观察Server Log发现，其他一些页面的log是`render xxx as HTML`，而我的表单页面提交之后，却是`render xxx as JS`。我猜测，是由于页面通过Ajax刷新，而flash是在下一次HTML redirect/render时显示，这导致了错误信息不能正确显示。

在[Rails Guide](https://edgeguides.rubyonrails.org/form_helpers.html#making-select-boxes-with-ease)中找到了解决的办法，也就是说，在表单中默认是`remote: true`，也就是数据提交会由XHR（Ajax）接管。如果需要关闭，需要在`form_with`中设置`local: true`。

```ruby
form_with(url: search_path, method: "patch", local: true)
```

如果执意要用Ajax，Guides指出可以参考[Working with JavaScript in Rails](https://edgeguides.rubyonrails.org/working_with_javascript_in_rails.html#remote-elements)。

## 总结

开发一个Web App确实很有难度，需要耐心，需要创造力。更重要的是需要无时不刻地抱有一颗谦虚的心，不断地学习、探究，因为只有站在巨人的肩膀上，才能看的更远。