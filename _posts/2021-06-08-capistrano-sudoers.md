---
layout: post
title: Capistrano部署中使用sudoers的那些安全风险
subtitle: Security Vulnerabilities in Using Sudoers with Capistrano
author: DotIN13
tags:
  - Ruby
  - Capistrano
  - Sudoers
locale: zh_CN
---

## Capistrano

在开发了自己的Ruby Websocket服务器之后，每次部署到服务器都要打开SSH，运行`git pull`，然后重启`systemd`服务，极为繁琐。于是，又瞄准了此前[部署Rails应用所用的Capistrano](/2020/06/06/rails-development-3/)。

一个简单的用于操作`systemd`服务的rake任务如下：

```ruby
namespace :panda do
  %i[start stop restart].each do |action|
    desc "#{action.capitalize} socket panda"
    task action do
      on roles(:websocket) do |host|
        execute :sudo, '/usr/bin/systemctl', action, 'socket-panda.service'
        info "Completed action #{action} on host #{host}"
      end
    end
  end
end

```

然而，我发现，在使用`systemd`时需要用到root权限，Capistrano在本质上就是一个non-login、non-interactive的shell，因此，不具备向服务器传送sudo密码的能力。此时，就需要开启目标用户不需要输入密码运行sudo指令的权限。

## sudoers文件

要使得用户不需要输入密码就能够运行sudo指令，需要修改`/etc/sudoers`文件。语法类似`user ALL=NOPASSWD:command`。

一些开发者指出，这是一项极为危险的操作，如果不**明确指定**用户可以不输入密码执行的sudo指令，那么很可能在该用户被盗取后，黑客可以利用无密码的sudo指令完成原本需要root权限才可以完成的操作。

因此，在此，我决定只给我的服务端用户重启服务的权限。

## 使用visudo编辑sudoers

`/etc/sudoers`文件指出，要修改这一文件，只能以root用户，使用`visudo`命令。`visudo`命令可以在保存时检查这一文件的语法，防止出错。

但在我使用`visudo`在**文件中段**添加了`ruby ALL=NOPASSWD:/usr/bin/systemctl restart socket-panda.service`一行之后，以ruby身份运行`sudo /usr/bin/systemctl restart socket-panda.service`仍然提示输入密码。

这是由于系统读取sudoers文件是逐行读取的，[最后一条命令`%sudo   ALL=(ALL:ALL) ALL`覆盖了我刚刚添加的命令](https://askubuntu.com/a/504665)。

## sudoers.d文件夹

最为稳妥的解决办法是将我们的指令添加到`/etc/sudoers.d/nn-file`中，由于系统按照文件名顺序读取文件，因此最好在文件名前加上数字序号，例如将文件命名为`20-ruby`。

我在`/etc/sudoers.d/20-ruby`中添加`ruby ALL=NOPASSWD:/usr/bin/systemctl restart socket-panda.service`一行后，以ruby身份运行上述命令，便不再需要输入密码。使用Capistrano也能够重启我的`systemd`服务了。

## 没有绝对的安全

在我翻阅网络上的讨论时，[有一位开发者非常谨慎](https://askubuntu.com/a/917872)。

{% include post-image.html link="post-ruby/sudoers-security.png" alt="Against allowing all sudo commands without password" %}

他指出，不要给任何用户无需密码运行sudo指令的能力。

难道其他传授新手使用`user   ALL=NOPASSWD: ALL`的开发者都错了吗？这么做究竟有什么安全威胁，对我来说是否重要？安全措施的合理界限究竟在何处，对于我来说，是模糊的。

> 网络安全是开放的而不是封闭的。只有立足开放环境，加强对外交流、合作、互动、博弈，吸收先进技术，网络安全水平才会不断提高。四是网络安全是相对的而不是绝对的。没有绝对安全，要立足基本国情保安全，避免不计成本追求绝对安全，那样不仅会背上沉重负担，甚至可能顾此失彼。
>
> ——习近平《在网络安全和信息化工作座谈会上的讲话》

习近平总书记的话引人深思，信息时代网络世界的安全措施，究竟应当做到什么程度？什么是绝对安全？什么是适合网络基础设施的适度安全？

每个应用都有自己的使用场景，这也就意味着每个应用都有自己的安全最佳实践，一些公司或者组织或许可以界定一些协议，制定一些规范，但没有任何的公司或者组织可以保证对全部的高层（high-level）技术应用提出一一对应的安全标准。举例来说，应当由哪些类型的用户可以拥有sudo权限，哪些用户可以无密码运行root权限指令，没有任何通行的技术标准。在[sudoers的文档页](https://www.sudo.ws/man/1.8.17/sudoers.man.html)，仅仅给出了用例，却并没有指出安全上的潜在风险。

既然没有普世的安全标准，那么信息系统安全的破局点应当在于安全攻防。没有识别辨识的风险是无可防范的，因此，首先应当辨识尽可能多的安全威胁，然后需要权威的企业与组织确诊这些安全威胁的危险程度，最后，对已知的风险在开发和运行两个层面进行防控。

我们承认，我们无法发现所有的安全威胁，但同时，绝对安全的不可能也是因为我们没有时间、精力、手段、意愿去解决全部的安全困境。有的安全威胁根本无法解决，例如[M1芯片就曝出一个无法修复的安全漏洞](https://www.wired.com/story/apples-m1-chip-has-fascinating-flaw/)；有的安全风险，开发者、从业者无从知晓其危险程度，很可能就被轻视、搁置——黑客攻入我的服务器的概率有多大，获取sudo权限账户控制权的概率有多大，造成的数据泄露有多严重，难以估量——根据[ComputerWeekly](https://www.computerweekly.com/news/252467348/Most-SMEs-severely-underestimate-cyber-security-vulnerabilities)的统计，在超过10年的老企业中，只有6%认为他们面临重大网络安全风险；再有的，纯粹是因为技术人员的能力不足或是懈怠，而没有得到妥善的解决。因此，安全威胁如何分级，如何划定危重程度，确定解决的先后次序，是一个重大的问题。

安全风险有时被忽视，有时被无限地夸大，每一位开发者对同一个风险都会有不同的看法，每一个风险在不同的技术应用中也占据不同的地位。多方考量，应防尽防，或许才是开发中应对风险的黄金准则。
