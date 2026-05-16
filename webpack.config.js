const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 定义前端源码目录与 Sphinx 产物目录
const assetsDir = path.resolve(__dirname, 'src/zcnote_sphinx_theme/assets');
const staticDir = path.resolve(__dirname, 'src/zcnote_sphinx_theme/theme/zcnote_sphinx_theme/static');

module.exports = (env, argv) => {
  // 判断是否为生产环境 (对应 npm run build)
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',

    // 开发模式开启 SourceMap，方便在浏览器审查元素时定位到原始 .scss 文件
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    cache: false,
    // =========================================================
    // 1. 入口 (Entry)：注入 JS 和 SCSS
    // =========================================================
    entry: {
      // 键名改为与包名一致的连字符格式
      'zcnote-sphinx-theme': [
        path.join(assetsDir, 'scripts/index.js'),
        path.join(assetsDir, 'styles/index.scss')
      ]
    },

    // =========================================================
    // 2. 输出 (Output)：精准投放到 Sphinx 主题包内部
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
            // 第三步：将 JS 中生成的 CSS 代码抽取为单独的物理 .css 文件
            MiniCssExtractPlugin.loader,
            // 第二步：将 CSS 转换为 CommonJS 模块
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                url: false // 如果你希望 Webpack 处理 CSS 中的 url(图片/字体)，设为 true 并配置资源 loader
              },
            },
            // 第一步：编译 SCSS 到 CSS
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
      minimize: isProduction, // 生产模式下自动压缩 JS 和 CSS
      concatenateModules: false,
    },
  };
};
