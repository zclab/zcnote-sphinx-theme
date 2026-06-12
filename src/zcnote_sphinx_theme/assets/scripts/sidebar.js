/**
 * 侧边栏折叠逻辑与防闪烁处理 (JIT 事件拦截终极版)
 */
export function initSidebar() {
    const sidebar = document.querySelector(".bd-sidebar-primary");
    const collapseBtnWrapper = document.querySelector(".sidebar-primary-item.pst-sidebar-collapse");
    const collapseBtn = document.querySelector("#pst-collapse-sidebar-button");

    if (!sidebar || !collapseBtnWrapper || !collapseBtn) return;

    sidebar.parentNode.insertBefore(collapseBtnWrapper, sidebar.nextSibling);

    const textCollapse = collapseBtn.querySelector('.pst-collapse-sidebar-label')?.textContent.trim() || 'Collapse Sidebar';
    const textExpand = collapseBtn.querySelector('.pst-expand-sidebar-label')?.textContent.trim() || 'Expand Sidebar';

    if (!collapseBtn.hasAttribute("data-bs-toggle")) {
        collapseBtn.setAttribute("data-bs-toggle", "tooltip");
        collapseBtn.setAttribute("data-bs-placement", "right");
    }

    let lastState = null;

    // =========================================
    // 核心功能：状态同步与 Tooltip 劫持
    // =========================================
    const syncState = () => {
        const isExpanded = collapseBtn.getAttribute("aria-expanded") !== "false";

        if (lastState === isExpanded) return;
        lastState = isExpanded;

        const targetText = isExpanded ? textCollapse : textExpand;

        sidebar.classList.toggle("zcnote-hide-scrollbar", !isExpanded);

        collapseBtn.setAttribute("aria-label", targetText);
        collapseBtn.setAttribute("data-bs-title", targetText);
        collapseBtn.setAttribute("data-bs-original-title", targetText);
        collapseBtn.removeAttribute("title");

        if (window.bootstrap && window.bootstrap.Tooltip) {
            const tip = window.bootstrap.Tooltip.getInstance(collapseBtn);
            if (tip) {
                if (tip._config) tip._config.title = targetText;
                if (tip.config) tip.config.title = targetText;

                if (typeof tip.getTipElement === 'function') {
                    const tipElem = tip.getTipElement();
                    if (tipElem) {
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

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.attributeName === "aria-expanded") {
                syncState();
                break;
            }
        }
    });

    observer.observe(collapseBtn, {
        attributes: true,
        attributeFilter: ["aria-expanded"]
    });

    collapseBtn.addEventListener('show.bs.tooltip', syncState);

    syncState();
}
