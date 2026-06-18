/**
 * ZC-Note Sphinx Theme
 * 侧边栏折叠逻辑与防闪烁处理
 */
export function initSidebar() {
    const sidebar = document.querySelector(".bd-sidebar-primary");
    const collapseBtnWrapper = document.querySelector(".sidebar-primary-item.pst-sidebar-collapse");
    const collapseBtn = document.querySelector("#pst-collapse-sidebar-button");

    if (!sidebar || !collapseBtnWrapper || !collapseBtn) return;

    if (collapseBtn.dataset.zcnoteSidebarInit) return;
    collapseBtn.dataset.zcnoteSidebarInit = "true";

    sidebar.parentNode.insertBefore(collapseBtnWrapper, sidebar.nextSibling);

    const textCollapse = collapseBtn.querySelector('.pst-collapse-sidebar-label')?.textContent.trim() || 'Collapse Sidebar';
    const textExpand = collapseBtn.querySelector('.pst-expand-sidebar-label')?.textContent.trim() || 'Expand Sidebar';

    collapseBtn.removeAttribute("title");
    if (!collapseBtn.hasAttribute("data-bs-toggle")) {
        collapseBtn.setAttribute("data-bs-toggle", "tooltip");
        collapseBtn.setAttribute("data-bs-placement", "right");
    }

    // 全局状态管理
    let lastLayoutState = null;
    let isSyncing = false;

    const forceUpdateTooltip = (targetText) => {
        collapseBtn.setAttribute("aria-label", targetText);
        collapseBtn.setAttribute("data-bs-title", targetText);
        collapseBtn.setAttribute("data-bs-original-title", targetText);

        if (collapseBtn.hasAttribute("title")) {
            collapseBtn.removeAttribute("title");
        }

        if (window.bootstrap && window.bootstrap.Tooltip) {
            const tip = window.bootstrap.Tooltip.getInstance(collapseBtn);
            if (tip) {
                // 1. 覆盖只读配置
                if (tip._config) tip._config.title = targetText;
                if (tip.config) tip.config.title = targetText;

                // 2. 强刷底层 DOM (移除 show 判定，即便是游离内存中的 DOM 也要刷)
                try {
                    const tipElem = typeof tip.getTipElement === 'function' ? tip.getTipElement() : tip.tip;
                    if (tipElem) {
                        const inner = tipElem.querySelector('.tooltip-inner');
                        if (inner) inner.textContent = targetText;
                    }
                } catch (e) {
                }
            }
        }
    };

    const syncState = () => {
        if (isSyncing) return;
        isSyncing = true;

        try {
            const isExpanded = collapseBtn.getAttribute("aria-expanded") !== "false";

            forceUpdateTooltip(isExpanded ? textCollapse : textExpand);

            if (lastLayoutState !== isExpanded) {
                sidebar.classList.toggle("zcnote-hide-scrollbar", !isExpanded);
                lastLayoutState = isExpanded;
            }
        } finally {
            isSyncing = false;
        }
    };

    const observer = new MutationObserver((mutations) => {
        let needsSync = false;
        for (const m of mutations) {
            if (m.attributeName === "aria-expanded") {
                needsSync = true;
            } else if (m.attributeName === "title" && collapseBtn.hasAttribute("title")) {
                needsSync = true;
            }
        }
        if (needsSync) syncState();
    });

    observer.observe(collapseBtn, {
        attributes: true,
        attributeFilter: ["aria-expanded", "title"]
    });

    collapseBtn.addEventListener('show.bs.tooltip', syncState);

    // 初始执行
    syncState();
}
