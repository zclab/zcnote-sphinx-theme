---
html_theme.sidebar_secondary.remove: true
---

<!-- 满足 Sphinx 的强迫症：将真实的 H1 放在文档绝对顶层 -->
# zcnote-sphinx-theme

<!-- =========================================================
   Hero 区域：左文右码 Split Layout (严格的层级嵌套)
   ========================================================= -->
:::::::{container} zcnote-landing-page pb-5 pt-5

::::::{grid} 1 1 2 2
:gutter: 5
:class-container: align-items-center

:::::{grid-item}
::::{container} hero-h1
A Sphinx Theme with Sticky Sidebars.
::::

**Modify and build upon [pydata-sphinx-theme](https://pydata-sphinx-theme.readthedocs.io/) with minor style altered.**

<!-- 徽章组：通过 justify-content-start 强制靠左 -->
::::{container} landing-page-badges justify-content-start mt-3
[![PyPI](https://img.shields.io/pypi/v/zcnote-sphinx-theme?style=flat-square&logo=python&logoColor=white&color=0ea5e9)](https://pypi.org/project/zcnote-sphinx-theme/)
[![status](https://img.shields.io/pypi/status/zcnote-sphinx-theme.svg?style=flat-square&color=8b5cf6)](https://pypi.org/project/zcnote-sphinx-theme/)
[![license](https://img.shields.io/pypi/l/zcnote-sphinx-theme.svg?style=flat-square&logo=opensourceinitiative&logoColor=white&color=10b981)](https://github.com/zclab/zcnote-sphinx-theme/blob/main/LICENSE)
::::

<!-- 按钮组：通过 justify-content-start 强制靠左 -->
::::{container} landing-page-btns justify-content-start mt-4
:::{button-ref} examples/index
:class: btn-modern-primary font-weight-bold px-4 py-2

Examples ✨
:::

:::{button-link} https://github.com/zclab/zcnote-sphinx-theme
:class: btn-modern-secondary font-weight-bold px-4 py-2

<i class="fa-brands fa-github"></i> GitHub
:::
::::

:::::


:::::{grid-item}
::::{container} ghost-card code-card-split shadow-hard
**install with `pip`**
```bash
pip install zcnote-sphinx-theme
```
**configure the Sphinx docs to use the theme by editing `conf.py`**
```python
html_theme = "zcnote_sphinx_theme"
```
::::
:::::
::::::
:::::::

---

## ✨ Minor altered features

::::{grid} 1 1 3 3
:gutter: 4
:padding: 2
:class-container: pb-5 pt-3

:::{grid-item-card} <i class="fa-solid fa-thumbtack icon-modern"></i> Sticky Sidebars
:class-card: ghost-card
:class-title: font-weight-bold
Sidebars anchored to the viewport. No jumping or shifting when readers scroll to the bottom of documentation.
:::

:::{grid-item-card} <i class="fa-solid fa-paintbrush icon-modern"></i> Slightly modified styles
:class-card: ghost-card
:class-title: font-weight-bold
Symmetrical padding, minimalist borders, and color mapping for admonition.
:::

:::{grid-item-card} <i class="fa-solid fa-eye-slash icon-modern"></i> Hiddable Collapse Sidebar
:class-card: ghost-card
:class-title: font-weight-bold
Added configuration flags to hide the "Collapse Sidebar" buttons.
:::
::::

---



```{toctree}
:maxdepth: 2
:hidden:

examples/index
```


