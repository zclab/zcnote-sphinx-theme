/**
 * 侧边栏折叠逻辑与防闪烁处理
 */
export function initSidebar() {
    const sidebar = document.querySelector(".bd-sidebar-primary");
    const collapseBtnWrapper = document.querySelector(".sidebar-primary-item.pst-sidebar-collapse");
    const collapseBtn = document.querySelector("#pst-collapse-sidebar-button");

    if (sidebar && collapseBtnWrapper) {
        // 1. 抢在浏览器渲染前，瞬间移出侧边栏，插入到接缝处 (防御刷新闪烁)
        sidebar.parentNode.insertBefore(collapseBtnWrapper, sidebar.nextSibling);

        // 2. 状态接管与滚动条控制
        if (collapseBtn) {
            const toggleScrollbar = () => {
                // 如果是折叠状态，隐藏侧边栏内的原生滚动条
                if (collapseBtn.getAttribute("aria-expanded") === "false") {
                    sidebar.classList.add("zcnote-hide-scrollbar");
                } else {
                    sidebar.classList.remove("zcnote-hide-scrollbar");
                }
            };

            // 监听 aria-expanded 属性的变化，动态开关滚动条
            const observer = new MutationObserver(toggleScrollbar);
            observer.observe(collapseBtn, {
                attributes: true,
                attributeFilter: ["aria-expanded"]
            });

            // 初始化执行一次
            toggleScrollbar();
        }
    }
}
