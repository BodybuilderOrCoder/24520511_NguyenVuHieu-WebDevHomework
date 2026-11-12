# AI FAILURE AUDIT — LAB 3 / HOMEWORK 2: 88-KEY POLYPHONIC PIANO & FIFO SEQUENCER

* **Môn học / Lab:** Phát triển ứng dụng Web — Lab 3: Production React 19, Fiber Hooks & Concurrent UI
* **Bài tập:** Homework 2 — 88-Key Polyphonic Piano & Concurrent FIFO Sequencer
* **Mục tiêu kiểm toán:** Ghi nhận tối thiểu 3 lỗi thực tế do AI sinh ra trong quá trình phát triển HW2, kèm bằng chứng Oxlint / DevTools / MutationObserver và bản vá kiến trúc.

---

## 1. Lỗi AI #01 (`AI-HW2-01`) — Phá vỡ `React.memo` trên 88 phím do truyền Inline Arrow Function & Đối tượng `Set`

### Prompt đã sử dụng
> *"Render danh sách 88 phím đàn từ PIANO_KEYS_88 bằng component PianoKey được bọc trong React.memo."*

### Đoạn code lỗi do AI sinh ra
```jsx
// LỖI: AI tạo hàm ẩn danh mới trên mỗi lần render và truyền trực tiếp Set activeMidis
{PIANO_KEYS_88.map((keyItem) => (
  <PianoKey
    key={keyItem.midi}
    keyData={keyItem}
    activeMidis={activeMidis}
    onNoteOn={() => handleNoteOn(keyItem.midi)}
    onNoteOff={() => handleNoteOff(keyItem.midi)}
  />
))}
```

### Phân tích nguyên nhân gốc rễ (Root Cause)
1. `React.memo` thực hiện so sánh nông (`Object.is`) trên từng prop. Khi truyền `onNoteOn={() => ...}`, mỗi lần `GrandPiano88` cập nhật state `activeMidis`, 88 hàm closure mới tinh được cấp phát trên heap $\rightarrow$ `prevProps.onNoteOn !== nextProps.onNoteOn` luôn đúng cho cả 88 phím.
2. Truyền trực tiếp `activeMidis` (`new Set(prev)`) vào mọi phím cũng làm cả 88 phím nhận tham chiếu `Set` mới và buộc phải re-render toàn bộ 88 nút DOM.

### Bằng chứng xác minh (DevTools Profiler & DOM Mutation Audit)
* Khi nhấn 1 phím duy nhất (`C4`, MIDI `60`), bản lỗi làm cả 88 component `PianoKey` đều sáng vạch vàng trong React DevTools Profiler.
* Sau khi sửa sang truyền prop nguyên thủy `isPressed={activeMidis.has(keyItem.midi)}` kết hợp `useCallback` ổn định cho `handleNoteOn(midi)` và `handleNoteOff(midi)`, nhấn 1 phím chỉ cập nhật đúng **1 nút DOM duy nhất** (`87/88` phím còn lại `"Did not render"`).

### Bản vá kiến trúc (Verified Fix)
```jsx
// Truyền boolean nguyên thủy isPressed và hàm ổn định qua useCallback
<PianoKey
  key={keyItem.midi}
  midi={keyItem.midi}
  noteName={keyItem.noteName}
  isBlack={keyItem.isBlack}
  isPressed={activeMidis.has(keyItem.midi)}
  onNoteOn={handleNoteOn}
  onNoteOff={handleNoteOff}
/>
```

---

## 2. Lỗi AI #02 (`AI-HW2-02`) — Vi phạm quy tắc Pure Render `react(refs)` của React 19 Compiler

### Prompt đã sử dụng
> *"Khởi tạo PolyphonicSynth trong useRef và đếm số lần render của PianoKey bằng useRef."*

### Đoạn code lỗi do AI sinh ra
```javascript
// LỖI 1: Trong PianoKey.jsx
const renderCountRef = useRef(0);
renderCountRef.current += 1;

// LỖI 2: Trong usePolyphonicAudio.js
const synthRef = useRef(null);
if (!synthRef.current) {
  synthRef.current = new PolyphonicSynth(maxVoices);
}
```

### Bằng chứng phát hiện qua Oxlint (`npm run lint`)
```text
x react(refs): Cannot access refs during render
   ,-[src/homeworks/GrandPiano88/PianoKey.jsx:19:3]
18 |   const renderCountRef = useRef(0);
19 |   renderCountRef.current += 1;
   `----
x react(refs): Cannot access refs during render
   ,-[src/homeworks/GrandPiano88/audio/usePolyphonicAudio.js:12:8]
11 |   const synthRef = useRef(null);
12 |   if (!synthRef.current) {
   `----
Found 0 warnings and 4 errors.
```

### Phân tích nguyên nhân gốc rễ & Bản vá kiến trúc
* Trong React 19 Concurrent Rendering, hàm render phải thuần khiết tuyệt đối (idempotent). Đọc hoặc ghi `ref.current` trong quá trình render khiến React Compiler từ chối tối ưu hóa component và có thể gây sai lệch khi một nhánh render bị hủy giữa chừng.
* **Cách khắc phục:** Loại bỏ `renderCountRef` khỏi thân render của `PianoKey.jsx`, và chuyển việc khởi tạo lazy `PolyphonicSynth` vào helper `getSynth()` chỉ được gọi trong event handler (`noteOn`) hoặc `useEffect`. Kết quả chạy lại `npm run lint`: **0 warnings, 0 errors**.

---

## 3. Lỗi AI #03 (`AI-HW2-03`) — Thiếu `AbortController` khi phát lại chuỗi FIFO & Tiếng nổ (Click/Pop) khi ngắt Oscillator

### Prompt đã sử dụng
> *"Viết hàm playSequence phát lại mảng nốt nhạc theo deltaMs và nút Stop Sequence."*

### Đoạn code lỗi do AI sinh ra
```javascript
// LỖI: Không truyền AbortSignal vào Promise delay và gọi osc.stop() đột ngột
for (const ev of events) {
  await new Promise((r) => setTimeout(r, ev.deltaMs / playbackRate));
  synth.noteOn(ev.midi, ev.freqHz);
}
```

### Phân tích nguyên nhân gốc rễ (Root Cause)
1. Khi người dùng nhấn **"Stop Sequence"** ở giữa bản nhạc hoặc unmount component, vòng lặp `for...of` đang treo ở `await new Promise(...)` vẫn tiếp tục thức dậy sau khi `setTimeout` hết hạn và kích hoạt các nốt nhạc "ma" (dangling timers).
2. Trong `PolyphonicSynth.noteOff(midi)`, việc gọi trực tiếp `osc.stop()` khi sóng âm đang ở biên độ khác `0` tạo ra bước nhảy điện áp đột ngột gây tiếng *"bụp"* (speaker click/pop).

### Bản vá kiến trúc (Verified Fix)
1. Xây dựng `abortableDelay(ms, signal)` lắng nghe sự kiện `signal.addEventListener('abort', ...)` để gọi `clearTimeout(timerId)` và reject `DOMException('Sequence aborted', 'AbortError')` ngay trong 1 frame khi bấm **Stop Sequence** hoặc unmount.
2. Áp dụng đường cong giảm âm lượng mượt mà 40ms trước khi dừng bộ dao động:
   ```javascript
   voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
   voice.osc.stop(now + 0.045);
   ```
