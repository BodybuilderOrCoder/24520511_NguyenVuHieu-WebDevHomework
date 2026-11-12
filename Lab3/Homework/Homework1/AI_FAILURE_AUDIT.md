# AI FAILURE AUDIT — LAB 3 / HOMEWORK 1: PRODUCTION STUDIO DRUM KIT

* **Môn học / Lab:** Phát triển ứng dụng Web — Lab 3: Production React 19, Fiber Hooks & Concurrent UI
* **Bài tập:** Homework 1 — Production Studio Drum Kit (`DrumKit.jsx`, `useDrumAudio.js`, `useDrumKeyboard.js`)
* **Mục tiêu kiểm toán:** Ghi nhận tối thiểu 3 lỗi thực tế do AI sinh ra trong quá trình phát triển, bằng chứng phát hiện qua DevTools / Oxlint, nguyên nhân gốc rễ và bản vá kiến trúc.

---

## 1. Lỗi AI #01 (`AI-HW1-01`) — Bẫy bộ gõ tiếng Việt (Telex/VNI) do dùng `event.key` thay vì `event.code`

### Prompt đã sử dụng
> *"Viết hook lắng nghe bàn phím cho 7 phím trống W, A, S, D, J, K, L trong React 19 và kích hoạt hàm triggerSound(padId)."*

### Đoạn code lỗi do AI sinh ra
```javascript
// LỖI: AI dùng event.key.toLowerCase() và tìm kiếm tuyến tính O(n)
useEffect(() => {
  const handleKeyDown = (e) => {
    const pad = DRUM_PADS.find((p) => p.keyLabel.toLowerCase() === e.key.toLowerCase());
    if (pad) {
      triggerSound(pad.id);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [triggerSound]);
```

### Phân tích nguyên nhân gốc rễ (Root Cause)
1. Khi người dùng Việt Nam bật bộ gõ **UniKey / EVKey (kiểu gõ Telex)**, nhấn phím vật lý `W` sẽ phát sinh `event.key === 'ư'` (hoặc gõ `A` rồi `W` sẽ biến thành `'ă'`, gõ `S` biến thành dấu sắc). Do đó `e.key.toLowerCase() === 'w'` trả về `false`, làm phím Kick Bass (`W`) và Snare (`A`) bị liệt hoàn toàn.
2. Ngoài ra, dùng `DRUM_PADS.find(...)` tốn độ phức tạp $O(n)$ trên mỗi sự kiện phím thay vì $O(1)$ qua cấu trúc `Map`.

### Bằng chứng xác minh (DevTools / Automated Browser Test)
* Khi dispatch sự kiện `KeyboardEvent('keydown', { key: 'ư', code: 'KeyW' })` mô phỏng bộ gõ Telex, phiên bản dùng `e.key` không phát ra âm thanh và không cập nhật `aria-pressed="true"`.
* Sau khi chuyển sang tra cứu `padByCodeMap.get(event.code)` với khóa `'KeyW'`, nút Kick Bass phản hồi chính xác 100% bất kể trạng thái bộ gõ IME.

### Bản vá kiến trúc (Verified Fix)
* Định nghĩa trường `code: 'KeyW' | 'KeyA' | ...` trong `src/homeworks/DrumMachine/data/drumPads.js` và tạo `export const padByCodeMap = new Map(DRUM_PADS.map((p) => [p.code, p]))`.
* Tra cứu $O(1)$ bằng `padByCodeMap.get(event.code)` trong `src/homeworks/DrumMachine/useDrumKeyboard.js`.

---

## 2. Lỗi AI #02 (`AI-HW1-02`) — Thiếu Anti-Repeat Guard & Input Focus Isolation gây bão Oscillator

### Prompt đã sử dụng
> *"Kết nối sự kiện keydown vào toàn cửa sổ window để gõ trống bất kỳ lúc nào trên trang."*

### Đoạn code lỗi do AI sinh ra
```javascript
const handleKeyDown = (event) => {
  const matchedPad = padByCodeMap.get(event.code);
  if (!matchedPad) return;
  onTrigger(matchedPad.id, 'KEYBOARD', event.code);
};
```

