const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const assetsDir = path.resolve(__dirname, 'src/zcnote_sphinx_theme/assets');
const staticDir = path.resolve(__dirname, 'src/zcnote_sphinx_theme/theme/zcnote_sphinx_theme/static');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    cache: {
      type: 'filesystem',
    },
    // =========================================================
    // 1. 入口
    // =========================================================
    entry: {
      'zcnote-sphinx-theme': [
        path.join(assetsDir, 'scripts/index.js'),
        path.join(assetsDir, 'styles/index.scss')
      ]
    },

    // =========================================================
    // 2. 输出
    // =========================================================
    output: {
      path: staticDir,
      filename: 'scripts/[name].js',
      clean: false,
    },

    // =========================================================
    // 3. 模块解析与 Loader
    // =========================================================
    module: {
      rules: [
        {
          // 匹配 .scss, .sass, .css 文件
          test: /\.(sa|sc|c)ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                url: false // 如果希望 Webpack 处理 CSS 中的 url(图片/字体)，设为 true 并配置资源 loader
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                postcssOptions: {
                  plugins: ['autoprefixer']
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },

    // =========================================================
    // 4. 插件配置
    // =========================================================
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'styles/[name].css',
      }),
    ],

    optimization: {
      minimize: isProduction,

      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),

        new CssMinimizerPlugin({
          parallel: true,
        }),
      ],
    },
  };
};
