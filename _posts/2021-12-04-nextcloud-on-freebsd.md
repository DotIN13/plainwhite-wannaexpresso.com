---
layout: post
title: "FreeBSD 13，NextCloud 22，iPhone 13，留住我的照片"
subtitle: "FreeBSD 13, NextCloud 22, iPhone 13, Save Ma Photos"
author: "DotIN13"
tags:
  - FreeBSD
  - NextCloud
  - Life
typora-root-url: ../
locale: zh_CN
---

## 新的文字

上次动笔是十月廿九，不想已过去了壹月整。

## 新的手机

陪伴我三年的小米MIX 3在一个不留心的早晨滑出了我长久不穿的高中校服，重重跌在了水泥地上，屏幕着地。

如果他是一个人，那么，着地的恐怕是后脑勺，最终的诊断大概是植物人。与普通的病例不同的是，或许期限不是永远，而是到我为他移植屏幕的那一天为止。

当天晚上，去最近的Apple Store，原价5999买下了思来想去不舍得买的iPhone 13。

至于是不是九月上市时未有纠结，现下就不会有“人”受伤，此处不表。

## 新的照片

恋上拍照，大约是在暑期，MIX3的存储空间，从暑期开始前的大半可用，到跌打损伤为止已经用得七七八八。Google Photos的15GB，也已将近告急。

打量了一眼5GB的iCloud存储空间，iPhone上新拍的照片，似乎有些无处安放。

## 新的NextCloud

目光最终还是落在了NAS上，几乎无限的存储空间，似乎是留住记忆的最好选择。iPhone上的自动备份应用，包括Möbius Sync、Photo Sync以及Resilio Sync。

