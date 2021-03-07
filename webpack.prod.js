const {
    merge
} = require('webpack-merge');
const common = require('./webpack.common.js');

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
});