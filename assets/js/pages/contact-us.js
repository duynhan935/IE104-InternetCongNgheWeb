// contact-us.js - JavaScript đơn giản cho trang Contact Us

// ============================================
// 1. FORM VALIDATION & SUBMISSION
// ============================================
function initContactForm() {
        const form = document.querySelector(".modern-contact-form");
        if (!form) return;

        const submitBtn = form.querySelector(".modern-submit-btn");

        function showError(input, message) {
                const group = input.closest(".form-group");
                if (!group) return;
                let errorEl = group.querySelector(".form-error");
                if (!errorEl) {
                        errorEl = document.createElement("small");
                        errorEl.className = "form-error";
                        group.appendChild(errorEl);
                }
                errorEl.textContent = message;
                errorEl.classList.add("active");
                input.classList.add("error");
        }

        function clearError(input) {
                const group = input.closest(".form-group");
                if (!group) return;
                const errorEl = group.querySelector(".form-error");
                if (errorEl) {
                        errorEl.textContent = "";
                        errorEl.classList.remove("active");
                }
                input.classList.remove("error");
        }

        function validateField(input) {
                const value = (input.value || "").trim();
                clearError(input);

                const id = input.id || input.name || "";

                // Required fields
                if (input.hasAttribute("required") && !value) {
                        return showError(input, "Trường này là bắt buộc.");
                }

                // Field-specific rules
                if (id === "email" || input.type === "email") {
                        if (value) {
                                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailPattern.test(value)) return showError(input, "Email không hợp lệ.");
                        }
                }

                if (id === "phone" || input.type === "tel") {
                        if (value) {
                                // Cho phép 0xxxxxxxxx hoặc +84xxxxxxxxx, tối thiểu 9-10 số tùy đầu số
                                const phonePattern = /^(?:\+84|0)\d{9}$/;
                                if (!phonePattern.test(value)) return showError(input, "Số điện thoại không hợp lệ.");
                        }
                }

                if (id === "subject") {
                        if (value && value.length < 3) return showError(input, "Chủ đề quá ngắn (>= 3 ký tự).");
                }

                if (id === "message") {
                        if (value && value.length < 5) return showError(input, "Tin nhắn quá ngắn (>= 5 ký tự).");
                }
        }

        function validateForm() {
                const inputs = form.querySelectorAll(".form-input");
                let isValid = true;
                inputs.forEach((input) => {
                        validateField(input);
                        if (input.classList.contains("error")) isValid = false;
                });
                return isValid;
        }

        // Submit handler
        form.addEventListener("submit", async function (e) {
                e.preventDefault();
                if (!validateForm()) {
                        showNotification("error", "Vui lòng kiểm tra lại thông tin!");
                        return;
                }

                const originalHTML = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = "<span>Đang gửi...</span>";

                // Giả lập API call
                await new Promise((resolve) => setTimeout(resolve, 800));

                // Hiển thị modal thành công thay vì chỉ toast
                showContactSuccessModal();
                form.reset();

                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
        });

        // Real-time validation
        const inputs = form.querySelectorAll(".form-input");
        inputs.forEach((input) => {
                input.addEventListener("blur", () => validateField(input));
                input.addEventListener("input", () => clearError(input));
        });
}

function validateForm() {
        const requiredFields = document.querySelectorAll(".form-input[required]");
        let isValid = true;

        requiredFields.forEach((field) => {
                if (!validateField(field)) isValid = false;
        });

        return isValid;
}

function validateField(field) {
        const value = field.value.trim();
        field.classList.remove("error", "success");

        if (field.hasAttribute("required") && !value) {
                field.classList.add("error");
                return false;
        }

        if (field.type === "email" && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                        field.classList.add("error");
                        return false;
                }
        }

        if (value) field.classList.add("success");
        return true;
}

// ============================================
// 2. NOTIFICATION SYSTEM
// ============================================
function showNotification(type, message) {
        const existing = document.querySelector(".notification-toast");
        if (existing) existing.remove();

        const notification = document.createElement("div");
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add("show"), 10);
        setTimeout(() => {
                notification.classList.remove("show");
                setTimeout(() => notification.remove(), 300);
        }, 3500);
}

// ============================================
// 3. SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
                link.addEventListener("click", function (e) {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute("href"));
                        if (target) {
                                target.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                });
        });
}

// ============================================
// 4. PARALLAX EFFECT CHO HERO
// ============================================
function initParallax() {
        const hero = document.querySelector(".contact-hero");
        if (!hero) return;

        window.addEventListener("scroll", () => {
                const scrolled = window.pageYOffset;
                const heroContent = hero.querySelector(".contact-hero__content");
                const shapes = hero.querySelectorAll(".shape");

                if (heroContent) {
                        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
                        heroContent.style.opacity = Math.max(0, 1 - scrolled / 500);
                }

                shapes.forEach((shape, i) => {
                        const speed = 0.1 + i * 0.05;
                        shape.style.transform = `translate(${scrolled * speed}px, ${scrolled * speed}px)`;
                });
        });
}

