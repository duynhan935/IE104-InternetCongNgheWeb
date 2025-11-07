// Build blog entries from data.json
let blogData = [];

// --- DOM ELEMENTS ---
const blogMetaContainer = document.querySelector(".blog-detail__meta");
const blogHeading = document.querySelector(".blog-detail__heading");
const articleContainer = document.querySelector(".blog-detail__article");
const commentsContainer = document.querySelector(".blog-detail__comments");
const recentPostsContainer = document.querySelector(".blog-detail__recent-blog__container");
const searchForm = document.querySelector(".blog-detail__form");
const searchInput = document.querySelector(".blog-detail__form__input");

// --- UTILITY FUNCTIONS ---

/**
 * A utility function to delay execution of a function (debounce).
 */
function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
}

// --- RENDER FUNCTIONS ---

/**
 * Renders the main content of a single blog post.
 * @param {object} post - The blog post object to render.
 */
function renderPostDetails(post) {
        if (!post) {
                document.querySelector(
                        ".blog-detail-content__left"
                ).innerHTML = `<h1 class="blog-detail__heading">404 - Post Not Found</h1>
                     <p>The post you are looking for does not exist. Please check the URL or go back to the homepage.</p>`;
                document.querySelector(".blog-detail-content__right").style.display = "none";
                return;
        }

        // 1. Render Meta Info (Author, Date, Tags)
        blogMetaContainer.innerHTML = `
                <div class="blog-detail__author">
                    <img src="${post.author.avatar}" alt="${post.author.name}" class="blog-detail__author-avatar" />
                    <span>By ${post.author.name} • Published on ${post.publishDate}</span>
                </div>
                <div class="blog-detail__tags">
                    ${post.tags.map((tag) => `<a href="#blog-detail" class="tag">${tag}</a>`).join("")}
                </div>
            `;

        // 2. Render Main Heading
        blogHeading.textContent = post.title;

        // 3. Render Article Content
        articleContainer.innerHTML = post.content
                .map((block) => {
                        switch (block.type) {
                                case "intro":
                                        return `<p class="blog-detail__article__intro">${block.text}</p>`;
                                case "paragraph":
                                        return `<p class="blog-detail__article__description">${block.text}</p>`;
                                case "subheading":
                                        return `<h2 class="blog-detail__article__subheading">${block.text}</h2>`;
                                case "image":
                                        return `<img src="${block.src}" alt="${block.alt}" class="blog-detail__article__image" />`;
                                case "blockquote":
                                        return `<blockquote>${block.text}<cite>- ${block.cite}</cite></blockquote>`;
                                case "locations": {
                                        const list = (block.items || [])
                                                .map((loc) => {
                                                        const img = loc.image_url
                                                                ? `<img src="${loc.image_url}" alt="${loc.name}" class="location-img" />`
                                                                : "";
                                                        const desc = loc.description
                                                                ? `<p class="location-desc">${loc.description}</p>`
                                                                : "";
                                                        return `
                                                                <li class="location-item">
                                                                        <div class="location-text">
                                                                                <strong class="location-name">${loc.name}</strong>
                                                                                ${desc}
                                                                        </div>
                                                                        ${img}
                                                                </li>`;
                                                })
                                                .join("");
                                        return `<ul class="locations-list">${list}</ul>`;
                                }
                                case "list":
                                        return `<ul>${block.items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
                                default:
                                        return "";
                        }
                })
                .join("");

        // 4. Render Comments
        const commentCount = post.comments.length;
        const commentHeading = commentsContainer.querySelector(".comments-heading");
        commentHeading.textContent = `${commentCount} Comment${commentCount !== 1 ? "s" : ""}`;

        const commentElements = commentsContainer.querySelectorAll(".comment");
        commentElements.forEach((el) => el.remove()); // Clear static comments

        post.comments.forEach((comment) => {
                const commentDiv = document.createElement("div");
                commentDiv.className = "comment";
                commentDiv.innerHTML = `
                    <img src="${comment.avatar}" alt="${comment.author} Avatar" class="comment-avatar" />
                    <div class="comment-body">
                        <h5 class="comment-author">${comment.author}</h5>
                        <p class="comment-text">${comment.text}</p>
                        <a href="#blog-detail" class="comment-reply">Reply</a>
                    </div>
                `;
                // Insert before the comment form
                commentsContainer.insertBefore(commentDiv, commentsContainer.querySelector(".comment-form"));
        });
}

/**
 * Renders a list of recent blog posts in the sidebar.
 * @param {Array<object>} posts - An array of blog post objects.
 */
function renderRecentPosts(posts) {
        recentPostsContainer.innerHTML = ""; // Clear existing recent posts

        if (posts.length === 0) {
                recentPostsContainer.innerHTML = "<p>No matching posts found.</p>";
                return;
        }

        posts.forEach((post) => {
                const article = document.createElement("article");
                article.className = "blog-detail__recent-blog__article";
                // Use ?id=${post.id} to simulate navigating to a different post
                article.innerHTML = `
                    <div class="blog-detail__recent-blog__image">
                        <a href="/index.html#blog-detail?id=${post.id}">
                            <img src="${post.recentImage}" alt="${post.title}" class="blog-detail__recent-blog__img" />
                        </a>
                    </div>
                    <p class="blog-detail__recent-blog__description">
                        <a href="/index.html#blog-detail?id=${post.id}">${post.title}</a>
                    </p>
                `;
                recentPostsContainer.appendChild(article);
        });
}

// --- DATA LOAD & TRANSFORM ---

function minutesToRead(text) {
        if (!text) return "5 min read";
        const words = text.split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(3, Math.round(words / 200));
        return `${minutes} min read`;
}

function buildBlogDataFromJson(json) {
        const out = [];
        const items = json?.data || [];
        let idCounter = 1;
        items.forEach((tour) => {
                const country = tour.country;
                const places = tour.places || [];
                places.forEach((place) => {
                        const img =
                                place.famous_locations?.[0]?.image_url ||
                                "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800";
                        const title = `${place.city}, ${country}: ${tour.title || "Travel Guide"}`;
                        const intro =
                                place.blog || tour.description || "Discover highlights, tips, and must-see places.";
                        const locationsDetailed = (place.famous_locations || []).map((l) => ({
                                name: l.name,
                                image_url: l.image_url,
                                description: l.description || "",
                        }));
                        const post = {
                                id: idCounter++,
                                title,
                                author: {
                                        name: "Travel Team",
                                        avatar: `https://i.pravatar.cc/40?u=${encodeURIComponent(place.city)}`,
                                },
                                publishDate: new Date().toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "long",
                                        day: "2-digit",
                                }),
                                tags: [country, place.city, "City Guide"],
                                recentImage: img,
                                content: [
                                        { type: "intro", text: intro },
                                        { type: "image", src: img, alt: `${place.city} in ${country}` },
                                        { type: "subheading", text: "Famous Locations" },
                                        { type: "locations", items: locationsDetailed },
                                        { type: "subheading", text: "Traveler Tips" },
                                        {
                                                type: "paragraph",
                                                text: "Consider visiting during shoulder seasons for fewer crowds. Book popular attractions in advance and sample local specialties for an authentic experience.",
                                        },
                                ],
                                comments: [],
                                meta: {
                                        country,
                                        city: place.city,
                                        readingTime: minutesToRead(intro),
                                },
                        };
                        out.push(post);
                });
        });
        return out;
}

