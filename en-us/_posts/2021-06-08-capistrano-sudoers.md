---
author: DotIN13
layout: post
locale: en-us
subtitle: null
tags:
- Ruby
- Capistrano
- Sudoers
title: Security Vulnerabilities in Using Sudoers with Capistrano
---

## Capistrano

After developing my own Ruby Websocket server, it became tiresome to SSH into the server, run `git pull`, and then restart the `systemd` service every time I needed to deploy. So, I turned to [Capistrano, which I had previously used to deploy Rails applications](/2020/06/06/rails-development-3/).

A simple rake task for operating the `systemd` service is as follows:

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

However, I realized that using `systemd` requires root permissions, and Capistrano essentially operates as a non-login, non-interactive shell, so it lacks the ability to send the sudo password to the server. Thus, it is necessary to grant the target user permission to run sudo commands without needing to enter a password.

## The sudoers file

To allow a user to run sudo commands without entering a password, the `/etc/sudoers` file needs to be modified. The syntax is similar to `user ALL=NOPASSWD:command`.

Some developers point out that this is an extremely risky operation. If the sudo commands that users can run without entering a password are not **explicitly specified**, it is highly possible that if the user account is compromised, hackers can exploit the passwordless sudo commands to perform operations that originally required root permissions.

Therefore, in this case, I decided to only grant my server user the permission to restart the service.

## Editing sudoers with visudo

The `/etc/sudoers` file indicates that to edit this file, it can only be done as the root user using the `visudo` command. `visudo` checks the syntax of the file when saving, to prevent errors.

However, after I added the line `ruby ALL=NOPASSWD:/usr/bin/systemctl restart socket-panda.service` in the **middle of the file** using `visudo`, running `sudo /usr/bin/systemctl restart socket-panda.service` as the ruby user still prompted for a password.

This is because the system reads the sudoers file line by line, and the [last entry `%sudo   ALL=(ALL:ALL) ALL` overrides the command I just added](https://askubuntu.com/a/504665).

## The sudoers.d directory

The safest solution is to add our command to `/etc/sudoers.d/nn-file`. Since the system reads files in order of their names, it is advisable to prefix the filenames with a number, such as naming the file `20-ruby`.

After adding `ruby ALL=NOPASSWD:/usr/bin/systemctl restart socket-panda.service` to `/etc/sudoers.d/20-ruby`, running the above command as the ruby user no longer requires entering a password. Capistrano can now restart my `systemd` service without issues.

## There is no absolute security

While browsing discussions online, [one developer expressed extreme caution](https://askubuntu.com/a/917872).

{% include post-image.html link="post-ruby/sudoers-security.png" alt="Against allowing all sudo commands without password" %}

He emphasizes not granting any user the ability to run sudo commands without entering a password.

Are the developers teaching beginners to use `user   ALL=NOPASSWD: ALL` wrong? What are the security threats of this action, and is it essential for me? Where is the reasonable limit for security measures? For me, it remains unclear.

> Network security is based on openness rather than closure. Only by strengthening external exchanges, cooperation, interaction, and competition in an open environment, absorbing advanced technologies, can the level of network security continuously improve. Network security is relative rather than absolute. There is no absolute security. We need to be based on the national conditions to ensure security, avoid pursuing absolute security regardless of cost, which will not only impose a heavy burden but may also lose opportunities elsewhere.
>
> — President Xi Jinping's Speech at a Symposium on Cyber Security and Informatization

President Xi Jinping's words are thought-provoking. In this digital age, to what extent should security measures be implemented in the online world? What is absolute security? What is the appropriate level of security for network infrastructure?

Every application has its own use case, which means each one also has its own security best practices. Some companies or organizations may define protocols and establish norms, but no company or organization can guarantee specific security standards for all high-level technical applications. For example, which type of users should have sudo privileges, which users can run root commands without a password, there are no universal technical standards. The [sudoers documentation](https://www.sudo.ws/man/1.8.17/sudoers.man.html) only provides use cases without indicating potential security risks.

Without universal security standards, the key to information system security lies in cybersecurity. Unidentified risks are unpreventable. Therefore, it is essential to first identify as many security threats as possible, then authoritative companies and organizations need to assess the level of risk these threats pose, and finally, known risks need to be controlled in both development and operation aspects.

We acknowledge that we cannot discover all security threats. The impossibility of achieving absolute security is due to our lack of time, resources, means, and willingness to address all security challenges. Some security threats cannot be solved, such as the [unfixable security vulnerability in the M1 chip](https://www.wired.com/story/apples-m1-chip-has-fascinating-flaw/); some security risks are unknown in terms of their severity, often underestimated, and neglected by developers and practitioners — what is the probability of a hacker breaching my server, gaining control of sudo privileged accounts, and causing data leaks is hard to estimate. According to [ComputerWeekly](https://www.computerweekly.com/news/252467348/Most-SMEs-severely-underestimate-cyber-security-vulnerabilities), only 6% of established companies over 10 years old consider themselves at significant risk of cybersecurity threats; some risks are simply due to inadequate skills or neglect by technical personnel, without proper resolution. Therefore, how to classify security risks, determine the severity of risks, and establish the order of priority for addressing them is a critical issue.

Security risks are sometimes overlooked and sometimes exaggerated. Each developer has a different perspective on the same risk, and each risk holds a different position in various technical applications. With multifaceted considerations, prevention is key. Perhaps this is the golden rule for handling risks in development.
