import os
import sys
import zcnote_sphinx_theme

sys.path.insert(0, os.path.abspath('../src'))

project = 'ZCNote Theme Docs'
copyright = '2026, ZCNote'
author = 'ZCNote'

extensions = [
    "sphinx.ext.todo",
    "sphinx.ext.viewcode",
    "sphinx_design",
    "sphinx_copybutton",
    "myst_parser",
    "sphinx_togglebutton",
    "sphinxcontrib.mermaid",
    "ablog",
]

# This allows us to use ::: to denote directives, useful for admonitions
myst_enable_extensions = ["colon_fence", "substitution"]
myst_heading_anchors = 2

templates_path = ["_templates"]
exclude_patterns = [
    "_build",
    "Thumbs.db",
    ".DS_Store",
    "**.ipynb_checkpoints",
]

# -- Ablog options -----------------------------------------------------------

blog_path = "examples/blog/index"
blog_authors = {
    "pydata": ("PyData", "https://pydata.org"),
    "jupyter": ("Jupyter", "https://jupyter.org"),
}


html_theme = 'zcnote_sphinx_theme'
html_logo = "_static/logo.png"
html_favicon = "_static/logo.png"
html_sourcelink_suffix = ""
html_last_updated_fmt = ""  # to reveal the build date in the pages meta

json_url = "https://zcnote-sphinx-theme.readthedocs.io/en/latest/_static/switcher.json"
version_match = os.environ.get("READTHEDOCS_VERSION")
release = zcnote_sphinx_theme.__version__
if not version_match or version_match.isdigit() or version_match == "latest":
    if "dev" in release or "rc" in release:
        version_match = "dev"
        json_url = "_static/switcher.json"
    else:
        version_match = f"v{release}"
elif version_match == "stable":
    version_match = f"v{release}"

html_theme_options = {
    "external_links": [
        {
            "url": "https://pydata.org",
            "name": "PyData Website",
        },
        {
            "url": "https://numfocus.org/",
            "name": "NumFocus",
        },
        {
            "url": "https://numfocus.org/donate",
            "name": "Donate to NumFocus",
        },
    ],
    "header_links_before_dropdown": 3,
    "enable_collapse_sidebar": True,
    "navigation_depth": 5,
    "show_toc_level": 2,
    "search_as_you_type": True,
    "use_edit_page_button": True,
    "icon_links": [
        {
            "name": "GitHub",
            "url": "https://github.com/zclab/zcnote-sphinx-theme",
            "icon": "fa-brands fa-github",
        },
        {
            "name": "PyPI",
            "url": "https://pypi.org/project/zcnote-sphinx-theme/",
            "icon": "https://pypi.org/static/images/logo-small.8998e9d1.svg",
            "type": "url",
        },
    ],
    "logo": {
        "text": "ZCNote Theme",
        "image_dark": "_static/logo.png",
    },
    "secondary_sidebar_items": {
        "**/*": ["page-toc", "edit-this-page", "sourcelink"],
        "examples/no-sidebar": [],
    },
    "primary_sidebar_end":[],
    "hide_header": True,
    # "article_footer_items": ["copyright", "sphinx-version"],
    "content_footer_items": ["copyright", "sphinx-version", "zcnote-theme-version"],
    "footer_start": [],
    "footer_end": [],
    # "nav_style": "sidebar",
    # "home_page_in_toc": True,
    # "sticky_banners": True,
    # "announcement": "https://raw.githubusercontent.com/pydata/pydata-sphinx-theme/main/docs/_templates/custom-template.html",
    "navbar_end": ["version-switcher", "theme-switcher", "navbar-icon-links"],
    "switcher": {
        "json_url": json_url,
        "version_match": version_match,
    },
    "check_switcher": False
}

html_context = {
    "github_user": "zclab",
    "github_repo": "zcnote-sphinx-theme",
    "github_version": "main",
    "doc_path": "docs",
}

html_sidebars = {
    "examples/no-sidebar": [],  # Test what page looks like with no sidebar items
    "examples/persistent-search-field": ["search-field"],
}

html_sidebars = {
    "examples/no-sidebar": [],  # Test what page looks like with no sidebar items
    "examples/persistent-search-field": ["search-field"],
    # Blog sidebars
    # ref: https://ablog.readthedocs.io/manual/ablog-configuration-options/#blog-sidebars
    "examples/blog/*": [
        "ablog/postcard.html",
        "ablog/recentposts.html",
        "ablog/tagcloud.html",
        "ablog/categories.html",
        "ablog/authors.html",
        "ablog/languages.html",
        "ablog/locations.html",
        "ablog/archives.html",
    ],
}


html_static_path = ['_static']
html_title = "ZCNote 主题文档"
html_short_title = "ZCNote"
html_css_files = [
    'css/landing-page.css',
]
todo_include_todos = True