async function loadData() {
        try {
                const res = await fetch("/data.json");
                const json = await res.json();
                blogData = buildBlogDataFromJson(json);
                initializeFromData();
        } catch (e) {
                console.error("Failed to load data.json", e);
                blogData = [];
                initializeFromData();
        }
}

// --- INITIALIZATION LOGIC ---

function getPostIdFromUrl() {
        // Support hash-based routing like: /index.html#blog-detail?id=2
        const hash = window.location.hash || "";
        let paramsString = "";
        if (hash.includes("?")) {
                paramsString = hash.split("?")[1];
        } else {
                paramsString = window.location.search.replace(/^\?/, "");
        }
        const params = new URLSearchParams(paramsString);
        return parseInt(params.get("id"), 10);
}

function initializeFromData() {
        let currentPostId = getPostIdFromUrl();
        if (isNaN(currentPostId)) currentPostId = blogData[0]?.id || 1;
        let currentPost = blogData.find((p) => p.id === currentPostId) || blogData[0];
        let recentPosts = blogData.filter((p) => p.id !== currentPost?.id).slice(0, 3);
        renderPostDetails(currentPost);
        renderRecentPosts(recentPosts);

        const handleSearch = () => {
                const searchTerm = (searchInput?.value || "").trim().toLowerCase();
                const filteredRecent = blogData
                        .filter((p) => p.id !== currentPost?.id)
                        .filter(
                                (p) =>
                                        p.title.toLowerCase().includes(searchTerm) ||
                                        p.tags.join(" ").toLowerCase().includes(searchTerm)
                        )
                        .slice(0, 5);
                renderRecentPosts(filteredRecent);
        };

        if (searchForm) searchForm.addEventListener("submit", (e) => e.preventDefault());
        if (searchInput) searchInput.addEventListener("input", debounce(handleSearch, 300));

        // When navigating via hash links, re-render the new post
        window.addEventListener("hashchange", () => {
                const newId = getPostIdFromUrl();
                const nextPost = blogData.find((p) => p.id === newId) || currentPost;
                currentPost = nextPost;
                renderPostDetails(currentPost);
                renderRecentPosts(blogData.filter((p) => p.id !== currentPost.id).slice(0, 3));
        });
}

loadData();
