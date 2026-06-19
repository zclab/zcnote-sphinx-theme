import os
from pathlib import Path

__version__ = "0.1.0.dev"

def get_html_theme_path():
    """返回主题文件夹的绝对路径"""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "theme"))


def _ensure_list(val):
    if not val:
        return []
    if isinstance(val, str):
        return [val]
    return list(val)

def override_pydata_sidebar_logic(app, pagename, templatename, context, doctree):
    context["zcnote_theme_version"] = __version__

    hide_header_raw = context.get("theme_hide_header", False)
    if isinstance(hide_header_raw, str):
        is_header_hidden = hide_header_raw.lower() in ("true", "1", "yes")
    else:
        is_header_hidden = bool(hide_header_raw)

    if is_header_hidden:
        context["theme_nav_style"] = "sidebar"
        current_sidebars = context.get("sidebars")

        if current_sidebars is not False:
            if current_sidebars is None:
                current_sidebars = ["search-field.html", "sidebar-nav-bs.html"]

            if isinstance(current_sidebars, list):
                top_components = [
                    "components/sidebar-brand.html",
                    "components/sidebar-utilities.html"
                ]

                navbar_end_items = _ensure_list(context.get("theme_navbar_end"))
                navbar_persistent_items = _ensure_list(context.get("theme_navbar_persistent"))

                components_to_remove = set(
                    top_components +
                    navbar_end_items +
                    navbar_persistent_items +
                    ["search-field.html"]
                )

                cleaned_sidebars = [
                    item for item in current_sidebars
                    if item not in components_to_remove
                ]

                context["sidebars"] = top_components + cleaned_sidebars

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
