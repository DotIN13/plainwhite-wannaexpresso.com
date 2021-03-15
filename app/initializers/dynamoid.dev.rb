require 'dynamoid'
require 'aws-sdk-dynamodb'

region = 'us-west-1'

# To use the downloadable version of Amazon DynamoDB,
# uncomment the endpoint statement.
Aws.config.update(
  region: region,
  endpoint: 'http://localhost:8000',
  credentials: Aws::Credentials.new(ENV['DYNAMOID_KEY_ID'], ENV['DYNAMOID_KEY_SECRET'])
)

Dynamoid.config.logger.level = :debug
