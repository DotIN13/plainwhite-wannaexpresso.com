require 'nokogiri'

Jekyll::Hooks.register :posts, :post_convert do |page|
  # page.content.gsub!(/{%\s+include\s+post-image.html/).with_index do |tag, index|
  #   index.positive? ? "#{tag} loading='lazy'" : "#{tag} loading='eager'"
  # end
  # Use nokogiri for better compatibility with tags in code blocks
  @doc = Nokogiri::HTML.fragment page.content
  @doc.css('img').each_with_index { |node, index| node['loading'] = 'lazy' if index.positive? }
  page.content = @doc.to_html
end
