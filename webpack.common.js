const path = require('path');
const glob = require("glob");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

// https://webpack.js.org/configuration/
module.exports = {
  watch: false,
  entry: {
    archive: {
      import: ['./_webpack/javascript/archive/archive', './_webpack/javascript/pages/search'],
    },
    pages: path.join(__dirname, '_webpack', 'javascript', 'pages'),
    posts: glob.sync('./_webpack/javascript/posts/*'),
    application: path.join(__dirname, '_webpack', 'javascript', 'application'),
  },
  output: {
    path: path.resolve(__dirname, 'assets/public'),
    filename: '[name]-bundle.js',
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
    new CleanWebpackPlugin(),
    new WebpackAssetsManifest(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: './_webpack/javascript/service-worker.js',
      swDest: path.resolve(__dirname, "service-worker.js"),
      modifyURLPrefix: {
        '': '/assets/public/',
      },
      maximumFileSizeToCacheInBytes: 296000,
      exclude: [/\.(jpe?g|png|webp|avif)$/i],
    }),
    new PreloadWebpackPlugin({
      rel: 'preload',
      as(entry) {
        if (/\.woff2?$/.test(entry)) return 'font';
      }
    }),
  ]
};