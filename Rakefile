require 'rake'

desc 'Create new mood'
task :new_mood, [:title] do |_t, args|
  title = args[:title] || "untitled"
  file = File.join(File.dirname(__FILE__), '_moods',
                   "#{Time.new.strftime('%Y-%m-%d')}-#{title.downcase.gsub(' ', '-')}.md")
  yaml = <<-EOYAML.gsub(/^\s{2}/, '')
  ---
  title: "#{title}"
  author: "DotIN13"
  locale: zh_CN
  header-image: false
  date: #{Time.now}
  ---

  EOYAML
  File.open(file, 'w') { |f| f << yaml }
end

desc 'Create new post'
task :new_post, [:title] do |_t, args|
  title = args[:title]
  file = File.join(File.dirname(__FILE__), '_posts',
                   "#{Time.new.strftime('%Y-%m-%d')}-#{title.downcase.gsub(' ', '-')}.md")
  yaml = <<-EOYAML.gsub(/^\s{2}/, '')
  ---
  layout: post
  title: ""
  subtitle: "#{title}"
  author: "DotIN13"
  tags:
    - Example
  locale: zh_CN
  ---

  EOYAML
  File.open(file, 'w') { |f| f << yaml }
end
