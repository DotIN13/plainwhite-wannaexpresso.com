module MultilingualPosts
  class Generator < Jekyll::Generator
    safe true
    priority :high

    @@language_codes = %w[zh-cn en-us]

    def generate(site)
      # Create a hash to keep track of posts by their identifiers excluding language part
      posts_by_id = {}

      site.posts.docs.each do |post|
        categories = post.data['categories']

        lang = if categories.empty?
                 'zh-cn'
               else
                 categories.intersection(@@language_codes).first
               end

        id = post.id.split('/')[-4..].join('/')

        # Initialize the array for this id if it doesn't exist
        posts_by_id[id] ||= []
        posts_by_id[id] << lang
      end

      # Now, iterate again to set the multilingual property for each post
      site.posts.docs.each do |post|
        id = post.id.split('/')[-4..].join('/')

        if posts_by_id[id]
          # Set the multilingual property
          post.data['multilingual'] = posts_by_id[id].sort
        end
      end
    end
  end
end
