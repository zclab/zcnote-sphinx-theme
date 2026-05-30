import os
from pathlib import Path

__version__ = "0.0.8dev"

def get_html_theme_path():
    """返回主题文件夹的绝对路径"""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "theme"))


def override_pydata_sidebar_logic(app, pagename, templatename, context, doctree):
    """
    拦截并覆盖 PyData 默认的上下文变量。
    """
    context["zcnote_theme_version"] = __version__

    nav_style = context.get("theme_nav_style", "header")
    if nav_style == "sidebar":
        context["suppress_sidebar_toctree"] = lambda **kwargs: False


def setup(app):
    """Sphinx 扩展注册入口"""
    base_theme_path = get_html_theme_path()
    actual_theme_path = os.path.join(base_theme_path, "zcnote_sphinx_theme")

    app.add_html_theme("zcnote_sphinx_theme", actual_theme_path)
    components_path = os.path.join(actual_theme_path, "components")
    app.config.templates_path.append(components_path)

    # 加载编译后的 JS
    app.add_js_file("scripts/zcnote-sphinx-theme.js", defer="defer", priority=900)
    app.connect("html-page-context", override_pydata_sidebar_logic, priority=999)

    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
