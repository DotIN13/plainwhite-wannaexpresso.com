require_relative '../app/initializers/dynamoid.dev'

module DynamoidReset
  def self.all
    Dynamoid.adapter.list_tables.each do |table|
      # Only delete tables in our namespace
      Dynamoid.adapter.delete_table(table) if table =~ /^#{Dynamoid::Config.namespace}/
    end
    Dynamoid.adapter.tables.clear
    # Recreate all tables to avoid unexpected errors
    Dynamoid.included_models.each { |m| m.create_table(sync: true) }
  end
end

# Reduce noise in test output
Dynamoid.logger.level = Logger::FATAL

DynamoidReset.all
puts 'Dynamoid reset complete'
