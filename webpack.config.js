const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const TerserPlugin = require('terser-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const generate = require('generate-file-webpack-plugin');

const BUILD_HASH = JSON.stringify(Math.round(Date.now() / 3000));

const moduleOptions = {
    rules: [
        {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                },
            },
        },
        {
            test: /\.s[ac]ss$/i,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        url: false,
                        sourceMap: true
                    }
                },
                {
                    loader: "postcss-loader",
                    options: {
                        postcssOptions: {
                            plugins: [
                                [
                                    "postcss-preset-env",
                                    {
                                        browsers: 'last 2 versions'
                                    },
                                ],
                                autoprefixer()
                            ],
                        },
                    },
                },
                "sass-loader",
            ],
        },
    ]
}

const optimization = {
    minimize: true,
    minimizer: [
        new TerserPlugin({
            terserOptions: {
                format: {
                    comments: false,
                },
            },
        }),
        new CssMinimizerPlugin()
    ]
}

const resolve = {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
}

const watchOptions = {
    ignored: /node_modules/,
    poll: 1000
}

const commonPlugins = [
    generate({
        file: 'build-prefix.php',
        content: `<?php return ${BUILD_HASH};`
    }),
    new FileManagerPlugin({
        events: {
            onStart: {
                delete: ['dist'],
            },
        },
    })
]

const MainApp = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `main.${BUILD_HASH}.js`,
    },
    watch: process.env.NODE_ENV !== 'production',
    watchOptions: watchOptions,
    resolve: resolve,
    module: moduleOptions,
    plugins: [
        ...commonPlugins,
        new MiniCssExtractPlugin({
            filename: `main.style.${BUILD_HASH}.css`
        })
    ],
    optimization: optimization
}

module.exports = [MainApp]