# PRD - Virtual Physics & Laser Workshop
## Mô Phỏng Phòng Thí Nghiệm & Xưởng Chế Tác Laser 3D Tương Tác

---

### 1. Giới thiệu & Bối cảnh dự án (Overview & Background)

#### 1.1. Bối cảnh (Context)
Trong các trường đại học, viện nghiên cứu kỹ thuật và xưởng chế tác số (FabLab / MakerSpace), các thiết bị laser công nghiệp như **Máy cắt Laser CO2**, **Máy khắc Laser UV**, **Máy khắc Laser Fiber** và **Hệ thống cảm biến an toàn** đóng vai trò nòng cốt. Tuy nhiên, việc giảng dạy và đào tạo thực tế gặp nhiều thách thức lớn:
- **Nguy cơ an toàn cao**: Bức xạ laser vô hình (CO2 bước sóng 10.6 µm, Fiber 1064 nm) và laser tử ngoại (UV 355 nm) có thể gây bỏng giác mạc vĩnh viễn, cháy nổ vật liệu và sinh khí độc hại (VOCs, khí CO/NOx).
- **Cấu tạo bên trong bị che kín**: Các máy công nghiệp đều có vỏ bảo vệ khép kín (Enclosure), người học chỉ nhìn thấy bên ngoài mà không quan sát được quá trình kích thích photon, hệ thống dẫn truyền gương phản xạ, thấu kính hội tụ, hay cơ chế vi mô của gia công quang hóa vs. bốc hơi nhiệt.
- **Chi phí thiết bị đắt đỏ**: Không phải cơ sở đào tạo nào cũng đủ kinh phí trang bị đầy đủ cả 3 nguồn laser chuyên biệt và các trạm cảm biến tiêu chuẩn.

#### 1.2. Tầm nhìn sản phẩm (Product Vision)
Xây dựng một nền tảng Web 3D thời gian thực (Real-time 3D Web Application), mô phỏng một xưởng thực hành vật lý hiện đại. Ứng dụng cho phép người dùng nhập vai góc nhìn thứ nhất (First-Person), tự do đi lại trong xưởng, tiến tới từng trạm máy để kích hoạt chế độ quan sát chuyên sâu (Inspection Mode) kết hợp bảng tri thức trực quan (Infographic/Knowledge Panel) giải thích rõ ràng nguyên lý vật lý quang học và cơ chế vận hành của từng loại thiết bị.

---

### 2. Chân dung người dùng (User Personas)

| Persona | Vai trò | Mục tiêu | Nỗi đau (Pain Points) |
| :--- | :--- | :--- | :--- |
| **Minh Trí (20 tuổi)** | Sinh viên ngành Vật lý Ứng dụng / Cơ điện tử | Muốn hiểu trực quan sự khác biệt giữa các loại laser (CO2, UV, Fiber) và cách cảm biến hoạt động trong hệ thống điều khiển. | Sách giáo trình quá trừu tượng; thực tập tại xưởng trường không được mở nắp máy xem cấu tạo bên trong. |
| **Thầy Quang Hùng (45 tuổi)** | Giảng viên Bộ môn Quang học & Kỹ thuật Laser | Cần một công cụ trực quan 3D để trình chiếu trong bài giảng và cho sinh viên tự học sau giờ lên lớp. | Thiếu phần mềm trực quan miễn phí, chạy ngay trên trình duyệt mà không cần cài đặt phần mềm nặng nề. |
| **Đức Anh (27 tuổi)** | Kỹ thuật viên vận hành xưởng chế tác (Makerspace) | Muốn tra cứu nhanh thông số quang học, tương thích vật liệu và nguyên tắc an toàn vận hành cảm biến bảo vệ máy. | Hướng dẫn sử dụng dạng tài liệu chữ khô khan, khó hình dung trực tiếp đường đi của tia và cơ chế cảnh báo. |

---

### 3. Phạm vi sản phẩm (Product Scope)

