/**
 * ZC-Note Sphinx Theme Sidebar Module (Ultra Bulletproof Edition)
 */

let activeScrollContainer = null;
let debounceTimer = null;
let cachedStorageKey = null;


function getStorageKey() {
    if (cachedStorageKey) return cachedStorageKey;
    try {
        const rootDir = document.documentElement.getAttribute('data-content_root') || './';
        const rootPath = new URL(rootDir, window.location.href).pathname;
        cachedStorageKey = `zcnote_sidebar_scroll_${rootPath}`;
    } catch (e) {
        cachedStorageKey = 'zcnote_sidebar_scroll_fallback';
    }
    return cachedStorageKey;
}


const saveScroll = () => {
    try {
        if (activeScrollContainer && activeScrollContainer.clientHeight > 0) {
            window.sessionStorage.setItem(getStorageKey(), Math.round(activeScrollContainer.scrollTop));
        }
    } catch (e) {}
};


const handleScroll = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(saveScroll, 150);
};

const handlePageHide = () => {
    clearTimeout(debounceTimer);
    saveScroll();
};

const handlePageShow = (e) => {
    if (e.persisted && activeScrollContainer) {
        try {
            const saved = window.sessionStorage.getItem(getStorageKey());
            if (saved !== null && activeScrollContainer.clientHeight > 0) {
                const originalBehavior = activeScrollContainer.style.getPropertyValue('scroll-behavior');
                activeScrollContainer.style.setProperty('scroll-behavior', 'auto', 'important');
                activeScrollContainer.scrollTop = parseInt(saved, 10);
                if (originalBehavior) {
                    activeScrollContainer.style.setProperty('scroll-behavior', originalBehavior);
                } else {
                    activeScrollContainer.style.removeProperty('scroll-behavior');
                }
            }
        } catch (err) {}
    }
};


export function initSidebar() {
    if (window._zcnoteSidebarCleanup) {
        window._zcnoteSidebarCleanup();
    }

    try {
        initSidebarScrollManager();
    } catch (e) {
        console.warn("[zcnote-theme] Failed to initialize sidebar scroll manager:", e);
    }

    try {
        initSidebarCollapse();
    } catch (e) {
        console.warn("[zcnote-theme] Failed to initialize sidebar collapse:", e);
    }
}


export function initSidebarScrollManager() {
    const scrollContainer = document.querySelector('.sidebar-primary-items__start');
    if (!scrollContainer) return;

    activeScrollContainer = scrollContainer;

    const saved = window.sessionStorage.getItem(getStorageKey());
    if (saved !== null) {
        const targetScroll = parseInt(saved, 10);
        if (!isNaN(targetScroll) && targetScroll > 0) {
            scrollContainer.scrollTop = Math.round(targetScroll);
        }
    }

    const isRestored = scrollContainer.hasAttribute('data-zcnote-scroll-restored');

    if (!isRestored) {
        const currents = scrollContainer.querySelectorAll('.current');
        const active = currents.length > 0 ? currents[currents.length - 1] : null;

        if (active && active.offsetHeight > 0) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const cRect = scrollContainer.getBoundingClientRect();
                    const aRect = active.getBoundingClientRect();

                    if (cRect.height > 100) {
                        const targetScroll = aRect.top - cRect.top + scrollContainer.scrollTop - (cRect.height / 3);
                        if (targetScroll > 0) {
                            scrollContainer.scrollTop = Math.round(targetScroll);
                        }
                    }
                });
            });
        }
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    window._zcnoteSidebarCleanup = () => {
        if (activeScrollContainer) {
            activeScrollContainer.removeEventListener('scroll', handleScroll);
        }
        window.removeEventListener('pagehide', handlePageHide);
        window.removeEventListener('pageshow', handlePageShow);
        activeScrollContainer = null;
        window._zcnoteSidebarCleanup = null;
    };
}


export function initSidebarCollapse() {
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
                } catch (e) {}
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
}
