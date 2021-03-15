class WannaLikes
  include Dynamoid::Document
  table name: :wanna_likes, key: :article_id, read_capacity: 5, write_capacity: 5
  range :identity, :string
  field :genre, :string
end