#### 3.1. Phạm vi MVP (Phase 1)
1. **Không gian xưởng thí nghiệm 3D**: Phòng xưởng công nghiệp phong cách hiện đại với sàn epoxy, trần xưởng, đèn led chiếu sáng, bàn thí nghiệm và vách ngăn an toàn.
2. **Hệ thống điều khiển góc nhìn thứ nhất (FPS)**: Phím `WASD` di chuyển, chuột xoay góc nhìn với `PointerLock`, xử lý va chạm cơ bản (AABB) ngăn xuyên tường/máy.
3. **Cơ chế tương tác trạm máy (Interaction System)**: Tâm ngắm (Crosshair), phát hiện cự ly gần và hiển thị phím tắt gợi ý `[E] Xem nguyên lý`.
4. **4 Nhóm thiết bị & Hệ thống nguyên lý vật lý**:
   - **Máy cắt Laser CO2** (Carbon Dioxide Laser, bước sóng $10.6\,\mu\text{m}$).
   - **Máy khắc Laser UV** (Ultraviolet Cold Laser, bước sóng $355\,\text{nm}$).
   - **Máy khắc Laser Fiber / Galvo** (Ytterbium Doped Fiber Laser, bước sóng $1064\,\text{nm}$).
   - **Cụm cảm biến xưởng an toàn** (Cảm biến nhiệt hồng ngoại không tiếp xúc, cảm biến lưu lượng nước làm mát Chiller, cảm biến khói quang điện, công tắc hành trình quang).
5. **Chế độ kiểm tra máy (Inspection View) & Bảng tri thức (Knowledge Panel)**:
   - Camera chuyển động mượt mà tập trung vào máy.
   - Máy chạy hoạt ảnh vận hành (đầu cắt di chuyển, gương galvo quét, tia laser sáng).
   - Sidebar kính mờ (Glassmorphism) trình bày sơ đồ nguyên lý, biểu đồ bước sóng quang phổ, thông số kỹ thuật và video/ảnh động minh họa.
6. **Trải nghiệm đa nền tảng (Responsive Multi-Platform)**:
   - Áp dụng nguyên tắc Mobile-First cho toàn bộ hệ thống giao diện 2D (HUD, Knowledge Panel, biểu đồ, nút điều khiển).
   - **Trên Desktop**: Di chuyển góc nhìn thứ nhất (FPS WASD + PointerLock), Knowledge Panel dạng Sidebar trượt từ bên phải.
   - **Trên Mobile & Tablet**: Giao diện cảm ứng chạm (Touch Look & Tap to Inspect) hoặc thanh trượt chuyển nhanh trạm máy, Knowledge Panel dạng Bottom-Sheet/Drawer trượt từ cạnh dưới lên với kích thước tối ưu cho màn hình cảm ứng.

#### 3.2. Ngoài phạm vi Phase 1 (Dự kiến cho Phase 2 & Tương lai)
- Tương tác vật lý biến dạng bề mặt thời gian thực (Real-time Mesh Boolean Cut).
- Hỗ trợ thiết bị VR / WebXR kính thực tế ảo.
- Hệ thống tài khoản người dùng và bài thi trắc nghiệm (Quiz/LMS integration).

---

### 4. Chi tiết nguyên lý vật lý & Cấu trúc các thiết bị (Physics Core Specifications)

#### 4.1. Máy Cắt Laser Khí CO2 (Carbon Dioxide Gas Laser)
- **Lịch sử & Tổng quan**: Phát minh năm 1964 bởi C. Kumar N. Patel tại Bell Labs; giữ vai trò nòng cốt trong gia công phi kim loại và y tế nhờ bước sóng dài $\lambda = 10.6\,\mu\text{m}$ (hồng ngoại xa) và hiệu suất quang học cao (10 - 20%).
- **Nguyên lý hoạt động cốt lõi**:
  - Dựa trên sự chuyển dời năng lượng giữa các mức dao động - quay (vibrational-rotational energy levels) của phân tử khí $\text{CO}_2$, hỗ trợ bởi khí đệm $\text{N}_2$ và khí tản nhiệt $\text{He}$ theo chu trình 4 mức năng lượng.
  - **Hỗn hợp khí**: Tỉ lệ điển hình $\text{CO}_2 : \text{N}_2 : \text{He} \approx 1 : 1 : 8$.
    * $\text{CO}_2$ (10-15%): Khí hoạt tính trực tiếp phát xạ photon.
    * $\text{N}_2$ (15-20%): Hấp thụ năng lượng phóng điện tử, tích lũy năng lượng ở trạng thái giả bền $v=1$ có thời gian sống dài, truyền năng lượng cộng hưởng hoàn hảo sang chế độ kéo giãn bất đối xứng $00^01$ của $\text{CO}_2$.
    * $\text{He}$ (65-75%): Có độ dẫn nhiệt cực cao giúp tản nhiệt từ tâm ống ra áo nước làm mát; đồng thời va chạm làm rỗng mức năng lượng dưới ($10^00$ hoặc $02^00$) của $\text{CO}_2$ về mức cơ bản, duy trì đảo lộn mật độ cư trú (Population Inversion).
  - **Chu trình phát xạ 4 mức**:
    1. Kích thích điện tử: $e^- + \text{N}_2 \rightarrow \text{N}_2^*(v=1) + e^-$.
    2. Truyền năng lượng cộng hưởng: $\text{N}_2^*(v=1) + \text{CO}_2(00^00) \rightarrow \text{N}_2(v=0) + \text{CO}_2(00^01)$.
    3. Phát xạ cảm ứng: $\text{CO}_2^*(00^01) + h\nu \rightarrow \text{CO}_2(10^00) + 2h\nu$ ($\lambda \approx 10.6\,\mu\text{m}$).
    4. Khử kích thích & tản nhiệt qua Helium: $\text{CO}_2(10^00) + \text{He} \rightarrow \text{CO}_2(00^00) + \text{He} + \text{Nhiệt}$.
