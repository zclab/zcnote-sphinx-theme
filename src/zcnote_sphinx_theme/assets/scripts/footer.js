/**
 * ZC-Note Sphinx Theme (Ultimate FOUC, Bounce & Performance Defense)
 */
export function initFooter() {
    const globalFooter = document.querySelector(".bd-footer");
    let articleFooter = document.querySelector(".bd-main > .bd-footer-content");
    const stickyHeader = document.querySelector(".pst-sticky-header");
    const bdHeader = document.querySelector("#pst-header") || document.querySelector(".bd-header");
    const bdMain = document.querySelector(".bd-main");

    const root = document.documentElement;

    // 状态镜像缓存，全部初始化为整数 0
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
    // 阶段 A: 静态与结构性维度测量
    // ==========================================
    function updateStaticDimensions() {
        state.vh = window.innerHeight;
        state.vw = window.innerWidth;
        root.style.setProperty('--zcnote-vh', `${state.vh}px`);

        // 1. Header 吸顶高度测量 (亚像素抹平)
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

        if (state.hBottom !== hBottom) {
            root.style.setProperty('--zcnote-header-height', `${hBottom}px`);
            state.hBottom = hBottom;
        }

        // 2. Footer 基础高度测量
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

        if (state.gHeight !== gHeight) {
            root.style.setProperty('--zcnote-g-h', `${gHeight}px`);
            state.gHeight = gHeight;
        }
        if (state.aHeight !== aHeight) {
            root.style.setProperty('--zcnote-a-h', `${aHeight}px`);
            state.aHeight = aHeight;
        }

        // 3. 注入补偿 Padding
        if (bdMain && state.gHeight > 0) {
            bdMain.style.setProperty('padding-bottom', `${state.gHeight}px`, 'important');
        }

        updateScrollOverlap();
    }

    // ==========================================
    // 阶段 B: 滚动重叠度计算
    // ==========================================
    function updateScrollOverlap() {
        // ★ 性能屏障：如果屏幕小于 960px (移动端)，侧边栏变为抽屉，无需计算滚动，直接释放性能
        if (state.vw < 960) {
            ticking = false;
            return;
        }

        let oGlobal = 0, oArticle = 0;

        // 真实系统过冲量 (ScrollY + Viewport - DocumentHeight)
        // 彻底免疫短页面 Bug 和 iOS/Mac 弹性回弹
        const docHeight = document.documentElement.scrollHeight;
        const scrollBottom = window.scrollY + state.vh;
        const fakeScroll = Math.max(0, scrollBottom - docHeight);

        // ★ 抹平亚像素，防御渲染风暴
        if (globalFooter) {
            oGlobal = Math.max(0, state.vh - globalFooter.getBoundingClientRect().top - fakeScroll);
            oGlobal = Math.round(oGlobal);
        }

        if (articleFooter) {
            oArticle = Math.max(0, state.vh - articleFooter.getBoundingClientRect().top - fakeScroll);
            oArticle = Math.round(oArticle);
        }

        const oPrimary = oGlobal;
        const oSecondary = Math.max(oGlobal, oArticle);

        // 仅在整数像素发生实质改变时写入 DOM
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
    // 阶段 C: 事件注册与监听器管理
    // ==========================================

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollOverlap);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", () => {
        window.requestAnimationFrame(updateStaticDimensions);
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

    // 立即执行一次初始化
    updateStaticDimensions();
}
