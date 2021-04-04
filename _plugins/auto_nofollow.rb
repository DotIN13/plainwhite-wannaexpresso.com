require 'kramdown'

module Kramdown
  module Converter
    class Html
      alias super_convert_a convert_a
      def convert_a(el, indent)
        if el.attr['href'] =~ /^[A-Za-z0-9]+:/
          el.attr['target'] = '_blank'
          el.attr['rel'] = 'nofollow noopener noreferrer'
        end

        super_convert_a el, indent
      end
    end
  end
end
