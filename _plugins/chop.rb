require 'nokogiri'

# Core extension
class String
  def contains_cjk?
    cjk = /\p{Han}|\p{Katakana}|\p{Hiragana}|\p{Hangul}/
    punc = /[\u{2000}-\u206F]|[\u{2000}-\u{206F}]|[\u{3000}-\u{303F}]|[\u{FF00}-\u{FFEF}]/
    self =~ Regexp.union(cjk, punc)
  end

  def count_cjk
    split.inject(0) do |sum, word|
      sum + (word.contains_cjk? ? word.length : 1)
    end
  end

  def cjk_width
    chars.inject(0) do |sum, char|
      sum + (char.contains_cjk? ? 2 : 1)
    end
  end

  # def split_cjk
  #   str = [self[0]]
  #   prev_cjk = self[0].contains_cjk?
  #   chars[1..].each do |char|
  #     current_cjk = char.contains_cjk?
  #     if (prev_cjk != current_cjk) || char.linebreak?
  #       str << char
  #     else
  #       str.last << char
  #     end
  #     prev_cjk = current_cjk
  #   end
  #   str
  # end

  def linebreak?
    self == "\n"
  end

  def paragraph_break?
    self == "\n\n"
  end
end

# Jekyll main module
module Jekyll
  # Chopping text by number of words and lines
  module Chop
    def chop(doc, max_line = 5, line_width = 50, ellipsis = '...')
      # puts "start chopping"
      @chopped = false
      @ellipsis = ellipsis
      @line_width = line_width
      @lines_left = max_line
      @words_left = line_width
      @body = Nokogiri::HTML.fragment(doc)
      # Safeguard against empty input
      return '' if doc.nil?

      @body.inner_html = @body.inner_html.chomp
      chop_elem(@body).inner_html + (@chopped ? @ellipsis : '')
    end

    def chop_elem(elem)
      if @chopped
        elem.remove
      elsif elem.is_a?(Nokogiri::XML::Text)
        # p elem.content
        mark = chop_mark(elem.content)
        elem.content = elem.content[0, mark]
      else
        elem.children.each do |child|
          chop_elem(child)
        end
      end
      elem
    end

    # Return position to stop
    def chop_mark(str)
      next_line if str.paragraph_break?
      return str.length if str.paragraph_break?

      str.chars.each_with_index do |char, i|
        if char.linebreak?
          next_line
        elsif @words_left.positive?
          next_char(char)
        elsif @lines_left.positive?
          next_line
          next_char(char)
        end
        # puts "#{@lines_left}, #{@words_left}"
        return i if (@chopped = chop_end?)
      end
      # Return string length if word limits not reached
      # @chpped = true if @lines_left.zero?
      str.length
    end

    def chop_end?
      @lines_left.negative? || (@lines_left.zero? && @words_left <= 0)
    end

    def next_line
      @lines_left -= 1
      @words_left = @line_width
    end

    def next_char(char)
      @words_left -= char.cjk_width
    end
  end
end

Liquid::Template.register_filter(Jekyll::Chop)
