require_relative '../app/initializers/dynamoid.prod'
require_relative '../app/models/wanna_likes'

item = WannaLikes.new(article_id: '2', identity: 'chrome', genre: 'mood')
item.save

item = WannaLikes.find('2', range_key: 'chrome')
p item
