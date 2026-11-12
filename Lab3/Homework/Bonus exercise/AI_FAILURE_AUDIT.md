# AI FAILURE AUDIT — LAB 3 / BONUS EXERCISE: 'HẸN HÒ NHƯNG KHÔNG YÊU' STATE MACHINE

* **Môn học / Lab:** Phát triển ứng dụng Web — Lab 3: Production React 19, Fiber Hooks & Concurrent UI
* **Bài tập:** Bonus Exercise — 'Hẹn Hò Nhưng Không Yêu' Finite State Machine (FSM) & Asymmetric Effort Analyzer

---

## 1. Lỗi AI #01 (`AI-BONUS-01`) — "Situationship Boolean Soup" tạo ra trạng thái mâu thuẫn không thể xảy ra

### Prompt đã sử dụng
> *"Quản lý trạng thái mối quan hệ hẹn hò mập mờ, yêu chính thức và rời đi trong component SituationshipAnalyzer."*

### Đoạn code lỗi do AI sinh ra
```javascript
// LỖI: Boolean Soup cho phép 2^4 = 16 tổ hợp, trong đó có nhiều tổ hợp vô lý
const [isDating, setIsDating] = useState(true);
const [isLoved, setIsLoved] = useState(false);
const [isOfficial, setIsOfficial] = useState(false);
const [isGhosted, setIsGhosted] = useState(false);
```

### Phân tích nguyên nhân gốc rễ & Bản vá kiến trúc
* Khi dùng 4 biến boolean rời rạc, nếu quên reset 1 cờ khi chuyển pha, giao diện có thể rơi vào trạng thái mâu thuẫn (`isOfficial === true && isGhosted === true`).
* **Bản vá (`src/homeworks/HenHoKhongYeu/relationshipFsm.js`):** Thay thế toàn bộ cờ boolean bằng duy nhất 1 state `phase` thuộc tập hợp hữu hạn `'FRIENDS' | 'DATING_NO_LOVE' | 'OFFICIAL_LOVE' | 'GHOSTED_EXIT'` và kiểm soát chuyển tiếp qua hàm thuần `transitionRelationshipPhase(currentPhase, nextPhase)`.

---

## 2. Lỗi AI #02 (`AI-BONUS-02`) — Đồng bộ `isRedFlag` bằng `useEffect` gây Double-Render

### Prompt đã sử dụng
> *"Tính điểm nỗ lực của Em (×0.1) và Ai đó (×50.0), nếu đang DATING_NO_LOVE mà điểm Em nhỏ hơn thì bật cờ isRedFlag."*

### Đoạn code lỗi do AI sinh ra
```javascript
const [isRedFlag, setIsRedFlag] = useState(false);

useEffect(() => {
  const emScore = signals.filter((s) => s.actor === 'EM').reduce((a, b) => a + b.steps * 0.1, 0);
  const rivalScore = signals.filter((s) => s.actor === 'AI_DO').reduce((a, b) => a + b.steps * 50, 0);
  setIsRedFlag(phase === 'DATING_NO_LOVE' && emScore < rivalScore);
}, [phase, signals]);
```

### Phân tích nguyên nhân gốc rễ & Bản vá kiến trúc
* Vi phạm trực tiếp **Rule 5 (`STATE HYGIENE`)**: `isRedFlag`, `emImpactScore`, và `rivalImpactScore` hoàn toàn phụ thuộc hàm số vào `phase` và `signals`. Dùng `useEffect` tạo ra 1 lần render trung gian dư thừa với giá trị `isRedFlag` cũ.
* **Bản vá (`src/homeworks/HenHoKhongYeu/effortReducer.js`):** Tính toán trực tiếp `const derived = computeDerivedCompatibility(phase, signals)` ngay trong thân hàm render của `SituationshipAnalyzer.jsx` (1 render pass duy nhất).

---

## 3. Lỗi AI #03 (`AI-BONUS-03`) — Rò rỉ bộ đếm Ghosting Timer sau khi bấm "Unbind & Free Memory"

### Prompt đã sử dụng
> *"Tạo bộ đếm 5 giây chờ phản hồi tin nhắn, nếu không trả lời thì tự động chuyển sang GHOSTED_EXIT."*

### Đoạn code lỗi do AI sinh ra
```javascript
useEffect(() => {
  if (phase === 'DATING_NO_LOVE') {
    setTimeout(() => {
      setPhase('GHOSTED_EXIT');
    }, 5000);
  }
}, [phase]);
```

### Phân tích nguyên nhân gốc rễ & Bản vá kiến trúc
* Không lưu `timeoutId` để gọi `clearTimeout` và không hủy `AbortController` của tiến trình kiểm tra "Đã xem (Seen)". Nếu người dùng chủ động chuyển sang `OFFICIAL_LOVE` ở giây thứ `2.5s`, đến giây thứ `5.0s` callback `setTimeout` cũ vẫn nổ và ép trạng thái sang `GHOSTED_EXIT` sai quy tắc!
* **Bản vá (`src/homeworks/HenHoKhongYeu/useGhostingTimer.js`):** Trả về hàm cleanup hủy đồng thời `controller.abort()`, `window.clearInterval(intervalId)` và `window.clearTimeout(timeoutId)` ngay khi rời khỏi pha `DATING_NO_LOVE` hoặc unmount.
