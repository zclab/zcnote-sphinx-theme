/**
 * ZC-Note Sphinx Theme
 * (Zero Layout Thrashing & Sub-pixel Immune Version - Final)
 */
export function initFooter() {
    const globalFooter = document.querySelector(".bd-footer");
    const articleFooter = document.querySelector(".bd-main > .bd-footer-content");
    const stickyHeader = document.querySelector(".pst-sticky-header");
    const bdHeader = document.querySelector("#pst-header") || document.querySelector(".bd-header");
    const bdMain = document.querySelector(".bd-main");

    const root = document.documentElement;

    const state = {
        gHeight: 0,
        aHeight: 0,
        oPrimary: 0,
        oSecondary: 0,
        hBottom: 0,
        vh: window.innerHeight,
        vw: window.innerWidth
    };

    let ticking = false;

    // ==========================================
    // 阶段 A: 静态维度测量
    // ==========================================
    function updateStaticDimensions() {
        state.vh = window.innerHeight;
        state.vw = window.innerWidth;
        root.style.setProperty('--zcnote-vh', `${state.vh}px`);

        let hBottom = 0;
        if (stickyHeader) {
            const style = window.getComputedStyle(stickyHeader);
            if (style.position === 'sticky' || style.position === 'fixed') {
                hBottom = Math.max(hBottom, stickyHeader.offsetHeight || 0);
            }
        }
        if (bdHeader) {
            const style = window.getComputedStyle(bdHeader);
            if (style.position === 'sticky' || style.position === 'fixed') {
                hBottom = Math.max(hBottom, bdHeader.offsetHeight || 0);
            }
        }
        hBottom = Math.round(Math.max(0, hBottom));

        if (Math.abs(state.hBottom - hBottom) > 1) {
            root.style.setProperty('--zcnote-header-height', `${hBottom}px`);
            state.hBottom = hBottom;
        }

        const gHeight = globalFooter ? Math.round(globalFooter.offsetHeight) : 0;
        let aHeight = 0;

        if (articleFooter) {
            const hasItems = articleFooter.querySelectorAll('.footer-article-item').length > 0;
            const hasText = articleFooter.textContent.trim() !== '';

            if (!hasItems && !hasText) {
                articleFooter.style.setProperty('display', 'none', 'important');
            } else {
                articleFooter.style.removeProperty('display');
                aHeight = Math.round(articleFooter.offsetHeight);
            }
        }

        if (Math.abs(state.gHeight - gHeight) > 1) {
            root.style.setProperty('--zcnote-g-h', `${gHeight}px`);
            state.gHeight = gHeight;
        }

        if (Math.abs(state.aHeight - aHeight) > 1) {
            root.style.setProperty('--zcnote-a-h', `${aHeight}px`);
            state.aHeight = aHeight;
        }

        if (bdMain) {
            const expectedPadding = state.gHeight > 0 ? `${state.gHeight}px` : '0px';
            if (bdMain.style.paddingBottom !== expectedPadding) {
                bdMain.style.setProperty('padding-bottom', expectedPadding, 'important');
            }
        }

        updateScrollOverlap();
    }

    // ==========================================
    // 阶段 B: 滚动重叠度计算
    // ==========================================
    function updateScrollOverlap() {
        if (state.vw < 960) {
            ticking = false;
            return;
        }

        let oGlobal = 0, oArticle = 0;
        let fakeScroll = 0;

        const docHeight = document.documentElement.scrollHeight;
        if (globalFooter && docHeight > state.vh + 5) {
            const bottom = globalFooter.getBoundingClientRect().bottom;
            if (bottom < state.vh) {
                fakeScroll = Math.max(0, state.vh - bottom);
            }
        }

        if (globalFooter && state.gHeight > 0) {
            const top = globalFooter.getBoundingClientRect().top;
            if (top < state.vh) {
                oGlobal = state.vh - Math.max(0, top) - fakeScroll;
            }
        }

        if (articleFooter && state.aHeight > 0) {
            const top = articleFooter.getBoundingClientRect().top;
            if (top < state.vh) {
                oArticle = state.vh - Math.max(0, top) - fakeScroll;
            }
        }

        oGlobal = Math.max(0, Math.min(state.gHeight, Math.round(oGlobal)));
        oArticle = Math.max(0, Math.min(state.aHeight + state.gHeight, Math.round(oArticle)));

        const oPrimary = oGlobal;
        const oSecondary = Math.max(oGlobal, oArticle);

        if (Math.abs(state.oPrimary - oPrimary) > 0) {
            root.style.setProperty('--zcnote-overlap-primary', `${oPrimary}px`);
            state.oPrimary = oPrimary;
        }
        if (Math.abs(state.oSecondary - oSecondary) > 0) {
            root.style.setProperty('--zcnote-overlap-secondary', `${oSecondary}px`);
            state.oSecondary = oSecondary;
        }

        ticking = false;
    }

    // ==========================================
    // 阶段 C: 事件注册与性能防护管理
    // ==========================================

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollOverlap);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", () => {
        if (window.innerWidth !== state.vw) {
            window.requestAnimationFrame(updateStaticDimensions);
        } else {
            state.vh = window.innerHeight;
            root.style.setProperty('--zcnote-vh', `${state.vh}px`);
            if (!ticking) {
                window.requestAnimationFrame(updateScrollOverlap);
                ticking = true;
            }
        }
    }, { passive: true });

    if (window.ResizeObserver) {
        let roTicking = false;
        const ro = new ResizeObserver(() => {
            if (!roTicking) {
                window.requestAnimationFrame(() => {
                    updateStaticDimensions();
                    roTicking = false;
                });
                roTicking = true;
            }
        });

        // 由于重新引入了 JS 操作 bdMain padding，必须恢复对其高度变化的监控
        if (globalFooter) ro.observe(globalFooter);
        if (articleFooter) ro.observe(articleFooter);
        if (stickyHeader) ro.observe(stickyHeader);
        if (bdMain) ro.observe(bdMain);
    }

    updateStaticDimensions();
}
