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
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';
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
        ...dotenv.parsed,
        ...getEnvVariables(env),
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
            chunkFilename: 'js/[name].[chunkhash].js',
            filename: 'js/[name].[contenthash].js',
        },

        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: false,
        },

        mode: 'production',

        devtool: 'source-map',

        optimization: {
            minimizer: [
                // NOTE: Using TerserPlugin instead of UglifyJsPlugin as es6 support deprecated
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        mangle: true,
                        compress: { typeofs: false },
                    },
                }),
                new OptimizeCssAssetsPlugin({
                    cssProcessorOptions: {
                        safe: true,
                    },
                }),
            ],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
            runtimeChunk: 'single',
            moduleIds: 'deterministic',
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    include: appSrc,
                    use: [
                        require.resolve('babel-loader'),
                        {
                            loader: require.resolve('eslint-loader'),
                            options: {
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
                        MiniCssExtractPlugin.loader,
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
                        MiniCssExtractPlugin.loader,
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
            new webpack.DefinePlugin({
                'process.env': ENV_VARS,
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
                filename: 'css/[name].[contenthash].css',
                chunkFilename: 'css/[id].[contenthash].css',
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
            new WorkboxPlugin.GenerateSW({
                // these options encourage the ServiceWorkers to get in there fast
                // and not allow any straggling "old" SWs to hang around
                clientsClaim: true,
                skipWaiting: true,
                include: [/\.html$/, /\.js$/, /\.css$/],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/assets/, /^\/admin/, /^\/api/],
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /assets/,
                        handler: 'CacheFirst',
                    },
                ],
            }),
            new CompressionPlugin(),
            new ResourceHintWebpackPlugin(),
            new webpack.ids.HashedModuleIdsPlugin(),
        ],
    };
};
export default [localConfig];
