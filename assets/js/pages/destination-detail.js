const PRICE_FORMATTER_VND = new Intl.NumberFormat("vi-VN", {
	style: "currency",
	currency: "VND",
	maximumFractionDigits: 0,
});

const FALLBACKS = {
	hero: "../assets/images/destination-detail/background.jpg",
	missionImage: "../assets/images/destination-detail/mission.jpg",
	cardImage: "../assets/images/destination-detail/background.jpg",
	avatars: [
		"../assets/images/destination-detail/ava1.jpg",
		"../assets/images/destination-detail/ava2.jpg",
		"../assets/images/destination-detail/ava3.jpg",
	],
	quote: "../assets/images/destination-detail/quote.png",
};

function normalizeText(value) {
	if (typeof value !== "string") return "";
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
}

const state = {
	destination: null,
	tours: [],
	insights: [],
	visibleInsights: 0,
};

const INSIGHT_STORAGE_KEY = "destinationDetail:selectedInsightArticle";
const INSIGHT_STORAGE_ID_KEY = "destinationDetail:selectedInsightArticleId";

let skeletonLoaderInstance = null;
let scrollRevealInstance = null;

class SkeletonLazyLoader {
	constructor() {
		this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
			rootMargin: "50px",
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
		const lazyImages = document.querySelectorAll("img[data-src]");
		lazyImages.forEach((img) => {
			this.wrapImageWithSkeleton(img);
			this.observer.observe(img);
		});
	}

	wrapImageWithSkeleton(img) {
		if (!img || !img.parentElement || img.parentElement.classList.contains("skeleton-wrapper")) {
			return;
		}

		const preserveSizeClasses = [
			"destination-detail-mission__img",
			"destination-detail-ready__background",
			"destination-detail-ready__image",
			"destination-detail-gallery__main-image",
			"destination-detail-gallery__thumb",
		];

		const shouldPreserveSize = preserveSizeClasses.some((className) => img.classList.contains(className));

		const wrapper = document.createElement("div");
		wrapper.className = "skeleton-wrapper skeleton-loading";

		if (img.className) {
			img.className
				.split(" ")
				.filter(Boolean)
				.forEach((cls) => {
					if (!wrapper.classList.contains(cls)) {
						wrapper.classList.add(cls);
					}
				});
		}

		img.parentNode.insertBefore(wrapper, img);
		wrapper.appendChild(img);

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
		const imageLoader = new Image();

		imageLoader.onload = () => {
			img.src = src;
			img.classList.add("loaded");

			if (wrapper) {
				wrapper.classList.remove("skeleton-loading");
				wrapper.classList.add("skeleton-loaded");
			}
		};

		imageLoader.onerror = () => {
			img.alt = img.alt || "Image not available";
			if (wrapper) {
				wrapper.classList.remove("skeleton-loading");
				wrapper.classList.add("skeleton-error");
			}
		};

		imageLoader.src = src;
	}
}

class ScrollReveal {
	constructor() {
		this.init();
	}

	init() {
		const observerOptions = {
			threshold: 0.15,
			rootMargin: "0px 0px -80px 0px",
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("animate-in");
					observer.unobserve(entry.target);
				}
			});
		}, observerOptions);

		const animatedElements = document.querySelectorAll(
			".destination-detail-popular, .destination-detail-mission, " +
				".destination-detail-mission__image, .destination-detail-mission__text, " +
				".destination-detail-mission__stat, .destination-detail-ready, " +
				".destination-detail-ready__overlay, .destination-detail-pilgrimages, " +
				".destination-detail-gallery, .destination-detail-itinerary, " +
				".destination-detail-cta, .destination-detail-cta__overlay, " +
				".destination-detail-insights, .destination-detail-testimonials, " +
				".destination-detail-card, .destination-detail-pilgrimages__card, " +
				".destination-detail-insights__card, .destination-detail-testimonials__item, " +
				".stagger-item"
		);

		animatedElements.forEach((el) => {
			el.classList.add("scroll-animate");
			observer.observe(el);
		});
	}
}