- **Cấu tạo các bộ phận chính**:
  1. *Buồng cộng hưởng & Ống phóng*: Ống thủy tinh borosilicate 3 lớp có áo nước; gương đuôi toàn phần bằng đồng mạ vàng ($R > 99.7\%$); gương xuất bán phản xạ bằng Kẽm Selenide $\text{ZnSe}$ ($R \approx 85-90\%$).
  2. *Bộ nguồn cấp điện*: Nguồn cao áp DC (20 - 40 kV khởi động, 15 - 30 mA duy trì) cho ống thủy tinh, hoặc nguồn kích thích sóng cao tần RF (dải MHz) cho ống kim loại.
  3. *Hệ thống quang dẫn & Hội tụ*: Bộ 3 gương phản xạ Silicon/Molybdenum tráng phủ vàng dẫn hướng 90 độ; thấu kính hội tụ chất liệu Kẽm Selenua ($\text{ZnSe}$) phủ lớp chống phản xạ AR vàng, hội tụ chùm tia thành điểm tiêu cự siêu nhỏ $0.1 - 0.2\,\text{mm}$.
  4. *Hệ thống phụ trợ*: Chiller tuần hoàn nước cất làm mát duy trì $20 - 24^\circ\text{C}$; máy nén khí trợ khí (Air Assist) dập lửa và giữ sạch thấu kính; quạt ly tâm hút và lọc khói độc VOCs.
- **Phân loại ống laser CO2**:
  * *Ống thủy tinh DC (Glass DC Tube)*: Giá thành rẻ, công suất lớn (40W - 180W), nhưng tuổi thọ trung bình thấp (2.000 - 8.000 giờ) và góc phân kỳ chùm tia lớn hơn.
  * *Ống kim loại RF (Metal RF Sealed Tube)*: Vỏ kim loại kín, kích thích bằng sóng vô tuyến RF, chất lượng chùm tia đỉnh cao ($M^2 \approx 1.1$), tuổi thọ rất cao (> 20.000 - 45.000 giờ), tần số xung cực nhanh cho khắc siêu tốc.

#### 4.2. Máy Khắc Laser Tử Ngoại UV (Ultraviolet DPSS Laser)
- **Lịch sử & Nguyên lý gia công lạnh (Cold Processing / Photochemical Ablation)**:
  - Khác biệt hoàn toàn với gia công nhiệt: Năng lượng của từng photon tử ngoại 355 nm đạt $E = h\nu = \frac{hc}{\lambda} \approx 3.49\,\text{eV}$. Mức năng lượng này vượt qua năng lượng liên kết hóa học cộng hóa trị của hầu hết các vật liệu hữu cơ ($\text{C}-\text{C}: 3.6\,\text{eV}, \text{C}-\text{H}: 4.3\,\text{eV}, \text{C}-\text{O}: 3.7\,\text{eV}$).
  - Tia laser trực tiếp bẻ gãy liên kết phân tử thành các mảnh vi mô mà không làm nóng chảy mạng tinh thể xung quanh $\rightarrow$ Vùng ảnh hưởng nhiệt (HAZ) gần như bằng 0, không biến dạng, không co ngót mép cắt.
