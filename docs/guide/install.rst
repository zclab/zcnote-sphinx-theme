================
安装指南
================

这里是安装指南页面。

系统要求
========
* Python 3.8+
* Sphinx 5.0+

安装步骤
========
你可以通过 pip 直接安装：

.. code-block:: bash

   pip install zcnote-sphinx-theme


## 开发测试

步骤 1：安装依赖与本地主题包：

.. code-block:: bash

    pip install -e .

    pip install sphinx-autobuild


步骤 2：启动热重载服务器，进入 docs 目录，使用 sphinx-autobuild 监听文件变化并启动本地服务器：

.. code-block:: bash

    cd docs

    sphinx-autobuild . _build/html --watch ../src/zcnote_sphinx_theme/theme --port 8008

