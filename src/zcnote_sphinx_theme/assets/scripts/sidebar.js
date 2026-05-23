/**
 * 侧边栏折叠逻辑与防闪烁处理 (JIT 事件拦截终极版)
 */
export function initSidebar() {
    const sidebar = document.querySelector(".bd-sidebar-primary");
    const collapseBtnWrapper = document.querySelector(".sidebar-primary-item.pst-sidebar-collapse");
    const collapseBtn = document.querySelector("#pst-collapse-sidebar-button");

    if (sidebar && collapseBtnWrapper) {
        // 1. 抢在浏览器渲染前，瞬间移出侧边栏，插入到接缝处 (防御刷新闪烁)
        sidebar.parentNode.insertBefore(collapseBtnWrapper, sidebar.nextSibling);

        if (collapseBtn) {
            // ★ 提取 Jinja 已经渲染好的多语言文本
            const collapseLabelSpan = collapseBtn.querySelector('.pst-collapse-sidebar-label');
            const expandLabelSpan = collapseBtn.querySelector('.pst-expand-sidebar-label');

            const textCollapse = collapseLabelSpan ? collapseLabelSpan.textContent.trim() : 'Collapse Sidebar';
            const textExpand = expandLabelSpan ? expandLabelSpan.textContent.trim() : 'Expand Sidebar';

            // 补全 Bootstrap Tooltip 的触发器条件
            if (!collapseBtn.hasAttribute("data-bs-toggle")) {
                collapseBtn.setAttribute("data-bs-toggle", "tooltip");
                collapseBtn.setAttribute("data-bs-placement", "right");
            }

            // =========================================
            // 核心功能：状态同步与 Tooltip 劫持
            // =========================================
            const syncState = () => {
                const isExpanded = collapseBtn.getAttribute("aria-expanded") !== "false";
                const targetText = isExpanded ? textCollapse : textExpand;

                // --- A. 滚动条控制 ---
                if (!isExpanded) {
                    sidebar.classList.add("zcnote-hide-scrollbar");
                } else {
                    sidebar.classList.remove("zcnote-hide-scrollbar");
                }

                // --- B. 修复无障碍属性 ---
                collapseBtn.setAttribute("aria-label", targetText);
                collapseBtn.setAttribute("data-bs-original-title", targetText);
                collapseBtn.removeAttribute("title"); // 防止双重重叠

                // --- C. 强制篡改 Bootstrap 内部缓存配置 ---
                if (window.bootstrap && window.bootstrap.Tooltip) {
                    const tip = window.bootstrap.Tooltip.getInstance(collapseBtn);
                    if (tip) {
                        /*
                         * =========================================================================
                         * [风险提示 / TECHNICAL DEBT]
                         * -------------------------------------------------------------------------
                         * 背景：pydata-sphinx-theme 在页面加载时，会硬编码传入错误的 Tooltip 文字并
                         *       锁死在 Bootstrap 实例内存中，导致仅修改 HTML 属性无效。
                         * 方案：此处直接修改了 Bootstrap 5 的私有属性 `_config`。这是为了在不销毁
                         *       PyData 原生实例（避免丢失官方绑定的事件回调）的前提下，实现的最优解。
                         * 风险：未来若上游大幅升级依赖（如 Bootstrap 6），底层属性 `_config` 可能被重命名。
                         * 维护关注点：如果日后发现悬停按钮时，提示文字固定为错的 "Expand Sidebar"，
                         *           请优先 `console.log(tip)` 检查新的内部配置对象叫什么名字，并在此处更新。
                         * =========================================================================
                         */
                        if (tip._config) {
                            tip._config.title = targetText;
                        }

                        // 如果当前气泡正处于显示状态（用户点击后鼠标未移开），立刻刷新屏幕内容
                        if (typeof tip.getTipElement === 'function') {
                            const tipElem = tip.getTipElement();
                            if (tipElem) {
                                // 优先使用 BS5.2+ 官方更新 API，降级则直接操作 DOM
                                if (typeof tip.setContent === 'function') {
                                    tip.setContent({ '.tooltip-inner': targetText });
                                } else {
                                    const inner = tipElem.querySelector('.tooltip-inner');
                                    if (inner) inner.textContent = targetText;
                                }
                            }
                        }
                    }
                }
            };

            // 监听点击事件引起的状态变化
            const observer = new MutationObserver(syncState);
            observer.observe(collapseBtn, {
                attributes: true,
                attributeFilter: ["aria-expanded"]
            });

            // ★ 终极防御：JIT (Just-In-Time) 拦截
            // 无论 PyData 的脚本在初始化时做了什么骚操作，只要鼠标悬停，气泡即将弹出的瞬间，
            // Bootstrap 就会抛出 show.bs.tooltip，我们在此刻强制把正确的文本注入配置中！
            collapseBtn.addEventListener('show.bs.tooltip', syncState);

            // 初始化执行一次，确保 HTML 无障碍属性就绪
            syncState();
        }
    }
}
