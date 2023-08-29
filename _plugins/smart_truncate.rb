require_relative "trunc"

module Jekyll
  module SmartTruncate
    def smart_truncate(input, num_words = 100)
      trunc(input, num_words)
    end
  end
end

Liquid::Template.register_filter(Jekyll::SmartTruncate)
