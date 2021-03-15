require_relative '../app/initializers/dynamoid.prod'
require_relative '../app/models/wanna_likes'

Handler = Proc.new do |req, res|
  like = WannaLikes.new(article_id: req.query[:article_id], identity: req.headers['user-agent'] + req.headers['x-forwarded-for'],
                        genre: req.query[:genre])
  if like.save
    res.status = 200
    res['Content-Type'] = 'text/text; charset=utf-8'
    res.body = 'Liked'
  else
    res.status = 404
  end
end