- **Kỹ thuật nhân ba tần số (Third Harmonic Generation - THG)**:
  1. Nguồn laser rắn bơm diode (DPSS): Diode bán dẫn 808 nm bơm tinh thể $\text{Nd:YVO}_4$ hoặc $\text{Nd:YAG}$ phát ra bước sóng hồng ngoại gốc $1064\,\text{nm}$.
  2. Nhân đôi tần số (SHG): Đi qua tinh thể phi tuyến tính $\text{LBO}$ thứ nhất để tạo bước sóng xanh lục $532\,\text{nm}$ ($2\omega$).
  3. Trộn tần số (THG): Trộn photon $1064\,\text{nm}$ và $532\,\text{nm}$ qua tinh thể $\text{LBO}$ thứ hai để tạo chùm tia tử ngoại $\lambda = 355\,\text{nm}$ ($3\omega$).
- **Cấu tạo chi tiết**:
  * Module nguồn DPSS tích hợp công tắc Q-Switch điều biến quang âm tạo xung nanosecond (10 - 30 ns) công suất đỉnh cực lớn.
  * Hệ thống thấu kính F-Theta và gương Galvo chuyên biệt làm bằng thạch anh nung chảy (Fused Silica) chống hấp thụ tia cực tím.
  * Buồng bảo hộ kín Class 1 có cửa kính lọc hấp thụ hoàn toàn tia UV màu hổ phách/xanh lục (OD 6+ tại 355 nm).
  * Bộ điều hòa nhiệt độ kép (Dual TEC) kiểm soát nhiệt độ lò tinh thể $\text{LBO}$ với độ chính xác $\pm 0.1^\circ\text{C}$.
- **Vật liệu tối ưu**: Mạch bán dẫn vi điện tử, silicon wafers, nhựa y tế (PE, PVC, Silicon), thủy tinh siêu mỏng màn hình smartphone.

#### 4.3. Máy Khắc Laser Fiber Sợi Quang & Đầu Quét Galvo (Fiber Laser Marker)
- **Cơ chế khuếch đại sợi quang**:
  - Môi trường hoạt chất là sợi quang silica kép (Double-clad) pha tạp ion đất hiếm Ytterbium ($\text{Yb}^{3+}$), bơm quang học bởi các diode laser bán dẫn công suất cao $915\,\text{nm} / 976\,\text{nm}$.
  - Gương cộng hưởng là các cách tử sợi quang Bragg (FBG) được ghi trực tiếp vào lõi cáp quang, triệt tiêu hoàn toàn sự lệch trục quang học cơ khí.
  - Bước sóng phát xạ: $\lambda = 1064\,\text{nm}$ (Cận hồng ngoại). Kim loại (thép, inox, nhôm, đồng, titan) có độ hấp thụ quang học cực cao tại dải sóng này.
- **Cơ cấu đầu quét Galvo (Galvanometer Scanner)**:
  - Cặp gương siêu nhẹ gắn trực tiếp trên trục động cơ servo tốc độ cao quét chùm tia trên trục $X$ và $Y$ với vận tốc lên tới $7.000 - 12.000\,\text{mm/s}$.
  - Thấu kính trường phẳng F-Theta biến chuyển động góc quét thành chuyển động phẳng đồng đều $y = f \cdot \theta$.
- **Phân loại nguồn Fiber**:
  * *Dòng Q-Switched Fiber*: Độ rộng xung cố định (~100 ns), tần số 20 - 80 kHz; siêu bền (tuổi thọ 100.000 giờ), kinh tế cho khắc sâu kim loại, mã QR, số seri.
  * *Dòng MOPA (Master Oscillator Power Amplifier)*: Cho phép tùy biến độc lập độ rộng xung (2 - 500 ns) và tần số (lên đến 4 MHz); khắc màu tuyệt đẹp trên inox (Stainless Steel Annealing), bóc lớp oxit anot trên nhôm mà không phạm vào cốt kim loại.

#### 4.4. Cụm Cảm Biến An Toàn Xưởng (Lab Sensor Cluster)
1. **Cảm biến nhiệt độ hồng ngoại không tiếp xúc (Non-contact IR Thermopile MLX90614)**:
   - Thu nhận bức xạ nhiệt hồng ngoại 5.5 - 14 µm theo định luật Stefan-Boltzmann ($E = \epsilon \sigma T^4$). Giám sát nhiệt độ phôi cắt theo thời gian thực; nếu nhiệt độ vượt ngưỡng an toàn (ví dụ > 120°C báo hiệu nguy cơ cháy), mạch ngắt cao áp nguồn laser lập tức.
