class SkeletonLazyLoader {
    constructor() {
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            rootMargin: "50px",
            // bắt đầu load trước khi ảnh vào viewport 50px
            threshold: 0.1,
        });

        this.init();
    }

    init() {
        setTimeout(() => {
            this.setupLazy();
        }, 300);
    }

    setupLazy() {
        // Tìm tất cả lazy images
        const lazyImages = document.querySelectorAll("img[data-src]");
        lazyImages.forEach((img) => {
            // Wrap image trong container nếu chưa có
            this.wrapImageWithSkeleton(img);
            this.observer.observe(img);
        });
    }

    // Wrap image trong skeleton container
    wrapImageWithSkeleton(img) {
        // Kiểm tra xem đã wrap chưa
        if (img.parentElement.classList.contains("skeleton-wrapper")) {
            return;
        }

        // Kiểm tra nếu là ảnh cần giữ nguyên kích thước (không dùng aspect-ratio)
        const preserveSizeClasses = [
            'destination-detail-mission__img',
            'destination-detail-ready__background',
            'destination-detail-ready__image',
            'destination-detail-gallery__main-image',
            'destination-detail-gallery__thumb'
        ];

        const shouldPreserveSize = preserveSizeClasses.some(className => 
            img.classList.contains(className)
        );

        // Tạo wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "skeleton-wrapper";

        // Thêm class skeleton-loading ban đầu
        wrapper.classList.add("skeleton-loading");

        // Copy tất cả classes từ image sang wrapper (để giữ styling)
        if (img.className) {
            const imgClasses = img.className.split(' ');
            imgClasses.forEach(cls => {
                if (cls && !wrapper.classList.contains(cls)) {
                    wrapper.classList.add(cls);
                }
            });
        }

        // Wrap image
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        // Xóa các classes styling khỏi img để tránh conflict
        const classesToRemove = [
            'destination-detail-card__img',
            'destination-detail-pilgrimages__image',
            'destination-detail-gallery__main-image',
            'destination-detail-gallery__thumb',
            'destination-detail-insights__image'
        ];
        
        classesToRemove.forEach(cls => {
            if (img.classList.contains(cls)) {
                img.classList.remove(cls);
            }
        });

        // Chỉ thêm aspect ratio cho các ảnh không cần giữ nguyên kích thước
        if (!shouldPreserveSize && img.width && img.height) {
            const aspectRatio = (img.height / img.width) * 100;
            wrapper.style.paddingBottom = `${aspectRatio}%`;
        }
    }

    handleIntersection(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        const wrapper = img.closest(".skeleton-wrapper");

        // Preload image
        const imageLoader = new Image();

        imageLoader.onload = () => {
            img.src = src;
            img.classList.add("loaded");

            // Xóa skeleton loading
            if (wrapper) {
                wrapper.classList.remove("skeleton-loading");
                wrapper.classList.add("skeleton-loaded");
            }
        };

        imageLoader.onerror = () => {
            // Khi lỗi, vẫn xóa skeleton và hiển thị alt
            img.alt = "Image not available";
            if (wrapper) {
                wrapper.classList.remove("skeleton-loading");
                wrapper.classList.add("skeleton-error");
            }
        };

        imageLoader.src = src;
    }
}

// Smooth scroll reveal for elements using scroll-animate system
class ScrollReveal {
    constructor() {
        this.init();
    }

    init() {
        // Options for the Intersection Observer
        const observerOptions = {
            threshold: 0.15,  // Trigger when 15% of element is visible
            rootMargin: '0px 0px -80px 0px'  // Trigger slightly before element is fully in view
        };

        // Create the observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animate-in class when element enters viewport
                    entry.target.classList.add('animate-in');
                    // Optional: unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Select all elements that need scroll-triggered animations
        const animatedElements = document.querySelectorAll(
            // Sections
            '.destination-detail-popular, .destination-detail-mission, ' +
            '.destination-detail-mission__image, .destination-detail-mission__text, ' +
            '.destination-detail-mission__stat, .destination-detail-ready, ' +
            '.destination-detail-ready__overlay, .destination-detail-pilgrimages, ' +
            '.destination-detail-gallery, .destination-detail-itinerary, ' +
            '.destination-detail-cta, .destination-detail-cta__overlay, ' +
            '.destination-detail-insights, .destination-detail-testimonials, ' +
            // Cards and items
            '.destination-detail-card, .destination-detail-pilgrimages__card, ' +
            '.destination-detail-insights__card, .destination-detail-testimonials__item, ' +
            // Generic stagger items
            '.stagger-item'
        );

        // Add scroll-animate class to all elements and observe them
        animatedElements.forEach(el => {
            el.classList.add('scroll-animate');
            observer.observe(el);
        });
    }
}

// Khởi tạo
if ("IntersectionObserver" in window) {
    new SkeletonLazyLoader();
    new ScrollReveal();
} else {
    // Fallback cho browsers cũ
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("img[data-src]").forEach((img) => {
            img.src = img.dataset.src;
        });
    });
}

// Add smooth parallax effect to hero background
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.destination-detail-hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        hero.style.backgroundPositionY = `${parallax}px`;
    }
});

// Video play functionality - Initialize immediately (no DOMContentLoaded needed since script loads after HTML)
function initVideoPlayer() {
    const playBtn = document.querySelector('.destination-detail-ready__play-btn');
    const videoSection = document.querySelector('.destination-detail-ready');
    const video = document.querySelector('.destination-detail-ready__video');
    
    console.log('Initializing video player...', { playBtn, video, videoSection }); // Debug log
    
    if (playBtn && video && videoSection) {
        // Click play button to show and play video
        playBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Play button clicked!'); // Debug log
            videoSection.classList.add('video-active');
            video.play();
            playBtn.style.display = 'none';
        });
        
        // Hide video when it ends
        video.addEventListener('ended', function() {
            console.log('Video ended'); // Debug log
            videoSection.classList.remove('video-active');
            playBtn.style.display = 'flex';
        });
        
        // Also hide video if user pauses it
        video.addEventListener('pause', function() {
            if (!video.ended) {
                // Optional: keep video visible when paused, or hide it
                // Uncomment below to hide on pause
                // videoSection.classList.remove('video-active');
                // playBtn.style.display = 'flex';
            }
        });
        
        console.log('Video player initialized successfully!'); // Debug log
    } else {
        console.error('Video player initialization failed - missing elements'); // Debug log
    }
}

// Initialize video player
setTimeout(initVideoPlayer, 100);

// Add hover effect to filter tabs
(function() {
    const tabs = document.querySelectorAll('.destination-detail-filter__tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll(
        '.destination-detail-pilgrimages__btn, .btn--primary, ' +
        '.destination-detail-cta__btn, .destination-detail-itinerary__button'
    );

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
})();
