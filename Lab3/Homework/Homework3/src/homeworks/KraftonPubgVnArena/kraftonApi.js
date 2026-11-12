/**
 * @file kraftonApi.js
 * @description Dịch vụ mạng mô phỏng KRAFTON Airdrop Claim Endpoint
 * Hỗ trợ `AbortSignal` và trả về lỗi `409 Conflict` ('LOOTED_OUT') khi hòm thính đã bị người chơi khác giành mất.
 */

export class KraftonHttpError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   */
  constructor(status, code, message) {
    super(message);
    this.name = 'KraftonHttpError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Gửi yêu cầu nhận hòm thính Airdrop / Vé VIP với độ trễ mô phỏng (380ms)
 * @param {string} dropId
 * @param {{ signal?: AbortSignal, simulateConflict?: boolean, currentStock?: number }} options
 */
export function claimDropRequest(
  dropId,
  { signal, simulateConflict = false, currentStock = 1 } = {}
) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Claim request aborted', 'AbortError'));
      return;
    }

    const latencyMs = 360;
    const timerId = globalThis.setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Claim request aborted', 'AbortError'));
        return;
      }

      if (simulateConflict || currentStock <= 0) {
        reject(
          new KraftonHttpError(
            409,
            'LOOTED_OUT',
            `HTTP 409 Conflict (LOOTED_OUT): Hòm thính [${dropId}] vừa bị đội khác loot hết trên máy chủ KRAFTON! Đã hoàn trả (Rollback) số lượng tồn kho.`
          )
        );
        return;
      }

      resolve({
        ok: true,
        status: 200,
        dropId,
        claimedAtIso: new Date().toISOString(),
      });
    }, latencyMs);

    signal?.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(timerId);
        reject(new DOMException('Claim request aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}
