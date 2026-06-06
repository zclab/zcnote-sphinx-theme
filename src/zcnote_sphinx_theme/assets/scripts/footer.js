/**
 * ZC-Note Sphinx Theme
 * (Expert Edition: Double-rAF Separation & Anti-Jitter Bumper)
 */
export function initFooter() {
    if (window._zcnoteFooterInitialized) return;
    window._zcnoteFooterInitialized = true;

    const globalFooter = document.querySelector(".bd-footer");
    const articleFooter = document.querySelector(".bd-main > .bd-footer-content");
    const stickyHeader = document.querySelector(".pst-sticky-header");
    const bdHeader = document.querySelector("#pst-header") || document.querySelector(".bd-header");
    const bdMain = document.querySelector(".bd-main");
    const bdContent = document.querySelector(".bd-content");

    const root = document.documentElement;

    const state = {
        gHeight: 0,
        aHeight: 0,
        oPrimary: 0,
        oSecondary: 0,
        hBottom: 0,
        vw: window.innerWidth
    };

    let scrollTicking = false;
    let resizeObserver = null;
    let isFirstMount = true;

    // ==========================================
    // 阶段 A1: DOM 集中读取 - 静态维度
    // ==========================================
    function measureStaticDimensions() {
        const metrics = {
            vw: window.innerWidth,
            hBottom: 0,
            gHeight: 0,
            aHeight: 0,
            hideArticle: false
        };

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
        metrics.hBottom = Math.round(Math.max(0, metrics.hBottom));

        if (globalFooter) {
            metrics.gHeight = Math.round(globalFooter.getBoundingClientRect().height);
        }

        if (articleFooter) {
            const hasItems = articleFooter.querySelectorAll('.footer-article-item').length > 0;
            const hasText = articleFooter.textContent.trim() !== '';

            if (!hasItems && !hasText) {
                metrics.hideArticle = true;
            } else {
                metrics.aHeight = Math.round(articleFooter.getBoundingClientRect().height);
            }
        }

        return metrics;
    }

    // ==========================================
    // 阶段 A2: DOM 集中读取 - 滚动重叠度
    // ==========================================
    function measureScrollOverlap() {
        const vh = window.innerHeight;
        const metrics = { oGlobal: 0, oArticle: 0 };

        if (state.vw < 960) return metrics;

        let fakeScroll = 0;
        const docHeight = document.documentElement.scrollHeight;

        if (globalFooter && docHeight > vh + 5) {
            const bottom = globalFooter.getBoundingClientRect().bottom;
            if (bottom < vh) fakeScroll = vh - bottom;
        }

        if (globalFooter && state.gHeight > 0) {
            const top = globalFooter.getBoundingClientRect().top;
            metrics.oGlobal = Math.max(0, vh - top - fakeScroll);
        }

        if (articleFooter && state.aHeight > 0) {
            const top = articleFooter.getBoundingClientRect().top;
            metrics.oArticle = Math.max(0, vh - top - fakeScroll);
        }

        return metrics;
    }

    // ==========================================
    // 阶段 B2: DOM 集中写入 - 滚动重叠度
    // ==========================================
    function applyScrollOverlap(metrics) {
        // 保留 2px 安全距离，防止与容器底边碰撞引发 Jitter
        const safeBumper = 2;

        const oPrimary = Math.max(safeBumper, Math.round(metrics.oGlobal));
        const oSecondary = Math.max(safeBumper, Math.round(Math.max(metrics.oGlobal, metrics.oArticle)));

        if (state.oPrimary !== oPrimary) {
            root.style.setProperty('--zcnote-overlap-primary', `${oPrimary}px`);
            state.oPrimary = oPrimary;
        }
        if (state.oSecondary !== oSecondary) {
            root.style.setProperty('--zcnote-overlap-secondary', `${oSecondary}px`);
            state.oSecondary = oSecondary;
        }
    }

    // 抽离 DOM 写入逻辑，以便复用
    function writeStaticDimensionsDOM(staticMetrics) {
        let layoutMutated = false;

        if (Math.abs(state.hBottom - staticMetrics.hBottom) > 1) {
            root.style.setProperty('--zcnote-header-height', `${staticMetrics.hBottom}px`);
            state.hBottom = staticMetrics.hBottom;
            layoutMutated = true;
        }

        if (articleFooter) {
            const currentDisplay = articleFooter.style.display === 'none';
            if (staticMetrics.hideArticle && !currentDisplay) {
                articleFooter.style.setProperty('display', 'none', 'important');
                layoutMutated = true;
            } else if (!staticMetrics.hideArticle && currentDisplay) {
                articleFooter.style.removeProperty('display');
                layoutMutated = true;
            }
        }

        if (Math.abs(state.gHeight - staticMetrics.gHeight) > 1) {
            root.style.setProperty('--zcnote-g-h', `${staticMetrics.gHeight}px`);
            state.gHeight = staticMetrics.gHeight;
            layoutMutated = true;
        }

        if (Math.abs(state.aHeight - staticMetrics.aHeight) > 1) {
            root.style.setProperty('--zcnote-a-h', `${staticMetrics.aHeight}px`);
            state.aHeight = staticMetrics.aHeight;
            layoutMutated = true;
        }

        if (bdMain) {
            const expectedPadding = state.gHeight > 0 ? `${state.gHeight}px` : '0px';
            if (bdMain.style.paddingBottom !== expectedPadding) {
                bdMain.style.setProperty('padding-bottom', expectedPadding, 'important');
                layoutMutated = true;
            }
        }

        return layoutMutated;
    }

    // ==========================================
    // 阶段 B1: DOM 集中写入 - 智能调度器
    // ==========================================
    function applyDimensions() {
        const staticMetrics = measureStaticDimensions();
        state.vw = staticMetrics.vw;

        // 首次渲染策略
        if (isFirstMount) {
            // 首次渲染：放弃双帧分离，采取强制同步模式。
            // 此时执行 measureScrollOverlap 会触发 Forced Reflow，
            // 但这是为了对抗浏览器 Scroll Restoration 的瞬间闪烁（FOUC）付出的代价。
            writeStaticDimensionsDOM(staticMetrics);
            const scrollMetrics = measureScrollOverlap();
            applyScrollOverlap(scrollMetrics);

            isFirstMount = false;
            return;
        }

        // ★ 交互渲染策略 (滚动/窗口缩放/内容变化时执行)
        // Double-rAF 隔离机制，保护 60fps 运行性能
        window.requestAnimationFrame(() => {
            const layoutMutated = writeStaticDimensionsDOM(staticMetrics);

            // Double-rAF 隔离 (彻底消灭强制同步布局)
            // 如果发生了布局变更，我们必须等待浏览器在当前帧末尾完成自然重排(Reflow)和重绘(Repaint)，
            // 才能在下一帧去安全地读取基于新布局的 getBoundingClientRect()。
            if (layoutMutated) {
                window.requestAnimationFrame(() => {
                    const scrollMetrics = measureScrollOverlap();
                    applyScrollOverlap(scrollMetrics);
                });
            } else {
                // 没有改变DOM结构，同一帧读取是安全的
                const scrollMetrics = measureScrollOverlap();
                applyScrollOverlap(scrollMetrics);
            }
        });
    }

    // ==========================================
    // 阶段 C: 事件注册与生命周期
    // ==========================================
    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            scrollTicking = true;
            window.requestAnimationFrame(() => {
                const scrollMetrics = measureScrollOverlap();
                applyScrollOverlap(scrollMetrics);
                scrollTicking = false;
            });
        }
    }, { passive: true });

    window.addEventListener("resize", () => {
        if (window.innerWidth !== state.vw) {
            applyDimensions();
        } else {
            // 移动端地址栏收起导致的高度变化，只需重算 Scroll Overlap
            if (!scrollTicking) {
                scrollTicking = true;
                window.requestAnimationFrame(() => {
                    const scrollMetrics = measureScrollOverlap();
                    applyScrollOverlap(scrollMetrics);
                    scrollTicking = false;
                });
            }
        }
    }, { passive: true });

    if (window.ResizeObserver) {
        let roTicking = false;
        resizeObserver = new ResizeObserver(() => {
            if (!roTicking) {
                roTicking = true;
                window.requestAnimationFrame(() => {
                    applyDimensions();
                    roTicking = false;
                });
            }
        });

        if (globalFooter) resizeObserver.observe(globalFooter);
        if (articleFooter) resizeObserver.observe(articleFooter);
        if (stickyHeader) resizeObserver.observe(stickyHeader);
        // 将监听目标从 bdMain (会被注入 padding) 改为内部的 bdContent (纯净的内容区)
        if (bdContent) resizeObserver.observe(bdContent);
    }

    window.addEventListener("beforeunload", () => {
        if (resizeObserver) resizeObserver.disconnect();
        window._zcnoteFooterInitialized = false;
    });

    applyDimensions();
}