1. **Möbius Sync**是一个第三方Syncthing客户端，Syncthing的可靠性占优，但同步后完全无法远程查看照片，尤其是不能查看Live Photos，属于致命伤。
2. **Photo Sync**是订阅制付费软件，每月6元，那么iCloud服务显然是更好的选择。
3. **Resilio Sync**[在稳定性上受到一些诟病](https://forum.resilio.com/topic/71842-resilio-mainly-now-soon-syncthing/?do=findComment&comment=153896)，并且同样[不能很好的支持Live Photos](https://forum.resilio.com/topic/72147-ios-live-photos/)。

似乎NextCloud是最佳的解决方案，不仅可以存放照片，并且可以后台自动备份，网页客户端还可以让我随时随地访问我的文件，而不必打开SFTP客户端。

> 值得一提是，我甚至可以通过挂载外部文件夹的方式，在NextCloud中直接观看Aria下载的影片（虽然他们中的80%在我的iPhone客户端中都无法解码）。

## 部署

{% include post-image.html link="post-nas/php-server.jpeg" alt="PHP Webserver Mechanism © Cloudways" %}

NextCloud是使用PHP实现的，而上面一幅图就很好地描述了访问PHP应用时服务器如何做出应答。

在这一过程中，需要一个**网络服务器**来接收用户的请求，并按照请求找到用户需要的文件，如果文件中有**PHP脚本**，那么就将其传送给**PHP编译器**加以处理。在处理过程中，编译器可能会访问**数据库**进行存取，随后它会将处理好的网页数据返回给网络服务器，并传输给用户。

在这个过程中，有四个关键节点，也就是网络服务器、PHP脚本、PHP编译器以及数据库。老规矩，网络服务器我们还是使用**Caddy**，PHP脚本就是**NextCloud**本身，编译方面我们利用**PHP-FPM**来加快处理速度，而数据库我们则使用**PostgreSQL**。

### 建立用户

首先，更新软件包列表及已有软件包：

```shell
sudo pkg update -f && sudo pkg upgrade
```

然后建立一个用户，这个用户将被用于运行Caddy与PHP-FPM，并将拥有管理NextCloud代码文件以及网盘数据的权力，我使用的用户名就是`caddy`本迪：

```shell
sudo pw useradd -u 1003 -g caddy -m -d /usr/local/etc/caddy -s /usr/sbin/nologin -c "Caddy web server" -n caddy
```

### NextCloud服务端文件

由于NextCloud本质上就是一个由网页与脚本文件组成的网站，其安装与更新的方法就仅仅是解压缩那么简单。

首先从NextCloud官方网站[下载服务端文件](https://nextcloud.com/install/#instructions-server)。

然后将下载的压缩文件解压：

```shell
sudo mkdir -p /usr/local/www
mv /path/to/nextcloud.tar.bz2 /usr/local/www
cd /usr/local/www
tar -xzvf /path/to/nextcloud.tar.bz2
```

此时所有的NextCloud代码文件应当被解压到了`/usr/local/www/nextcloud`中，接下来我们将解压的所有文件移交给刚刚建立的服务端用户，并赋予其正确的权限：

```shell
sudo chown -R caddy nextcloud
sudo chmod -R 750 nextcloud
```

### Caddy

接下来配置Caddy，首先[从官方网站下载](https://caddyserver.com/download)Caddy的二进制文件，注意选择正确的操作系统以及所需的模块。举例来说，由于我的网络环境中443端口不可用，我就使用了[caddy-dns/dnspod](https://github.com/caddy-dns/dnspod)模块来通过dns-challenge获得SSL证书。

然后将下载好的Caddy二进制文件移动到`/usr/local/bin`：

```shell
sudo mv /path/to/caddy /usr/local/bin/caddy
```

创建一个新的Caddy服务文件：

```shell
#!/bin/sh

# PROVIDE: caddy
# REQUIRE: NETWORKING
# KEYWORD: shutdown

. /etc/rc.subr

name=caddy
rcvar=caddy_enable

load_rc_config $name

: ${caddy_enable:="no"}
: ${caddy_user:="caddy"}
: ${caddy_group:="webmaster"}
: ${caddy_conf:="/usr/local/etc/Caddyfile"}
: ${caddy_envfile:="/usr/local/etc/caddy.env"}
: ${caddy_pidfile="/var/run/caddy/caddy.pid"}

pidfile=${caddy_pidfile}
command="/usr/sbin/daemon"
command_args="-P ${caddy_pidfile} -r -f caddy run --envfile ${caddy_envfile} --config ${caddy_conf}"

run_rc_command "$1"
```

在使用rc.d的条件下，Caddy不能正确识别`$HOME`，因此需要手动创建`caddy.env`为Caddy指路，告诉它应当如何存放配置文件与证书：

```shell
# /usr/local/etc/caddy.env
XDG_DATA_HOME=/usr/local/etc/caddy
XDG_CONFIG_HOME=/usr/local/etc/caddy
```

然后创建Caddyfile：

```shell
# /usr/local/etc/Caddyfile
{
  # 如果你的80和443端口不可用，建议关闭HTTPS自动重定向
  auto_https disable_redirects
  # 将日志存储到/var/log/caddy.log
  log {
    output file /var/log/caddy.log
    format console {
      time_format wall
    }
  }
}

# 修改next.yourdomain.com为你的域名或IP地址
next.yourdomain.com {
  root * /usr/local/www/nextcloud
  file_server
  php_fastcgi unix//var/run/nextcloud.sock {
    # 美化URL，在链接中隐藏PHP文件名
    env front_controller_active true
  }
  # 启用HSTS
  header {
    Strict-Transport-Security "max-age=15768000;includeSubDomains;preload"
  }
  redir /.well-known/carddav /remote.php/dav 301
  redir /.well-known/caldav /remote.php/dav 301
  # 禁止访问以下系统文件
  @forbidden {
    path /.htaccess
    path /data/*
    path /config/*
    path /db_structure
    path /.xml
    path /README
    path /3rdparty/*
    path /lib/*
    path /templates/*
    path /occ
    path /console.php
  }

  respond @forbidden 404
}
```

创建日志文件，并修改Caddy相关文件的权限：

```shell
sudo touch /var/log/caddy.log
sudo chmod 755 /usr/local/etc/caddy/Caddyfile /usr/local/etc/caddy/caddy.env /var/log/caddy.log
sudo chown caddy:caddy /usr/local/etc/caddy/Caddyfile /usr/local/etc/caddy/caddy.env /var/log/caddy.log
```

配置完成后，启动Caddy服务。

```shell
sudo sysrc caddy_enable=YES
sudo service caddy start
# 可以用以下命令查看Caddy日志来排查故障
tail -f /var/log/caddy.log
```

### PHP

现在我们已经有了一个文件服务器，但还缺少处理PHP文件的编译器，也就是PHP软件包。

只需要通过`pkg`就可以安装PHP软件包了：

```shell
sudo pkg install php80 php80-bcmath php80-curl php80-dom php80-fileinfo php80-filter php80-gd php80-gmp php80-intl php80-mbstring php80-opcache php80-openssl php80-pcntl php80-pdo php80-pecl-imagick php80-posix php80-session php80-simplexml php80-xml php80-xmlreader php80-xmlwriter php80-zip php80-zlib
```

以上是NextCloud所需的PHP软件包及PHP模块，安装后，我们需要进行一些简单的配置。首先创建PHP-FPM配置文件：

```shell
# /usr/local/etc/php-fpm.d/nextcloud.conf
[nextcloud]
user = caddy 
group = caddy
listen = /var/run/nextcloud.sock
listen.owner = caddy 
listen.group = caddy
pm = dynamic
# 以下限制了服务器的线程数，可以根据自身需要调整
pm.max_children = 128 
pm.start_servers = 32
pm.min_spare_servers = 32
pm.max_spare_servers = 64 
pm.max_requests = 500
```

然后创建PHP配置文件：

```shell
sudo cp /usr/local/etc/php.ini-production /usr/local/etc/php.ini
```

建议修改`php.ini`的以下部分：

```ini
; 增加内存到NextCloud推荐的512MB
memory_limit = 512M
; 设置默认时区
date.timezone = Asia/Shanghai
; 设置登录Session存储位置
session.save_path = "/tmp/php"
; 使用PHP的opcache缓存，去掉分号以使其生效
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=1
opcache.save_comments=1
```

创建Session存储目录，否则将无法登陆：

```shell
sudo mkdir /tmp/php
sudo chown caddy:caddy /tmp/php
sudo chmod 750 /tmp/php
```

配置完成后即可运行PHP-FPM：

```shell
sudo sysrc php_fpm_enable=YES
sudo service caddy restart
sudo service php-fpm start
```

### PostgreSQL数据库

由于在成文时，FreeBSD 13.0上用于访问PostgreSQL的PHP模块（PHP module）最高只支持PostgreSQL 12.8，因此我们*暂时不能*安装最新的PostgreSQL 13。

我们从安装PostgreSQL 12.8以及PHP 8.0的PostgreSQL相关模块开始：

```shell
sudo pkg install postgresql12-{server,client} php80-{pdo_pgsql,pgsql}
```

运行PostgreSQL服务：

```shell
# 在rc.conf中开启PostgreSQL服务
sudo sysrc postgresql_enable=YES
# 初始化数据库
sudo service postgresql initdb
# 启动数据库服务
sudo service postgresql start
```

接下来创建数据库的用户与数据表：

```shell
# 登录到postgres账户，初始条件下只有这个账户拥有管理数据库的权限
sudo su - postgres
# 创建数据库用户“nextcloud”，赋予其创建数据库的权力（createdb），并为其设置访问密码（pwprompt）
createuser --pwprompt --createdb nextcloud 
# 使用模版（template）创建NextCloud数据库“nextclouddb”，将用户(owner)设置为刚刚创建的nextcloud
createdb --owner=nextcloud --template=template1 nextclouddb
# 退出postgres账户
exit
```

### 初始化NextCloud

首先创建存放用户文件的目录。这个目录应当是空白目录，并且属于运行NextCloud的用户。

```shell
sudo mkdir /path/to/data/directory
sudo chown caddy:caddy /path/to/data/directory
sudo chmod 770 /path/to/data/directory
```

{% include post-image.html link="post-nas/nextcloud-setup.png" alt="First Time Setup" %}

然后使用浏览器打开你在Caddy中配置的网络地址（如next.yourdomain.com），进入初始配置页面。按照提示设置NextCloud管理员账号密码、用户目录。再填入PostgreSQL账户`nextcloud`及其密码、数据库名`nextclouddb` 以及数据库地址`localhost`。

点击安装完成开始初始化。不出意外，几分钟后你就拥有了你自己的NextCloud。

### Redis缓存

在当前条件下，NextCloud的文件访问、上传都较为缓慢，需要添加外部缓存来进行加速。

```shell
sudo pkg install redis php80-pecl-redis
```

修改Redis的配置参数：

```shell
# /usr/local/etc/redis.conf
port 0
unixsocket /var/run/redis/redis.sock
unixsocketperm 770
```

将`caddy`用户添加到Redis用户组：

```shell
sudo pw groupmod redis -m caddy
```

运行Redis服务：

```shell
sudo sysrc redis_enable=YES
sudo service redis start
```

编辑NextCloud配置文件以利用Redis：

```php
# /usr/local/www/nextcloud/config/config.php
<?php
$CONFIG = array (
  # ...
  'memcache.locking' => '\\OC\\Memcache\\Redis',
  'memcache.local' => '\\OC\\Memcache\\Redis',
  'redis' => 
  array (
    'host' => '/var/run/redis/redis.sock',
    'port' => 0,
  ),
);
```

### 调优NextCloud

如果在公网使用，建议使用HTTPS，利用Caddy获取SSL证书，并在NextCloud配置文件中打开HTTPS模式；另外，也建议在配置文件中设置默认的时区：

```php
# /usr/local/www/nextcloud/config/config.php
<?php
$CONFIG = array (
  # ...
  'overwriteprotocol' => 'https',
  'default_language' => 'zh',
  'default_locale' => 'zh_CN',
  'default_phone_region' => 'CN',
);
```

## 新的不去？

RIP  
NextCloud on FreeBSD  
2021.11.21 - 2021.12.04

两周前，我欣喜地在iPhone 13上下载了NextCloud客户端，上传了我所有的相册照片，有备份的感觉真棒。

两周后的今天，我的NextCloud已经永远地离开了我（至少在我重新安装操作系统之前）。

原因是在测试Caddy rc配置文件的过程中，运行了`sudo chown caddy .*`，而错误地将`/usr/local/etc`中的所有文件与目录交给了`caddy`用户。现在打开我的NextCloud，只能看到一页空荡荡的403错误。

新的不去，旧的不来？
