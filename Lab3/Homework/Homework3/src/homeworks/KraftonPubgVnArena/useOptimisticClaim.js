import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialCrateDrops } from './data/pubgVnDataset.js';
import { claimDropRequest } from './kraftonApi.js';

/**
 * Custom Hook quản lý Optimistic UI Claim cho hòm thính Airdrop & Vé VIP PVS Finals
 * - Bất biến 1 (Idempotency): Khóa click trùng lặp bằng `inFlightIds` (`Set<string>`)
 * - Bất biến 2 (Optimistic Deduction): Giảm `remainingStock` ngay lập tức (< 16ms) trước khi mạng phản hồi
 * - Bất biến 3 (Atomic 409 Rollback): Khi gặp HTTP 409 ('LOOTED_OUT'), khôi phục chính xác `remainingStock` trước đó,
 *   đánh dấu trạng thái `'LOOTED_OUT'` và công bố lỗi qua `<section role="alert">` (tuyệt đối không dùng `window.alert`).
 */
export function useOptimisticClaim(initialDrops = null) {
  const [drops, setDrops] = useState(() =>
    initialDrops || createInitialCrateDrops()
  );
  const [inFlightIds, setInFlightIds] = useState(() => new Set());
  const [alertMessage, setAlertMessage] = useState(null);
  const [statusLog, setStatusLog] = useState(
    'Sẵn sàng săn hòm thính KRAFTON PVS Finals.'
  );

  const inFlightLockRef = useRef(new Set());
  const abortControllersRef = useRef(new Map());

  const claimCrate = useCallback(
    async (dropId) => {
      // HW3-03.1: Idempotent Click Lock
      if (inFlightLockRef.current.has(dropId)) {
        return { ignoredDuplicate: true };
      }

      const targetDrop = drops.find((d) => d.id === dropId);
      if (!targetDrop || targetDrop.phase === 'LOOTED_OUT') {
        return { ignoredDuplicate: true };
      }

      const snapshotStock = targetDrop.remainingStock;
      const snapshotPhase = targetDrop.phase;

      inFlightLockRef.current.add(dropId);
      setInFlightIds((prev) => {
        const next = new Set(prev);
        next.add(dropId);
        return next;
      });
      setAlertMessage(null);

      // HW3-03.2: Optimistic UI Stock Deduction (< 16ms)
      const optimisticStock = Math.max(0, snapshotStock - 1);
      setDrops((prev) =>
        prev.map((item) =>
          item.id === dropId
            ? Object.freeze({
                ...item,
                remainingStock: optimisticStock,
              })
            : item
        )
      );
      setStatusLog(
        `[Optimistic UI] Đang giữ chỗ "${targetDrop.title}" (Tồn kho tạm tính: ${optimisticStock})...`
      );

      const controller = new AbortController();
      abortControllersRef.current.set(dropId, controller);

      try {
        await claimDropRequest(dropId, {
          signal: controller.signal,
          simulateConflict: Boolean(targetDrop.forceConflict409),
          currentStock: snapshotStock,
        });

        // Thành công 200 OK: Chốt số lượng mới; nếu hết hàng sau lần mua này thì chuyển sang LOOTED_OUT
        setDrops((prev) =>
          prev.map((item) =>
            item.id === dropId
              ? Object.freeze({
                  ...item,
                  remainingStock: optimisticStock,
                  phase: optimisticStock === 0 ? 'LOOTED_OUT' : item.phase,
                })
              : item
          )
        );
        setStatusLog(
          `[200 OK] Nhận thành công "${targetDrop.title}"! Số lượng còn lại: ${optimisticStock}.`
        );
        return { ok: true, rolledBack: false };
      } catch (err) {
        if (err?.name === 'AbortError') {
          return { aborted: true };
        }

        // HW3-03.3: Atomic 409 Conflict Rollback
        setDrops((prev) =>
          prev.map((item) =>
            item.id === dropId
              ? Object.freeze({
                  ...item,
                  remainingStock: snapshotStock,
                  phase: err?.status === 409 ? 'LOOTED_OUT' : snapshotPhase,
                })
              : item
          )
        );

        const rollbackMsg =
          err?.message ||
          `Lỗi mạng khi nhận "${targetDrop.title}". Đã hoàn trả tồn kho về ${snapshotStock}.`;
        setAlertMessage({
          dropId,
          title: targetDrop.title,
          status: err?.status || 500,
          restoredStock: snapshotStock,
          message: rollbackMsg,
        });
        setStatusLog(
          `[409 ROLLBACK] Đã hoàn trả tồn kho "${targetDrop.title}" về ${snapshotStock} và khóa trạng thái LOOTED_OUT.`
        );
        return { ok: false, rolledBack: true, restoredStock: snapshotStock };
      } finally {
        inFlightLockRef.current.delete(dropId);
        abortControllersRef.current.delete(dropId);
        setInFlightIds((prev) => {
          if (!prev.has(dropId)) return prev;
          const next = new Set(prev);
          next.delete(dropId);
          return next;
        });
      }
    },
    [drops]
  );

  const dismissAlert = useCallback(() => {
    setAlertMessage(null);
  }, []);

  const resetArenaDrops = useCallback(() => {
    for (const controller of abortControllersRef.current.values()) {
      controller.abort();
    }
    abortControllersRef.current.clear();
    inFlightLockRef.current.clear();
    setInFlightIds(new Set());
    setAlertMessage(null);
    setDrops(createInitialCrateDrops(Date.now()));
    setStatusLog('Đã làm mới toàn bộ hòm thính Airdrop PVS Finals.');
  }, []);

  useEffect(() => {
    const controllersMap = abortControllersRef.current;
    return () => {
      for (const controller of controllersMap.values()) {
        controller.abort();
      }
      controllersMap.clear();
    };
  }, []);

  return {
    drops,
    inFlightIds,
    alertMessage,
    statusLog,
    claimCrate,
    dismissAlert,
    resetArenaDrops,
  };
}
