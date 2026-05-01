import os
import sys

# 【关键】将本地 src 目录加入 Python 路径，确保 Sphinx 能找到你正在开发的主题
# 这样即使你不执行 pip install，也能直接读取到最新的 Python 逻辑
sys.path.insert(0, os.path.abspath('../src'))

project = 'ZCNote Theme Docs'
copyright = '2026, ZCNote'
author = 'ZCNote'

# --- 核心主题配置 ---
# 指定我们自定义的主题名称
html_theme = 'zcnote_sphinx_theme'

# 测试我们的自定义选项以及继承自 pydata 的选项
html_theme_options = {
    # 这是我们在 theme.conf 中新增的选项
    "enable_collapse_sidebar": True,

    # pydata 的原生选项，用于测试继承是否正常
    "navigation_depth": 4,
    "show_toc_level": 2,
}

# 静态文件路径（文档级别的静态文件，非主题级别）
html_static_path = ['_static']
