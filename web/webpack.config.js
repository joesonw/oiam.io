'use strict';
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = {
    entry: [
        'babel-polyfill',
        path.resolve(__dirname, 'src/index.tsx'),
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
    devtool: false,
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
        new webpack.DefinePlugin({
            API_URL: '""',
        }),
        new HtmlWebpackPlugin({
            title: 'Open Identity Asset Management',
            template: path.join(__dirname, 'src/index.html'),
        }),
        new CheckerPlugin(),
        new UglifyJsPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
};
