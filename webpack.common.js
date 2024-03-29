const path = require('path');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

// https://webpack.js.org/configuration/
module.exports = {
  watch: false,
  entry: {
    archive: {
      import: path.join(__dirname, '_webpack', 'javascript', 'archive'),
      dependOn: "hotwired",
    },
    pages: {
      import: path.join(__dirname, '_webpack', 'javascript', 'pages'),
      dependOn: "hotwired",
    },
    posts: {
      import: path.join(__dirname, '_webpack', 'javascript', 'posts'),
      dependOn: "hotwired",
    },
    application: {
      import: path.join(__dirname, '_webpack', 'javascript', 'application'),
      dependOn: "hotwired",
    },
    love: {
      import: path.join(__dirname, '_webpack', 'javascript', 'love'),
      dependOn: "hotwired",
    },
    talk: {
      import: path.join(__dirname, '_webpack', 'javascript', 'talk'),
      dependOn: "hotwired",
    },
    hotwired: ["@hotwired/turbo", "@hotwired/stimulus"],
  },
  output: {
    path: path.resolve(__dirname, 'dist/assets/public'),
    filename: '[name]-[contenthash].js',
    clean: {
      keep: /images/,
    }
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx'],
    modules: ['node_modules'],
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    },
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    },
    {
      test: /\.s[ac]ss$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader',
        {
          loader: 'sass-loader',
          options: {
            implementation: require("sass")
          }
        }
      ],
    },
    {
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
      type: 'asset/resource',
    },
    {
      test: /search\.json/,
      type: 'asset/resource',
    },
    ],
  },
  plugins: [
    new WebpackAssetsManifest(),
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css',
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: './_webpack/javascript/service-worker.js',
      swDest: path.resolve(__dirname, "dist", "service-worker.js"),
      modifyURLPrefix: {
        '': '/assets/public/',
      },
      maximumFileSizeToCacheInBytes: 296000,
      exclude: [/\.(jpe?g|png|webp|avif|html)$/i],
    }),
    new PreloadWebpackPlugin({
      rel: 'preload',
      as(entry) {
        if (/\.woff2?$/.test(entry)) return 'font';
      }
    }),
    new CopyPlugin({
      patterns: [
        { from: "_webpack/images/favicon", to: "favicon" },
        { from: "_webpack/static", to: "static" }
      ],
    }),
    new HtmlWebpackPlugin({
      publicPath: "/assets/public",
      template: path.join(__dirname, '_webpack', 'templates', 'javascript.html'),
      filename: path.resolve(__dirname, '_includes', 'head-assets.html'),
      inject: false,
    }),
  ]
};