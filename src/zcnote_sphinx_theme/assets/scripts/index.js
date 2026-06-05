/**
 * ZC-Note Sphinx Theme 核心脚本入口
 */
import { initSidebar } from './sidebar.js';
import { initFooter } from './footer.js';

// =========================================================
// 1. 侧边栏逻辑：立即执行 (防闪烁)
// =========================================================
initSidebar();

// =========================================================
// 2. 底部栏逻辑：等待 DOM 完全就绪
// =========================================================
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initFooter);
} else {
    initFooter();
}
