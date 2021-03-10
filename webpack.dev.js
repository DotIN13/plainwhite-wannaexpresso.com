const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path')

module.exports = merge(common, {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|webp|webp)$/i,
                use: [{
                    loader: 'responsive-loader',
                    options: {
                        adapter: require('responsive-loader/sharp'),
                        outputPath: 'img',
                        disable: true,
                    }
                }]
            },
        ],
    },
    cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
        version: 'development',
    }
});