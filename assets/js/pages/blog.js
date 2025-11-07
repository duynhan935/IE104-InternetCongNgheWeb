// =========================================================================
// Load data from data.json and normalize to blogPosts
// =========================================================================
let blogPosts = [];
let currentPage = 1;
const postsPerPage = 6;
let filteredPosts = [];

function minutesToRead(text) {
        if (!text) return "5 min read";
        const words = text.split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(3, Math.round(words / 200));
        return `${minutes} min read`;
}

function buildPostsFromData(data) {
        const items = data?.data || [];
        const posts = [];
        let idCounter = 1;
        items.forEach((tour) => {
                const country = tour.country;
                const tourId = tour.id;
                const places = tour.places || [];
                places.forEach((place, idx) => {
                        const firstImage =
                                place.famous_locations?.[0]?.image_url ||
                                "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800";
                        const title = `${place.city}, ${country}: ${tour.title || "Travel Guide"}`;
                        const description =
                                place.blog || tour.description || "Discover highlights, tips, and must-see places.";
                        posts.push({
                                id: idCounter++,
                                country,
                                tourId,
                                placeIndex: idx,
                                city: place.city,
                                title,
                                description,
                                image: firstImage,
                                category: "City Guide",
                                author: {
                                        name: "Travel Team",
                                        avatar: `https://i.pravatar.cc/32?u=${encodeURIComponent(place.city)}`,
                                },
                                date: new Date().toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "2-digit",
                                        year: "numeric",
                                }),
                                readingTime: minutesToRead(description),
                                isFeatured: false,
                        });
                });
        });
        if (posts.length > 0) posts[0].isFeatured = true;
        return posts;
}

async function loadData() {
        try {
                const res = await fetch("/data.json");
                const json = await res.json();
                blogPosts = buildPostsFromData(json);
                filteredPosts = [...blogPosts];
                initialLoad();
        } catch (e) {
                console.error("Failed to load data.json", e);
                // Fallback to empty state
                blogPosts = [];
                filteredPosts = [];
                initialLoad();
        }
}

// =========================================================================
// DOM ELEMENT VARIABLES
// =========================================================================
const blogGrid = document.querySelector(".blog-grid");
const searchForm = document.querySelector(".sidebar-widget__search-form");
const searchInput = document.querySelector(".sidebar-widget__search-input");
const categoryList = document.querySelector(".sidebar-widget__tag-list");
const featuredPostContainer = document.querySelector(".sidebar-widget__featured-post");
const recentPostsContainer = document.querySelector(".sidebar-widget__recent-posts");

const paginationContainer = document.querySelector(".pagination");
const pageNumbersSpan = document.querySelector(".page-numbers");
const firstBtn = document.querySelector(".pagination .first");
const prevBtn = document.querySelector(".pagination .prev");
const nextBtn = document.querySelector(".pagination .next");
const lastBtn = document.querySelector(".pagination .last");

// =========================================================================
// RENDER FUNCTIONS (UPDATED)
// =========================================================================

function renderPosts() {
        if (!blogGrid) return;
        blogGrid.innerHTML = "";
        const startIndex = (currentPage - 1) * postsPerPage;
        const postsToRender = filteredPosts.slice(startIndex, startIndex + postsPerPage);

        if (postsToRender.length === 0) {
                blogGrid.innerHTML = `<div class="no-posts-found"><h3>No Posts Found</h3><p>Try adjusting your search or category filter.</p></div>`;
                return;
        }

        postsToRender.forEach((post, index) => {
                const postElement = document.createElement("article");
                postElement.className = "blog-card";
                postElement.style.animationDelay = `${index * 0.1}s`; // Stagger animation
                postElement.innerHTML = `
                <a href="/index.html#blog-detail?id=${post.id}" class="blog-card__image-link">
                    <img src="${post.image}" alt="${post.title}" class="blog-card__image">
                    <span class="blog-card__category">${post.category}</span>
                </a>
                <div class="blog-card__content">
                    <h3 class="blog-card__title">
                        <a href="/index.html#blog-detail?id=${post.id}">${post.title}</a>
                    </h3>
                    <div class="blog-card__footer">
                        <div class="blog-card__author">
                            <img src="${post.author.avatar}" alt="${post.author.name}" class="blog-card__author-avatar">
                            <span>${post.author.name}</span>
                        </div>
                        <span class="blog-card__meta-info">${post.date} • ${post.readingTime}</span>
                    </div>
                </div>
            `;
                blogGrid.appendChild(postElement);
        });
}

function renderPagination() {
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        if (!paginationContainer) return;

        paginationContainer.style.display = totalPages <= 1 ? "none" : "flex";

        // Update First/Prev buttons state
        firstBtn.classList.toggle("disabled", currentPage === 1);
        prevBtn.classList.toggle("disabled", currentPage === 1);

        // Update Next/Last buttons state
        nextBtn.classList.toggle("disabled", currentPage === totalPages);
        lastBtn.classList.toggle("disabled", currentPage === totalPages);

        // Generate page number links (window size = 3)
        pageNumbersSpan.innerHTML = "";
        const windowSize = 3;
        let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
        let end = Math.min(totalPages, start + windowSize - 1);
        if (end - start + 1 < windowSize) {
                start = Math.max(1, end - windowSize + 1);
        }
        for (let i = start; i <= end; i++) {
                pageNumbersSpan.innerHTML += `<a href="#" data-page="${i}" class="${
                        i === currentPage ? "active" : ""
                }">${i}</a>`;
        }
}

