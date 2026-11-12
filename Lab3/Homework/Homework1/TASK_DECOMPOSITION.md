# Work Breakdown Structure (WBS) — Homework 1: Production Studio Drum Kit

* **Môn học / Lab:** Lab 3 — Production React 19, Fiber Hooks & Concurrent UI (UIT - VNUHCM)
* **Mục tiêu chất lượng:** Đạt chuẩn WCAG 2.2 AA, 100 điểm Lighthouse Accessibility, Responsive 375px–1440px, Zero `<div>`-soup, và tuân thủ tuyệt đối quy tắc React 19.
* **Quy tắc quản trị:** Chia nhỏ thành các Vertical Slices độc lập, định nghĩa Contract trước khi sinh code với AI, kiểm thử DevTools trước khi thực hiện mỗi Atomic Git Commit.
* **Trạng thái tổng thể:** Đã hoàn thành toàn bộ `HW1-01` → `HW1-05` (Verified Lighthouse Accessibility = 100/100, Best Practices = 100/100, SEO = 100/100).

---

## Tổng quan lộ trình & Atomic Git Commits

| Giai đoạn | Task ID | Tên công việc (Vertical Slice) | Deliverable / File chính | Target Git Commit | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | `HW1-01` | Khởi tạo cấu trúc, Data Schema & Audio Engine | `drumPads.js`, `useDrumAudio.js` | `feat(hw1): setup drum pad schema and Web Audio synth/loader` | `[x]` |
| **Phase 2** | `HW1-02` | Xây dựng UI Semantic & Responsive Drum Pad Grid | `DrumKit.jsx`, `DrumPad.jsx`, `DrumKit.module.css` | `feat(hw1): implement semantic WCAG 2.2 drum pad grid` | `[x]` |
| **Phase 3** | `HW1-03` | Xử lý bàn phím vật lý (`e.code`), Anti-Repeat & Focus Isolation | `useDrumKeyboard.js` | `feat(hw1): add e.code keyboard hook with anti-repeat and input isolation` | `[x]` |
| **Phase 4** | `HW1-04` | Đồng bộ phản hồi thị giác (Visual Hit Log & Decibel Meter) | `HitHistoryLog.jsx`, `DecibelMeter.jsx` | `feat(hw1): add aria-live hit log and visual decibel meter for A11y` | `[x]` |
| **Phase 5** | `HW1-05` | Kiểm thử chất lượng (375px, Lighthouse, StrictMode) & AI Audit | `AI_FAILURE_AUDIT.md`, `evidence/` | `test(hw1): verify 100 Lighthouse A11y, 375px layout and cleanup` | `[x]` |

---

## Chi tiết phân rã công việc (WBS Details)

### Phase 1: Kiến trúc dữ liệu & Audio Engine (`HW1-01`)
* **Mục tiêu:** Tách biệt dữ liệu cấu hình nhạc cụ và logic phát âm thanh khỏi tầng giao diện (UI).
* **Sub-tasks:**
  * `[x]` `HW1-01.1`: Tạo file `src/homeworks/DrumMachine/data/drumPads.js` định nghĩa mảng 7 nhạc cụ chuẩn (`w`, `a`, `s`, `d`, `j`, `k`, `l`) với cấu trúc bất biến:
    ```js
    { id: 'kick', code: 'KeyW', keyLabel: 'W', name: 'Kick Bass', freq: 110, colorToken: '--pad-kick' }
    ```
  * `[x]` `HW1-01.2`: Tạo `Map` tra cứu $O(1)$ theo `e.code` (`padByCodeMap`) để tối ưu độ trễ khi gõ phím nhanh.
  * `[x]` `HW1-01.3`: Xây dựng Custom Hook `useDrumAudio.js` quản lý `AudioContext` (khởi tạo lazy theo tương tác người dùng để tránh chính sách Autoplay của trình duyệt) và đảm bảo giải phóng/đóng node âm thanh khi component unmount.
* **Tiêu chí hoàn thành (DoD):** Gọi hàm `triggerSound(padId)` phát ra âm thanh tức thì (< 10ms latency), không rò rỉ `AudioContext` trong `<StrictMode>`.

---

### Phase 2: Giao diện Semantic & Responsive Grid (`HW1-02`)
* **Mục tiêu:** Xây dựng giao diện bàn trống tuân thủ HTML5 Semantic và WCAG 2.2 AA.
* **Sub-tasks:**
  * `[x]` `HW1-02.1`: Xây dựng component `DrumPad.jsx` sử dụng thẻ `<button type="button">` (cấm dùng `<div>` gắn `onClick`).
  * `[x]` `HW1-02.2`: Thiết lập thuộc tính ARIA chuẩn: `aria-pressed={isActive}` để thông báo trạng thái đang gõ cho trình đọc màn hình, và `aria-label={`${pad.name} (Phím ${pad.keyLabel})`}`.
  * `[x]` `HW1-02.3`: Viết CSS Module (`DrumKit.module.css`) sử dụng CSS Grid + CSS Custom Properties. Đảm bảo kích thước vùng chạm tối thiểu $44\times 44\text{px}$ (WCAG 2.2 Target Size) và hiển thị mượt mà từ `375px` (Mobile) đến `1440px` (Desktop).
  * `[x]` `HW1-02.4`: Hỗ trợ tương tác đa thiết bị bằng `onPointerDown` (thay vì `onClick`) để giảm độ trễ cảm ứng trên thiết bị di động.
