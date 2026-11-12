/**
 * @file relationshipFsm.js
 * @description Máy trạng thái hữu hạn (Deterministic Finite State Machine - FSM)
 * mô hình hóa ca khúc "Hẹn Hò Nhưng Không Yêu" (Wendy Thảo).
 * Loại bỏ hoàn toàn "Boolean Soup" (`isDating && !isLoved && !hasTitle`).
 */

export const RELATIONSHIP_PHASES = Object.freeze({
  FRIENDS: 'FRIENDS',                 // Trạng thái khởi đầu
  DATING_NO_LOVE: 'DATING_NO_LOVE',   // "Hẹn hò nhưng không yêu" (Nguy cơ Red-Flag cao)
  OFFICIAL_LOVE: 'OFFICIAL_LOVE',     // Cam kết chính thức từ hai phía
  GHOSTED_EXIT: 'GHOSTED_EXIT',       // Tự trọng rời đi & Giải phóng bộ nhớ (Unbind & Free Memory)
});

export const PHASE_META = Object.freeze({
  FRIENDS: Object.freeze({
    code: 'FRIENDS',
    badge: 'PHASE 01 • BASELINE',
    title: 'Bạn Bè Bình Thường (Friends)',
    lyricQuote: '“Chưa bước qua ranh giới mập mờ...”',
  }),
  DATING_NO_LOVE: Object.freeze({
    code: 'DATING_NO_LOVE',
    badge: 'PHASE 02 • SITUATIONSHIP WARNING',
    title: 'Hẹn Hò Nhưng Không Yêu (Dating — No Title)',
    lyricQuote: '“Hẹn hò nhưng không yêu, chắc em là kẻ ngốc...”',
  }),
  OFFICIAL_LOVE: Object.freeze({
    code: 'OFFICIAL_LOVE',
    badge: 'PHASE 03 • MUTUAL COMMITMENT',
    title: 'Yêu Chính Thức (Official Love)',
    lyricQuote: '“Danh chính ngôn thuận, nỗ lực song phương.”',
  }),
  GHOSTED_EXIT: Object.freeze({
    code: 'GHOSTED_EXIT',
    badge: 'PHASE 04 • MEMORY UNMOUNTED',
    title: 'Dừng Lại & Rời Đi (Ghosted / Self-Respect Exit)',
    lyricQuote: '“Đừng làm trái tim em thêm đau nữa... Unbind & Free Memory!”',
  }),
});

/**
 * Bảng chuyển trạng thái hợp lệ (Deterministic Transition Table)
 */
const ALLOWED_TRANSITIONS = Object.freeze({
  FRIENDS: new Set(['DATING_NO_LOVE']),
  DATING_NO_LOVE: new Set(['OFFICIAL_LOVE', 'GHOSTED_EXIT', 'FRIENDS']),
  OFFICIAL_LOVE: new Set(['FRIENDS', 'GHOSTED_EXIT']),
  GHOSTED_EXIT: new Set(['FRIENDS']),
});

/**
 * Chuyển trạng thái an toàn theo đúng luật FSM
 * @param {string} currentPhase
 * @param {string} nextPhase
 * @returns {string}
 */
export function transitionRelationshipPhase(currentPhase, nextPhase) {
  const allowed = ALLOWED_TRANSITIONS[currentPhase];
  if (!allowed || !allowed.has(nextPhase)) {
    return currentPhase;
  }
  return nextPhase;
}
