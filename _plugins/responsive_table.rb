require 'kramdown'

module Kramdown
  module Converter
    class Html
      alias super_convert_table convert_table
      def convert_table(el, indent)
        "<div class='responsive-table'>#{super_convert_table el, indent}</div>"
      end
    end
  end
end
