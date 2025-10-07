// --- FAKE DATA ---
// Trong một ứng dụng thực tế, dữ liệu này sẽ được lấy từ API
const blogPosts = [
        {
                id: 1,
                image: "../assets/images/blogs/demo.png",
                title: "On the Shores of a Pink Lake in Australia",
                description: "Experience the surreal beauty of Lake Hillier...",
                content: [
                        {
                                heading: "A Natural Wonder",
                                image: {
                                        src: "../assets/images/blogs/demo.png",
                                        alt: "Pink Lake from above",
                                },
                                paragraph: "Lake Hillier is a saline lake on the edge of Middle Island, the largest of the islands that make up the Recherche Archipelago in the Goldfields-Esperance region, off the south coast of Western Australia. It is particularly notable for its pink colour.",
                        },
                        {
                                heading: "Why is it Pink?",
                                image: {
                                        src: "../assets/images/blogs/demo.png",
                                        alt: "Close up of pink water",
                                },
                                paragraph: "The most likely explanation for the lake’s pink hue involves the presence of the microorganism Dunaliella salina. These salt-loving photosynthetic microorganisms generate energy by using other parts of the visible light spectrum except for the orange/red frequencies.",
                        },
                ],
        },
        {
                id: 2,
                image: "../assets/images/blogs/demo.png",
                title: "Exploring Argentina and Chile by Bus",
                description: "A comprehensive guide to backpacking through Patagonia...",
                content: [
                        {
                                heading: "The Journey Begins",
                                image: {
                                        src: "../assets/images/blogs/demo.png",
                                        alt: "Bus travelling through the mountains",
                                },
                                paragraph: "Sitting serenely on the turquoise coasts of the Caribbean Sea lie two properties that embody paradise in quiet luxury. Park Hyatt St. Kitts and Andaz Mayakoba are the answers to your desires for a sun-filled ocean getaway.",
                        },
                        {
                                heading: "Crossing the Andes",
                                image: {
                                        src: "../assets/images/blogs/demo.png",
                                        alt: "The Andes mountain range",
                                },
                                paragraph: "Whether vacationing with the whole family, or lounging your time away with a loved one, both properties capture the essence of resort living on beautiful grounds with unforgettable itineraries.",
                        },
                        {
                                heading: "Patagonian Wonders",
                                image: {
                                        src: "../assets/images/blogs/demo.png",
                                        alt: "Fitz Roy mountain in Patagonia",
                                },
                                paragraph: "From the jagged peaks of Fitz Roy to the sprawling glaciers of Perito Moreno, Patagonia is a land of untamed beauty. Traveling by bus allows for spontaneous stops and a deeper connection with the dramatic landscapes of both Argentina and Chile.",
                        },
                ],
        },
];

// --- DOM ELEMENTS ---
const headingElement = document.querySelector(".blog-detail__heading");
const mainContentContainer = document.querySelector(".blog-detail-content__left");
const recentPostsContainer = document.querySelector(".blog-detail__recent-blog__container");
const searchForm = document.querySelector(".blog-detail__form");
const searchInput = document.querySelector(".blog-detail__form__input");

// --- FUNCTIONS ---

/**
 * Renders the main content of a single blog post.
 * @param {object} post - The blog post object to render.
 */
function renderPostDetails(post) {
        if (!post) {
                mainContentContainer.innerHTML = '<h2 class="blog-detail__heading">Post not found!</h2>';
                return;
        }

        // 1. Update main post title
        headingElement.textContent = post.title;

        // 2. Clear existing articles and render new ones
        const existingArticles = mainContentContainer.querySelectorAll(".blog-detail__article");
        existingArticles.forEach((article) => article.remove());

        post.content.forEach((articleData) => {
                const articleElement = document.createElement("article");
                articleElement.className = "blog-detail__article";
                articleElement.innerHTML = `
                    <h3 class="blog-detail__article__content">${articleData.heading}</h3>
                    <img
                        src="${articleData.image.src}"
                        alt="${articleData.image.alt}"
                        class="blog-detail__article__image"
                    />
                    <p class="blog-detail__article__description">
                        ${articleData.paragraph}
                    </p>
                `;
                mainContentContainer.appendChild(articleElement);
        });
}

/**
 * Renders a list of recent blog posts in the sidebar.
 * @param {Array<object>} posts - An array of blog post objects.
 */
function renderRecentPosts(posts) {
        recentPostsContainer.innerHTML = ""; // Clear existing recent posts
        if (posts.length === 0) {
                recentPostsContainer.innerHTML = "<p>No recent posts found.</p>";
                return;
        }

        posts.forEach((post) => {
                const article = document.createElement("article");
                article.className = "blog-detail__recent-blog__article";
                // Use ?id=${post.id} to simulate navigating to a different post
                article.innerHTML = `
                    <div class="blog-detail__recent-blog__image">
                        <a href="?id=${post.id}">
                            <img src="${post.image}" alt="${post.title}" class="blog-detail__recent-blog__img" />
                        </a>
                    </div>
                    <p class="blog-detail__recent-blog__description">
                        <a href="?id=${post.id}">${post.title}</a>
                    </p>
                `;
                recentPostsContainer.appendChild(article);
        });
}

/**
 * A utility function to delay execution of a function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} A new debounced function.
 */
function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
}

// --- INITIALIZATION LOGIC ---

// 1. Get post ID from URL query parameter (e.g., blog-detail.html?id=2)
const urlParams = new URLSearchParams(window.location.search);
let postId = parseInt(urlParams.get("id"), 10);

// If no ID is found in URL, default to the first post
if (isNaN(postId)) {
        postId = blogPosts[0]?.id || 1;
}

// 2. Find the current post and the list of recent posts
const currentPost = blogPosts.find((p) => p.id === postId);
const recentPosts = blogPosts.filter((p) => p.id !== postId);

// 3. Render the content
renderPostDetails(currentPost);
renderRecentPosts(recentPosts);

// 4. Setup sidebar search logic
const handleSidebarSearch = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        // Filter the original list of recent posts
        const filteredRecent = recentPosts.filter((p) => p.title.toLowerCase().includes(searchTerm));
        renderRecentPosts(filteredRecent);
};

searchForm.addEventListener("submit", (e) => e.preventDefault());
searchInput.addEventListener("input", debounce(handleSidebarSearch, 300));
