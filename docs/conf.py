import os
import sys

# 【关键】将本地 src 目录加入 Python 路径，确保 Sphinx 能找到你正在开发的主题
# 这样即使你不执行 pip install，也能直接读取到最新的 Python 逻辑
sys.path.insert(0, os.path.abspath('../src'))

project = 'ZCNote Theme Docs'
copyright = '2026, ZCNote'
author = 'ZCNote'

extensions = [
    "sphinx_design",
    "sphinx_copybutton",
    "myst_parser",
]

# This allows us to use ::: to denote directives, useful for admonitions
myst_enable_extensions = ["colon_fence", "substitution"]
myst_heading_anchors = 2


html_theme = 'zcnote_sphinx_theme'

# 测试我们的自定义选项以及继承自 pydata 的选项
html_theme_options = {
    "enable_collapse_sidebar": True,
    "navigation_depth": 4,
    "show_toc_level": 2,
}

# 静态文件路径（文档级别的静态文件，非主题级别）
html_static_path = ['_static']

# 覆盖默认的网页标题和侧边栏顶部标题（不再自动拼接 documentation）
html_title = "ZCNote 主题文档"

# （可选）如果你觉得 html_title 太长，还可以设置一个极简标题
# html_short_title 通常会显示在左侧边栏顶部的 Logo 旁边
html_short_title = "ZCNote"
