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
title: RoR Development Log Four
typora-root-url: ../
---

## Unfinished Business

As the semester comes to an end with a satisfactory B+, it's not that developing Heroes of Emergence impacted my studies too much, just feeling like something is missing. As summer break begins, I find myself numbing my nerves with TV shows and games. Who or what woke me up? What wind blew away the dust covering my eyes? One day, waking up from bed, I realized that the past month has been unproductive. So many TV series left hanging, so many game points unreachable, why take it seriously?

{% include post-image.html link="post-rails-development/reminiscence.png" alt="Rekindle" %}

Hence, I pick up where I left off, trying to find self-approval.

## Local PostgreSQL Debugging

After developing for a while, I finally realize the relief of storing game configurations in a database. So, I decide to store core game configurations like hero attribute lists and attack type lists in a table. For data types, arrays seem like a good idea. However, Rails' built-in SQLite doesn't support native Arrays, unlike the PostgreSQL I use in production. So, I decide to set up a local psql for debugging.

Checking the software list, I found PostgreSQL 12.3 already installed at some point. Trying to run the `postgres` command, I encountered an error, stating that I must use a separate user to run postgres-related commands to ensure data safety. Still exploring, I accidentally deleted the automatically-created `postgres` user when installing PostgreSQL using `userdel`. Oh well, had to create a new one.

```shell
sudo useradd -m -d /var/lib/pgsql
sudo chown -R postgres:postgres /var/lib/pgsql
```

Following the [PostgreSQL Documentation](https://www.postgresql.org/docs/current/creating-cluster.html), I set the home directory of the postgres user to `/var/lib`, not having much knowledge of Unix file structure, but went with it. Then switched to the new user and created database files.

```shell
sudo -i -u postgres # Switch to postgres user
mkdir /var/lib/pgsql/data
initdb -D /var/lib/pgsql/data # Create database files
```

I attempted to start the server directly with `pg_ctl` but found I lacked permission for `/run/postgresql`. So, I had to create the folder and grant `postgres` the necessary permissions.

```shell
# Error: "/run/postgresql/.s.PGSQL.5432.lock": No such file or directory
sudo mkdir /run/postgresql
sudo chown -R postgres:postgres /run/postgresql
```

Now, `pg_ctl start -l logfile -D /var/lib/pgsql/data` can start the server logically.

I also set up systemd to auto-start pg_ctl for convenient debugging.

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

Then, it's time to configure Rails.

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

Finally, running `rails db:setup` will set up the necessary databases for development and test.

You can easily view the newly created databases using pgAdmin GUI.

> Friendly reminder: If `rails console` is still sluggish and using SQLite, wake it up with `bin/spring stop`.

With this setup, my local and AWS databases can stay synchronized, enabling the use of `array: true`.

## Array Form

After completing the database part, it's time to think about creating forms.

Reading the [Rails Guides Form Helpers](https://guides.rubyonrails.org/form_helpers.html#basic-structures), I find that using names like `game_rule[value][]` allows params to receive an array. For example:

```html
<input name="person[phone_number][]" value="0" type="text"/>
<input name="person[phone_number][]" value="0" type="text"/>
<input name="person[phone_number][]" value="0" type="text"/>
```

These three input fields will form params like this:

```ruby
{ 'person' => { 'phone_number' => ['0', '0', '0'] } }
```

However, Rails natively lacks helpers to create such forms. After several attempts, I finally found a workaround that meets the requirements of both creating and editing actions.

```erb
<% (person.phone_number || [nil]).each do |val| %>
<div class="field form-group col-6 col-md-3">
  <%= form.label :value %>
  <%= text_field_tag 'person[phone_number][]', val, class: "form-control" %>
</div>
<% end %>
```

## Defining Methods Based on Strings

When creating game configurations, I wanted to define multiple methods in bulk. From the versatile `StackOverflow`, I learned that I can use an array of strings to batch `define_method`.

```ruby
class Foo
  %w[method_a method_b].each do |method_name|
    define_method method_name do |args|
      # Do something
    end
  end
end
```

This way, `#method_a(arg)` and `#method_b(arg)` instance methods are established. To create a class method, simply call `self.class.defind_method`, for example:

```ruby
class Foo
  %w[method_a method_b].each do |method_name|
    self.class.define_method method_name do |args|
      # Do something
    end
  end
end
```

## Conclusion

Keep learning, keep growing, don't hold too much attachment to the results, enjoy the process.
