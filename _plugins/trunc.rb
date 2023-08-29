require 'nokogiri'

def contains_cjk?(str)
  cjk = /\p{Han}|\p{Katakana}|\p{Hiragana}|\p{Hangul}/
  punc = /[\u{2000}-\u206F]|[\u{2000}-\u{206F}]|[\u{3000}-\u{303F}]|[\u{FF00}-\u{FFEF}]/
  str =~ Regexp.union(cjk, punc)
end

def count_cjk(str)
  str.chars.inject(0) do |sum, char|
    sum + (contains_cjk?(char) ? 1 : 0.5)
  end
end

def truncate_cjk_string(str, length)
  return str if count_cjk(str) <= length

  truncated_str = ''
  str.chars.each do |char|
    truncated_str += char
    break if count_cjk(truncated_str) >= length
  end
  truncated_str
end

# Traverses the HTML tree and truncates the text nodes to the given length.
def traverse_and_truncate(node, length, lines = 15, last_text_node = nil)
  return [length, lines, last_text_node] unless node

  # Remove the node if the length is already below zero
  if length <= 0 || lines <= 0
    node.remove
    return [length, lines, last_text_node]
  end

  # Truncate the text node if it contains CJK characters
  if node.text?
    last_text_node = node # Save the last text node

    token_count = count_cjk(node.content)
    if length - token_count <= 0 || lines <= 0
      truncated_text = truncate_cjk_string(node.content, length)
      node.content = "#{truncated_text}..."
    end
    return [length - token_count, lines, last_text_node]
  end

  # Decrement the line count if the node is a block element
  lines -= 1 if %w[p div br].include?(node.name)
  # Add ellipsis to the last text node if the line count is now below zero
  last_text_node.content += '...' if lines <= 0 && last_text_node && !last_text_node.content.end_with?('...')

  # Traverse the children of the node
  if node.children.any?
    node.children.each do |child|
      length, lines, last_text_node = traverse_and_truncate(child, length, lines, last_text_node)
    end
  end

  [length, lines, last_text_node]
end

# Truncates HTML to the given number of characters.
def trunc(input, desired_length = 140, max_lines = 15)
  doc = Nokogiri::HTML::DocumentFragment.parse(input)
  traverse_and_truncate(doc, desired_length, max_lines)
  doc.to_html
end

# Debugging
if __FILE__ == $PROGRAM_NAME
  html_content = '<div>Hello, <b>world</b>. This is a <b><i>test</i></b> for HTML truncation.</div>'
  # html_content = "<div>你是我的小苹果，小雅小品过</div>"
  text = trunc(html_content, 6)
  print(text)
end
