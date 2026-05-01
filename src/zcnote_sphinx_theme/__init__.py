import os
from pathlib import Path

__version__ = "0.1.0"

def get_html_theme_path():
    """返回主题文件夹的绝对路径"""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "theme"))

def setup(app):
    """Sphinx 扩展注册入口"""
    theme_path = get_html_theme_path()
    app.add_html_theme("zcnote_sphinx_theme", os.path.join(theme_path, "zcnote_sphinx_theme"))

    # 自动加载自定义样式，无需用户在 conf.py 中手动配置 html_css_files
    app.add_css_file("css/zcnote_custom.css")

    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
