require 'nokogiri'

# Core extension
class String
  def contains_cjk?
    !!(self =~ /\p{Han}|\p{Katakana}|\p{Hiragana}|\p{Hangul}/)
  end

  def count_cjk
    split.inject(0) do |sum, word|
      sum + (word.contains_cjk? ? word.length : 1)
    end
  end
end

# Jekyll main module
module Jekyll
  # Chopping text by number of words and lines
  module Chop
    def chop(doc, max_word = 100, max_line = 5, ellipsis = "...")
      @doc = Nokogiri::HTML doc
    end
  end
end

Liquid::Template.register_filter(Jekyll::Chop)
