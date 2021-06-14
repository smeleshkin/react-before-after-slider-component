const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const makeNpmConfig = require('./npm.config.js');

module.exports = () => {
    const basePath = path.join(__dirname, '../docs');

    const config = makeNpmConfig();
    config.entry = './githubPage/index.tsx';
    config.output = {
        path: basePath,
        filename: 'build.[hash].js',
    }
    config.externals = {};
    config.plugins = [
        new  CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'build.[hash].css',
        }),
        new HtmlWebpackPlugin({
            template: './githubPage/index.html',
            inject: 'body',
        }),
        new CopyPlugin({
            patterns: [
                { from: './githubPage/assets', to: `${basePath}/assets` },
            ],
        }),
    ];

    config.module.rules = config.module.rules.map(rule => {
        if (rule.loader === 'ts-loader') {
            return {
                ...rule,
                options: {
                    transpileOnly: true
                },
            }
        }

        return rule;
    })

    return config;
}
