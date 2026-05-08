import os
from pathlib import Path

__version__ = "0.0.3"

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
        # 劫持：确保它不被 PyData 覆盖
        context["suppress_sidebar_toctree"] = lambda **kwargs: False


def setup(app):
    """Sphinx 扩展注册入口"""
    # 1. 获取基础路径与当前主题的真实路径
    base_theme_path = get_html_theme_path()
    actual_theme_path = os.path.join(base_theme_path, "zcnote_sphinx_theme")

    # 2. 注册 HTML 主题
    app.add_html_theme("zcnote_sphinx_theme", actual_theme_path)

    # =========================================================
    # 将 components 文件夹注入 Sphinx 的模板搜索路径
    # =========================================================
    components_path = os.path.join(actual_theme_path, "components")
    app.config.templates_path.append(components_path)

    # 3. 自动加载自定义样式，无需用户在 conf.py 中手动配置 html_css_files
    app.add_css_file("css/zcnote.css")

    # =========================================================
    # 增加 priority=999
    # 强制让我们的拦截器在 PyData 的拦截器之后执行，实现最终覆盖！
    # =========================================================
    app.connect("html-page-context", override_pydata_sidebar_logic, priority=999)

    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
