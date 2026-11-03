# 🔬 Virtual Physics & Industrial Laser Lab 3D Simulation

> Hệ thống mô phỏng 3D tương tác phòng thí nghiệm vật lý quang học và xưởng máy cắt/khắc laser công nghiệp thế hệ mới, tích hợp Studio thiết kế CAD Vector, kiểm định an toàn liên động (Safety Interlock), kiểm tra mẫu vật gia công 3D và tối ưu hóa WebGL 60 FPS (Phase 4 Hoàn thiện).

🌐 **Trải nghiệm trực tiếp trên Vercel:** [https://physics-lab-simulation-chi.vercel.app](https://physics-lab-simulation-chi.vercel.app)

![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-R174-black?logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/Release-Phase%204%20Complete-10B981)

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. Không Gian Xưởng 3D & Đồ Họa PBR (Physically-Based Rendering)
* **Góc nhìn thứ nhất (FPS Walk-around):** Di chuyển tự do trong không gian phòng thí nghiệm (`W`, `A`, `S`, `D` + Chuột điều hướng).
* **Hệ thống ánh sáng & hậu kỳ:** Đèn chiếu trần PBR, bóng đổ mềm PCFSoft, hiệu ứng phát sáng Bloom cho tia laser, sương mù tán xạ (Atmospheric Fog) và tone mapping ACESFilmic.
* **5 Trạm thiết bị công nghiệp chuyên dụng:**
  1. **Máy Laser CO₂ ($10.6\,\mu\text{m}$):** Gia công nhiệt bốc hơi phi kim (gỗ, mica acrylic, da, giấy).
  2. **Máy Laser Fiber ($1064\,\text{nm}$):** Khắc sâu và ủ nhiệt kim loại tốc độ cao (thép, nhôm, titan).
  3. **Máy Laser UV Tử Ngoại ($355\,\text{nm}$):** Gia công vi mạch lạnh bán dẫn (Silicon Wafer, kính quang học) không sinh nhiệt (Zero-HAZ).
  4. **Cụm Cảm Biến An Toàn & Giám Sát Xưởng:** Hệ thống quang học giám sát chùm tia bức xạ, cảm biến lưu lượng nước giải nhiệt Hall và cảm biến nhiệt hồng ngoại không tiếp xúc theo định luật Stefan-Boltzmann.
  5. **Buồng Phủ Sơn Tĩnh Điện & Sấy UV Bề Mặt:** Vách màng nước tuần hoàn, súng phun khí nén tĩnh điện và giàn đèn sấy UV 395 nm.

### 2. Tối Ưu Hóa WebGL 60 FPS & Đo Hiệu Năng Thời Gian Thực (Phase 4)
* **Khung chẩn đoán WebGL HUD (`Phím P`):** Giám sát trực tiếp chỉ số FPS, thời gian khung hình (ms/frame), số lượt vẽ (Draw calls $\le 100$), số đa giác (Triangles), bộ nhớ Geometries & Textures trong VRAM và tên card đồ họa phần cứng.
* **Tự thích ứng độ phân giải (`AdaptiveDpr`):** Tự động điều chỉnh hệ số DPI tránh nghẽn GPU trên màn hình Retina / 4K.
* **Hỗ trợ giải mã hình học nén Google Draco WebAssembly:** Tích hợp bộ giải mã Draco 1.5.7 qua web worker cho các mô hình 3D.
* **Tối ưu hóa bóng đổ & ánh sáng:** Giảm thiểu triệt để các pass shadow map không cần thiết trên nguồn sáng phụ, duy trì 60 FPS khóa cứng trên mọi thiết bị.

### 3. Trải Nghiệm Thân Thiện Trên Thiết Bị Di Động (Mobile-First & a11y)
* **Thanh điều hướng nhanh MobileNavBar:** Chạm để chuyển đổi tức thời giữa 5 trạm máy mà không cần thao tác bàn phím WASD.
* **Bảng tri thức Responsive:** Tự động co giãn mượt mà sang giao diện tối ưu cho màn hình cảm ứng nhỏ.
* **Màn hình Loading Screen Khoa Học:** Thanh tiến trình phần trăm từ 0% đến 100% kèm chuỗi trích dẫn tri thức vật lý quang học xoay vòng và nút bỏ qua tức thì.
* **Bảng phím tắt & trợ giúp toàn diện (`Phím H`):** Tra cứu nhanh toàn bộ phím tắt và mẹo trải nghiệm.

### 4. Studio Thiết Kế CAD Vector & Biên Dịch G-Code (`Phím T`)
* **Thư viện mẫu kỹ thuật (Presets):** Bánh răng cơ khí 12 răng, mô hình nguyên tử, chip vi xử lý, ngôi sao, trái tim...
* **Khắc chữ vector tùy biến (Text to G-code):** Tự động chuyển đổi chuỗi ký tự thành các đường chạy dao vector, tự co giãn tỷ lệ theo kích thước phôi thực tế.
* **Bàn vẽ tay tự do (Freehand Studio):** Vẽ phác thảo trực tiếp trên lưới milimet với hệ tọa độ chuẩn $[-1, +1]\,\text{m}$.
* **Định vị Gốc (Origin), Căn vừa (Auto-Fit) & Quét viền (Frame):**
  * Tự động tính toán Bounding Box và cảnh báo trực quan khi thiết kế tràn ra mép phôi.
  * Phím tắt **`F`** kích hoạt tia laser đỏ dẫn hướng quét thử 4 góc viền trên bàn gia công thực tế.

### 5. Cơ Chế Vật Lý Gia Công & Tách Rời Chi Tiết Thành Phẩm
* **Chế độ Cắt Xuyên (`Through-Cut` $3.0\,\text{mm}$):** Laser công suất cao cắt đứt xuyên qua vật liệu.
* **Chế độ Khắc Bề Mặt (`Surface Engrave` $0.1\,\text{mm}$):** Tạo hoa văn nông trên bề mặt tấm phôi.
* **Kiểm tra thành phẩm 3D (`Phím G`):** Lấy mẫu ra khỏi máy, xoay $360^\circ$ quan sát rãnh cắt (Kerf) và vùng ảnh hưởng nhiệt (HAZ).
* **Nhấc rời chi tiết (`Phím Space`):** Cho phép nhấc bổng chi tiết đã cắt rời lơ lửng trong không gian 3D, để lộ khoang rỗng bên dưới tấm phôi.
* **Xuất file vector SVG:** Tải file vector chuẩn để nạp vào máy CNC/Laser thực tế.

### 6. Phòng Phủ Sơn Bề Mặt & Sấy Khô UV (Coating & UV Cleanroom - `Phím 5`)
* **Buồng phun sơn màng nước (Water-Wash Spray Booth):** Thiết kế vách thu hồi bụi sơn bằng màng nước chảy tuần hoàn kết hợp ống hút khí lọc khí thải công nghiệp.
* **Mâm xoay phôi $360^\circ$ (Motorized Turntable):** Tự động xoay đều chi tiết giúp lớp sơn bao phủ đồng nhất mọi góc cạnh.
* **Súng phun khí nén tĩnh điện (Pneumatic Spray Mist):** Hiệu ứng bụi sơn hạt vi mô bám dính theo màu sơn lựa chọn và mô phỏng âm thanh xịt khí nén chân thực.
* **Hệ thống sấy UV quang trùng hợp (UV Photopolymerization Array):** Giàn đèn LED UV tử ngoại và sấy hồng ngoại IR đóng rắn màng sơn lập tức ($E = h\nu$).
* **7 Lớp sơn hoàn thiện cao cấp:** Clear Gloss, Matte Black, Candy Metallic Red, Industrial Safety Orange, Titanium Gold PVD, Neon Glow Cyan, Hydrophobic Shield.

### 7. Hệ Thống Khóa Liên Động An Toàn (Safety Interlock - ISO 11553)
* Cơ chế đóng/mở nắp bảo vệ (`Phím O`).
* Mở nắp khi laser đang hoạt động sẽ kích hoạt ngắt khẩn cấp để bảo vệ người vận hành khỏi bức xạ nguy hiểm.
* Tự động chặn phát tia khi đặt vật liệu phản xạ cao (như nhôm/thép vào máy laser CO₂).

---

## 🎮 Hướng Dẫn Điều Khiển & Phím Tắt

| Phím tắt | Thao tác | Chức năng |
| :---: | :---: | :--- |
| **`W`, `A`, `S`, `D`** | Bàn phím | Di chuyển nhân vật trong phòng thí nghiệm |
| **`Shift` + `W`** | Phím tắt | Chạy nhanh trong phòng thí nghiệm ($7.5\,\text{m/s}$) |
| **`Chuột`** | Rê chuột | Quay góc nhìn $360^\circ$ (Click màn hình để khóa chuột) |
| **`E`** | Phím tắt | Tương tác / Mở bảng tri thức chi tiết của máy đang nhìn vào |
| **`1`, `2`, `3`, `4`, `5`** | Phím tắt | Chuyển nhanh 5 trạm máy (CO2, UV, Fiber, Cảm biến, Buồng sơn) |
| **`T`** | Phím tắt | Mở Studio thiết kế CAD Vector & G-Code |
| **`F`** | Phím tắt | Bật / tắt quét khung viền an toàn (Frame) bằng tia laser đỏ |
| **`O`** | Phím tắt | Đóng / Mở nắp máy an toàn (Safety Interlock) |
| **`M`** | Phím tắt | Thay đổi phôi vật liệu gia công (Gỗ, Mica, Thép, Nhôm, Silicon, Kính) |
| **`C`** | Phím tắt | Thực hiện chu trình Cắt xuyên / Khắc laser |
| **`G`** | Phím tắt | Lấy mẫu ra kiểm tra chất lượng 3D sau khi cắt |
| **`X`** | Phím tắt | Bật / Tắt chế độ X-Ray nhìn thấu cấu tạo quang học máy |
| **`P`** | Phím tắt | Bật / Tắt bảng chẩn đoán hiệu năng WebGL 60 FPS & Draw Calls |
| **`H`** | Phím tắt | Mở / Đóng bảng hướng dẫn phím tắt |
| **`Space`** | Phím tắt | Nhấc rời chi tiết khỏi tấm phôi (trong màn hình xem mẫu 3D) |
| **`ESC`** | Phím tắt | Thoát bảng điều khiển / Đóng cửa sổ modal |

---

## 🛠️ Cài Đặt & Chạy Cục Bộ (Getting Started)

### Yêu cầu môi trường:
* **Node.js** >= 18.x
* **npm** hoặc **yarn** / **pnpm**

### Các bước cài đặt:
```bash
# 1. Clone repository
git clone https://github.com/phule8211/physics-lab-simulation.git

# 2. Di chuyển vào thư mục dự án
cd physics-lab-simulation

# 3. Cài đặt các gói phụ thuộc
npm install

# 4. Khởi chạy máy chủ phát triển
npm run dev

# Ứng dụng sẽ chạy tại: http://localhost:3000
```

### Đóng gói sản phẩm (Production Build):
```bash
npm run build
npm run preview
```

---

## 📐 Kiến Trúc Kỹ Thuật (Architecture)

```
src/
├── components/
│   ├── 3d/                 # Three.js 3D Viewport, Phòng lab, Máy móc, Ánh sáng
│   │   ├── environments/   # Phòng lab, sàn PBR, trần, đèn neon, cửa sổ
│   │   ├── fallbacks/      # Mô hình 3D cho CO2, Fiber, UV Laser, Spray Coating
│   │   ├── visual-effects/ # Tia laser phát sáng, tia dẫn hướng đỏ, tia lửa cắt
│   │   ├── PerformanceTracker.tsx # Thu thập số liệu WebGL thời gian thực
│   │   └── PlayerController.tsx
│   └── ui/                 # Giao diện người dùng Tailwind + Lucide Icons
│       ├── CrosshairHUD.tsx
│       ├── MachineControlOverlay.tsx
│       ├── VectorDesignModal.tsx       # Studio CAD thiết kế vector
│       ├── SpecimenInspectionModal.tsx # Xem mẫu 3D & nhấc rời chi tiết
│       ├── PerformanceStatsHUD.tsx     # Bảng đo FPS & Draw calls
│       ├── MobileNavBar.tsx            # Thanh điều hướng di động
│       ├── HelpGuideModal.tsx          # Bảng phím tắt & trợ giúp
│       ├── LoadingScreen.tsx           # Màn hình chờ tri thức laser
│       └── KnowledgePanel.tsx          # Bảng tri thức & cảm biến
├── data/
│   ├── labConfig.ts        # Cấu hình trạm máy & thông số kỹ thuật
│   ├── materialsConfig.ts  # Bảng vật liệu PBR & ma trận phản xạ quang học
│   ├── coatingFinishes.ts  # Bảng cấu hình lớp phủ sơn tĩnh điện & sấy UV
│   ├── physicsData.ts      # Dữ liệu lý thuyết & công thức vật lý
│   └── vectorDesigns.ts    # Bounding Box, Toolpath, G-code generator
├── store/
│   └── useLabStore.ts      # Quản lý trạng thái toàn cục với Zustand
└── utils/
    └── audioSystem.ts      # Bộ tổng hợp âm thanh Web Audio API thời gian thực
```

---

## 🚀 Triển Khai Đám Mây (Cloud Deployment)

Dự án đã được cấu hình sẵn sàng cho **Vercel** và **GitHub Pages**:
- `vercel.json`: Cấu hình SPA rewrites và bộ nhớ đệm tài nguyên WebGL tĩnh tối ưu.
- `.github/workflows/deploy.yml`: Tự động kiểm tra typecheck và build sản phẩm trên mỗi commit push lên `main`.

---

## 📄 Bản Quyền & Giấy Phép (License & Authors)

Dự án được phát triển phục vụ mục đích giáo dục, nghiên cứu và đào tạo kỹ thuật gia công công nghệ cao.

### 👥 Nhóm Tác Giả & Bản Quyền (Authors & Copyright):
* **Lê Ngọc Phú** ([@phule8211](https://github.com/phule8211))
* **Đinh Thiên Ân** ([dthienan762@gmail.com](mailto:dthienan762@gmail.com))

---
*Bản quyền © 2026 Virtual Physics & Industrial Laser Lab 3D Simulation. Mọi quyền được bảo lưu.*