2. **Cảm biến lưu lượng dòng nước làm mát (Cooling Water Flow Sensor - Hall Effect)**:
   - Nước làm mát từ máy Chiller chảy qua cánh quạt từ tính; cánh quạt quay kích hoạt cảm biến hiệu ứng Hall tạo chuỗi xung vuông số. Tín hiệu nối cứng vào chân `WP` (Water Protect) của bo mạch điều khiển; ngắt tức thời nếu dòng chảy < 3.5 L/phút để chống nổ vỡ ống laser.
3. **Cảm biến phát hiện khói quang điện (Optical Smoke Sensor - Tyndall Effect)**:
   - Buồng tối mê cung (Labyrinth) chứa diode phát hồng ngoại 940 nm và photodiode thu đặt vuông góc. Khi có hạt khói hoặc bụi hữu cơ tán xạ ánh sáng vào photodiode $\rightarrow$ kích hoạt còi báo động và quạt hút tăng tốc.
4. **Khóa liên động quang học an toàn nắp máy (Optical Interlock Switch)**:
   - Bộ thu phát quang học rãnh chữ U (Photo-interrupter). Nhấc nắp bảo vệ máy $\rightarrow$ chùm quang bị gián đoạn $\rightarrow$ rơ-le an toàn ngắt mạch phát quang trong vòng 10 µs, bảo vệ mắt kỹ sư khỏi bức xạ tán xạ Class 4.

---

### 5. Yêu cầu chức năng chi tiết (Functional Requirements)

