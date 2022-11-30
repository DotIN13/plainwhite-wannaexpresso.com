# Jekyll main module
module Jekyll
  # Chopping text by number of words and lines
  module Ago
    MINUTE = 60
    HOUR = MINUTE * 60
    DAY = HOUR * 24
    WEEK = DAY * 7

    def ago(doc)
      diff = Time.now.to_i - doc.to_i
      return "#{diff}s" if diff < MINUTE
      return "#{diff / MINUTE}min" if diff < HOUR
      return "#{diff / HOUR}h" if diff < DAY
      return "#{diff / DAY}d" if diff < WEEK

      doc.strftime("%b %-d, %Y")
    end
  end
end

Liquid::Template.register_filter(Jekyll::Ago)