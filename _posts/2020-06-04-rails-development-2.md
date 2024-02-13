---
layout: post
title: "RoR开发日志二"
subtitle: "Ruby on Rails Development Log Two"
author: "DotIN13"
tags:
  - Linux
  - Ruby
  - Ruby on Rails
  - WoD
typora-root-url: ../
locale: zh-cn
---

## 数据库配置

在亚马逊香港区建立了自己的账户，新建了一个RDS实例，却发现免费套餐的t2.micro根本不在选项列表中，只得选择了最便宜的t3.micro。一问客服，却推说港区是新区，需要和当地团队确认，计费已经开始两天，至今还没有回复，每小时0.03美元的价格虽说不贵，却也终究是钱，如若不能解决，倒是可以回头尝试一下Oracle的Always Free。

以上是题外话，接下来谈谈在配置数据库的时候遇到的坑。

一个正确的`database.yml`配置是App成功调用RDS实例的必要条件。一开始我配置了`database`、`username`以及`password`和`host`，却发现程序虽然处于production中，却依旧在使用`sqlite3`作为数据库。

对照网络上的配置，发现少了两行，由于我的RDS是PostgreSQL，还需要额外配置`adapter`和`encoding`，否则Rails就会调用`database.yml`中的default设置，而default中指定的数据库类型是`sqlite3`。

一个正确的`database.yml`配置实例如下：

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

## 环境变量

一开始我的环境变量用的是`~/.bashrc`，直接在文件中添加`export KEY=value`，然后`source ~/.bashrc`更新环境。但似乎Rails在读取这类环境变量时偶尔会出现不能读取的问题，并且网络上认为这种方式不够安全，于是我转而采用了dotenv gem，然而，在我第二次部署到服务器的时候，Rails就不能正确读取环境变量了，甚至环境变成了development。这种问题自然不能忍，于是又转而使用[figaro gem](https://github.com/laserlemon/figaro)。

老规矩：

```ruby
# Gemfile
gem "figaro"
```

执行：

```shell
bundle install
bundle exec figaro install
```

figaro会修改`.gitignore`，并创建`config/application.yml`。修改`.gitignore`的本意就是不要将`application.yml`的敏感信息传输到git。因此我们需要在服务器上手工创建一个`application.yml`，并且将环境变量填入。

```yaml
# config/application.yml
production:
  RDS_DATABASE: "postgresql://sadhuhuwd.aws.com/asdhuio"
  RDS_PASSWORD: "ad69caf9a44dcac1fb28"
  MAILER_EMAIL: "83ca7aa160fedaf3b350@gmail.com"
```

然后启动服务器，Rails就能够正确识别环境变量了。

## Rails Credentials

Rails 5.1+开始，不再使用`secret.yml`存储主密钥，而采用`config/credentials.yml.enc`存储加密后的主密钥，再由`config/master.key`存储解密密钥用于解密`credentials.yml.enc`，来确保密钥的安全。在production环境中如果Rails找不到解密密钥，就可能出现以下的错误。

```shell
# Possible Error 1
ActiveSupport::MessageEncryptor::InvalidMessage
# Possible Error 2
Please run `rails credentials:edit`
```

这一问题困扰了我几乎一整天，我每次尝试向Elastic Beanstalk部署都以失败告终。最后发现，[StackOverflow的littleforest](https://stackoverflow.com/questions/60466861/how-to-generate-a-missing-secret-key-base-on-aws)回答了这一问题，有两种解决方案。

### 方案一

在本地环境运行：

```shell
rails credentials:edit
```

复制出现的secret_base_key，在你的服务器环境变量中添加`SECRET_KEY_BASE=<你刚才复制的内容>`

### 方案二

我最终选择了这一解决方案。

在本地环境运行：

```shell
rails credentials:edit
```

然后打开`config/master.key`，复制内容。

在服务器的环境变量中添加`RAILS_MASTER_KEY=<你刚才复制的内容>`

最后还是推荐使用刚刚提到的figaro gem来管理ENV。

## Webpacker Compiling

使用Asset Pipeline的时候遇到一个问题，那就是不能保证scss文件按顺序加载。这导致了在多文件中调用bootstrap变量100%报错。既然Webpacker是大势所趋，我也勉为其难[依照教程](https://www.vic-l.com/setup-bootstrap-in-rails-6-with-webpacker-for-development-and-production/)将scss放到了`app/javascript/stylesheets`，使用`application.js`来加载scss。

然而打开rails server，进入网页却收到错误，大体如下：

```plaintext
could not find application in manifest.json
```

这就涉及到我的知识盲区了，搜集资料后发现Webpack顾名思义，是有一个pack过程的，Webpacker将资源文件打包之后，默认保存在`app/public/packs`文件夹中，并生成一个`manifest.json`来为Rails指明需要加载`packs`文件夹中的哪些文件，由于我们没有设置Webpacker编译css，在manifest中Rails是找不到css文件的索引的。因此需要在`config/webpacker.yml`中进行配置。

在defaults和development项目中进行如下配置：

```yaml
# config/webpacker.yml
default: &default

  ...
  
  # Reload manifest.json on all requests so we reload latest compiled packs
  cache_manifest: false

  # Extract and emit a css file
  extract_css: true
  
  ...
  
development:
  <<: *default
  compile: true
  
  ...
```

`extract_css`保证了Webpacker会生成编译好的css，`compile`表示在开始服务器前进行编译，而`cache_manifest`则让我折腾了好几个小时，不小心将它设置成true导致了每次修改css网页都不会更新，因此需要格外小心，保证其设置为false。

在开发的时候，可以使用命令`bin/webpack-dev-server`打开编译服务器，Webpacker会检测资源文件的改动，并且即时生成`manifest.json`。更贴心的是，它还能够自动刷新浏览器以应用改动。

## 本地预编译

在将App部署到EC2的过程当中，发现`rails server`命令本身不会预编译资源文件，需要额外运行`rails assets:precompile`，然而，1G1C的服务器运行预编译半个小时都不能完成，于是只得考虑在本地编译。

在本地运行`rails assets:precompile`之后，在`.gitignore`中删除或者comment以下路径：

```yaml
# /public/packs
```

这样push时就能将预编译的文件一并上传了。

> 20200608#EDIT: 重新建立EC2实例后，发现只要打开实例的Unlimited特性，服务器就能够应对突增的性能需求了，编译只需要数分钟，因此我不再需要本地预编译。