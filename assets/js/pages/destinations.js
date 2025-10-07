const cards = document.querySelectorAll(".destination-card");
const itemsPerPage = 7;
const totalPages = Math.ceil(cards.length / itemsPerPage);
let currentPage = 1;

const pageNumbersContainer = document.querySelector(".page-numbers");

function showPage(page) {
  currentPage = page;

  // Hiển thị cards
  cards.forEach((card, index) => {
    card.style.display =
      index >= (page - 1) * itemsPerPage && index < page * itemsPerPage
        ? "block"
        : "none";
  });

  // Nếu chỉ có 1 trang, ẩn pagination
  if (totalPages <= 1) {
    document.querySelector(".pagination").style.display = "none";
  } else {
    document.querySelector(".pagination").style.display = "flex";
    renderPagination();
  }
}

// Render số trang với ...
function renderPagination() {
  pageNumbersContainer.innerHTML = "";

  const createPageLink = (i) => {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = i;
    // a.classList.add("page");
    if (i === currentPage) a.classList.add("active");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showPage(i);
    });
    return a;
  };

  const createDots = () => {
    const span = document.createElement("span");
    span.textContent = "...";
    span.classList.add("dots");
    return span;
  };

  if (totalPages <= 7) {
    // Hiển thị tất cả nếu < 8 trang
    for (let i = 1; i <= totalPages; i++) {
      pageNumbersContainer.appendChild(createPageLink(i));
    }
  } else {
    if (currentPage <= 4) {
      // Trang đầu
      for (let i = 1; i <= 5; i++)
        pageNumbersContainer.appendChild(createPageLink(i));
      pageNumbersContainer.appendChild(createDots());
      pageNumbersContainer.appendChild(createPageLink(totalPages));
    } else if (currentPage >= totalPages - 3) {
      // Trang cuối
      pageNumbersContainer.appendChild(createPageLink(1));
      pageNumbersContainer.appendChild(createDots());
      for (let i = totalPages - 4; i <= totalPages; i++)
        pageNumbersContainer.appendChild(createPageLink(i));
    } else {
      // Trang giữa
      pageNumbersContainer.appendChild(createPageLink(1));
      pageNumbersContainer.appendChild(createDots());
      for (let i = currentPage - 1; i <= currentPage + 1; i++)
        pageNumbersContainer.appendChild(createPageLink(i));
      pageNumbersContainer.appendChild(createDots());
      pageNumbersContainer.appendChild(createPageLink(totalPages));
    }
  }
}

// Nút điều hướng
document.querySelector(".pagination .prev").addEventListener("click", (e) => {
  e.preventDefault();
  if (currentPage > 1) showPage(currentPage - 1);
});

document.querySelector(".pagination .next").addEventListener("click", (e) => {
  e.preventDefault();
  if (currentPage < totalPages) showPage(currentPage + 1);
});

document.querySelector(".pagination .first").addEventListener("click", (e) => {
  e.preventDefault();
  showPage(1);
});

document.querySelector(".pagination .last").addEventListener("click", (e) => {
  e.preventDefault();
  showPage(totalPages);
});

// Load trang đầu tiên
showPage(1);
