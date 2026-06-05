/**
 * ZC-Note Sphinx Theme
 * (Ultimate FOUC, Layout Thrashing & Scroll Restoration Defense)
 */
export function initFooter() {
    const globalFooter = document.querySelector(".bd-footer");
    let articleFooter = document.querySelector(".bd-main > .bd-footer-content");
    const stickyHeader = document.querySelector(".pst-sticky-header");
    const bdHeader = document.querySelector("#pst-header") || document.querySelector(".bd-header");
    const bdMain = document.querySelector(".bd-main");

    const root = document.documentElement;

    let state = {
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
    // 阶段 A: 静态维度测量 (极简且防死循环)
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
                articleFooter = null;
            } else {
                aHeight = Math.round(articleFooter.offsetHeight);
            }
        }

        let layoutChanged = false;

        // 核心防御：引入 > 1px 的宽容度，防止 ResizeObserver 陷入亚像素死循环
        if (Math.abs(state.gHeight - gHeight) > 1) {
            root.style.setProperty('--zcnote-g-h', `${gHeight}px`);
            state.gHeight = gHeight;
            layoutChanged = true;
        }

        if (Math.abs(state.aHeight - aHeight) > 1) {
            root.style.setProperty('--zcnote-a-h', `${aHeight}px`);
            state.aHeight = aHeight;
            layoutChanged = true;
        }

        if (bdMain && state.gHeight > 0) {
            if (bdMain.style.paddingBottom !== `${state.gHeight}px`) {
                bdMain.style.setProperty('padding-bottom', `${state.gHeight}px`, 'important');
                layoutChanged = true;
            }
        }

        // 强制 Layout Flush 消除 1 帧闪动
        if (layoutChanged) {
            void document.body.offsetHeight;
        }

        updateScrollOverlap();
    }

    // ==========================================
    // 阶段 B: 滚动重叠度计算 (物理封顶法)
    // ==========================================
    function updateScrollOverlap() {
        if (state.vw < 960) {
            ticking = false;
            return;
        }

        let oGlobal = 0, oArticle = 0;

        if (globalFooter) {
            const top = globalFooter.getBoundingClientRect().top;
            if (top < state.vh) {
                oGlobal = Math.max(0, Math.min(state.gHeight, Math.round(state.vh - top)));
            }
        }

        if (articleFooter) {
            const top = articleFooter.getBoundingClientRect().top;
            if (top < state.vh) {
                oArticle = Math.max(0, Math.min(state.aHeight, Math.round(state.vh - top)));
            }
        }

        const oPrimary = oGlobal;
        const oSecondary = Math.max(oGlobal, oArticle);

        // 使用 !== 即可，因为已经是 round 处理过的整数
        if (state.oPrimary !== oPrimary) {
            root.style.setProperty('--zcnote-overlap-primary', `${oPrimary}px`);
            state.oPrimary = oPrimary;
        }
        if (state.oSecondary !== oSecondary) {
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
        // 核心防御：移动端地址栏收缩性能杀手防护
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
        if (globalFooter) ro.observe(globalFooter);
        if (articleFooter) ro.observe(articleFooter);
        if (stickyHeader) ro.observe(stickyHeader);
        if (bdMain) ro.observe(bdMain);
    }

    updateStaticDimensions();
}
