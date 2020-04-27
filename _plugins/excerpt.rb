# frozen_string_literal: true

module Excerpt
  def excerpt(html)
    headers = [/<h1[^<]*<\/h1>/, /<h2[^<]*<\/h2>/, /<h3[^<]*<\/h3>/, /<div\sclass=\"highlight\".*<\/div>/m, /<figure\sclass=\"highlight\".*<\/figure>/m]

    headers.each do |tag|
      html.gsub!(tag, '')
    end

    html
  end
end

Liquid::Template.register_filter(Excerpt)