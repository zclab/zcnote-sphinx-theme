/**
 * ZC-Note Sphinx Theme
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

    function applyScrollOverlap(metrics) {
        // 由于已经有 CSS 的 -100vh 防碰撞，这里的 Bumper 只是为了视觉留白
        const safeBumper = 0;

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

    function applyDimensions() {
        const staticMetrics = measureStaticDimensions();
        state.vw = staticMetrics.vw;

        // ★ 首次挂载：同步重排 + 0ms 瞬移。配合 CSS 动画镇压彻底消灭底部刷新闪烁。
        if (isFirstMount) {
            isFirstMount = false;

            writeStaticDimensionsDOM(staticMetrics);
            const scrollMetrics = measureScrollOverlap();
            applyScrollOverlap(scrollMetrics);

            // 彻底算准高度后，解除 CSS 动画封印
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    root.setAttribute('data-zcnote-layout-ready', 'true');
                });
            });
            return;
        }

        // 常规交互的 60fps 异步管线
        window.requestAnimationFrame(() => {
            const layoutMutated = writeStaticDimensionsDOM(staticMetrics);

            if (layoutMutated) {
                window.requestAnimationFrame(() => {
                    const scrollMetrics = measureScrollOverlap();
                    applyScrollOverlap(scrollMetrics);
                });
            } else {
                const scrollMetrics = measureScrollOverlap();
                applyScrollOverlap(scrollMetrics);
            }
        });
    }

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
        if (bdContent) resizeObserver.observe(bdContent);
    }

    window.addEventListener("beforeunload", () => {
        if (resizeObserver) resizeObserver.disconnect();
        window._zcnoteFooterInitialized = false;
    });

    applyDimensions();
}
