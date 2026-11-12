# AI FAILURE AUDIT — LAB 3 / HOMEWORK 3: KRAFTON x PUBG VIETNAM CHAMPIONSHIP & AIRDROP ARENA

* **Môn học / Lab:** Phát triển ứng dụng Web — Lab 3: Production React 19, Fiber Hooks & Concurrent UI
* **Bài tập:** Homework 3 — KRAFTON x PUBG Vietnam Championship & Airdrop Arena
* **Trọng số Rubric:** 15% tổng điểm Lab 3 (`HW3-05`)

---

## 1. Lỗi AI #01 (`AI-HW3-01`) — Trôi đồng hồ đếm ngược (Timer Drift) khi ẩn Tab do dùng `setInterval(s => s - 1)`

### 1.1. Exact Prompt Used
> *"Viết hook usePubgAirdropTimer đếm ngược thời gian mở hòm thính Airdrop PVS Finals theo từng giây và hiển thị định dạng MM:SS."*

### 1.2. Faulty AI Snippet
```javascript
// LỖI: AI giảm biến đếm thủ công s => s - 1 và không lắng nghe visibilitychange
export function usePubgAirdropTimer(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return secondsLeft;
}
```

### 1.3. Root-Cause Architectural Explanation
* Trình duyệt hiện đại (Chrome / Edge Background Tab Throttling) tự động giảm tần suất `setInterval` trong các tab nền xuống còn **1 lần mỗi phút** (hoặc tạm dừng hoàn toàn khi tiết kiệm pin).
* Khi dựa vào phép trừ tích lũy `s => s - 1`, nếu người chơi chuyển sang tab khác 45 giây rồi quay lại, đồng hồ bị lệch (drift) gần 40 giây so với thời gian thực của máy chủ KRAFTON.

### 1.4. Chrome DevTools / Network / Profiler Proof
* Giả lập chuyển tab ẩn (`document.visibilityState = 'hidden'`) và dịch chuyển đồng hồ hệ thống thêm 30.000ms: cách viết `s => s - 1` bị trễ 29 giây; trong khi công thức lấy độ lệch thời gian thực `targetEpochMs - (Date.now() + serverOffsetMs)` kết hợp sự kiện `document.addEventListener('visibilitychange', syncWallClock)` đồng bộ lại sai số **0.0ms** ngay khi tab hiển thị trở lại.

### 1.5. Verified Manual Fix + Git Commit Hash
* **Commit:** `b9a76ee` (`feat(hw3): implement anti-drift airdrop timer with visibilitychange sync`)
* **Bản vá trong `src/homeworks/KraftonPubgVnArena/usePubgAirdropTimer.js`:**
```javascript
const syncWallClock = () => {
  const nextRemaining = Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs));
  setRemainingMs(nextRemaining);
};
```

---

## 2. Lỗi AI #02 (`AI-HW3-02`) — Hỏng State Tồn Kho khi Rollback lỗi `409 Conflict` & Race Condition khi Double-Click

### 2.1. Exact Prompt Used
> *"Viết hàm claimCrate giảm số lượng remainingStock ngay khi bấm nút (Optimistic UI) và hoàn trả lại nếu API trả về lỗi 409 Conflict."*

### 2.2. Faulty AI Snippet
```javascript
// LỖI: Không khóa in-flight idempotency, dùng stale state `drops` khi rollback và gọi window.alert()
const claimCrate = async (dropId) => {
  const snapshot = [...drops];
  setDrops(drops.map((d) => (d.id === dropId ? { ...d, remainingStock: d.remainingStock - 1 } : d)));
  try {
    await claimDropRequest(dropId);
  } catch (err) {
    window.alert('Lỗi 409: Hòm thính đã hết!'); // VI PHẠM RULE 2: Cấm window.alert
    setDrops(snapshot); // Ghi đè làm mất kết quả của các hòm thính khác!
  }
};
```

