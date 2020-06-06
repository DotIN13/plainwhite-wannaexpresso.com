---
layout: post
title: "RoR开发日志三 Capistrano + Puma + Caddy部署特辑"
subtitle: "Ruby on Rails Development Log Three: Capistrano + Puma + Caddy"
author: "DotIN13"
tags:
  - Linux Dev
  - Ruby
  - Ruby on Rails
  - WoD
typora-root-url: ../
locale: zh_CN
---

## Web App Hosting

尝试过AWS Elastic Beanstalk和Azure Web App，前者出现的missing credentials直接把我劝退，因为还要我自己手动登陆EC2修改配置，那我还不如直接建一个EC2；后者则只支持Ruby 2.6，并且免费套餐不支持自定义域名。此外，这类一揽子服务使用的是Nginx，而我想用Caddy，没有为什么，用Caddy V2就是帅气！综合考量下来，我还是选择直接使用AWS EC2来部署我的应用。

一开始我选择手动`git push` + `git pull`，不过稍微有些麻烦，于是决定部署一个Capistrano来自动化部署过程。

## 配置环境

### Ruby

安装Ruby 2.7.1时发现Ubuntu的软件库还停留在2.7.0，于是使用rbenv来安装Ruby，废话不多说，直接上命令。

```shell
# Fully update server packages
sudo apt-get update
sudo apt-get upgrade -y

# Choose Time zone=>Asia=>Shanghai
sudo dpkg-reconfigure tzdata

# Install rails dependencies, include libpq-dev if you are using postreSQL
sudo apt-get install -y build-essential git-core bison openssl libreadline6-dev curl zlib1g zlib1g-dev libssl-dev libyaml-dev libsqlite3-0 libsqlite3-dev sqlite3  autoconf libc6-dev libpcre3-dev curl libcurl4-nss-dev libxml2-dev libxslt-dev imagemagick nodejs libffi-dev libpq-dev

# Clone rbenv repo
git clone https://github.com/rbenv/rbenv.git ~/.rbenv

# Setup rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
exec $SHELL

# Clone ruby-build plugin
git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build

# Install Ruby 2.7.1; this might take some time
rbenv install 2.7.1
rbenv global 2.7.1

# Check ruby version
ruby -v
```

### Bundler

```shell
# Install Bundler
gem install bundler
rbenv rehash
```

### Yarn

