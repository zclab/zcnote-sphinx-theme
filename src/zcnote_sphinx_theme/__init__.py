import os

__version__ = "0.3.0.dev"

def get_html_theme_path():
    """返回主题文件夹的绝对路径"""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "theme"))

def _ensure_list(val):
    """确保传入的值始终为一个列表"""
    if not val:
        return []
    if isinstance(val, str):
        return [x.strip() for x in val.split(",") if x.strip()]
    try:
        return list(val)
    except TypeError:
        return [val]

def override_pydata_sidebar_logic(app, pagename, templatename, context, doctree):
    context["zcnote_theme_version"] = __version__

    root_doc = context.get("root_doc") or context.get("master_doc") or "index"

    if hasattr(app, "env") and hasattr(app.env, "titles") and root_doc in app.env.titles:
        context["root_title"] = app.env.titles[root_doc].astext()
    else:
        context["root_title"] = context.get("project") or "Home"

    hide_header_raw = context.get("theme_hide_header", False)
    if isinstance(hide_header_raw, str):
        is_header_hidden = hide_header_raw.lower() in ("true", "1", "yes")
    else:
        is_header_hidden = bool(hide_header_raw)

    if is_header_hidden:
        context["theme_nav_style"] = "sidebar"

        raw_routing_map = context.get("theme_relocate_header")
        routing_map = raw_routing_map if isinstance(raw_routing_map, dict) else {}

        exclude_items = {"navbar-logo.html", "navbar-nav.html"}

        to_sidebar = []
        to_sidebar_end = []
        to_article_end = []
        to_article_start = []
        processed_orphans = []

        def route_items(source_items, smart_default_target):
            for item in _ensure_list(source_items):
                if item in exclude_items:
                    continue

                if item in processed_orphans:
                    continue
                processed_orphans.append(item)

                target = routing_map.get(item, smart_default_target)

                if target == "sidebar":
                    to_sidebar.append(item)
                elif target == "primary_sidebar_end":
                    to_sidebar_end.append(item)
                elif target == "article_header_end":
                    to_article_end.append(item)
                elif target == "article_header_start":
                    to_article_start.append(item)
                elif target == "drop":
                    pass

        route_items(context.get("theme_navbar_start"), "sidebar")
        route_items(context.get("theme_navbar_center"), "sidebar")
        route_items(context.get("theme_navbar_persistent"), "sidebar")
        route_items(context.get("theme_navbar_end"), "article_header_end")

        context["zcnote_sidebar_tools"] = to_sidebar
        context["zcnote_sidebar_tools_end"] = to_sidebar_end

        if to_sidebar_end:
            current_end = context.get("theme_primary_sidebar_end")
            new_primary_end = list(_ensure_list(current_end))
            wrapper_tpl = "components/sidebar-utilities-end.html"
            if wrapper_tpl not in new_primary_end:
                new_primary_end.insert(0, wrapper_tpl)

            context["theme_primary_sidebar_end"] = new_primary_end

        if to_article_end:
            original_end = _ensure_list(context.get("theme_article_header_end", []))
            new_end = list(original_end)
            for item in to_article_end:
                if item not in new_end:
                    new_end.append(item)
            context["theme_article_header_end"] = new_end

        if to_article_start:
            original_start = _ensure_list(context.get("theme_article_header_start", ["breadcrumbs.html"]))
            new_start = list(original_start)
            for item in to_article_start:
                if item not in new_start:
                    new_start.append(item)
            context["theme_article_header_start"] = new_start

        current_sidebars = context.get("sidebars")

        if current_sidebars is not False and current_sidebars != []:
            if current_sidebars is None:
                current_sidebars = ["sidebar-nav-bs.html"]

            cleaned_sidebars = [
                i for i in current_sidebars
                if i not in processed_orphans
            ]

            top_components = ["components/sidebar-brand.html"]
            if to_sidebar:
                top_components.append("components/sidebar-utilities.html")

            cleaned_sidebars = [c for c in cleaned_sidebars if c not in top_components]
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
    app.add_js_file("scripts/zcnote-sphinx-theme.js", defer="defer", priority=900)
    app.connect("html-page-context", override_pydata_sidebar_logic, priority=999)

    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
