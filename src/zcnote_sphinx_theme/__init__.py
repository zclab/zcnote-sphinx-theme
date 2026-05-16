import os
from pathlib import Path

__version__ = "0.0.5rc"

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
    # 3. 将 components 文件夹注入 Sphinx 的模板搜索路径
    # =========================================================
    components_path = os.path.join(actual_theme_path, "components")
    app.config.templates_path.append(components_path)

    # =========================================================
    # ★ 核心优化 1：注册 Webpack 编译出的静态产物
    # 增加 priority=900（数值越大越靠后），确保绝对覆盖 PyData 原有样式
    # =========================================================
    # 加载编译后的 CSS
    app.add_css_file("styles/zcnote-sphinx-theme.css", priority=900)

    # 加载编译后的 JS (defer="defer" 确保不阻塞 DOM 骨架解析)
    app.add_js_file("scripts/zcnote-sphinx-theme.js", defer="defer", priority=900)

    # =========================================================
    # ★ 核心优化 2：上下文拦截器
    # 增加 priority=999，强制让我们的拦截器在 PyData 的拦截器之后执行
    # =========================================================
    app.connect("html-page-context", override_pydata_sidebar_logic, priority=999)

    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
