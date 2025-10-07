// main.js - JS chung cho toàn bộ website

// ============================================
// 1. KHAI BÁO BIẾN VÀ HẰNG SỐ TOÀN CỤC
// ============================================
const $ = document.querySelector.bind(document);
// chọn phần tử đầu tiên phù hợp với selector
const $$ = document.querySelectorAll.bind(document);
// chọn tất cả phần tử phù hợp với selector

let initialLoad = true;
let isPageLoading = false;
let currentPage1 = null;

// ============================================
// 2. CÁC HÀM TIỆN ÍCH (UTILITY FUNCTIONS)
// ============================================

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html", callback);
 * </script>
 * Sau đó trang từ đường dẫn trên sẽ được load vào trong div có id="parent"
 */
function load(selector, path, callback) {
    const cachedTemplates = localStorage.getItem(path);
    if (cachedTemplates) {
        $(selector).innerHTML = cachedTemplates;
        if (typeof callback === "function") callback();
        return;
    }

    fetch(path)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then((data) => {
            const element = $(selector);
            if (element) {
                element.innerHTML = data;
                localStorage.setItem(path, data);
            }
            if (typeof callback === "function") callback();
        })
        .catch((error) => {
            console.error("Error loading template:", error);
            const element = $(selector);
            if (element) {
                element.innerHTML = "<p>Không thể tải trang. Vui lòng thử lại sau.</p>";
            }
            if (typeof callback === "function") callback();
        });
}

// ============================================
// 3. CÁC HÀM XỬ LÝ LOADING
// ============================================

function showLoading() {
    const loading = document.getElementById("page-loading");
    if (loading) {
        loading.style.display = "flex";
        // Ẩn content khi loading
        document.body.classList.remove("page-ready");
    }
}

function hideLoading() {
    const loading = document.getElementById("page-loading");
    if (loading) {
        // Hiện content trước
        document.body.classList.add("page-ready");

        setTimeout(() => {
            loading.style.display = "none";
        }, 150);
    }
}

// ============================================
// 4. CÁC HÀM XỬ LÝ NAVIGATION
// ============================================

function updateActiveNavLink(page) {
    document.querySelectorAll(".header-main-nav li").forEach((li) => li.classList.remove("active"));
    const activeLink = document.querySelector(`.header-main-nav a[data-page="${page}"]`);
    if (activeLink) {
        activeLink.parentElement.classList.add("active");
    }
}

function loadPage(page) {
    if (isPageLoading) {
        console.log("Page is already loading or loaded");
        return;
    }

    currentPage1 = page;
    showLoading();

    load("#main", `./pages/${page}.html`, () => {
        // Xóa script và CSS cũ nếu có
        const oldScript = document.getElementById("page-script");
        const oldCss = document.getElementById("page-style");

        if (oldScript) oldScript.remove();
        if (oldCss) oldCss.remove();

        // ĐỢI một chút để trình duyệt cleanup
        setTimeout(() => {
            // Tạo thẻ CSS mới
            const link = document.createElement("link");
            link.id = "page-style";
            link.rel = "stylesheet";
            link.href = `./assets/css/pages/${page}.css`;

            // Tạo thẻ script mới với type="module" để tạo scope riêng
            const script = document.createElement("script");
            script.id = "page-script";
            script.src = `./assets/js/pages/${page}.js?v=${Date.now()}`;
            script.type = "module"; // Quan trọng: tạo scope riêng
            script.async = true;

            // Biến theo dõi trạng thái loading
            let jsLoaded = false;
            let cssLoaded = false;
            let jsError = false;
            let cssError = false;

            // Hàm kiểm tra và ẩn loading
            function tryHideLoading() {
                if ((jsLoaded || jsError) && (cssLoaded || cssError)) {
                    hideLoading();
                    isPageLoading = false;

                    if (jsError) {
                        console.warn(`Failed to load JavaScript file: ./assets/js/pages/${page}.js`);
                    }
                    if (cssError) {
                        console.warn(`Failed to load CSS file: ./assets/css/pages/${page}.css`);
                    }
                }
            }

            // Xử lý sự kiện cho CSS
            link.onload = () => {
                cssLoaded = true;
                tryHideLoading();
            };

            link.onerror = () => {
                cssError = true;
                console.error(`Failed to load CSS: ${page}.css`);
                tryHideLoading();
            };

            // Xử lý sự kiện cho JavaScript
            script.onload = () => {
                jsLoaded = true;
                tryHideLoading();
            };

            script.onerror = () => {
                jsError = true;
                console.error(`Failed to load JavaScript: ${page}.js`);
                tryHideLoading();
            };

            // Thêm vào DOM
            document.head.appendChild(link);
            document.body.appendChild(script);

            // Timeout fallback
            setTimeout(() => {
                if (!((jsLoaded || jsError) && (cssLoaded || cssError))) {
                    console.warn("Loading timeout - hiding loading indicator");
                    hideLoading();
                    isPageLoading = false;
                }
            }, 10000);

            setTimeout(() => {
                handleHeaderScroll();
            }, 200);
        }, 100); // Delay 100ms để đảm bảo cleanup hoàn tất
    });
}

