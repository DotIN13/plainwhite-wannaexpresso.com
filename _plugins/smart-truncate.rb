#    smart_truncate: A HTML-aware word-truncating filter for Jekyll/Liquid
#    Copyright © 2016  RunasSudo (Yingtong Li)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.

# Code style: Smells like Python

require 'nokogiri'

class String
  def contains_cjk?
    !!(self =~ /\p{Han}|\p{Katakana}|\p{Hiragana}|\p{Hangul}/)
  end

  def count_cjk
    split.inject(0) do |sum, word|
      sum += if word.contains_cjk?
               word.length
             else
               1
             end
    end
  end

  def truncate_cjk(num)
    temp = []
    split.each do |word|
      next if num <= 0

      if word.contains_cjk?
        num -= word.length
        temp << (num >= 0 ? word : word.split('').first(word.length + num).join)
      else
        num -= word.split.length
        temp << (num >= 0 ? word : word.split.first(word.length + num).join(' '))
      end
    end
    temp.join(' ')
  end
end

module Jekyll
  module SmartTruncate
    def smart_truncate(input, num_words = 100, after = '...')
      doc = Nokogiri::HTML(input)
      words = smart_truncate_doc(doc, num_words)

      body = doc.root.children.first

      if words >= num_words
        if body.children.last.name == 'p' || body.children.last.name == 'div' || body.children.last.name == 'span'
          body.children.last.inner_html += after
        else
          body << after
        end
      end

      body.inner_html
    end

    def is_blank(doc)
      return true if doc.is_a?(Nokogiri::XML::Text) && (doc.content.strip.length == 0)

      return true if doc.children.length == 0

      doc.children.each do |child|
        return false unless is_blank(child)
      end
      true
    end

    def smart_truncate_doc(doc, num_words)
      if doc.is_a?(Nokogiri::XML::Text)
        if num_words.positive?
          if doc.content.count_cjk <= num_words # Enough words
            doc.content.count_cjk
          else # Must break here
            new_content = doc.content.truncate_cjk(num_words)

            doc.content = if doc.content.start_with?(' ')
                            ' ' + new_content # Preserve leading space
                          # If we're breaking, then trailing spaces don't matter
                          else
                            new_content
                          end
            num_words
          end
        else
          doc.remove
          0
        end
      elsif doc.name == 'table'
        smart_truncate_table(doc, num_words)
      elsif num_words.positive?
        was_blank = is_blank(doc)

        count = 0
        doc.children.each do |child|
          if child.name == 'br'
            num_words -= 16
            count += 16
          end
          count += smart_truncate_doc(child, num_words - count)
        end

        doc.remove if is_blank(doc) && !was_blank

        count
      else
        doc.remove
        0
      end
    end

    def smart_truncate_table(doc, num_words)
      if doc.is_a?(Nokogiri::XML::Text)
        doc.content.split.length
      elsif doc.name == 'tr'
        if num_words <= 0 # Cut off at the row level
          doc.remove
          0
        else
          count = 0
          doc.children.each do |child|
            count += smart_truncate_table(child, num_words - count)
          end
          count
        end
      elsif num_words > 0
        was_blank = is_blank(doc)

        count = 0
        doc.children.each do |child|
          count += smart_truncate_table(child, num_words - count)
        end

        doc.remove if is_blank(doc) && !was_blank

        count
      else
        doc.remove
        0
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::SmartTruncate)
