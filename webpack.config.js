const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const assetsDir = path.resolve(__dirname, 'src/zcnote_sphinx_theme/assets');
const staticDir = path.resolve(__dirname, 'src/zcnote_sphinx_theme/theme/zcnote_sphinx_theme/static');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    cache: false,
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
      filename: 'scripts/[name].js', // ★ 此时会输出为 scripts/zcnote-sphinx-theme.js
      clean: false, // 保持关闭清理
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
                url: false // 如果你希望 Webpack 处理 CSS 中的 url(图片/字体)，设为 true 并配置资源 loader
              },
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
        filename: 'styles/[name].css', // ★ 此时会输出为 styles/zcnote-sphinx-theme.css
      }),
    ],

    // =========================================================
    // 5. 性能与优化
    // =========================================================
    optimization: {
      minimize: isProduction,
      concatenateModules: false,
    },
  };
};
