import os
from pathlib import Path

__version__ = "0.0.10dev"

def get_html_theme_path():
    """返回主题文件夹的绝对路径"""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "theme"))


def override_pydata_sidebar_logic(app, pagename, templatename, context, doctree):
    """
    拦截并覆盖 PyData 默认的上下文变量，实现配置联动与动态组件注入。
    """
    context["zcnote_theme_version"] = __version__

    # 1. 解析 hide_header 变量
    hide_header_raw = context.get("theme_hide_header", False)
    if isinstance(hide_header_raw, str):
        is_header_hidden = hide_header_raw.lower() in ("true", "1", "yes")
    else:
        is_header_hidden = bool(hide_header_raw)

    # 2. 隐藏 Header 时的全局联动逻辑
    if is_header_hidden:
        context["theme_nav_style"] = "sidebar"
        current_sidebars = context.get("sidebars")

        # 仅当该页面没有显式禁用侧边栏 (html_sidebars = False) 时才注入
        if current_sidebars is not False:
            if current_sidebars is None:
                current_sidebars = ["search-field.html", "sidebar-nav-bs.html"]

            if isinstance(current_sidebars, list):
                sidebars_list = list(current_sidebars)

                brand_tpl = "components/sidebar-brand.html"
                search_tpl = "search-field.html"  # PyData 原生搜索组件

                # 先清洗队列，防止用户配置导致的重复或顺序错乱
                if brand_tpl in sidebars_list:
                    sidebars_list.remove(brand_tpl)
                if search_tpl in sidebars_list:
                    sidebars_list.remove(search_tpl)

                sidebars_list.insert(0, search_tpl)
                sidebars_list.insert(0, brand_tpl)

                # 写回上下文
                context["sidebars"] = sidebars_list

    # 3. 释放侧边栏树的渲染权限
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
