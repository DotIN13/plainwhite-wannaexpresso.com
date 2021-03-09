const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    module: {
        rules: [{
            test: /\.(jpe?g|png|webp|webp)$/i,
            use: [{
                loader: 'responsive-loader',
                options: {
                    adapter: require('responsive-loader/sharp'),
                    sizes: [320, 640, 960, 1600],
                    outputPath: 'img',
                }
            }]
        }],
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    cache: {
        type: "filesystem",
        cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    }
});