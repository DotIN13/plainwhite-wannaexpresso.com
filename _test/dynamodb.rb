require 'dynamoid'
require 'aws-sdk-dynamodb'

region = 'us-west-1'

# To use the downloadable version of Amazon DynamoDB,
# uncomment the endpoint statement.
Aws.config.update(
  endpoint: 'http://localhost:8000',
  region: region
)

class WannaLikes
  include Dynamoid::Document
  table key: :article_id, read_capacity: 5, write_capacity: 5
  range :idnetity, :string
  field :type, :string
  field :like, :integer
end

# class WannaLikes
#   include Aws::Record
#   integer_attr :article_id, hash_key: true
#   string_attr  :type, range_key: true
#   integer_attr :like
# end

# Create WannaLikes table
# cfg = Aws::Record::TableConfig.define do |t|
#   t.model_class(WannaLikes)
#   t.read_capacity_units(5)
#   t.write_capacity_units(5)
# end
# cfg.migrate!

# item = WannaLikes.new(article_id: 1, type: 'mood', published: true)
# item.save

item = WannaLikes.find(article_id: 1, type: 'mood')
p item
