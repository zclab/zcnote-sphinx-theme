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
]

# This allows us to use ::: to denote directives, useful for admonitions
myst_enable_extensions = ["colon_fence", "substitution"]
myst_heading_anchors = 2

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store", "**.ipynb_checkpoints"]
html_theme = 'zcnote_sphinx_theme'
html_logo = "_static/logo.png"
html_favicon = "_static/logo.png"
html_sourcelink_suffix = ""
html_last_updated_fmt = ""  # to reveal the build date in the pages meta


html_theme_options = {
    "enable_collapse_sidebar": True,
    "navigation_depth": 4,
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
    # "announcement": "https://raw.githubusercontent.com/pydata/pydata-sphinx-theme/main/docs/_templates/custom-template.html",
}

html_context = {
    "github_user": "zclab",
    "github_repo": "zcnote-sphinx-theme",
    "github_version": "main",
    "doc_path": "docs",
}


html_static_path = ['_static']
html_title = "ZCNote 主题文档"
html_short_title = "ZCNote"
todo_include_todos = True
