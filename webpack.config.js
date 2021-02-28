const path = require('path');
const glob = require("glob");
const webpack = require('webpack');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const { LibManifestPlugin } = require('webpack');


// https://webpack.js.org/configuration/
module.exports = {
    mode: "production",
    watch: false,
    entry: {
        utilities: glob.sync('./_webpack/javascript/*.js'),
        application: path.join(__dirname, "_webpack/application")
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
                use: ['style-loader', 'css-loader',
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
    ],
};