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
title: RoR Development Log One
typora-root-url: ../
---

## Rails Development Log

After studying Ruby with Head First Ruby, I found Hartl's The Ruby on Rails Tutorial online for self-learning. Although I can't say I've become a genius, at least I have some basic understanding of using Rails. Since my beloved World of Dungeons (WoD) has been neglected for a long time, I decided to use Rails to rebuild it. Hartl's book is relatively basic and does not cover many practical issues, which has caused me a lot of confusion in my development process. Fortunately, Stackoverflow is incredibly helpful. I found many examples effortlessly without spending too much effort.

## Corporate Email

Using my own email for Devise email verification is truly foolish (mistake), so I decided to set up a corporate email. Initially, I used NetEase's free corporate email service, only to find that I couldn't even log in with a security code. I then closed the account and switched to Tencent. Tencent's corporate email has a more modern management panel, and logging in with WeChat is more convenient. However, if one person needs multiple corporate emails, it might be a bit cumbersome.

First, I configured the sending address in `app/mailers/application_mailer.rb`.

```ruby
class ApplicationMailer < ActionMailer::Base
  default from: <email address>
  layout 'mailer'
end
```

Then, I decided to set up a new mailer `app/mailers/ezantoh_mailer.rb` according to Devise's documentation.

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

Next, I needed to call my mailer in Devise's Initializer.

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

Finally, in `config/environments/production.rb`, I configured detailed email settings. I needed to obtain a security code from the corporate email settings page.

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

Initially, my settings couldn't send emails no matter what I tried. I eventually discovered that the issue was with the domain setting, which needed to be set to `exmail.qq.com`. Additionally, I tried multiple port settings like 25, 465, and 587, and they all seemed to work, but using port 465 required adding `tls: true`.

## Could not find generator

I wanted to add password strength validation to the app and found the Devise Security plugin online. After modifying the `Gemfile` and running `bundle install`, I encountered a `could not find generator` error when trying to install the plugin using `rails generate`.

After browsing Stackoverflow, I found a solution. The reason was that the Spring server didn't recognize the newly installed gem, so I needed to restart Spring.

```shell
bin/spring stop
```

Spring will automatically restart the next time you use the `rails` command. After this, I was able to successfully install Devise Security using the `generate` command.

## Error Messages Not Showing on Form Submission

Initially, I created hero classes in the game, where each class had some modifications. Since modifications could also be possessed by races and equipment, I used Polymorphic Associations here, making the race modification form a Nested Dynamic Form.

I initially used the Cocoon gem but found that error messages on form submission were not displaying. I thought it was a bug in Cocoon, so I refactored using Stimulus based on the [Gorails tutorial](https://www.youtube.com/watch?v=qM4ZK0uuZUE) and [Stimulus JS](https://stimulusjs.org/) Documentation, but the issue persisted.

Related issues found on Stackoverflow were due to the form model being reset when a form submission was unsuccessful and resulted in a redirect. Since I was using `render 'new'`, I couldn't find an answer.

Later, after carefully examining the Server Log, I noticed that for other pages, the log was `render xxx as HTML`, but after submitting the form page, it was `render xxx as JS`. I speculated that because the page refreshes through Ajax, and the flash is displayed on the next HTML redirect/render, this caused the error messages not to display correctly.

I found the solution in the [Rails Guide](https://edgeguides.rubyonrails.org/form_helpers.html#making-select-boxes-with-ease), which explained that by default, forms are `remote: true`, meaning data submission is managed by XHR (Ajax). To disable this, I needed to set `local: true` in `form_with`.

```ruby
form_with(url: search_path, method: "patch", local: true)
```

If you insist on using Ajax, the Guides suggest referring to [Working with JavaScript in Rails](https://edgeguides.rubyonrails.org/working_with_javascript_in_rails.html#remote-elements).

## Conclusion

Developing a Web App is indeed challenging, requiring patience, creativity, and, most importantly, a humble attitude of continuous learning and exploration. Only by standing on the shoulders of giants can we see further.
