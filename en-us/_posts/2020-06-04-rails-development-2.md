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
title: RoR Development Log Two
typora-root-url: ../
---

## Database Configuration

I set up my own account in the Amazon Hong Kong region, created a new RDS instance, only to find that the free t2.micro option is not available in the selection list. I had no choice but to choose the cheapest option, t3.micro. After inquiring with customer service, they mentioned that the Hong Kong region is a new region and needs confirmation from the local team. Billing has started two days ago, and there has been no response yet. Although the price of 0.03 dollars per hour is not expensive, it still is money. If the issue cannot be resolved, I might consider trying Oracle's Always Free plan.

Above was a side note. Next, let's talk about the pitfalls encountered during the database configuration.

A correct `database.yml` configuration is a necessary condition for the app to successfully call the RDS instance. Initially, I configured `database`, `username`, `password`, and `host`, only to find that the program, although in production, was still using `sqlite3` as the database.

Comparing with configurations found online, I realized that two lines were missing. Since my RDS is PostgreSQL, it requires additional configuration for `adapter` and `encoding`. Otherwise, Rails would default to the settings in `database.yml`, where the specified database type is `sqlite3`.

A correct `database.yml` configuration example is as follows:

```yaml
# config/database.yml
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

## Environment Variables

Initially, I used `~/.bashrc` for environment variables, directly adding `export KEY=value` in the file, and then updating the environment with `source ~/.bashrc`. However, it seems that Rails occasionally encounters issues reading these environment variables. Moreover, it is considered inadequate from a security perspective. So, I switched to using the dotenv gem. However, during my second deployment to the server, Rails could not read the environment variables correctly, and the environment even switched to development. This issue was intolerable, leading me to switch to using the [figaro gem](https://github.com/laserlemon/figaro).

As usual:

```ruby
# Gemfile
gem "figaro"
```

Run:

```shell
bundle install
bundle exec figaro install
```

Figaro will modify `.gitignore` and create `config/application.yml`. The purpose of modifying `.gitignore` is to prevent sensitive information from `application.yml` being transmitted to git. Therefore, we need to manually create an `application.yml` on the server and fill in the environment variables.

```yaml
# config/application.yml
production:
  RDS_DATABASE: "postgresql://sadhuhuwd.aws.com/asdhuio"
  RDS_PASSWORD: "ad69caf9a44dcac1fb28"
  MAILER_EMAIL: "83ca7aa160fedaf3b350@gmail.com"
```

Then start the server, and Rails will be able to recognize the environment variables correctly.

## Rails Credentials

Starting from Rails 5.1, `secret.yml` is no longer used to store the master key. Instead, it uses `config/credentials.yml.enc` to store the encrypted master key, and `config/master.key` to store the decryption key used to decrypt `credentials.yml.enc`, ensuring the security of the key. In the production environment, if Rails cannot find the decryption key, the following errors may occur.

```shell
# Possible Error 1
ActiveSupport::MessageEncryptor::InvalidMessage
# Possible Error 2
Please run `rails credentials:edit`
```

This issue troubled me for almost an entire day. Every attempt to deploy to Elastic Beanstalk ended in failure. Finally, [StackOverflow user littleforest](https://stackoverflow.com/questions/60466861/how-to-generate-a-missing-secret-key-base-on-aws) provided two solutions.

### Solution One

Run in the local environment:

```shell
rails credentials:edit
```

Copy the secret_base_key that appears and add `SECRET_KEY_BASE=<content you just copied>` to your server environment variables.

### Solution Two

I ultimately chose this solution.

Run in the local environment:

```shell
rails credentials:edit
```

Then open `config/master.key` and copy the content.

Add `RAILS_MASTER_KEY=<content you just copied>` to the server's environment variables.

It is still recommended to manage ENV using the figaro gem mentioned earlier.

## Webpacker Compiling

When using Asset Pipeline, I encountered an issue where I couldn't guarantee that scss files were loaded in order. This caused errors when calling bootstrap variables across multiple files. Since Webpacker is gaining popularity, I reluctantly followed the [tutorial](https://www.vic-l.com/setup-bootstrap-in-rails-6-with-webpacker-for-development-and-production/) to place scss files in `app/javascript/stylesheets` and use `application.js` to load scss.

However, upon opening the rails server, I received an error on the webpage resembling:

```plaintext
could not find application in manifest.json
```

This exposed my knowledge gap. After researching, I found that Webpack, as the name suggests, has a packing process. Webpacker bundles resource files and by default saves them in the `app/public/packs` folder, generating a `manifest.json` to indicate to Rails which files in the `packs` folder need to be loaded. Since we didn't set up Webpacker to compile css, Rails couldn't find the index of css files in the manifest. Therefore, configuration is needed in `config/webpacker.yml`.

Configure the following in defaults and development projects:

```yaml
# config/webpacker.yml
default: &default

  ...
  
  # Reload manifest.json on all requests so we reload the latest compiled packs
  cache_manifest: false

  # Extract and emit a css file
  extract_css: true
  
  ...
  
development:
  <<: *default
  compile: true
  
  ...
```

`extract_css` ensures Webpacker generates compiled css, `compile` indicates compiling before starting the server, and `cache_manifest` caused me to struggle for hours. Accidentally setting it to true prevented the web page from updating whenever css was modified, so it requires special attention to ensure it is set to false.

During development, you can use the command `bin/webpack-dev-server` to open the compiling server. Webpacker will detect changes to resource files and immediately generate `manifest.json`. Even better, it can automatically refresh the browser to apply changes.

## Local Precompilation

During the process of deploying the App to EC2, I discovered that the `rails server` command itself does not precompile resource files. Additional running of `rails assets:precompile` is required. However, on a 1G1C server, running precompile for half an hour still couldn't complete. Therefore, I had to consider compiling locally.

After running `rails assets:precompile` locally, remove or comment out the following path in `.gitignore`:

```yaml
# /public/packs
```

This way, when pushing, the precompiled files can be uploaded together.

> 20200608#EDIT: After rebuilding the EC2 instance, I found that simply enabling the Unlimited feature of the instance allowed the server to handle the sudden increase in performance demand. Compilation now takes only a few minutes, so I no longer need to precompile locally.