由于系统自带软件源一般不包含我们所需要的Yarn，直接apt安装会安装错误的包，因此需要参照Yarn Documentation的[各系统安装教程](https://classic.yarnpkg.com/en/docs/install)。我使用了Ubuntu的对应命令来安装Yarn。

```shell
# Configure package source
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# Install yarn
sudo apt update && sudo apt install yarn
```

在依次运行上述命令之后，Ruby环境就配置完成了。

## Capistrano

Capistrano是一个Ruby Gem，其作用就是当你在本地运行部署命令时，在服务器执行相应脚本，来完成自动从git获取代码、编译、运行服务器等操作。

首先需要在`Gemfile`中添加该Gem，只需要添加到development组即可。

```ruby
group :development do

  ...

  # Use capistrano for automated deployment
  gem "capistrano", "~> 3.10", require: false
  gem "capistrano-rails", "~> 1.5", require: false
  gem "capistrano-yarn", require: false
  gem "capistrano-rbenv", require: false
  gem 'capistrano3-puma', require: false
end
```

由于我使用了Puma，因此使用了capistrano3-puma gem。

然后需要执行bundle命令来生成Capistrano的各个配置文件。

```shell
bundle exec cap install
```

默认的文件结构如下。

```plaintext
├── Capfile
├── config
│   ├── deploy
│   │   ├── production.rb
│   │   └── staging.rb
│   └── deploy.rb
└── lib
    └── capistrano
            └── tasks
```

### 配置Capfile

首先我在Capfile中添加/Uncomment了部署的各项步骤。

```ruby
# Capfile
# Load DSL and set up stages
require "capistrano/setup"

# Include default deployment tasks
require "capistrano/deploy"

# Load the SCM plugin appropriate to your project:
#
# require "capistrano/scm/hg"
# install_plugin Capistrano::SCM::Hg
# or
# require "capistrano/scm/svn"
# install_plugin Capistrano::SCM::Svn
# or
require "capistrano/scm/git"
install_plugin Capistrano::SCM::Git

# Include tasks from other gems included in your Gemfile
#
# For documentation on these, see for example:
#
#   https://github.com/capistrano/rvm
#   https://github.com/capistrano/rbenv
#   https://github.com/capistrano/chruby
#   https://github.com/capistrano/bundler
#   https://github.com/capistrano/rails
#   https://github.com/capistrano/passenger
#
# require "capistrano/rvm"
require 'capistrano/rails'
require "capistrano/rbenv"
# require "capistrano/chruby"
# require "capistrano/bundler"
# require "capistrano/rails/assets"
# require "capistrano/rails/migrations"
# require "capistrano/passenger"
require 'capistrano/puma'
install_plugin Capistrano::Puma

# Load custom tasks from `lib/capistrano/tasks` if you have any defined
Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }
```

由于`capistrano/rails`包含了`bundler`、`rails/assets`、`rails/migrations`，因此只需要添加`capistrano/rails`即可。而Yarn则被包含在了`rails/assets`中（禁止套娃）。

### 配置deploy.rb

```ruby
# config/deploy.rb
# config valid for current version and patch releases of Capistrano
lock "~> 3.14.0"

`ssh-add`

set :application, "<application name>"
set :repo_url, "<git repo ssh>"

...

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, "<deployment folder on server>"

...

# Default value for :linked_files is []
append :linked_files, "config/database.yml", "config/master.key", "config/application.yml"

# Default value for linked_dirs is []
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system"

...
```

`<application name>`指你的应用名称，`<git repo ssh>`指代码Repo的SSH地址，`<deployment folder on server>`指你想部署的服务器文件夹。

`:linked_files`和`:linked_dir`是指各环境共享的文件，存储在`deploy_folder/shared`文件夹中，Capistrano会用`symlink`的方式来保证每次部署都使用的是`shared`文件夹中的这些文件。其中`shared/config/database.yml`、`shared/config/master.key`这两个文件需要手动创建，从本地复制即可。由于我使用的是figaro来存储环境变量，因此额外添加了`shared/config/application.yml`。

## 配置SSH

需要为Capistrano配置两套SSH key，一套用于本地运行部署命令时连接到服务器，一套用于服务器连接git。

### 本地连接服务器

我只有一个production服务器，因此只配置`config/deploy/production.rb`

```ruby
# config/deploy/production.rb

...

server "<server ip>", user: "ubuntu", roles: %w{app db web}, my_property: :my_value

...

set :ssh_options, {
  keys: %w(~/.ssh/<aws ssh pem>),
  forward_agent: true,
  auth_methods: %w(publickey)
}

...
```

我直接使用了ubuntu用户来部署。`<server ip>`是服务器IP，`~/.ssh/<aws ssh pem>`是亚马逊提供的用于连接服务器的pem。

### 服务器连接Git

首先在服务器上运行keygen

```shell
ssh-keygen
```

一路回车使用默认设置创建`~/.ssh/id-rsa.pub`。这是你的服务器的身份标识，将其倒入Github之后，Github就可以识别服务器，从而达到不需要密码使用git命令的目的。

```shell
cat ~/.ssh/id-rsa.pub
```

复制上述命令产生的key。

打开Github->设置->SSH Key，添加SSH Key，将我刚刚复制的key填入。

此时在服务器上运行git命令访问我的Repo就不需要密码了，可以使用`git clone`来测试一下。此处需要注意remote url要使用ssh的格式，如`git@github.com:user/repo.git`。

## Puma

接下来需要配置Puma。

```ruby
# config/puma.rb
# Puma can serve each request in a thread from an internal thread pool.
# The `threads` method setting takes two numbers: a minimum and maximum.
# Any libraries that use thread pools should be configured to match
# the maximum value specified for Puma. Default is set to 5 threads for minimum
# and maximum; this matches the default thread size of Active Record.
#
max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

# Specifies the `port` that Puma will listen on to receive requests; default is 3000.
#
port        ENV.fetch("PORT") { 3000 }

# Specifies the `environment` that Puma will run in.
#
environment ENV.fetch("RAILS_ENV") { "development" }

# Specifies the `pidfile` that Puma will use.
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

# Specifies the number of `workers` to boot in clustered mode.
# Workers are forked web server processes. If using threads and workers together,
# the concurrency of the application would be max `threads` * `workers.`
# Workers do not work on JRuby or Windows (both of which do not support
# processes).
#
workers ENV.fetch("WEB_CONCURRENCY") { 2 } # <------ uncomment this line

# Use the `preload_app!` method when specifying a `workers` number.
# This directive tells Puma to first boot the application and load code
# before forking the application. This takes advantage of Copy On Write
# process behavior so workers use less memory.
#
preload_app! # <------ uncomment this line

# Allow Puma to be restarted by the `Rails restart` command.
plugin :tmp_restart
```

以上是一个默认的Production Puma配置示例，将其保存后，使用`cap`命令将其上传到`shared`文件夹中备用。

```shell
cap production puma:config
```

## 检查配置

使用下面的命令让Capistrano检测配置是否正确。

```shell
cap production deploy:check
```

如果出现问题，请用你的`technical sophistication`来解决。

## Caddy

Caddy的配置相对简单，首先参看我过去的博文[安装Caddy V2](/2020/04/21/aria-pi/)。

然后修改/新建`/etc/caddy/Caddyfile`。

```shell
# Caddyfile
yourdomain.com {
	root * <deployment folder>/current/public/
	route {
		file_server /packs*
		reverse_proxy unix/<deployment folder>/shared/tmp/sockets/puma.sock {
			header_up X-Forwarded-For {remote_host}
			header_up X-Forwarded-Port {server_port}
			header_up X-Forwarded-Proto {scheme}
		}
	}
}
```

`<deployment folder>`是刚刚在`deploy.rb`设置的部署文件夹。思路是使用`route`命令来保证能优先访问到JavaScript和CSS等资源文件，然后在不是访问`packs`文件夹下的文件的情况下，将请求转发到puma。

> Note: 需要提醒的是Caddy V2的unix连接格式是这样的：`unix//foder/server.sock`，而并不是以`unix:///`开头。

由于我用了Webpacker来接管JavaScript和CSS，因此我只使用file_server命令serve了`packs`文件夹。

然后使用`systemctl`三件套来启动caddy服务。

```shell
sudo systemctl daemon-reload # 重新加载修改过的service文件
sudo systemctl enable aria2 # 开启自启动
sudo systemctl start aria2 # 启动服务
```

## 部署

最后的部署过程比较简单。

```shell
cap production deploy
```

目前没有解决的问题是从第二次部署开始，每次部署之后需要手动启动puma。

```shell
cap production puma:start
```

其余已经非常完美了。