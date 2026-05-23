/**
 * ZC-Note Sphinx Theme
 * 布局动态计算逻辑 (Footer 零跳动与 Header 精确吸顶计算)
 */
export function initFooter() {
    const footer = document.querySelector(".bd-footer");
    // 捕获 PyData 可能注入的各类头部容器
    const stickyHeader = document.querySelector(".pst-sticky-header");
    const bdHeader = document.querySelector("#pst-header") || document.querySelector(".bd-header");

    let spacer = null;

    // 1. 如果有 Footer，执行底部占位符注入逻辑
    if (footer) {
        const targetContainer = document.querySelector(".bd-article-container") ||
                                document.querySelector(".bd-content") ||
                                document.querySelector(".bd-main") ||
                                document.body;

        // 确保 Footer 被绝对定位到 body 的最底层
        if (footer.parentNode !== document.body) {
            document.body.appendChild(footer);
        }

        // 注入透明的“幽灵占位符”
        spacer = document.createElement("div");
        spacer.id = "zcnote-footer-spacer";
        spacer.style.cssText = "width: 100%; display: block; clear: both; pointer-events: none; flex-shrink: 0;";
        if (targetContainer) {
            targetContainer.appendChild(spacer);
        }
    }

    // ==========================================
    // ★ 性能优化核心：状态缓存与帧级节流
    // ==========================================
    let ticking = false;
    let lastFooterHeight = null;
    let lastOverlap = null;
    let lastViewportHeight = null;
    let lastHeaderHeight = null;

    const root = document.documentElement;

    // 核心布局计算函数
    function updateLayout() {
        const viewportHeight = window.innerHeight;

        // --- 视口高度更新 ---
        if (lastViewportHeight !== viewportHeight) {
            root.style.setProperty('--zcnote-vh', `${viewportHeight}px`);
            lastViewportHeight = viewportHeight;
        }

        // --- Footer 逻辑 ---
        if (footer && spacer) {
            const footerHeight = footer.offsetHeight;
            const footerTop = footer.getBoundingClientRect().top;
            const overlap = Math.max(0, viewportHeight - footerTop);

            if (lastFooterHeight !== footerHeight) {
                spacer.style.height = `${footerHeight}px`;
                lastFooterHeight = footerHeight;
            }

            if (lastOverlap !== overlap) {
                root.style.setProperty('--zcnote-footer-overlap', `${overlap}px`);
                lastOverlap = overlap;
            }
        }

        // --- ★ Header 精确吸顶边界追踪 ---
        // 无论 sticky_banners 是 true/false，getBoundingClientRect().bottom
        // 都能精准反映当前吸顶层占据了视口上方多少物理像素。
        let headerBottom = 0;
        if (stickyHeader) {
            headerBottom = Math.max(headerBottom, stickyHeader.getBoundingClientRect().bottom);
        }
        if (bdHeader) {
            headerBottom = Math.max(headerBottom, bdHeader.getBoundingClientRect().bottom);
        }

        // 防御性处理：确保不会出现负值
        headerBottom = Math.max(0, headerBottom);

        if (lastHeaderHeight !== headerBottom) {
            root.style.setProperty('--zcnote-header-height', `${headerBottom}px`);
            lastHeaderHeight = headerBottom;
        }

        // 计算完成，释放锁
        ticking = false;
    }

    // 利用 rAF 节流
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateLayout);
            ticking = true;
        }
    }

    // 绑定生命周期与交互事件 (passive 提升滚动性能)
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });

    // 监听 DOM 内容引起的容器尺寸变化
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => requestTick());
        if (footer) ro.observe(footer);
        if (stickyHeader) ro.observe(stickyHeader); // 监听 Banner/Header 的高度突变
        ro.observe(document.body);
    }

    // 首次挂载时立即执行一次计算
    requestTick();
}