* **Tiêu chí hoàn thành (DoD):** Zero `<div>`-soup bên trong `DrumKit.jsx`; không xuất hiện thanh cuộn ngang ở viewport `375px`; có viền `:focus-visible` rõ nét (độ tương phản $\ge 3:1$).

---

### Phase 3: Điều khiển bàn phím vật lý & An toàn sự kiện (`HW1-03`)
* **Mục tiêu:** Giải quyết triệt để lỗi bộ gõ tiếng Việt (UniKey/EVKey) và lỗi kẹt phím của bản Lab cũ.
* **Sub-tasks:**
  * `[x]` `HW1-03.1`: Viết Custom Hook `useDrumKeyboard.js` lắng nghe sự kiện `keydown` và `keyup` trên `window`.
  * `[x]` `HW1-03.2`: Sử dụng thuộc tính W3C `e.code` (`'KeyW'`, `'KeyA'`, `'KeyS'`, `'KeyD'`, `'KeyJ'`, `'KeyK'`, `'KeyL'`). Tuyệt đối **cấm** dùng `e.keyCode` (deprecated) hay `e.key` (dễ biến thành `'ư'`, `'ă'` khi bật Telex).
  * `[x]` `HW1-03.3`: Thêm **Anti-Repeat Guard**: `if (e.repeat) return;` để ngăn việc giữ đè phím gây spam âm thanh liên tục.
  * `[x]` `HW1-03.4`: Thêm **Input Focus Isolation**: Kiểm tra `['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)` để bỏ qua phím tắt trống khi người dùng đang nhập liệu (ví dụ: nhập tên preset hoặc tìm kiếm).
  * `[x]` `HW1-03.5`: Trả về hàm cleanup `() => window.removeEventListener(...)` trong `useEffect` với dependency array chính xác.
* **Tiêu chí hoàn thành (DoD):** Bật bộ gõ Telex tiếng Việt và nhấn phím `W` vẫn kích hoạt Kick Drum chính xác; giữ đè phím chỉ kêu đúng 1 tiếng; unmount component gỡ sạch event listener.

---

### Phase 4: Hỗ trợ người khiếm thính & Phản hồi trực quan (`HW1-04`)
* **Mục tiêu:** Đảm bảo người dùng khiếm thính hoặc dùng Screen Reader vẫn cảm nhận được nhịp điệu trống.
* **Sub-tasks:**
  * `[x]` `HW1-04.1`: Tạo thanh đo cường độ âm thanh trực quan (`DecibelMeter.jsx`) sử dụng thẻ `<meter>` hoặc `<progress>` chuẩn HTML5, cập nhật động theo biên độ âm thanh khi gõ.
  * `[x]` `HW1-04.2`: Xây dựng bảng lịch sử gõ (`HitHistoryLog.jsx`) sử dụng `<output role="status" aria-live="polite">` để cập nhật danh sách các nhịp trống vừa đánh (ví dụ: *"Kick Bass → Snare → Hi-Hat"*).
  * `[x]` `HW1-04.3`: Tạo nút gạt bật/tắt chế độ lắng nghe bàn phím (`Keyboard Lock Toggle`) sử dụng `<label htmlFor={toggleId}>` kết hợp React 19 `useId()`.
* **Tiêu chí hoàn thành (DoD):** Mọi control đều có nhãn `<label>` liên kết qua `useId()`; vùng `aria-live` cập nhật mượt mà không làm gián đoạn thao tác gõ.

---

### Phase 5: Kiểm thử DevTools, Lighthouse & AI Failure Audit (`HW1-05`)
* **Mục tiêu:** Xác minh toàn bộ tiêu chí chấm điểm và ghi nhận các lỗi của AI (nếu có sử dụng AI hỗ trợ).
* **Sub-tasks:**
  * `[x]` `HW1-05.1`: Chạy **Chrome Lighthouse Audit** (chế độ Navigation & Desktop/Mobile) -> Xác nhận điểm **Accessibility = 100** (Lưu kết quả tại `evidence/lighthouse-testing.png`, `evidence/lighthouse.html`, `evidence/lighthouse.json`).
  * `[x]` `HW1-05.2`: Kiểm tra **React DevTools Profiler** -> Xác nhận gõ 1 phím trống không gây re-render dây chuyền không cần thiết (không dùng `useEffect` để sync derived state).
  * `[x]` `HW1-05.3`: Kiểm tra mã nguồn bằng lệnh tìm kiếm đảm bảo không có API cấm (`keyCode`, `ReactDOM.render`, `class extends`, `window.alert`).
  * `[x]` `HW1-05.4`: Cập nhật các lỗi AI sinh ra trong quá trình làm HW1 (ví dụ: AI dùng `e.key` thay vì `e.code`, quên `e.repeat`, hoặc tạo `<dl>` sai cấu trúc HTML5) vào file `AI_FAILURE_AUDIT.md`.
* **Tiêu chí hoàn thành (DoD):** Sẵn sàng cho bài kiểm tra **3-Minute Live Refactoring Defense** (ví dụ: thêm nút ghi âm/phát lại beat hoặc thêm phím tắt mới trong vòng 180 giây mà không cần mở AI).