function handleHashChange() {
    const page = window.location.hash.replace("#", "") || "home";

    document.body.scrollTop = 0;

    loadPage(page);
    updateActiveNavLink(page);
}

// ============================================
// 5. CÁC HÀM XỬ LÝ MOBILE MENU
// ============================================

function setupMobileMenu() {
    const menuToggle = $("#menuToggle");
    const sideMenu = $("#sideMenu");
    const sideMenuBack = $("#sideMenuBack");
    const sideMenuOverlay = $("#sideMenuOverlay");

    if (menuToggle && sideMenu && sideMenuBack && sideMenuOverlay) {
        menuToggle.addEventListener("click", () => {
            sideMenu.classList.add("active");
            sideMenuOverlay.classList.add("active");
        });

        function closeMenu() {
            sideMenu.classList.remove("active");
            sideMenuOverlay.classList.remove("active");
        }
        sideMenuBack.addEventListener("click", closeMenu);
        sideMenuOverlay.addEventListener("click", closeMenu);
    }
}

// ============================================
// 6. CÁC HÀM XỬ LÝ THEME (DARK MODE)
// ============================================

function setupThemeToggle() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const root = document.documentElement;

    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        root.classList.add("dark");
        btn.setAttribute("data-mode", "dark");
        btn.setAttribute("aria-pressed", "true");
    } else {
        btn.setAttribute("data-mode", "light");
    }

    btn.addEventListener("click", () => {
        const isDark = root.classList.toggle("dark");
        btn.setAttribute("data-mode", isDark ? "dark" : "light");
        btn.setAttribute("aria-pressed", isDark ? "true" : "false");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

// ============================================
// 7. HÀM KÍCH HOẠT NAVIGATION LINKS
// ============================================

function activateNavLink() {
    setupMobileMenu();

    $$("a[data-page]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const page = link.getAttribute("data-page");
            loadPage(page);
            window.location.hash = page;

            // Cập nhật active class
            updateActiveNavLink(page);
        });
    });
}

// ============================================
// 8. EVENT LISTENERS - KHỞI ĐỘNG KHI VÀO WEB
// ============================================

// Sự kiện chính khi DOM load xong
document.addEventListener("DOMContentLoaded", () => {
    // Load header (chứa navigation)
    load("#header", "./templates/header.html", () => {
        activateNavLink();
        handleHashChange();
        initialLoad = false;
        setupThemeToggle();
    });

    // Load footer
    load("#footer", "./templates/footer.html");
    // Chỉ listen hashchange sau khi load xong
    window.addEventListener("hashchange", () => {
        if (!initialLoad) {
            handleHashChange();
        }
    });

    // Hiện trang luôn
    document.body.classList.add("page-ready");
});

// Đóng side menu khi resize về desktop
window.addEventListener("resize", function () {
    if (window.innerWidth > 991.98) {
        const sideMenu = document.getElementById("sideMenu");
        const sideMenuOverlay = document.getElementById("sideMenuOverlay");
        if (sideMenu) sideMenu.classList.remove("active");
        if (sideMenuOverlay) sideMenuOverlay.classList.remove("active");
    }
});

// ============================================
// 9. XỬ LÝ HEADER KHI CUỘN QUA BANNER
// ============================================

// Biến toàn cục để lưu scroll handler
let scrollHandler = null;

function handleHeaderScroll() {
    const header = document.querySelector("header");
    // Kiểm tra tất cả các loại banner
    const banner = document.querySelector(".about-des-banner, .des-banner, .onl-banner, .destination-detail-hero");

    if (!header) return;

    // XÓA event listener cũ nếu có
    if (scrollHandler) {
        document.removeEventListener("scroll", scrollHandler);
        scrollHandler = null;
    }

    // Nếu trang có banner
    if (banner) {
        const bannerHeight = banner.offsetHeight;

        // Tạo handler mới
        scrollHandler = () => {
            const scrollY = document.body.scrollTop;

            if (scrollY > bannerHeight) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        };

        document.addEventListener("scroll", scrollHandler, true);

        scrollHandler();
    } else {
        header.classList.add("scrolled");
    }
}
