/**
 * ZC-Note Sphinx Theme
 * Footer 零跳动滚动与版心重叠计算逻辑 (极致性能优化版)
 */
export function initFooter() {
    const footer = document.querySelector(".bd-footer");
    if (!footer) return;

    // 寻找主内容容器
    const targetContainer = document.querySelector(".bd-article-container") ||
                            document.querySelector(".bd-content") ||
                            document.querySelector(".bd-main") ||
                            document.body;

    // 1. 确保 Footer 被绝对定位到 body 的最底层
    if (footer.parentNode !== document.body) {
        document.body.appendChild(footer);
    }

    // 2. 在内容区底部注入一个透明的“幽灵占位符”，撑开物理空间
    const spacer = document.createElement("div");
    spacer.id = "zcnote-footer-spacer";
    spacer.style.cssText = "width: 100%; display: block; clear: both; pointer-events: none; flex-shrink: 0;";
    targetContainer.appendChild(spacer);

    // ==========================================
    // ★ 性能优化核心：状态缓存与帧级节流
    // ==========================================
    let ticking = false;
    let lastFooterHeight = null;
    let lastOverlap = null;
    let lastViewportHeight = null;

    const root = document.documentElement;

    // 3. 核心布局计算函数
    function updateLayout() {
        const footerHeight = footer.offsetHeight;
        const footerTop = footer.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;

        // 计算 Footer 与视口底部的重叠量
        const overlap = Math.max(0, viewportHeight - footerTop);

        // ★ 优化 1：仅在视口高度真正改变时才写入 CSS 变量，防抖动
        if (lastViewportHeight !== viewportHeight) {
            root.style.setProperty('--zcnote-vh', `${viewportHeight}px`);
            lastViewportHeight = viewportHeight;
        }

        // ★ 优化 2：仅在 Footer 真实高度改变时，才去触碰 DOM 修改占位符高度
        if (lastFooterHeight !== footerHeight) {
            spacer.style.height = `${footerHeight}px`;
            lastFooterHeight = footerHeight;
        }

        // ★ 优化 3：仅在重叠量发生实质变化时，才更新重叠变量给侧边栏使用
        if (lastOverlap !== overlap) {
            root.style.setProperty('--zcnote-footer-overlap', `${overlap}px`);
            lastOverlap = overlap;
        }

        // 计算完成，释放锁
        ticking = false;
    }

    // 利用 rAF 节流，确保无论触发频率多高，每帧最多只执行一次 DOM 更新
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateLayout);
            ticking = true;
        }
    }

    // 4. 绑定生命周期与交互事件 (添加 passive 提升滚动性能)
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });

    // ★ 监听 DOM 内容引起的容器尺寸变化
    if (window.ResizeObserver) {
        // 由于我们上方做了 lastFooterHeight 的判断，
        // 这里不会再引发因修改 spacer 导致的 ResizeObserver 无限循环报错
        const ro = new ResizeObserver(() => requestTick());
        ro.observe(footer);
        ro.observe(document.body);
    }

    // 首次挂载时立即执行一次计算，完成初始化布局
    requestTick();
}
