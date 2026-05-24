/**
 * ZC-Note Sphinx Theme
 * 布局精准测量与极简零干预避障引擎 (全端护航版)
 */
export function initFooter() {
    const globalFooter = document.querySelector(".bd-footer");
    let articleFooter = document.querySelector(".bd-main > .bd-footer-content");
    const stickyHeader = document.querySelector(".pst-sticky-header");
    const bdHeader = document.querySelector("#pst-header") || document.querySelector(".bd-header");
    const bdMain = document.querySelector(".bd-main");

    const root = document.documentElement;
    let ticking = false;

    // 状态镜像缓存，阻断无效的重排写入
    let state = {
        gHeight: null,
        aHeight: null,
        oPrimary: null,
        oSecondary: null,
        hBottom: null
    };

    function updateLayout() {
        const vh = window.innerHeight;
        root.style.setProperty('--zcnote-vh', `${vh}px`);

        // 1. 全局 Footer 高度测量
        const gHeight = globalFooter ? globalFooter.offsetHeight : 0;
        let aHeight = 0;

        // 2. 文章 Footer 空壳探测与清理
        if (articleFooter) {
            const hasItems = articleFooter.querySelectorAll('.footer-article-item').length > 0;
            const hasText = articleFooter.textContent.trim() !== '';

            if (!hasItems && !hasText) {
                articleFooter.style.setProperty('display', 'none', 'important');
                articleFooter = null;
            } else {
                aHeight = articleFooter.offsetHeight;
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

        // 全端生效：为 bd-main 注入等同于 gHeight 的 padding，用来安全接住上浮的 Footer
        if (bdMain) {
            bdMain.style.setProperty('padding-bottom', `${gHeight}px`, 'important');
        }

        // 3. 计算视口入侵量
        let oGlobal = 0, oArticle = 0;
        if (globalFooter && globalFooter.getBoundingClientRect) {
            oGlobal = Math.max(0, vh - globalFooter.getBoundingClientRect().top);
        }
        if (articleFooter && articleFooter.getBoundingClientRect) {
            oArticle = Math.max(0, vh - articleFooter.getBoundingClientRect().top);
        }

        const oPrimary = oGlobal;
        const oSecondary = Math.max(oGlobal, oArticle);

        if (state.oPrimary !== oPrimary) {
            root.style.setProperty('--zcnote-overlap-primary', `${oPrimary}px`);
            state.oPrimary = oPrimary;
        }
        if (state.oSecondary !== oSecondary) {
            root.style.setProperty('--zcnote-overlap-secondary', `${oSecondary}px`);
            state.oSecondary = oSecondary;
        }

        // 4. 测量 Header 吸顶高度
        let hBottom = 0;
        if (stickyHeader && stickyHeader.getBoundingClientRect) {
            hBottom = Math.max(hBottom, stickyHeader.getBoundingClientRect().bottom);
        }
        if (bdHeader && bdHeader.getBoundingClientRect) {
            hBottom = Math.max(hBottom, bdHeader.getBoundingClientRect().bottom);
        }
        hBottom = Math.max(0, hBottom);

        if (state.hBottom !== hBottom) {
            root.style.setProperty('--zcnote-header-height', `${hBottom}px`);
            state.hBottom = hBottom;
        }

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateLayout);
            ticking = true;
        }
    }

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });

    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => requestTick());
        if (globalFooter) ro.observe(globalFooter);
        if (articleFooter) ro.observe(articleFooter);
        if (stickyHeader) ro.observe(stickyHeader);
        if (bdMain) ro.observe(bdMain);
        ro.observe(document.body);
    }
    requestTick();
}
