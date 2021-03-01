const path = require('path');
const glob = require("glob");
const webpack = require('webpack');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// https://webpack.js.org/configuration/
module.exports = {
    mode: "production",
    watch: false,
    entry: {
        archive: {
            import: ['./_webpack/javascript/archive/archive', './_webpack/javascript/pages/search'],
        },
        pages: glob.sync('./_webpack/javascript/pages/*'),
        posts: glob.sync('./_webpack/javascript/posts/*'),
        application: {
            import: glob.sync('./_webpack/javascript/application/*'),
        },
    },
    output: {
        path: path.resolve(__dirname, 'assets/public'),
        filename: '[name]-bundle.js',
    },
    resolve: {
        extensions: ['.json', '.js', '.jsx'],
        modules: ['node_modules'],
    },
    module: {
        rules: [{
                test: /\.js$/,
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
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
        }),
        new CleanWebpackPlugin(),
        new WebpackAssetsManifest(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
};