### 2.3. Root-Cause Architectural Explanation
1. **Thiếu Idempotent Click Lock (`inFlightIds`)**: Người dùng bấm đúp (double-click) nhanh vào nút *"Claim VIP Pass"* sẽ bắn 2 request trùng lặp và trừ `remainingStock` đi 2 đơn vị.
2. **Stale Snapshot Rollback (`setDrops(snapshot)`)**: Khôi phục toàn bộ mảng `snapshot` cũ sẽ xóa sạch thay đổi hợp lệ của các hòm thính anh em (`sibling crates`) vừa cập nhật trong lúc chờ mạng.
3. **Vi phạm Rule 2 (`NO LEGACY APIS`)**: Sử dụng `window.alert()` làm đóng băng luồng chính (main thread) và chặn bộ đếm ngược Airdrop.

### 2.4. Chrome DevTools / Network / Profiler Proof
* Kiểm thử tự động trong `scripts/verify-hw3.mjs`: Khi kích hoạt `claimCrate('drop-awm-contraband')`, tồn kho giảm tức thì từ `1 → 0` (`< 16ms`). Khi máy chủ trả về `HTTP 409 Conflict (LOOTED_OUT)` sau 360ms, tồn kho được hoàn trả chính xác về `1` (`data-stock-for="drop-awm-contraband"`), trạng thái chuyển sang `'LOOTED_OUT'`, hiển thị `<section id="conflict-alert-banner" role="alert">` mà không ảnh hưởng đến hòm `drop-pvs-vip-pass`.

### 2.5. Verified Manual Fix + Git Commit Hash
* **Commit:** `e4ca9ff` (`feat(hw3): add idempotent optimistic crate claim and 409 conflict rollback`)
* **Bản vá trong `src/homeworks/KraftonPubgVnArena/useOptimisticClaim.js`:** Sử dụng `inFlightLockRef.current.has(dropId)` để chặn click đúp, cập nhật bất biến theo từng `dropId` qua `setDrops((prev) => prev.map(...))` và hiển thị lỗi qua `<section role="alert">`.

---

## 3. Lỗi AI #03 (`AI-HW3-03`) — Dùng `useEffect` đồng bộ State dẫn xuất (`filteredSquads`) & Mutate mảng gốc bằng `.sort()`

### 3.1. Exact Prompt Used
> *"Hiển thị bảng xếp hạng các đội tuyển PUBG VN có tìm kiếm theo tên, lọc khu vực và sắp xếp theo tổng điểm."*

### 3.2. Faulty AI Snippet
```javascript
// LỖI: AI tạo state dư thừa filteredSquads, dùng useEffect để đồng bộ và gọi .sort() làm biến đổi mảng gốc
const [filteredSquads, setFilteredSquads] = useState(PUBG_VN_SQUADS);

useEffect(() => {
  const result = squads
    .filter((s) => s.squadName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.placementPts + b.killPts) - (a.placementPts + a.killPts));
  setFilteredSquads(result);
}, [searchQuery, squads]);
```

### 3.3. Root-Cause Architectural Explanation
1. **Vi phạm Rule 5 (`STATE HYGIENE`)**: Lưu kết quả lọc/sắp xếp vào `useState` rồi đồng bộ qua `useEffect` khiến mỗi lần gõ 1 ký tự vào ô tìm kiếm phải chịu **2 chu kỳ render (cascading double-render)**: lần 1 render với danh sách cũ, sau đó `useEffect` chạy `setFilteredSquads` kích hoạt lần render thứ 2.
2. **Đột biến mảng gốc (Array Mutation)**: Phương thức `.sort()` sắp xếp tại chỗ (in-place mutation) trên mảng `squads` nếu không sao chép, trái với chuẩn bất biến ES2023 `.toSorted()`.

### 3.4. Chrome DevTools / Network / Profiler Proof
* Kiểm tra trên React DevTools Profiler & `oxlint`: Khi tính `visibleSquads` trực tiếp trong thân hàm render bằng `.map(...).filter(...).toSorted(...)`, thao tác gõ tìm kiếm `"Cerberus"` hoàn tất chỉ trong **1 lần render duy nhất** (`< 2ms`).

### 3.5. Verified Manual Fix + Git Commit Hash
* **Commit:** `085fdd8` (`feat(hw3): build derived PVS leaderboard with search and toSorted`)
* **Bản vá trong `src/homeworks/KraftonPubgVnArena/PvsLeaderboard.jsx`:** Tính toán `totalPoints = squad.placementPts + squad.killPts`, `.filter()`, và `.toSorted()` trực tiếp trong quá trình render, hoàn toàn không dùng `useEffect`.
