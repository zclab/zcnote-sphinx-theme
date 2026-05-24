---
html_theme.sidebar_secondary.remove: true
---

<!-- 满足 Sphinx 的强迫症：将真实的 H1 放在文档绝对顶层，后续由 CSS 隐藏 -->
# zcnote-sphinx-theme

<!-- =========================================================
   Hero 区域：全局居中 + 悬浮控制台 (Centered Hero Layout)
   ========================================================= -->
:::::::{container} zcnote-landing-page text-center pb-5 pt-5

<!-- 1. 居中主标题 (项目名) -->
::::{container} hero-h1
zcnote-sphinx-theme
::::

::::{container} hero-slogan
A thin customized sphinx theme for zcnote.
::::

::::{container} hero-description
A lightweight wrapper theme based on the [pydata-sphinx-theme](https://pydata-sphinx-theme.readthedocs.io/).
::::

::::{container} landing-page-badges justify-content-center mt-3
[![PyPI](https://img.shields.io/pypi/v/zcnote-sphinx-theme?style=flat-square&logo=python&logoColor=white&color=0ea5e9)](https://pypi.org/project/zcnote-sphinx-theme/)
[![status](https://img.shields.io/pypi/status/zcnote-sphinx-theme.svg?style=flat-square&color=8b5cf6)](https://pypi.org/project/zcnote-sphinx-theme/)
[![license](https://img.shields.io/pypi/l/zcnote-sphinx-theme.svg?style=flat-square&logo=opensourceinitiative&logoColor=white&color=10b981)](https://github.com/zclab/zcnote-sphinx-theme/blob/main/LICENSE)
::::

::::{container} landing-page-btns justify-content-center mt-4
:::{button-ref} examples/index
:class: btn-modern-primary font-weight-bold px-4 py-2

Examples ✨
:::

:::{button-link} https://github.com/zclab/zcnote-sphinx-theme
:class: btn-modern-secondary font-weight-bold px-4 py-2

<i class="fa-brands fa-github"></i> GitHub
:::
::::

::::::{container} mock-window center-terminal mt-5
:::::{container} mock-window-header
<span class="mock-dot red"></span>
<span class="mock-dot yellow"></span>
<span class="mock-dot green"></span>
<span class="mock-title">bash & conf.py</span>
:::::
:::::{container} mock-window-body
::::{grid} 1 1 2 2
:gutter: 3

:::{grid-item}
**1. install with `pip`**

```bash
pip install zcnote-sphinx-theme
```
:::

:::{grid-item}
**2. configure `conf.py`**

```python
html_theme = "zcnote_sphinx_theme"
```
:::
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

:::{grid-item-card}  Sticky Sidebars
:class-card: ghost-card
:class-title: font-weight-bold
Sidebars anchored to the viewport. No jumping or shifting when readers scroll to the bottom of documentation.
:::

:::{grid-item-card}  Slightly modified admonitions styles
:link: examples-admonitions
:link-type: ref
:class-card: ghost-card
:class-title: font-weight-bold
Symmetrical padding, minimalist borders, and color mapping for admonition.
:::

:::{grid-item-card}  Collapse Sidebar
:class-card: ghost-card
:class-title: font-weight-bold
Added configuration flags to hide the "Collapse Sidebar" buttons. Move collapse sidebar button to the border of primary sidebar.
:::
::::

```{toctree}
:maxdepth: 2
:hidden:
:caption: User Guide

guide/index
```

```{toctree}
:maxdepth: 2
:hidden:
:caption: Example pages

examples/index
```

```{toctree}
:hidden:

Changelog <https://github.com/pydata/pydata-sphinx-theme/releases>
```

