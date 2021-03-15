Jekyll::Hooks.register :moods, :pre_render do |mood|
  # get the current post last modified time
  creation_time = File.ctime mood.path

  # inject modification_time in post's datas.
  mood.data['date'] ||= creation_time
end
