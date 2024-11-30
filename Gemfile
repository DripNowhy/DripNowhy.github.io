source "https://rubygems.org"

# 使用 GitHub Pages 推荐的 gem
gem "github-pages", group: :jekyll_plugins

# 如果你需要其他插件，把它们放在这个组里
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
  gem "jekyll-paginate"
  gem "jekyll-include-cache"
end

# Windows 平台需要的 gems
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# 性能相关的 gems
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# 锁定 webrick 版本，解决 Ruby 3.0+ 的兼容性问题
gem "webrick", "~> 1.7"
