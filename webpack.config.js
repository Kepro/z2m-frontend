const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const path = require('path');
const glob = require('glob');
const proxyTo = process.env.Z2M_API_URI ? process.env.Z2M_API_URI : 'ws://localhost:8579';

module.exports = (env, args) => {
    let production = false;

    if (args && args.mode === 'production') {
        production = true;
        // console.log('== Production mode');
    } else {
        console.log('== Development mode');
    }

    const plugins = [
        new webpack.DefinePlugin({
            FRONTEND_VERSION: JSON.stringify(process.env.npm_package_version),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].[contenthash].css',
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'src/images/favicon.ico',
                },
            ],
        }),
    ];
    const basePath = 'src/templates';
    glob.sync(`${basePath}/**/*.html`).forEach((item) => {
        plugins.push(
            new HtmlWebpackPlugin({
                filename: path.relative(basePath, item),
                template: item,
            }),
        );
    });
    if (production) {
        plugins.push(
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
            }),
        );
    } else {
        plugins.push(new ForkTsCheckerWebpackPlugin());
    }

    return {
        entry: './src/index.tsx',
        output: {
            filename: '[name].[contenthash].js',
            path: path.resolve('./dist'),
        },
        target: 'web',
        devtool: 'source-map',
        optimization: {
            usedExports: true,
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    defaultVendors: {
                        test: /node_modules/,
                        name: 'scripts/vendor',
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },
        },
        resolve: {
            modules: ['src', 'node_modules'],
            mainFields: ['module', 'main'],
            extensions: ['.ts', '.tsx', '.js', '.html', '.txt'],
        },
        module: {
            rules: [
                {
                    test: /\.txt$/i,
                    type: 'asset/source',
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    include: [/\.global\./, /node_modules/],
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                    sideEffects: true,
                },
                {
                    // Preprocess our own .css files
                    // This is the place to add your own loaders (e.g. sass/less etc.)
                    // for a list of loaders, see https://webpack.js.org/loaders/#styling
                    test: /\.scss$/,
                    exclude: [/\.global\./, /node_modules/],
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                modules: {
                                    localIdentName: '[local]___[hash:base64:5]',
                                },
                                importLoaders: 1,
                            },
                        },
                        'sass-loader',
                    ],
                    sideEffects: true,
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,

                        '@teamsupercell/typings-for-css-modules-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    include: /node_modules/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },

                {
                    test: /\.scss$/,
                    include: [/\.global\./, /node_modules/],
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                    sideEffects: true,
                },
                {
                    // Preprocess our own .css files
                    // This is the place to add your own loaders (e.g. sass/less etc.)
                    // for a list of loaders, see https://webpack.js.org/loaders/#styling
                    test: /\.scss$/,
                    exclude: [/\.global\./, /node_modules/],
                    use: [
                        MiniCssExtractPlugin.loader,
                        '@teamsupercell/typings-for-css-modules-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                modules: {
                                    localIdentName: '[local]___[hash:base64:5]',
                                },
                                importLoaders: 1,
                            },
                        },
                        'sass-loader',
                    ],
                    sideEffects: true,
                },
            ],
        },
        devServer: {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            contentBase: './dist',
            compress: true,
            host: '0.0.0.0',
            port: 3030,
            proxy: {
                '/api': {
                    target: proxyTo,
                    ws: true,
                },
            },
        },
        plugins,
        stats: 'errors-only',
        externals: {},
    };
};