function initDestinationDetailPage() {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", loadDestinationData);
	} else {
		loadDestinationData();
	}
}

initDestinationDetailPage();

async function loadDestinationData() {
	const destinationId = window.currentPageParams?.id;

	try {
		const [destinationsResponse, toursResponse] = await Promise.all([
			fetch("./data.json"),
			fetch("./tours.json"),
		]);

		if (!destinationsResponse.ok) {
			throw new Error(`Failed to load data.json (${destinationsResponse.status})`);
		}

		if (!toursResponse.ok) {
			throw new Error(`Failed to load tours.json (${toursResponse.status})`);
		}

		const destinationsJson = await destinationsResponse.json();
		const toursJson = await toursResponse.json();

		const destinations = Array.isArray(destinationsJson.data) ? destinationsJson.data : [];
		const tours = Array.isArray(toursJson.tours) ? toursJson.tours : [];

		if (!destinations.length) {
			throw new Error("Destination dataset is empty");
		}

		const selectedDestination =
			destinations.find((item) => item.id === destinationId) || destinations[0];

		if (!selectedDestination) {
			throw new Error("Destination not found");
		}

		state.destination = selectedDestination;
		state.tours = tours.filter((tour) => tour.destination_id === selectedDestination.id);
		state.insights = buildInsightsData(selectedDestination);
		state.visibleInsights = Math.min(6, state.insights.length);

		renderDestinationPage(selectedDestination, state.tours);
		initializeEnhancements();
	} catch (error) {
		console.error("Failed to initialise destination detail page:", error);
		showDestinationError();
	}
}

// Collect famous locations for the insights grid
function buildInsightsData(destination) {
	const insights = [];
	const places = Array.isArray(destination.places) ? destination.places : [];

	places.forEach((place) => {
		const locations = Array.isArray(place.famous_locations) ? place.famous_locations : [];
		locations.forEach((location) => {
			insights.push({
				title: location.name || place.city || destination.country,
				image: location.image_url || FALLBACKS.cardImage,
				city: place.city || destination.country,
			});
		});
	});

	return insights;
}

function findTourForCity(city, tours) {
	if (!city || !Array.isArray(tours) || !tours.length) {
		return null;
	}

	const cityToken = normalizeText(city);
	if (!cityToken) return tours[0] || null;

	const matchesCity = (text) => (text ? normalizeText(text).includes(cityToken) : false);

	const tourMatch = tours.find((tour) => {
		if (!tour) return false;
		if (matchesCity(tour.title)) return true;
		if (matchesCity(tour.overview)) return true;
		if (matchesCity(tour.type)) return true;
		if (Array.isArray(tour.highlights) && tour.highlights.some((item) => matchesCity(item))) {
			return true;
		}
		if (Array.isArray(tour.itinerary)) {
			const itineraryHasMatch = tour.itinerary.some((day) => {
				if (!day) return false;
				if (matchesCity(day.title)) return true;
				if (Array.isArray(day.activities) && day.activities.some((activity) => matchesCity(activity))) {
					return true;
				}
				return false;
			});
			if (itineraryHasMatch) return true;
		}
		return false;
	});

	return tourMatch || tours[0] || null;
}

function renderDestinationPage(destination, tours) {
	renderHero(destination);
	renderPopularPlaces(destination);
	renderMission(destination);
	renderReadySection(destination);
	renderPilgrimages(destination, tours);
	renderCTA(destination);
	renderInsights();
	renderTestimonials(destination);
}