function renderCategories() {
        if (!categoryList) return;
        const categories = ["All", ...new Set(blogPosts.map((p) => p.country))];
        categoryList.innerHTML = categories
                .map(
                        (cat) =>
                                `<li><a href="#" data-category="${cat}" class="${cat === "All" ? "active" : ""}">${
                                        cat === "All" ? "All Countries" : cat
                                }</a></li>`
                )
                .join("");
}

function renderFeaturedPost() {
        if (!featuredPostContainer) return;
        const featured = blogPosts.find((p) => p.isFeatured) || blogPosts[0];
        if (!featured) return;

        featuredPostContainer.innerHTML = `
            <a href="/index.html#blog-detail?id=${featured.id}">
                <img src="${featured.image}" alt="${featured.title}">
                <h4>${featured.title}</h4>
            </a>
        `;
}

// NEW: Render recent posts
function renderRecentPosts() {
        if (!recentPostsContainer) return;
        const recent = blogPosts.slice(0, 3);
        recentPostsContainer.innerHTML = recent
                .map(
                        (post) => `
            <div class="sidebar-widget__recent-post-item">
                <a href="/index.html#blog-detail?id=${post.id}">
                    <img src="${post.image}" alt="${post.title}">
                    <h5>${post.title}</h5>
                </a>
            </div>
        `
                )
                .join("");
}

function renderSkeletonCards() {
        if (!blogGrid) return;
        blogGrid.innerHTML = "";
        const itemsToRender = Math.min(postsPerPage, filteredPosts.length || postsPerPage);
        for (let i = 0; i < itemsToRender; i++) {
                const skeletonCard = document.createElement("div");
                skeletonCard.className = "skeleton-card";
                skeletonCard.innerHTML = `
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton-footer">
                        <div class="skeleton skeleton-avatar"></div>
                        <div class="skeleton skeleton-author-name"></div>
                    </div>
                </div>
            `;
                blogGrid.appendChild(skeletonCard);
        }
}

// =========================================================================
// LOGIC FUNCTIONS
// =========================================================================

function handleSearchAndFilter() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const activeCategoryLink = categoryList ? categoryList.querySelector("a.active") : null;
        const activeCategory = activeCategoryLink ? activeCategoryLink.dataset.category : "All";

        filteredPosts = blogPosts.filter((post) => {
                const matchesCategory = activeCategory === "All" || post.country === activeCategory;
                const matchesSearch =
                        post.title.toLowerCase().includes(searchTerm) ||
                        (post.description || "").toLowerCase().includes(searchTerm) ||
                        (post.city || "").toLowerCase().includes(searchTerm) ||
                        (post.country || "").toLowerCase().includes(searchTerm);
                return matchesCategory && matchesSearch;
        });

        currentPage = 1;
        updateUI();
}

function debounce(func, delay = 350) {
        let timeout;
        return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                        func.apply(this, args);
                }, delay);
        };
}

function updateUI() {
        renderSkeletonCards();
        setTimeout(() => {
                renderPosts();
                renderPagination();
        }, 300); // Reduce delay for faster feel
}

// =========================================================================
// EVENT LISTENERS
// =========================================================================

if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
                e.preventDefault();
                handleSearchAndFilter();
        });
}

if (searchInput) {
        searchInput.addEventListener("input", debounce(handleSearchAndFilter));
}

if (categoryList) {
        categoryList.addEventListener("click", (e) => {
                if (e.target.tagName === "A") {
                        e.preventDefault();
                        categoryList.querySelector("a.active").classList.remove("active");
                        e.target.classList.add("active");
                        handleSearchAndFilter();
                }
        });
}

function handlePageChange(newPage) {
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

        currentPage = newPage;
        const blogContainer = document.querySelector(".blog__container");
        if (blogContainer) {
                blogContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        updateUI();
}

if (paginationContainer) {
        firstBtn.addEventListener("click", (e) => {
                e.preventDefault();
                handlePageChange(1);
        });
        prevBtn.addEventListener("click", (e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
        });
        nextBtn.addEventListener("click", (e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
        });
        lastBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
                handlePageChange(totalPages);
        });
        pageNumbersSpan.addEventListener("click", (e) => {
                if (e.target.tagName === "A" && e.target.dataset.page) {
                        e.preventDefault();
                        handlePageChange(parseInt(e.target.dataset.page, 10));
                }
        });
}

// =========================================================================
// INITIAL LOAD
// =========================================================================
function initialLoad() {
        renderCategories();
        renderFeaturedPost();
        renderRecentPosts();
        updateUI();
}

loadData();
