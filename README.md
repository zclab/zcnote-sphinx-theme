# zcnote-sphinx-theme
A sphinx based on pydata-sphinx-theme


## 测试

步骤 1：安装依赖与本地主题包

```bash
# 以可编辑模式（editable）安装当前项目，同时安装开发所需的热重载工具
pip install -e .
pip install sphinx-autobuild
```

步骤 2：启动热重载服务器

进入 docs 目录，使用 sphinx-autobuild 监听文件变化并启动本地服务器：

```bash
cd docs

# 启动 autobuild。它会监听 source/ 目录和源主题目录
sphinx-autobuild . build/html --watch ../src/zcnote_sphinx_theme/theme --port 8008
```
