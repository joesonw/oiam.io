'use strict';
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    entry: [
        'babel-polyfill',
        path.resolve(__dirname, 'src/index.tsx'),
        'webpack-dev-server/client?http://127.0.0.1:4100',
    ],
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules'),
        ],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: path.resolve(__dirname, 'tsconfig.json'),
            }),
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js',
    },
    node: {
        fs: 'empty',
        module: 'empty',
        net: 'empty',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'libs'),
                use: ['script-loader'],
            },
            {
                test: /\.(t|j)sx?$/,
                exclude: /(node_modules|libs)/,
                use: ['babel-loader', 'awesome-typescript-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Open Identity Asset Management',
            template: path.join(__dirname, 'src/index.html'),
        }),
        new webpack.DefinePlugin({
            API_URL: '"http://localhost:9000"',
        }),
        new webpack.HotModuleReplacementPlugin(),
        new CheckerPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
    devServer: {
        contentBase: './src',
        historyApiFallback: true,
        host: '0.0.0.0',
        port: 4100,
        hot: true,
        inline: true,
        compress: true,
        watchOptions: {
            ignored: /node_modules/,
            aggregateTimeout: 500,
            poll: 1000,
        },
        stats: {
            assets: true,
            children: false,
            chunks: false,
            hash: false,
            modules: false,
            timings: true,
            version: false,
            warnings: true,
        },
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:9000',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '',
                },
            },
        },
    },
};
