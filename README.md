# Travel Website – IE104

> Website giới thiệu doanh nghiệp du lịch (Safe Tour) được xây dựng hoàn toàn bằng HTML, CSS, JavaScript thuần nhằm đáp ứng yêu cầu môn học IE104. Dự án tập trung vào trải nghiệm người dùng đa ngôn ngữ, tối ưu trên nhiều thiết bị và có khả năng mở rộng dữ liệu tour/điểm đến thông qua các tệp JSON.

---

## ✨ Tính năng chính

- **Đa trang**: Home, About, Destinations, Destination Detail, Tours, Tour Detail, Blog, Blog Detail, Contact, Online Booking, Coming Soon, Error.
- **Hỗ trợ i18n**: chuyển đổi song ngữ Việt/Anh thông qua `assets/js/i18n.js` và dữ liệu trong `assets/lang/`.
- **Dynamic data**: danh sách tour, điểm đến, blog được render từ các tệp JSON (`data-vi.json`, `tours-en.json`, ...).
- **Lazy loading & skeletons**: tối ưu hiệu năng cho trang Destination Detail và Tours.
- **Responsive UI**: thiết kế mobile-first, bao gồm header sticky, side menu và các layout grid linh hoạt.
- **Hiệu ứng tương tác**: Scroll reveal, ripple effect, parallax hero, wishlist, filter UI, v.v.

---

## 🗂️ Cấu trúc thư mục chính

```
IE104-InternetCongNgheWeb/
├── assets/
│   ├── css/
│   │   ├── base/           # reset.css, style.css, responsive.css
│   │   ├── layout/         # header, footer
│   │   └── pages/          # CSS riêng cho từng trang
│   ├── fonts/
│   ├── icons/
│   ├── images/             # assets hình ảnh, chia theo trang & dữ liệu tour
│   ├── js/
│   │   ├── pages/          # JS logic cho từng page
│   │   ├── data-loader.js  # tải & cache JSON
│   │   ├── i18n.js         # trình quản lý ngôn ngữ
│   │   └── main.js         # router đơn giản + shared behaviors
│   └── lang/               # file dịch en.json, vi.json và README hướng dẫn
├── pages/                  # phiên bản HTML tách trang (nếu cần build tĩnh)
├── templates/              # header/footer dùng chung khi load qua JS
├── data-vi.json            # dữ liệu điểm đến tiếng Việt
├── data-en.json            # dữ liệu điểm đến tiếng Anh
├── tours-vi.json / tours-en.json
├── index.html              # entry chính (load header/footer động)
├── coming-soon.html
├── error.html
└── README.md
```

---

## 🛠️ Công nghệ & tiêu chuẩn

- **HTML5 semantic** với template tách header/footer để tái sử dụng.
- **CSS3** (Flexbox, Grid, custom properties) + reset + responsive breakpoints.
- **JavaScript ES6+**: modules logic cho từng trang, Intersection Observer, localStorage/sessionStorage, fetch API.
- **Font Awesome 5.15.4** và Google Fonts (Inter, Poppins).
- **Không dùng framework** nhằm đảm bảo đúng yêu cầu môn học.

---

## 🚀 Hướng dẫn chạy dự án

1. **Clone repo**
   ```bash
   git clone https://github.com/duynhan935/IE104-InternetCongNgheWeb.git
   cd IE104-InternetCongNgheWeb
   ```
2. **Chạy bằng Live Server / bất kỳ HTTP server tĩnh nào**
   - Cài Live Server (VS Code) hoặc dùng `npx serve`:
     ```bash
     npx serve .
     ```
   - Hoặc mở trực tiếp `index.html` trong trình duyệt (Chrome/Edge).
3. **Chọn trang** qua navigation hoặc thay đổi hash URL, ví dụ `#tours`, `#destination-detail?id=vn001`.

> Lưu ý: Một số tính năng (lazy load, fetch JSON) yêu cầu chạy qua server để tránh lỗi CORS/file protocol.

---

## 🌐 Quốc tế hóa (i18n)

- File dịch đặt tại `assets/lang/en.json` và `assets/lang/vi.json`.
- `assets/js/i18n.js` cung cấp API `window.i18n` (translatePage, t, subscribe).
- Để thêm ngôn ngữ mới:
  1. Sao chép một file JSON dịch hiện có.
  2. Cập nhật giá trị ngôn ngữ.
  3. Sửa `availableLanguages` trong `i18n.js`.

---

## 📦 Dữ liệu động

- `data-*.json`: mô tả điểm đến, places, famous_locations.
- `tours-*.json`: danh sách tour (giá, ưu đãi, lịch trình, dịch vụ đi kèm).
- `assets/js/pages/*.js` đọc và render tùy theo hash param (`window.currentPageParams`).
- Có thể cập nhật dữ liệu bằng cách chỉnh sửa JSON, không cần thay đổi HTML.

---

## 🧪 Kiểm thử & chất lượng

- Đã kiểm tra responsive trên các breakpoint 1200px, 992px, 768px, 576px.
- Đảm bảo các trang chính load dữ liệu giả lập đầy đủ; cần thêm backend nếu muốn đặt tour thực tế.
- Khuyến nghị dùng Lighthouse/Chrome DevTools để đánh giá thêm hiệu năng và accessibility.

---

## 🤝 Đóng góp

1. Fork dự án & tạo branch mới `feature/<ten>`.
2. Commit kèm mô tả rõ ràng.
3. Tạo Pull Request về branch `main`.

Hoặc mở issue nếu phát hiện bug/đề xuất cải tiến UI, data, i18n.

---

## 📄 Giấy phép

Dự án chỉ phục vụ mục đích học tập trong khuôn khổ môn IE104. Khi tái sử dụng, vui lòng ghi nguồn và đảm bảo tuân thủ bản quyền hình ảnh/font sử dụng trong repo.

---

## 📬 Liên hệ

- **Tác giả**: Duy Nhan & nhóm IE104
- **Email góp ý**: (cập nhật theo thông tin nhóm)
- **Github**: [IE104-InternetCongNgheWeb](https://github.com/duynhan935/IE104-InternetCongNgheWeb)

Bạn cũng có thể xem trực tiếp trang web tại [Live Demo](https://kieuphat159.github.io)

Chúc bạn có chuyến “Safe Tour” thú vị! ✈️