// ============================================
// 5. CARD TILT EFFECT
// ============================================
function initCardEffects() {
        document.querySelectorAll(".contact-card").forEach((card) => {
                // Nâng thẻ lên ngay khi hover để phản hồi tức thì
                card.addEventListener("mouseenter", function () {
                        this.style.transform = "translateY(-10px)";
                });

                card.addEventListener("mousemove", function (e) {
                        const rect = this.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = ((y - centerY) / centerY) * 5;
                        const rotateY = ((centerX - x) / centerX) * 5;

                        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
                });

                card.addEventListener("mouseleave", function () {
                        this.style.transform = "";
                });
        });
}

// ============================================
// 6. FADE-IN ANIMATIONS KHI SCROLL
// ============================================
function initScrollAnimations() {
        const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const elements = document.querySelectorAll("[data-aos], .contact-card, .faq-item, .contact-feature");

        if (prefersReducedMotion) {
                elements.forEach((el) => {
                        el.style.opacity = "1";
                        el.style.transform = "none";
                });
                return;
        }

        const observer = new IntersectionObserver(
                (entries) => {
                        entries.forEach((entry) => {
                                if (entry.isIntersecting) {
                                        const el = entry.target;
                                        el.style.opacity = "1";
                                        el.style.transform = "translateY(0)";

                                        const cleanup = () => {
                                                el.style.transition = "";
                                                el.style.willChange = "";
                                                el.removeEventListener("transitionend", cleanup);
                                        };
                                        el.addEventListener("transitionend", cleanup);
                                        setTimeout(cleanup, 300);

                                        observer.unobserve(el);
                                }
                        });
                },
                { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
        );

        elements.forEach((el, index) => {
                el.style.opacity = "0";
                el.style.transform = "translateY(12px)";
                el.style.willChange = "opacity, transform";

                // Stagger nhỏ và bỏ trễ cho các phần tử cần phản hồi nhanh
                let delay = 0;
                if (!el.classList.contains("contact-card")) {
                        delay = Math.min(index * 0.02, 0.12);
                }

                el.style.transition = `opacity 0.18s ease-out ${delay}s, transform 0.18s ease-out ${delay}s`;
                observer.observe(el);
        });
}

// ============================================
// 7. SOCIAL LINKS HOVER ANIMATION
// ============================================
function initSocialAnimations() {
        const socialLinks = document.querySelectorAll(".social-link");

        socialLinks.forEach((link, index) => {
                link.style.opacity = "0";
                link.style.transform = "translateY(20px)";

                setTimeout(() => {
                        link.style.transition = "all 0.2s ease";
                        link.style.opacity = "1";
                        link.style.transform = "translateY(0)";
                }, 500 + index * 50);
        });
}

// ============================================
// 8. INPUT FOCUS ANIMATIONS
// ============================================
function initInputAnimations() {
        const inputs = document.querySelectorAll(".form-input");

        inputs.forEach((input) => {
                input.addEventListener("focus", function () {
                        this.parentElement.style.transform = "scale(1.02)";
                        this.parentElement.style.transition = "transform 0.3s ease";
                });

                input.addEventListener("blur", function () {
                        this.parentElement.style.transform = "scale(1)";
                });
        });
}

// ============================================
// 9b. SUCCESS MODAL (copy từ tour-details, tinh chỉnh cho contact)
// ============================================
function showContactSuccessModal() {
        let modal = document.querySelector(".contact-success-modal");
        if (!modal) {
                modal = document.createElement("div");
                modal.className = "contact-success-modal";
                modal.innerHTML = `
            <div class="contact-success-modal__content">
                <h3>Gửi tin nhắn thành công!</h3>
                <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                <button class="contact-success-modal__close">Đóng</button>
            </div>
        `;
                document.body.appendChild(modal);
        }
        modal.style.display = "flex";

        const closeBtn = modal.querySelector(".contact-success-modal__close");
        closeBtn.addEventListener("click", () => {
                modal.style.display = "none";
        });
}

// ============================================
// 9. MAIN INITIALIZATION
// ============================================
function initContactPage() {
        console.log("🚀 Initializing Contact Page...");

        initContactForm();
        initSmoothScroll();
        initParallax();
        initCardEffects();
        initScrollAnimations();
        initSocialAnimations();
        initInputAnimations();

        console.log("✨ Contact Page Ready!");
}

// Execute on DOM ready
if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initContactPage);
} else {
        initContactPage();
}