function renderHero(destination) {
	const heroTitle = document.querySelector(".destination-detail-hero__title");
	if (heroTitle) {
			heroTitle.textContent = destination.title || `Khám phá ${destination.country || "điểm đến"}`;
	}

	const heroSubtitle = document.querySelector(".destination-detail-hero__subtitle");
	if (heroSubtitle) {
		const subtitleParts = [];
		if (destination.days) subtitleParts.push(`${destination.days} ngày`);
		if (destination.rating) subtitleParts.push(`Đánh giá ${destination.rating.toFixed(1)}/5`);
		if (destination.country) subtitleParts.push(destination.country);
		heroSubtitle.textContent = subtitleParts.length
			? subtitleParts.join(" • ")
			: "Trải nghiệm đáng nhớ cùng chúng tôi";
	}

	const heroSection = document.querySelector(".destination-detail-hero");
	if (heroSection) {
		const heroImage = getPrimaryImage(destination);
		heroSection.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 40%), url(${heroImage})`;
	}
}

function renderPopularPlaces(destination) {
	const container = document.querySelector(".destination-detail-popular__container");
	if (!container) return;

	container.innerHTML = "";

	const places = Array.isArray(destination.places) ? destination.places : [];

	if (!places.length) {
		const empty = document.createElement("p");
		empty.className = "destination-detail-empty";
		empty.textContent = "Chúng tôi sẽ sớm cập nhật các địa điểm nổi bật.";
		container.appendChild(empty);
		return;
	}

	places.slice(0, 4).forEach((place) => {
		const firstLocation =
			Array.isArray(place.famous_locations) && place.famous_locations.length
				? place.famous_locations[0]
				: null;

		const imageUrl = firstLocation && firstLocation.image_url ? firstLocation.image_url : FALLBACKS.cardImage;
		const matchingTour = findTourForCity(place.city, state.tours);

		const card = document.createElement("div");
		card.className = "destination-detail-card";
		card.setAttribute("role", "listitem");

		const image = document.createElement("img");
		image.className = "destination-detail-card__img";
		image.setAttribute("width", "230");
		image.setAttribute("height", "212");
		image.dataset.src = imageUrl;
		image.alt = firstLocation && firstLocation.name
			? `${firstLocation.name} - ${place.city}`
			: `${place.city || destination.country}`;

		const content = document.createElement("div");
		content.className = "destination-detail-card__content";

		const nameEl = document.createElement("h3");
		nameEl.className = "destination-detail-card__name";
		nameEl.textContent = place.city || destination.country || "Điểm đến";

		const locationEl = document.createElement("p");
		locationEl.className = "destination-detail-card__location";
		locationEl.textContent = firstLocation && firstLocation.name
			? `${firstLocation.name}, ${destination.country || ""}`
			: destination.country || "";

		content.appendChild(nameEl);
		content.appendChild(locationEl);

		card.appendChild(image);
		card.appendChild(content);

		if (matchingTour) {
			card.dataset.tourId = matchingTour.id;
			card.tabIndex = 0;
			card.classList.add("destination-detail-card--interactive");
			card.setAttribute(
				"aria-label",
				`Xem tour ${matchingTour.title || "chi tiết"} tại ${place.city || destination.country || "điểm đến"}`
			);

			const handleNavigation = (event) => {
				event.preventDefault();
				navigateToTour(matchingTour.id);
			};

			card.addEventListener("click", handleNavigation);
			card.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					handleNavigation(event);
				}
			});
		} else {
			card.setAttribute("aria-disabled", "true");
			card.classList.add("destination-detail-card--inactive");
		}

		container.appendChild(card);
	});

	refreshScrollReveal();
	triggerLazyRefresh();
}

function renderMission(destination) {
	const missionImage = document.querySelector(".destination-detail-mission__img");
	if (missionImage) {
		missionImage.dataset.src = getPrimaryImage(destination) || FALLBACKS.missionImage;
		missionImage.alt = `${destination.country || "Điểm đến"} - Hình ảnh nổi bật`;
		if (missionImage.getAttribute("src")) {
			missionImage.removeAttribute("src");
		}
	}

	const missionTitle = document.querySelector(".destination-detail-mission__title");
	if (missionTitle) {
		missionTitle.textContent = destination.country
			? `Sứ mệnh của chúng tôi: đưa bạn đến gần ${destination.country} hơn`
			: "Sứ mệnh của chúng tôi là tạo nên hành trình đáng nhớ";
	}

	const missionDescriptions = document.querySelectorAll(".destination-detail-mission__desc");
	if (missionDescriptions.length) {
		missionDescriptions[0].textContent =
			destination.description || "Chúng tôi luôn tìm kiếm những trải nghiệm chân thực và giàu cảm xúc nhất cho bạn.";
		if (missionDescriptions[1]) {
			const placeBlogs = (destination.places || [])
				.map((place) => place.blog)
				.filter(Boolean);
			missionDescriptions[1].textContent =
				placeBlogs.length > 0
					? getExcerpt(placeBlogs[0], 220)
					: "Mỗi chuyến đi là cơ hội để kết nối, để cảm nhận và để lưu giữ ký ức trọn vẹn.";
		}
	}

	const stats = {
		days: destination.days ? `${destination.days} ngày` : "--",
		cities: Array.isArray(destination.places) ? `${destination.places.length} thành phố` : "--",
		rating: destination.rating ? `${destination.rating.toFixed(1)}/5` : "--",
	};

	Object.keys(stats).forEach((key) => {
		const statEl = document.querySelector(`[data-destination-stat="${key}"]`);
		if (statEl) {
			statEl.textContent = stats[key];
		}
	});

	const joinButton = document.querySelector(".btn.btn--primary");
	if (joinButton && destination.country) {
		joinButton.dataset.country = destination.country;
		joinButton.setAttribute("aria-label", `Xem tất cả tour ${destination.country}`);
	}

	triggerLazyRefresh();
}

function renderReadySection(destination) {
	const readyText = document.querySelector(".destination-detail-ready__text");
	if (readyText) {
		readyText.textContent = destination.country
			? `trải nghiệm ${destination.country} theo cách của riêng bạn`
			: "trải nghiệm hành trình mới và trọn vẹn trong cuộc sống";
	}
}

function renderPilgrimages(destination, tours) {
	const container = document.querySelector(".destination-detail-pilgrimages__cards");
	if (!container) return;

	container.innerHTML = "";

	if (!tours.length) {
		const empty = document.createElement("p");
		empty.className = "destination-detail-pilgrimages__empty";
		empty.textContent = `Hiện chưa có tour khả dụng cho ${destination.country || "điểm đến này"}.`;
		container.appendChild(empty);
		return;
	}

	tours.forEach((tour) => {
		const card = document.createElement("div");
		card.className = "destination-detail-pilgrimages__card";
		card.tabIndex = 0;
		card.dataset.tourId = tour.id;

		const imageWrapper = document.createElement("div");
		imageWrapper.className = "destination-detail-pilgrimages__image-wrapper";

		const img = document.createElement("img");
		img.className = "destination-detail-pilgrimages__image";
		img.dataset.src = tour.main_image || getPrimaryImage(destination) || FALLBACKS.cardImage;
		img.alt = tour.title || `Tour khám phá ${destination.country || "đặc sắc"}`;
		img.setAttribute("loading", "lazy");

		const date = document.createElement("span");
		date.className = "destination-detail-pilgrimages__date";
		date.textContent = tour.next_departure || "Khởi hành linh hoạt";

		imageWrapper.appendChild(img);
		imageWrapper.appendChild(date);

		const content = document.createElement("div");
		content.className = "destination-detail-pilgrimages__content";

		const status = document.createElement("div");
		status.className = "destination-detail-pilgrimages__status";

		const badge = document.createElement("span");
		const badgeModifier = tour.discount_percent > 0 ? "pink" : "blue";
		badge.className = `destination-detail-pilgrimages__badge destination-detail-pilgrimages__badge--${badgeModifier}`;
		badge.textContent =
			tour.discount_percent > 0 ? `Giảm ${tour.discount_percent}%` : "Còn chỗ";

		const days = document.createElement("span");
		days.className = "destination-detail-pilgrimages__days";
		days.textContent = tour.duration_days ? `${tour.duration_days} ngày` : "Linh hoạt";

		status.appendChild(badge);
		status.appendChild(days);

		const title = document.createElement("h3");
		title.className = "destination-detail-pilgrimages__card-title";
		title.textContent = tour.title || `Hành trình ${destination.country || "đáng nhớ"}`;

		const desc = document.createElement("p");
		desc.className = "destination-detail-pilgrimages__desc";
		desc.textContent = tour.overview || "Trải nghiệm nổi bật đang chờ đón bạn.";

		const chaplain = document.createElement("p");
		chaplain.className = "destination-detail-pilgrimages__chaplain";
		const highlightCities = (destination.places || []).map((place) => place.city).filter(Boolean).slice(0, 3);
		chaplain.innerHTML = `Điểm đến nổi bật<br /><strong>${highlightCities.join(", ")}</strong>`;

		const footer = document.createElement("div");
		footer.className = "destination-detail-pilgrimages__footer";

		const price = document.createElement("span");
		price.className = "destination-detail-pilgrimages__price";
		const priceValue = formatPriceVND(tour.price);
		price.innerHTML = `${priceValue}<small>/Khách</small>`;

		const ctaButton = document.createElement("button");
		ctaButton.type = "button";
		ctaButton.className = "destination-detail-pilgrimages__btn";
		ctaButton.setAttribute("aria-label", `Xem chi tiết ${tour.title || "tour"}`);
		ctaButton.textContent = "Xem chi tiết";

		footer.appendChild(price);
		footer.appendChild(ctaButton);

		content.appendChild(status);
		content.appendChild(title);
		content.appendChild(desc);
		content.appendChild(chaplain);
		content.appendChild(footer);

		card.appendChild(imageWrapper);
		card.appendChild(content);

		card.addEventListener("click", () => navigateToTour(tour.id));
		card.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				navigateToTour(tour.id);
			}
		});
		ctaButton.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			navigateToTour(tour.id);
		});

		container.appendChild(card);
	});

	refreshScrollReveal();
	triggerLazyRefresh();
}

function renderCTA(destination) {
	const ctaTitle = document.querySelector(".destination-detail-cta__title");
	if (ctaTitle) {
		const countryLabel = destination.country || "ngay hôm nay";
		ctaTitle.innerHTML = `Đừng bỏ lỡ giảm 10% nếu<br>bạn đặt tour ${countryLabel}`;
	}

	const ctaButton = document.querySelector(".destination-detail-cta__btn");
	if (ctaButton) {
		if (state.tours.length) {
			const primaryTour = state.tours[0];
			ctaButton.setAttribute("href", `#tour-details?id=${encodeURIComponent(primaryTour.id)}`);
			ctaButton.setAttribute("aria-label", `Liên hệ để đặt tour ${primaryTour.title}`);
		} else {
			ctaButton.setAttribute("href", "#tours");
			ctaButton.setAttribute("aria-label", "Xem thêm tour");
		}
	}
}

