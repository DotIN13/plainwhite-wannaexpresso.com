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
title: "Ruby on Rails Development Log Three: Capistrano + Puma + Caddy Special Episode"
typora-root-url: ../
---

## Web App Hosting

I've tried AWS Elastic Beanstalk and Azure Web App before. The former prompted me with "missing credentials," making me retreat as it required manual EC2 configuration, so I might as well set up a new EC2 from scratch; while the latter only supports Ruby 2.6 and its free package does not allow custom domain names. Additionally, these all-in-one services use Nginx, but I prefer Caddy—no specific reason, just Caddy V2 looks cool! After considering all factors, I decided to go with deploying my app directly on AWS EC2.

Initially, I opted for the manual `git push` + `git pull` approach, but it was a bit cumbersome. So, I made the decision to automate the deployment process by deploying Capistrano.

## Environment Configuration

### Ruby

When I tried to install Ruby 2.7.1, I found that Ubuntu's software repository was still stuck at 2.7.0. Therefore, I used rbenv to install Ruby. Without further ado, here are the commands.

```shell
# Fully update server packages
sudo apt-get update
sudo apt-get upgrade -y

# Choose Time zone => Asia => Shanghai
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

Since the system's default software sources usually do not include Yarn, directly installing it with apt could result in installing incorrect packages. Therefore, following the instructions in Yarn Documentation for [installing on various systems](https://classic.yarnpkg.com/en/docs/install) is necessary. I used the corresponding command for Ubuntu to install Yarn.

```shell
# Configure package source
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# Install yarn
sudo apt update && sudo apt install yarn
```

After running these commands sequentially, the Ruby environment setup is complete.

## Capistrano

Capistrano is a Ruby Gem that automates various deployment processes by executing corresponding scripts on the server when deploying commands are run locally.

First, add this Gem to the `Gemfile`, but only include it in the development group.

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

Since I use Puma, I included the capistrano3-puma gem.

Then, run the bundle command to generate various Capistrano configuration files.

```shell
bundle exec cap install
```

The default file structure is as follows.

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

### Configure Capfile

I added/uncommented the deployment steps in the Capfile.

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

Since `capistrano/rails` includes `bundler`, `rails/assets`, `rails/migrations`, adding `capistrano/rails` is sufficient. Yarn is included in `rails/assets` (no nesting allowed).

### Configure deploy.rb

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

`<application name>` refers to your application name, `<git repo ssh>` refers to the SSH address of your code repo, and `<deployment folder on server>` is the folder you want to deploy on the server.

`:linked_files` and `:linked_dir` refer to shared files across environments stored in the `deploy_folder/shared` folder. Capistrano ensures that these shared files in the `shared` folder are used for each deployment through symbolic links. The files `shared/config/database.yml` and `shared/config/master.key` need to be created manually and copied from the local environment. As I use figaro to store environment variables, I included `shared/config/application.yml`.

## SSH Configuration

Two sets of SSH keys need to be configured for Capistrano—one for connecting to the server when deploying commands locally and another for the server to connect to Git.

### Local Server Connection

Since I only have one production server, I configured `config/deploy/production.rb`.

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

I directly used the ubuntu user for deployment. `<server ip>` is the server's IP address, and `~/.ssh/<aws ssh pem>` is the pem provided by Amazon for connecting to the server.

### Server Git Connection

First, run keygen on the server.

```shell
ssh-keygen
```

Simply press enter using the default settings to create `~/.ssh/id-rsa.pub`. This is the server's identity. Import it into Github, and Github can identify the server, allowing the use of git commands password-free.

```shell
cat ~/.ssh/id-rsa.pub
```

Copy the key generated by the above command.

Open Github->Settings->SSH Key, add the SSH Key, and paste the copied key.

Now, running git commands on the server to access my repository doesn't require a password. You can test it with `git clone`. Remember to use the ssh format for the remote URL, like `git@github.com:user/repo.git`.

## Puma

Next comes the configuration of Puma.

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

The above is a default Production Puma configuration example. Save it and use the `cap` command to upload it to the `shared` folder for future use.

```shell
cap production puma:config
```

### Temporary Fix for Puma Not Restarting Properly After Each Deploy

This seems to be a Puma bug that first appeared in version 3.8.2, briefly fixed, and recently resurfaced. After deployment, the site becomes inaccessible, and checking `shared/log/puma_error.log` reveals Puma restart errors.

A [Workaround](https://stackoverflow.com/questions/44763777/capistrano-pumarestart-not-working-but-pumastart-does) is to modify the `puma:restart` task, manually stop it with `puma:stop`, and then start it with `puma:start`.

Create a new file in `lib/capistrano/tasks`, as shown below.

```ruby
# lib/capistrano/tasks/restart_puma.rake
namespace :puma do
  Rake::Task[:restart].clear_actions

  desc 'Overwritten puma:restart task'
  task :restart do
    puts 'Overwriting puma:restart to ensure that puma is running. Effectively, we are just starting Puma.'
    puts 'A solution to this should be found.'
    invoke 'puma:stop'
    invoke 'puma:start'
  end
end
```

Then, deploy it, and you will see the following output:

```shell
Overwriting puma:restart to ensure that puma is running. Effectively, we are just starting Puma.
A solution to this should be found.
01:44 puma:stop
      01 $HOME/.rbenv/bin/rbenv exec bundle exec pumactl -S /home/ubuntu/srv…
      01 Command stop sent success
    ✔ 01 ubuntu@3.34.127.18 0.875s
01:45 puma:start
      using conf file /home/ubuntu/srv/heroes-of-ezantoh/shared/puma.rb
      01 $HOME/.rbenv/bin/rbenv exec bundle exec puma -C /home/ubuntu/srv/he…
      01 Puma starting in single mode...
      01 * Version 4.3.5 (ruby 2.7.1-p83), codename: Mysterious Traveller
      01 * Min threads: 0, max threads: 16
      01 * Environment: production
      01 * Daemonizing...
    ✔ 01 ubuntu@3.34.127.18 1.051s
```

At this point, Puma has successfully restarted. However, this workaround is not seamless and may result in downtime. Hopefully, an update will resolve this issue soon.

## Check Configuration

Use the following command to have Capistrano check if the configuration is correct.

```shell
cap production deploy:check
```

If there are any issues, utilize your technical skills to resolve them.


# Ruby on Rails Development Log Three: Capistrano + Puma + Caddy Special Deployment Issue

## Caddy

Configuring Caddy is relatively simple. First, refer to my previous blog post on [installing Caddy V2](/2020/04/21/aria-pi/).

Then, modify or create `/etc/caddy/Caddyfile`.

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

`<deployment folder>` is the deployment folder set in `deploy.rb`. The idea is to use the `route` command to ensure priority access to JavaScript, CSS, and other resource files. Then, in cases where files outside of the `packs` folder are accessed, redirect the request to Puma.

> Note: It is worth mentioning that the correct Unix connection format for Caddy V2 is: `unix//folder/server.sock`, and not starting with `unix:///`.

Since I use Webpacker to manage JavaScript and CSS, I only use the `file_server` command to serve the `packs` folder.

Then use the `systemctl` trio to start the Caddy service.

```shell
sudo systemctl daemon-reload # Reload modified service files
sudo systemctl enable aria2 # Enable auto-start
sudo systemctl start aria2 # Start the service
```

## Deployment

The final deployment process is quite simple.

```shell
cap production deploy
```

One unresolved issue is that starting from the second deployment onwards, Puma needs to be manually started after each deployment.

```shell
cap production puma:start
```

Other than that, everything is working perfectly.
