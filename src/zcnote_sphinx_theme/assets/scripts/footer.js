/**
 * ZC-Note Sphinx Theme - Footer (Bulletproof Industrial Edition)
 * Features: Strict FastDOM, Async Lock Delegation, GC Optimized, Subpixel Safe, DOM-Agnostic.
 */
export function initFooter() {
    if (window._zcnoteFooterCleanup) {
        window._zcnoteFooterCleanup();
    }

    const els = { root: document.documentElement };

    const getEl = (selector, cacheKey) => {
        if (!els[cacheKey] || !els[cacheKey].isConnected) {
            els[cacheKey] = document.querySelector(selector);
        }
        return els[cacheKey];
    };

    if (!getEl(".bd-main", 'bdMain')) return;

    const state = {
        gHeight: 0, cHeight: 0, oPrimary: 0, oSecondary: 0, hBottom: 0,
        vw: window.innerWidth, vh: window.innerHeight
    };

    const metrics = {
        vw: 0, vh: 0, hBottom: 0, gHeight: 0, cHeight: 0,
        hideContent: false, contentIsHiddenInDOM: false,
        oGlobal: 0, oContent: 0
    };

    let isUpdating = false;
    let resizeObserver = null;
    let isFirstMount = true;

    // =========================================
    // Phase 1: STRICT READ
    // =========================================
    function measureStaticDimensions() {
        metrics.vw = window.innerWidth;
        metrics.vh = window.innerHeight;
        metrics.hBottom = 0; metrics.gHeight = 0; metrics.cHeight = 0;
        metrics.hideContent = false; metrics.contentIsHiddenInDOM = false;

        const stickyHeader = getEl(".pst-sticky-header", 'stickyHeader');
        const bdHeader = getEl("#pst-header", 'bdHeader') || getEl(".bd-header", 'fallbackHeader');
        const globalFooter = getEl(".bd-footer", 'globalFooter');

        const mainContentFooter = getEl(".bd-main > .bd-footer-content", 'mainContentFooter');

        if (stickyHeader) {
            const style = window.getComputedStyle(stickyHeader);
            if (style.position === 'sticky' || style.position === 'fixed') {
                metrics.hBottom = Math.max(metrics.hBottom, stickyHeader.offsetHeight || 0);
            }
        }
        if (bdHeader) {
            const style = window.getComputedStyle(bdHeader);
            if (style.position === 'sticky' || style.position === 'fixed') {
                metrics.hBottom = Math.max(metrics.hBottom, bdHeader.offsetHeight || 0);
            }
        }
        metrics.hBottom = Math.ceil(Math.max(0, metrics.hBottom));

        if (globalFooter) {
            metrics.gHeight = Math.ceil(globalFooter.getBoundingClientRect().height);
        }

        if (mainContentFooter) {
            metrics.contentIsHiddenInDOM = window.getComputedStyle(mainContentFooter).display === 'none';

            // 只要里面没有实际的子标签且没有非空字符，即视为 Empty State
            const hasElements = mainContentFooter.childElementCount > 0;
            const hasText = mainContentFooter.textContent.trim() !== '';

            if (!hasElements && !hasText) {
                metrics.hideContent = true;
            } else {
                metrics.cHeight = Math.ceil(mainContentFooter.getBoundingClientRect().height);
            }
        }
    }

    function measureScrollOverlap() {
        metrics.oGlobal = 0;
        metrics.oContent = 0;

        if (state.vw < 960) return;

        let fakeScroll = 0;
        const docHeight = els.root.scrollHeight;
        const globalFooter = getEl(".bd-footer", 'globalFooter');
        const mainContentFooter = getEl(".bd-main > .bd-footer-content", 'mainContentFooter');

        if (globalFooter && docHeight > metrics.vh + 5) {
            const bottom = globalFooter.getBoundingClientRect().bottom;
            if (bottom < metrics.vh) fakeScroll = metrics.vh - bottom;
        }

        if (globalFooter && state.gHeight > 0) {
            const top = globalFooter.getBoundingClientRect().top;
            metrics.oGlobal = Math.max(0, metrics.vh - top - fakeScroll);
        }

        if (mainContentFooter && state.cHeight > 0) {
            const top = mainContentFooter.getBoundingClientRect().top;
            metrics.oContent = Math.max(0, metrics.vh - top - fakeScroll);
        }
    }

    // =========================================
    // Phase 2: STRICT WRITE
    // =========================================
    function writeStaticDimensionsDOM() {
        let layoutMutated = false;

        if (state.hBottom !== metrics.hBottom) {
            els.root.style.setProperty('--zcnote-header-height', `${metrics.hBottom}px`);
            state.hBottom = metrics.hBottom;
            layoutMutated = true;
        }

        const mainContentFooter = getEl(".bd-main > .bd-footer-content", 'mainContentFooter');
        if (mainContentFooter) {
            if (metrics.hideContent && !metrics.contentIsHiddenInDOM) {
                mainContentFooter.style.setProperty('display', 'none', 'important');
                layoutMutated = true;
            } else if (!metrics.hideContent && metrics.contentIsHiddenInDOM && mainContentFooter.style.display === 'none') {
                mainContentFooter.style.removeProperty('display');
                layoutMutated = true;
            }
        }

        if (state.gHeight !== metrics.gHeight) {
            els.root.style.setProperty('--zcnote-g-h', `${metrics.gHeight}px`);
            state.gHeight = metrics.gHeight;
            layoutMutated = true;
        }

        if (state.cHeight !== metrics.cHeight) {
            els.root.style.setProperty('--zcnote-a-h', `${metrics.cHeight}px`);
            state.cHeight = metrics.cHeight;
            layoutMutated = true;
        }

        const bdMain = getEl(".bd-main", 'bdMain');
        if (bdMain) {
            const expectedPadding = state.gHeight > 0 ? `${state.gHeight}px` : '0px';
            if (bdMain.style.paddingBottom !== expectedPadding) {
                bdMain.style.setProperty('padding-bottom', expectedPadding, 'important');
                layoutMutated = true;
            }
        }

        return layoutMutated;
    }

    function applyScrollOverlap() {
        const oPrimary = Math.ceil(metrics.oGlobal);
        const oSecondary = Math.ceil(Math.max(metrics.oGlobal, metrics.oContent));

        if (state.oPrimary !== oPrimary) {
            els.root.style.setProperty('--zcnote-overlap-primary', `${oPrimary}px`);
            state.oPrimary = oPrimary;
        }
        if (state.oSecondary !== oSecondary) {
            els.root.style.setProperty('--zcnote-overlap-secondary', `${oSecondary}px`);
            state.oSecondary = oSecondary;
        }
    }

    // =========================================
    // 调度中心：RAF 流水线与严格锁控制
    // =========================================
    function performUpdate() {
        let delegatedUnlock = false;

        try {
            measureStaticDimensions();

            const isMobileUrlBarShift = metrics.vw === state.vw &&
                                        Math.abs(metrics.vh - state.vh) > 0 &&
                                        Math.abs(metrics.vh - state.vh) < 150;
            state.vw = metrics.vw;
            state.vh = metrics.vh;

            const layoutMutated = writeStaticDimensionsDOM();

            if (layoutMutated && !isFirstMount) {
                delegatedUnlock = true;
                window.requestAnimationFrame(() => {
                    try {
                        measureScrollOverlap();
                        applyScrollOverlap();
                    } finally {
                        isUpdating = false;
                    }
                });
                return;
            }

            if (!isMobileUrlBarShift || isFirstMount) {
                measureScrollOverlap();
                applyScrollOverlap();
            }

            if (isFirstMount) {
                isFirstMount = false;
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        els.root.setAttribute('data-zcnote-layout-ready', 'true');
                    });
                });
            }

        } catch (error) {
            console.warn("[zcnote-theme] Footer calculation gracefully skipped:", error);
        } finally {
            if (!delegatedUnlock) {
                isUpdating = false;
            }
        }
    }

    function scheduleUpdate() {
        if (!isUpdating) {
            isUpdating = true;
            window.requestAnimationFrame(performUpdate);
        }
    }

    // =========================================
    // 绑定与全量销毁
    // =========================================
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(scheduleUpdate);
        const gb = getEl(".bd-footer", 'globalFooter');
        const mcf = getEl(".bd-main > .bd-footer-content", 'mainContentFooter');
        const sh = getEl(".pst-sticky-header", 'stickyHeader');
        const bc = getEl(".bd-content", 'bdContent');
        if (gb) resizeObserver.observe(gb);
        if (mcf) resizeObserver.observe(mcf);
        if (sh) resizeObserver.observe(sh);
        if (bc) resizeObserver.observe(bc);
    }

    window._zcnoteFooterCleanup = () => {
        window.removeEventListener("scroll", scheduleUpdate);
        window.removeEventListener("resize", scheduleUpdate);
        if (resizeObserver) resizeObserver.disconnect();
        window._zcnoteFooterInitialized = false;
        window._zcnoteFooterCleanup = null;
    };

    window.addEventListener("beforeunload", window._zcnoteFooterCleanup);

    // 立即执行首次计算
    performUpdate();
}
