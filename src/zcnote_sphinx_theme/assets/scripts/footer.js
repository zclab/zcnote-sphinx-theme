/**
 * ZC-Note Sphinx Theme
 */
export function initFooter() {
    const globalFooter = document.querySelector(".bd-footer");
    let articleFooter = document.querySelector(".bd-main > .bd-footer-content");
    const stickyHeader = document.querySelector(".pst-sticky-header");
    const bdHeader = document.querySelector("#pst-header") || document.querySelector(".bd-header");
    const bdMain = document.querySelector(".bd-main");

    const root = document.documentElement;

    // 状态镜像缓存
    let state = {
        gHeight: null,
        aHeight: null,
        oPrimary: null,
        oSecondary: null,
        hBottom: null,
        vh: window.innerHeight
    };

    let isFooterIntersecting = false;
    let ticking = false;

    // ==========================================
    // 阶段 A: 静态与结构性维度测量 (仅 Resize/DOM 变动触发)
    // ==========================================
    function updateStaticDimensions() {
        state.vh = window.innerHeight;
        root.style.setProperty('--zcnote-vh', `${state.vh}px`);

        // 1. Header 吸顶高度测量
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

        // 2. Footer 基础高度测量
        const gHeight = globalFooter ? globalFooter.offsetHeight : 0;
        let aHeight = 0;

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

        // 3. 注入补偿 Padding
        if (bdMain && state.gHeight > 0) {
            bdMain.style.setProperty('padding-bottom', `${state.gHeight}px`, 'important');
        }

        // 静态尺寸改变可能影响重叠，静默刷新一次
        updateScrollOverlap();
    }

    // ==========================================
    // 阶段 B: 滚动重叠度计算 (极致防抖，仅 Footer 可见时执行)
    // ==========================================
    function updateScrollOverlap() {
        // 如果 Footer 不在视口内，强制重叠度归零，并阻断所有 DOM 布局读取
        if (!isFooterIntersecting && globalFooter && articleFooter) {
            if (state.oPrimary !== 0 || state.oSecondary !== 0) {
                state.oPrimary = 0;
                state.oSecondary = 0;
                root.style.setProperty('--zcnote-overlap-primary', '0px');
                root.style.setProperty('--zcnote-overlap-secondary', '0px');
            }
            ticking = false;
            return;
        }

        let oGlobal = 0, oArticle = 0;
        if (globalFooter && globalFooter.getBoundingClientRect) {
            oGlobal = Math.max(0, state.vh - globalFooter.getBoundingClientRect().top);
        }
        if (articleFooter && articleFooter.getBoundingClientRect) {
            oArticle = Math.max(0, state.vh - articleFooter.getBoundingClientRect().top);
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

        ticking = false;
    }

    // ==========================================
    // 阶段 C: 事件注册与监听器管理
    // ==========================================

    // 引入 IntersectionObserver，监控 Footer 是否即将进入屏幕 (提前 150px 预判)
    if (window.IntersectionObserver) {
        const io = new IntersectionObserver((entries) => {
            let anyIntersecting = false;
            entries.forEach(entry => {
                if (entry.isIntersecting) anyIntersecting = true;
            });
            isFooterIntersecting = anyIntersecting;

            // 状态反转时立即触发一次计算
            if (!ticking) {
                window.requestAnimationFrame(updateScrollOverlap);
                ticking = true;
            }
        }, { rootMargin: "0px 0px 150px 0px" });

        if (globalFooter) io.observe(globalFooter);
        if (articleFooter) io.observe(articleFooter);
    } else {
        // 降级：不支持的古老浏览器默认始终允许计算
        isFooterIntersecting = true;
    }

    // 滚动事件，接管给 RAF
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollOverlap);
            ticking = true;
        }
    }, { passive: true });

    // 视口变化事件，重新计算静态尺寸
    window.addEventListener("resize", () => {
        window.requestAnimationFrame(updateStaticDimensions);
    }, { passive: true });

    // DOM 监听器：内容动态展开/收起时重测
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
