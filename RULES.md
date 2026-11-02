# RULES - Bộ Quy Tắc Thiết Kế & Lập Trình Chuẩn Chỉ
## Dự Án: Virtual Physics & Laser Workshop

Bộ quy tắc này được áp dụng bắt buộc cho toàn bộ quá trình phát triển mã nguồn, thiết kế giao diện và tối ưu hóa hệ thống.

---

### 1. Quy tắc về Kiến trúc & Công nghệ (Architecture & Tech Stack)

- **Xác định rõ Stack từ đầu**: 
  - Tuân thủ nghiêm ngặt các công nghệ đã chọn: **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **Three.js**, **@react-three/fiber**, **@react-three/drei**, **Zustand**, **Lucide React**.
  - Tuyệt đối không tự ý thêm bớt hoặc thay đổi thư viện ngoài danh mục này nếu không có sự đồng thuận của người dùng.
- **Tách biệt các thành phần (Modular Architecture)**:
  - Chia nhỏ code thành các component độc lập, mỗi file đảm nhiệm một trách nhiệm duy nhất (Single Responsibility Principle).
  - Phân tách rõ ràng giữa:
    - `3D Canvas Components` (Camera, Lighting, Mesh, Shaders, Controls)
    - `2D UI Overlays` (Header, Crosshair HUD, Knowledge Panel, Modals, Footer)
    - `State Management` (Zustand Store)
    - `Data Models` (Physics specifications, formulas, constants)

---

### 2. Quy tắc về Giao diện & Trải nghiệm Người dùng (UI/UX Standards)

- **Responsive Design (Mobile-First Approach)**:
  - Mọi thành phần giao diện (UI HUD, modal, bảng tri thức, nút điều khiển) phải hiển thị hoàn hảo trên mọi kích thước màn hình từ Mobile ($360\text{px}$), Tablet ($768\text{px}$) đến Desktop ($1080\text{p}, 2\text{K}, 4\text{K}$).
  - Cơ chế điều khiển thích ứng:
    - **Desktop**: Di chuyển góc nhìn thứ nhất (FPS) bằng `WASD` + khóa chuột `PointerLock`.
    - **Mobile/Tablet**: Hỗ trợ cảm ứng vuốt xoay góc nhìn (Touch Drag) hoặc cần gạt ảo (Virtual Joystick) + Tap trực tiếp vào máy để mở xem nguyên lý.
- **Tính đồng bộ về Màu sắc & Typography**:
  - Bảng màu cố định (Color Palette) gồm 4 màu chủ đạo:
    - Nền chính (Background): Dark Slate `#0f172a`
    - Bề mặt kính mờ (Surface): Glass Slate `#1e293b` (opacity 80-90%)
    - Màu nhấn tương tác & tia sáng (Accent): Laser Cyan `#06b6d4`
    - Màu cảnh báo bức xạ & UV (Warning/Accent): Violet UV `#8b5cf6` & Hazard Amber `#f59e0b`
  - Typography chuẩn chỉ: Font sans-serif hiện đại (Inter / Roboto), tỷ lệ cấp bậc chữ phân minh (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`), độ tương phản màu chữ/nền luôn đạt chuẩn **WCAG AA / AAA** ($\ge 4.5:1$).
- **Hiệu ứng mượt mà (Micro-interactions)**:
  - Nút bấm, tab chuyển đổi, thẻ thông tin đều có hiệu ứng `transition-all duration-200`, `hover:scale-102`, `active:scale-98`.
  - Hiệu ứng trượt camera 3D nội suy mượt mà qua `Vector3.lerp`, không gây xé hình hay giật đột ngột.

---

### 3. Quy tắc về Chất lượng Code & Tối ưu (Code Quality & Performance)

- **Clean Code & Thụt lề chuẩn**:
  - Sử dụng TypeScript strict mode, định nghĩa type/interface rõ ràng cho mọi props, state và dữ liệu vật lý.
  - Đặt tên biến, hàm, component có ý nghĩa rõ ràng (PascalCase cho Component, camelCase cho biến/hàm, UPPER_SNAKE_CASE cho hằng số).
  - Có chú thích (comments) giải thích chi tiết cho các thuật toán vật lý (công thức bước sóng, tính toán va chạm, ma trận quang học).
- **Tối ưu hiệu năng (Performance)**:
  - Mọi hình ảnh/texture bắt buộc tối ưu và ưu tiên định dạng `.webp` dung lượng nhẹ.
  - Mô hình 3D bắt buộc nén hình học qua Google Draco và giảm thiểu đa giác.
  - Loại bỏ hoàn toàn mã JavaScript/CSS thừa (Dead code elimination / Tree-shaking).
  - Duy trì tỉ lệ khung hình $\ge 50-60\,\text{FPS}$ và kiểm soát số lượng Draw calls $\le 100$.
- **Khả năng tiếp cận (Accessibility - a11y)**:
  - Sử dụng đầy đủ các thẻ HTML ngữ nghĩa: `<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`, `<nav>`.
  - Mọi hình ảnh minh họa và biểu đồ SVG bắt buộc có thuộc tính `alt` hoặc thẻ `<title>`/`<desc>`.
  - Nút bấm và icon bắt buộc có `aria-label` và hỗ trợ điều hướng bàn phím (`Tab`, `Enter`, `Space`, `ESC`).

---

### 4. Quy tắc về Quy trình Triển khai & Kiểm thử (Workflow & Testing)

- **Phát triển theo Phase**:
  1. *Khung cấu trúc*: Khởi tạo base project, cấu hình canvas, camera, hệ thống layout.
  2. *Giao diện tĩnh & Placeholder 3D*: Dựng khung cảnh phòng xưởng và các trạm máy cơ bản.
  3. *Tương tác & Logic*: Lập trình FPS controller, raycasting, camera lerp, knowledge panel và dữ liệu nguyên lý máy.
  4. *Tối ưu & Bàn giao*: Nén assets, kiểm thử hiệu năng đa thiết bị, đóng gói production và deploy.
- **Tự động kiểm tra lỗi (Verification)**:
  - Chạy `npm run build` / `tsc --noEmit` để đảm bảo 0 lỗi syntax, 0 lỗi kiểu dữ liệu trước khi xuất bản.
  - Rà soát chính tả thuật ngữ khoa học (cả tiếng Việt và tiếng Anh).
  - Đảm bảo 100% không có broken links hay assets thiếu dẫn đến lỗi 404 trên console WebGL.