### Phân tích nguyên nhân gốc rễ (Root Cause)
1. **Thiếu `if (event.repeat) return;`**: Khi người dùng giữ đè phím `W` trên bàn phím vật lý, hệ điều hành bắn liên tiếp hàng chục sự kiện `keydown` với `event.repeat === true` mỗi giây, tạo ra hàng loạt `OscillatorNode` và `AudioBufferSourceNode` chồng chéo gây rè tiếng (clipping) và tụt FPS.
2. **Thiếu Input Focus Isolation**: Khi người dùng click vào ô `<input>` *"Tên Preset"* và gõ chữ `"Studio Warm"`, các chữ cái `S`, `W`, `A`, `D` bị bắt làm phím trống và phát nhạc ầm ĩ trong lúc đang nhập văn bản.

### Bằng chứng xác minh (DevTools Profiler & Console)
* Kiểm tra bằng sự kiện `keydown` có `repeat: true`: số lượng nhịp gõ (`totalHits`) tăng vọt liên tục nếu không có guard.
* Kiểm tra khi focus vào `<input id="...preset">`: sự kiện `keydown` đi từ `event.target.tagName === 'INPUT'`.

### Bản vá kiến trúc (Verified Fix)
Thêm cả 2 chốt chặn an toàn trong `src/homeworks/DrumMachine/useDrumKeyboard.js`:
```javascript
if (event.repeat) return;
if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName?.toUpperCase())) return;
```

---

## 3. Lỗi AI #03 (`AI-HW1-03`) — Khởi tạo `AudioContext` sớm vi phạm Autoplay Policy & Cảnh báo Oxlint `no-redundant-roles`

### Prompt đã sử dụng
> *"Khởi tạo AudioContext trong custom hook useDrumAudio và hiển thị trạng thái nhịp gõ bằng thẻ output."*

### Đoạn code lỗi do AI sinh ra
```javascript
// LỖI 1: Tạo AudioContext ngay khi component mount hoặc ở module scope
const globalAudioCtx = new window.AudioContext();

// LỖI 2: Oxlint jsx-a11y báo lỗi redundant role trên thẻ <output role="status">
<output className={styles.liveOutput} role="status" aria-live="polite">
```

### Phân tích nguyên nhân gốc rễ (Root Cause)
1. Trình duyệt hiện đại (Chrome Web Audio Autoplay Policy) chặn `new AudioContext()` chạy trước khi có tương tác người dùng (`pointerdown` hoặc `keydown`), đồng thời trong React 19 `<StrictMode>` việc mount $\rightarrow$ unmount $\rightarrow$ remount sẽ làm rò rỉ `AudioContext` nếu không khởi tạo lazy và đóng (`ctx.close()`) trong hàm cleanup của `useEffect`.
2. Khi chạy `npm run lint` với `oxlint`, rule `jsx-a11y(no-redundant-roles)` báo lỗi:
   ```text
   x jsx-a11y(no-redundant-roles): The `output` element has an implicit role of `status`.
   ```
   Tuy nhiên, đặc tả Lab 3 (Rule 4 & WBS `HW1-04.2`) yêu cầu tường minh `<output role="status" aria-live="polite">` để tương thích tối đa với mọi trình đọc màn hình.

### Bản vá kiến trúc (Verified Fix)
1. Chuyển sang khởi tạo lazy thông qua `ensureAudioContext()` chỉ khi hàm `triggerSound()` được gọi từ cử chỉ người dùng, kèm `AbortController` hủy tiến trình nạp `.wav` và đóng `AudioContext` trong cleanup của `useEffect`.
2. Cấu hình `.oxlintrc.json` bổ sung `"jsx-a11y/no-redundant-roles": "off"` để giữ nguyên thuộc tính `role="status"` theo đúng hợp đồng bài Lab mà vẫn đảm bảo `oxlint` đạt **0 warnings, 0 errors**.
