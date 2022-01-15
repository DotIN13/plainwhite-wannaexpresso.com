require "rake"

desc "Create new mood"
task :new_mood, [:title] do |t, args|
  title = args[:title]
  file = File.join(File.dirname(__FILE__), "_moods", "#{Time.new.strftime("%Y-%m-%d")}-#{title.downcase.gsub(" ", "-")}.md")
  yaml = <<-EOS.gsub(/^\s+/, '')
  ---
  title: "#{title}"
  author: "DotIN13"
  locale: zh_CN
  header-image: false
  date: #{Time.now}
  ---

  EOS
  File.open(file, "w") { |f| f << yaml }
end