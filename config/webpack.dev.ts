import ResourceHintWebpackPlugin from 'resource-hints-webpack-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest';
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import GitRevisionPlugin from 'git-revision-webpack-plugin';
import StylishPlugin from 'eslint/lib/cli-engine/formatters/stylish';
import StyleLintPlugin from 'stylelint-webpack-plugin';

import { config } from 'dotenv';

import getEnvVariables from './env.js';

const dotenv = config({
    path: '.env',
});

const gitRevisionPlugin = new GitRevisionPlugin();

const appBase = process.cwd();
const eslintFile = path.resolve(appBase, '.eslintrc-loader.js');
const appSrc = path.resolve(appBase, 'src/');
const mapboxglDist = path.resolve(appBase, 'node_modules/mapbox-gl/dist/');
const appDist = path.resolve(appBase, 'build/');
const appIndexJs = path.resolve(appBase, 'src/index.tsx');
const appIndexHtml = path.resolve(appBase, 'public/index.html');
const appFavicon = path.resolve(appBase, 'public/favicon.ico');
const appFaviconImage = path.resolve(appBase, 'public/favicon.png');

const PUBLIC_PATH = '/';

const localConfig = (env): webpack.Configuration => {
    const ENV_VARS = {
        ...getEnvVariables(env),
        ...dotenv.parsed,
        REACT_APP_VERSION: JSON.stringify(gitRevisionPlugin.version()),
        REACT_APP_COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
        REACT_APP_BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
    };

    return {
        entry: appIndexJs,
        output: {
            path: appDist,
            publicPath: PUBLIC_PATH,
            sourceMapFilename: 'sourcemaps/[file].map',
            chunkFilename: 'js/[name].[hash].js',
            filename: 'js/[name].[hash].js',
            pathinfo: false,
        },

        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: false,
        },

        mode: 'development',

        devtool: 'cheap-module-source-map',

        performance: {
            hints: 'warning',
        },

        devServer: {
            host: '0.0.0.0',
            port: 3050,
            overlay: true,
            watchOptions: {
                ignored: /node_modules/,
            },
            // Don't show warnings in browser console
            clientLogLevel: 'none',

            hot: true,
            liveReload: false,
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    include: appSrc,
                    use: [
                        require.resolve('cache-loader'),
                        require.resolve('babel-loader'),
                        {
                            loader: require.resolve('eslint-loader'),
                            // enforce: 'pre',
                            options: {
                                cache: true,
                                configFile: eslintFile,
                                // NOTE: adding this because eslint 6 cannot find this
                                // https://github.com/webpack-contrib/eslint-loader/issues/271
                                formatter: StylishPlugin,
                            },
                        },
                    ],
                },
                {
                    test: /\.(html)$/,
                    use: [
                        {
                            loader: require.resolve('html-loader'),
                            options: {
                                // attrs: [':data-src'],
                            },
                        },
                    ],
                },
                {
                    test: /\.(css|scss)$/,
                    include: appSrc,
                    use: [
                        require.resolve('style-loader'),
                        {
                            // NOTE: we may need to use postcss-modules instead of css-loader
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                                modules: {
                                    localIdentName: '[name]_[local]_[hash:base64]',
                                    exportLocalsConvention: 'camelCaseOnly',
                                },
                                sourceMap: true,
                            },
                        },
                        {
                            loader: require.resolve('postcss-loader'),
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        'postcss-preset-env',
                                        'postcss-nested',
                                        'postcss-normalize',
                                    ],
                                },
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    include: mapboxglDist,
                    use: [
                        require.resolve('style-loader'),
                        require.resolve('css-loader'),
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    use: [
                        {
                            loader: require.resolve('file-loader'),
                            options: {
                                name: 'assets/[hash].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            // NOTE: could try using react-hot-loader
            // https://github.com/gaearon/react-hot-loader
            new webpack.DefinePlugin({
                'process.env': JSON.stringify(ENV_VARS),
            }),
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: false,
                allowAsyncCycles: false,
                cwd: appBase,
            }),
            // Remove build folder anyway
            new CleanWebpackPlugin(),
            new StyleLintPlugin({
                files: ['**/*.css'],
                context: appSrc,
            }),
            new HtmlWebpackPlugin({
                template: appIndexHtml,
                filename: './index.html',
                title: 'DFID',
                favicon: path.resolve(appFavicon),
                chunksSortMode: 'none',
            }),
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash].css',
                chunkFilename: '[id].[contenthash].css',
            }),
            new WebpackPwaManifest({
                name: 'dfid',
                short_name: 'DFID',
                description: 'DFID Data Visualization System',
                background_color: '#f0f0f0',
                orientation: 'portrait',
                // theme_color: '#18bc9c',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: path.resolve(appFaviconImage),
                        sizes: [96, 128, 192, 256, 384, 512],
                        destination: path.join('assets', 'icons'),
                    },
                ],
            }),
            new ResourceHintWebpackPlugin(),
            new webpack.HotModuleReplacementPlugin(),
        ],
    };
};
export default [localConfig];