function renderInsights() {
	state.visibleInsights = Math.min(
		state.visibleInsights || Math.min(6, state.insights.length),
		state.insights.length
	);
	updateInsightsGrid();
	setupInsightsLoadMoreButton();
}

function updateInsightsGrid() {
	const grid = document.querySelector(".destination-detail-insights__grid");
	if (!grid) return;

	grid.innerHTML = "";

	if (!state.insights.length) {
		const empty = document.createElement("p");
		empty.className = "destination-detail-empty";
		empty.textContent = "Đang cập nhật bài viết nổi bật.";
		grid.appendChild(empty);
		return;
	}

	const visibleItems = state.insights.slice(0, state.visibleInsights || state.insights.length);

	visibleItems.forEach((item) => {
		const article = document.createElement("article");
		article.className = "destination-detail-insights__card";

		const link = document.createElement("a");
		link.className = "destination-detail-insights__link";
		link.href = item.articleUrl || "#blog";
		link.setAttribute("data-insight-id", item.id);
		link.setAttribute("aria-label", `Đọc bài viết ${item.title}`);

		link.addEventListener("click", () => {
			handleInsightNavigation(item);
		});

		const img = document.createElement("img");
		img.className = "destination-detail-insights__image";
		img.dataset.src = item.image || FALLBACKS.cardImage;
		img.alt = `${item.title}${item.city ? ` - ${item.city}` : ""}`;
		img.setAttribute("loading", "lazy");

		const content = document.createElement("div");
		content.className = "destination-detail-insights__content";

		const title = document.createElement("h3");
		title.className = "destination-detail-insights__title";
		title.textContent = item.title;
		content.appendChild(title);

		if (item.city) {
			const location = document.createElement("p");
			location.className = "destination-detail-insights__location";
			location.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${item.city}`;
			content.appendChild(location);
		}

		if (item.excerpt) {
			const excerpt = document.createElement("p");
			excerpt.className = "destination-detail-insights__excerpt";
			excerpt.textContent = item.excerpt;
			content.appendChild(excerpt);
		}

		const readMore = document.createElement("span");
		readMore.className = "destination-detail-insights__read-more";
		readMore.innerHTML = 'Đọc bài viết <i class="fa fa-arrow-right" aria-hidden="true"></i>';
		content.appendChild(readMore);

		link.appendChild(img);
		link.appendChild(content);
		article.appendChild(link);
		grid.appendChild(article);
	});

	refreshScrollReveal();
	triggerLazyRefresh();
}

function setupInsightsLoadMoreButton() {
	const loadMoreBtn = document.querySelector(".destination-detail-insights__load-btn");
	if (!loadMoreBtn) return;

	if (state.insights.length <= state.visibleInsights) {
		loadMoreBtn.style.display = "none";
		return;
	}

	loadMoreBtn.style.display = "inline-flex";
	loadMoreBtn.disabled = false;
	loadMoreBtn.innerHTML = 'Tải thêm <i class="fa fa-chevron-down" aria-hidden="true"></i>';

	if (loadMoreBtn.dataset.bound === "true") return;

	loadMoreBtn.dataset.bound = "true";
	loadMoreBtn.addEventListener("click", () => {
		state.visibleInsights = state.insights.length;
		updateInsightsGrid();
		loadMoreBtn.innerHTML = "Đã hiển thị tất cả";
		loadMoreBtn.disabled = true;
	});
}

function renderTestimonials(destination) {
	const list = document.querySelector(".destination-detail-testimonials__list");
	if (!list) return;

	list.innerHTML = "";

	const places = Array.isArray(destination.places) ? destination.places : [];
	const testimonials = places.slice(0, 3).map((place, index) => ({
		text: getExcerpt(place.blog, 180),
		name: place.city || destination.country || "Hành khách",
		role: destination.country || "Khách hành hương",
		avatar: FALLBACKS.avatars[index % FALLBACKS.avatars.length],
	}));

	if (!testimonials.length) {
		const empty = document.createElement("p");
		empty.className = "destination-detail-empty";
		empty.textContent = "Chưa có đánh giá cho điểm đến này.";
		list.appendChild(empty);
		return;
	}

	testimonials.forEach((item) => {
		const wrapper = document.createElement("div");
		wrapper.className = "destination-detail-testimonials__item";

		const quote = document.createElement("img");
		quote.className = "destination-detail-testimonial__quote";
		quote.dataset.src = FALLBACKS.quote;
		quote.alt = "";
		quote.setAttribute("loading", "lazy");

		const textEl = document.createElement("p");
		textEl.className = "destination-detail-testimonials__text";
		textEl.textContent = item.text;

		const nameEl = document.createElement("h4");
		nameEl.className = "destination-detail-testimonials__name";
		nameEl.textContent = `- ${item.name}`;

		const roleEl = document.createElement("p");
		roleEl.className = "destination-detail-testimonials__role";
		roleEl.textContent = item.role;

		const rating = document.createElement("div");
		rating.className = "destination-detail-testimonials__rating";
		const ratingValue = state.destination && state.destination.rating
			? state.destination.rating.toFixed(1)
			: "4.5";
		rating.setAttribute("aria-label", `Đánh giá: ${ratingValue} trên 5 sao`);

		const starIcon = document.createElement("i");
		starIcon.className = "fa-solid fa-star";
		starIcon.setAttribute("aria-hidden", "true");

		const ratingText = document.createElement("span");
		ratingText.textContent = ratingValue;

		rating.appendChild(starIcon);
		rating.appendChild(ratingText);

		const avatar = document.createElement("img");
		avatar.className = "destination-detail-testimonials__avatar";
		avatar.dataset.src = item.avatar;
		avatar.alt = `Chân dung ${item.name}`;
		avatar.setAttribute("loading", "lazy");

		wrapper.appendChild(quote);
		wrapper.appendChild(textEl);
		wrapper.appendChild(nameEl);
		wrapper.appendChild(roleEl);
		wrapper.appendChild(rating);
		wrapper.appendChild(avatar);

		list.appendChild(wrapper);
	});

	refreshScrollReveal();
	triggerLazyRefresh();
}

function initTestimonialsNavigation() {
	const list = document.querySelector(".destination-detail-testimonials__list");
	const prevBtn = document.querySelector('.destination-detail-testimonials__btn[aria-label="Lời chứng trước"]');
	const nextBtn = document.querySelector('.destination-detail-testimonials__btn[aria-label="Lời chứng tiếp"]');

	if (!list || !prevBtn || !nextBtn) return;

	if (!prevBtn.dataset.bound) {
		prevBtn.dataset.bound = "true";
		prevBtn.addEventListener("click", () => {
			list.scrollBy({ left: -list.clientWidth, behavior: "smooth" });
		});
	}

	if (!nextBtn.dataset.bound) {
		nextBtn.dataset.bound = "true";
		nextBtn.addEventListener("click", () => {
			list.scrollBy({ left: list.clientWidth, behavior: "smooth" });
		});
	}
}

function formatPriceVND(value) {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return PRICE_FORMATTER_VND.format(0);
	}
	return PRICE_FORMATTER_VND.format(value);
}

function getPrimaryImage(destination) {
	const places = Array.isArray(destination.places) ? destination.places : [];

	for (let i = 0; i < places.length; i += 1) {
		const place = places[i];
		if (Array.isArray(place.famous_locations) && place.famous_locations.length) {
			const candidate = place.famous_locations[0];
			if (candidate && candidate.image_url) {
				return candidate.image_url;
			}
		}
	}

	return FALLBACKS.hero;
}

function getExcerpt(text, maxLength) {
	if (!text) return "";
	if (text.length <= maxLength) return text;

	const truncated = text.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");
	const base = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
	return `${base}...`;
}

function navigateToTour(tourId) {
	if (!tourId) return;
	window.location.hash = `tour-details?id=${encodeURIComponent(tourId)}`;
}

function initializeEnhancements() {
	if ("IntersectionObserver" in window) {
		skeletonLoaderInstance = new SkeletonLazyLoader();
		refreshScrollReveal();
		setTimeout(triggerLazyRefresh, 350);
	} else {
		triggerLazyRefresh();
	}

	initVideoPlayer();
	initRippleEffects();
	initFilterTabs();
	initTestimonialsNavigation();
	initJoinButton();
}

function refreshScrollReveal() {
	if (!("IntersectionObserver" in window)) return;
	scrollRevealInstance = new ScrollReveal();
}

function triggerLazyRefresh() {
	if (skeletonLoaderInstance && typeof skeletonLoaderInstance.setupLazy === "function") {
		skeletonLoaderInstance.setupLazy();
		return;
	}

	if (!("IntersectionObserver" in window)) {
		document.querySelectorAll("img[data-src]").forEach((img) => {
			if (!img.getAttribute("src")) {
				const source = img.dataset.src || FALLBACKS.cardImage;
				img.setAttribute("src", source);
			}
		});
	}
}

function initVideoPlayer() {
	const playBtn = document.querySelector(".destination-detail-ready__play-btn");
	const videoSection = document.querySelector(".destination-detail-ready");
	const video = document.querySelector(".destination-detail-ready__video");

	if (!playBtn || !videoSection || !video) return;
	if (playBtn.dataset.bound === "true") return;

	playBtn.dataset.bound = "true";

	playBtn.addEventListener("click", (event) => {
		event.preventDefault();
		videoSection.classList.add("video-active");
		video.play();
		playBtn.style.display = "none";
	});

	video.addEventListener("ended", () => {
		videoSection.classList.remove("video-active");
		playBtn.style.display = "flex";
	});
}

function initJoinButton() {
	const joinButton = document.querySelector(".btn.btn--primary");
	if (!joinButton) return;

	joinButton.addEventListener("click", (event) => {
		event.preventDefault();
		const country = joinButton.dataset.country;
		if (country) {
			// Navigate to tours page with country filter
			window.location.hash = `tours?location=${encodeURIComponent(country)}`;
		} else {
			// Fallback to tours page without filter
			window.location.hash = "tours";
		}
	});
}

function initRippleEffects() {
	const buttons = document.querySelectorAll(
		".destination-detail-pilgrimages__btn, .btn--primary, .destination-detail-cta__btn, .destination-detail-itinerary__button"
	);

	buttons.forEach((button) => {
		if (button.dataset.rippleBound === "true") return;

		button.dataset.rippleBound = "true";

		button.addEventListener("click", (event) => {
			const rect = button.getBoundingClientRect();
			const size = Math.max(rect.width, rect.height);
			const ripple = document.createElement("span");
			ripple.className = "ripple";

			const clientX = event.clientX || rect.left + rect.width / 2;
			const clientY = event.clientY || rect.top + rect.height / 2;

			ripple.style.width = `${size}px`;
			ripple.style.height = `${size}px`;
			ripple.style.left = `${clientX - rect.left - size / 2}px`;
			ripple.style.top = `${clientY - rect.top - size / 2}px`;

			button.appendChild(ripple);
			setTimeout(() => ripple.remove(), 600);
		});
	});
}

function initFilterTabs() {
	const tabs = document.querySelectorAll(".destination-detail-filter__tab");
	if (!tabs.length) return;

	tabs.forEach((tab) => {
		if (tab.dataset.bound === "true") return;
		tab.dataset.bound = "true";

		tab.addEventListener("click", function () {
			tabs.forEach((item) => item.classList.remove("active"));
			this.classList.add("active");
		});
	});
}

function showDestinationError() {
	const heroTitle = document.querySelector(".destination-detail-hero__title");
	if (heroTitle) {
		heroTitle.textContent = "Không thể tải thông tin điểm đến";
	}

	const heroSubtitle = document.querySelector(".destination-detail-hero__subtitle");
	if (heroSubtitle) {
		heroSubtitle.textContent = "Vui lòng thử lại sau hoặc chọn một hành trình khác.";
	}

	const sections = document.querySelectorAll(
		".destination-detail-popular, .destination-detail-mission, .destination-detail-ready, " +
			".destination-detail-pilgrimages, .destination-detail-cta, .destination-detail-insights, " +
			".destination-detail-testimonials"
	);

	sections.forEach((section) => {
		section.setAttribute("hidden", "true");
	});
}

window.addEventListener("scroll", () => {
	const hero = document.querySelector(".destination-detail-hero");
	if (hero) {
		const scrolled = window.pageYOffset;
		const parallax = scrolled * 0.5;
		hero.style.backgroundPositionY = `${parallax}px`;
	}
});

