import os
import sys

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
    # "nav_style": "sidebar",
    # "home_page_in_toc": True,
    # "sticky_banners": True,
    # "announcement": "https://raw.githubusercontent.com/pydata/pydata-sphinx-theme/main/docs/_templates/custom-template.html",
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
