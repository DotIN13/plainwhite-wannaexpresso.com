# frozen_string_literal: true

require 'nokogiri'

module Excerpt
  def excerpt(html)
    @doc = Nokogiri::HTML html
    remove_tags = %w[figure.highlight div.highlight h1 h2 h3 h4 h5 h6 em details summary]
    remove_tags.each do |tag|
      @doc.css(tag).each { |node| node.content = '' }
    end
    @doc.to_html
  end
end

Liquid::Template.register_filter(Excerpt)