| Mã FR | Tên chức năng | Mô tả chi tiết | Tiêu chí chấp nhận (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **FR-01** | First-Person Walkthrough | Điều khiển di chuyển nhân vật trong phòng lab 3D bằng `W`, `A`, `S`, `D`. Giữ `Shift` để tăng tốc độ chạy. Phím `Space` để nhảy nhẹ. Chuột điều khiển hướng nhìn. | Di chuyển mượt mà 60 FPS; không bị kẹt hay giật lag khi đổi hướng; không xuyên qua tường hoặc bàn thí nghiệm. |
| **FR-02** | Pointer Lock & Crosshair | Click vào màn hình để khóa chuột (PointerLock API). Hiển thị tâm ngắm nhỏ ở chính giữa màn hình. Nhấn `ESC` để nhả chuột. | Chuột biến mất khi khóa; tâm ngắm đổi màu hoặc phóng to nhẹ khi trỏ vào thiết bị tương tác được. |
| **FR-03** | Proximity Detection | Dùng Raycasting từ camera kiểm tra khoảng cách đến các trạm máy. Nếu cự ly $< 2.5\text{m}$, hiển thị thanh thông báo nổi HUD: `[E] Xem chi tiết & Nguyên lý`. | Chỉ hiển thị khi hướng nhìn đúng về phía máy và trong tầm với; tự động ẩn khi quay lưng hoặc bước ra xa. |
| **FR-04** | Inspection Focus Mode | Khi người dùng nhấn `E`, camera chuyển động nội suy (Tween/Lerp) mượt mà từ vị trí người chơi đến góc nhìn lý tưởng trước máy. Mở khóa chuột để click giao diện. | Chuyển động trong khoảng 0.8s - 1.2s; góc nhìn nhìn rõ bàn thao tác và các chi tiết máy; có nút `[X] Quay lại xưởng` hoặc nhấn `ESC`. |
| **FR-05** | Machine Running Animation | Khi ở chế độ Inspection, máy tự động kích hoạt trạng thái vận hành: Đầu laser di chuyển theo đường cong mô phỏng, tia laser sáng trực quan, hiệu ứng tia sáng quét trên bàn gia công. | Animation chạy trơn tru lặp lại (loop); có nút toggle Bật/Tắt mô phỏng máy chạy. |
| **FR-06** | Physics Knowledge Panel | Hiển thị bảng điều khiển trượt từ cạnh phải màn hình với 4 tab: **1. Tổng quan**, **2. Nguyên lý quang học**, **3. Dải phổ & Vật liệu**, **4. Cảnh báo an toàn**. | Nội dung khoa học chính xác, trình bày công thức vật lý đẹp mắt, biểu đồ phổ trực quan, kèm nút phóng to sơ đồ. |
| **FR-07** | HUD & Environment UI | Giao diện hiển thị góc trên cùng bên trái: Tên phòng xưởng, hướng dẫn phím tắt cơ bản (`W/A/S/D`: Đi lại, `E`: Tương tác, `Shift`: Chạy nhanh, `ESC`: Thoát). | Thiết kế tối giản (Minimalist dark/glass UI), không che khuất tầm nhìn 3D. |
| **FR-08** | Responsive Adaptive UI | Thiết kế Mobile-First. Giao diện UI co giãn hoàn hảo từ Mobile ($360\text{px}$) đến Desktop ($4\text{K}$). Trên Mobile/Tablet, hỗ trợ thao tác chạm (Touch Look & Tap-to-Inspect), thanh điều hướng trạm máy dưới chân trang và Knowledge Panel chuyển thành Bottom-Sheet trượt từ dưới lên mượt mà. | Đầy đủ tính năng trên cả Mobile, Tablet và Desktop; không vỡ layout, không che khuất các nút thao tác; đạt chuẩn tương phản WCAG. |

---

### 6. Yêu cầu phi chức năng (Non-Functional Requirements)

- **Hiệu năng WebGL**:
  - Tỉ lệ khung hình (Frame Rate): $\ge 50 - 60\,\text{FPS}$ trên card đồ họa tích hợp phổ thông (Intel Iris Xe / AMD Radeon Vega) và GPU rời (Nvidia GTX 1050 trở lên).
  - Số lượng Draw Calls: Tối ưu $\le 100$ draw calls trong toàn bộ khung cảnh.
  - Số đa giác (Triangle Count): Giữ ở mức $\le 200,000$ đa giác cho toàn bộ phòng và thiết bị.
- **Thời gian tải trang & Dung lượng (Loading & Asset Size)**:
  - Thời gian tải trang ban đầu (Initial Load Time): $\le 3.0$ giây trên kết nối mạng trung bình (20 Mbps).
  - Nén toàn bộ hình ảnh và texture sang định dạng `.webp`.
  - Tổng dung lượng tải về (Total Assets): $\le 15 - 20\,\text{MB}$ nhờ nén Draco geometry.
  - Có thanh tiến trình (Loading Bar) hiển thị phần trăm nạp tài nguyên trực quan.
- **Quy chuẩn UI/UX & Khả năng tiếp cận (UI/UX & Accessibility Standards)**:
  - **Bảng màu đồng bộ (3-5 màu chủ đạo)**:
    - Nền chính (Background): Dark Slate `#0f172a`
    - Bề mặt kính mờ (Surface): Glass Slate `#1e293b`
    - Màu nhấn tương tác laser (Primary Accent): Laser Cyan `#06b6d4`
    - Màu cảnh báo bức xạ & UV (Warning/Secondary): Violet UV `#8b5cf6` & Hazard Amber `#f59e0b`
  - **Khả năng tiếp cận (Accessibility - a11y)**:
    - Đảm bảo độ tương phản màu sắc chữ/nền đạt chuẩn **WCAG AA / AAA** ($\ge 4.5:1$).
    - Sử dụng thẻ HTML ngữ nghĩa chuẩn: `<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`, `<nav>`.
    - Tất cả nút bấm và icon đều có nhãn `aria-label` cho trình đọc màn hình; mọi hình ảnh/biểu đồ đều có thuộc tính `alt`.
    - Hỗ trợ đầy đủ điều hướng bằng phím (`Tab`, `Enter`, `Space`, `ESC`).
  - **Hiệu ứng mượt mà (Micro-interactions)**:
    - Nút bấm, thẻ tab đều có hiệu ứng `transition-all duration-200`, `hover:scale-102`, `active:scale-98` tinh tế, không làm chậm giao diện.
- **Tính khả dụng & Thẩm mỹ (UI/UX)**:
  - Thiết kế theo ngôn ngữ hiện đại: Phong cách công nghiệp công nghệ cao (High-tech Lab / Cleanroom) kết hợp kính mờ Glassmorphism và đèn neon accent nhẹ nhàng.
  - Tông màu chủ đạo: Xám than chì (Dark Slate `#0f172a`), Xanh dương cyan `#06b6d4`, Đỏ cảnh báo laser `#ef4444`.
  - Hỗ trợ đầy đủ tiếng Việt chuẩn thuật ngữ khoa học vật lý và quang học.
- **Tương thích trình duyệt (Browser Compatibility)**:
  - Hoạt động mượt mà trên Chrome, Microsoft Edge, Firefox, Brave (các trình duyệt hỗ trợ WebGL 2.0).
