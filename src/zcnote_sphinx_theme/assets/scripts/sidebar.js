/**
 * ZC-Note Sphinx Theme Sidebar Module
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
            const tip = window.bootstrap.Tooltip.getOrCreateInstance(collapseBtn, {
                placement: 'right',
                title: targetText
            });

            if (tip) {
                if (tip._config) tip._config.title = targetText;
                if (tip.config) tip.config.title = targetText;

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

    syncState();
    initSidebarScrollManager();
}


function initSidebarScrollManager() {
    const scrollContainer = document.querySelector('.sidebar-primary-items__start');
    if (!scrollContainer) return;

    const STORAGE_KEY = 'zcnote_sidebar_scroll_state';
    let debounceTimer;

    const saveScroll = () => {
        try {
            if (scrollContainer.clientHeight > 0) {
                window.sessionStorage.setItem(STORAGE_KEY, Math.round(scrollContainer.scrollTop));
            }
        } catch (e) {}
    };

    scrollContainer.addEventListener('scroll', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(saveScroll, 150);
    }, { passive: true });

    window.addEventListener('pagehide', () => {
        clearTimeout(debounceTimer);
        saveScroll();
    });

    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            try {
                const saved = window.sessionStorage.getItem(STORAGE_KEY);
                if (saved !== null && scrollContainer.clientHeight > 0) {
                    const originalBehavior = scrollContainer.style.getPropertyValue('scroll-behavior');
                    scrollContainer.style.setProperty('scroll-behavior', 'auto', 'important');

                    scrollContainer.scrollTop = parseInt(saved, 10);

                    if (originalBehavior) {
                        scrollContainer.style.setProperty('scroll-behavior', originalBehavior);
                    } else {
                        scrollContainer.style.removeProperty('scroll-behavior');
                    }
                }
            } catch (err) {}
        }
    });
}
