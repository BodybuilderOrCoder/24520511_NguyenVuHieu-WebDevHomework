/**
 * @file effortReducer.js
 * @description Engine tính toán trọng số nỗ lực bất đối xứng ("Em cố trăm lần chẳng bằng ai đó một phần")
 * và tính toán chỉ số dẫn xuất thuần khiết (Zero `useEffect`).
 */

export const EM_EFFORT_WEIGHT = 0.1;
export const RIVAL_EFFORT_WEIGHT = 50.0;

export const INITIAL_EFFORT_SIGNALS = Object.freeze([
  Object.freeze({
    id: 'sig-em-1',
    actor: 'EM',
    label: 'Chờ tin nhắn cả đêm & quan tâm 100 bước',
    steps: 100,
    weight: EM_EFFORT_WEIGHT,
  }),
  Object.freeze({
    id: 'sig-rival-1',
    actor: 'AI_DO',
    label: 'Ai đó chỉ thả tim story 1 lần',
    steps: 1,
    weight: RIVAL_EFFORT_WEIGHT,
  }),
]);

/**
 * Tạo bản ghi tín hiệu nỗ lực bất biến mới
 */
export function createEffortSignal({ id, actor, label, steps }) {
  const normalizedActor = actor === 'AI_DO' ? 'AI_DO' : 'EM';
  const weight =
    normalizedActor === 'AI_DO' ? RIVAL_EFFORT_WEIGHT : EM_EFFORT_WEIGHT;
  const numericSteps = Math.max(1, Number(steps) || 1);

  return Object.freeze({
    id,
    actor: normalizedActor,
    label: label.trim() || (normalizedActor === 'EM' ? 'Em cố gắng' : 'Ai đó xuất hiện'),
    steps: numericSteps,
    weight,
  });
}

/**
 * Tính toán dẫn xuất thuần khiết (Pure Derived Metrics — Rule 5: ZERO useEffect)
 * @param {string} phase
 * @param {ReadonlyArray<{ id: string, actor: 'EM' | 'AI_DO', label: string, steps: number, weight: number }>} signals
 */
export function computeDerivedCompatibility(phase, signals) {
  let emRawSteps = 0;
  let rivalRawSteps = 0;
  let emImpactScore = 0;
  let rivalImpactScore = 0;

  for (const sig of signals) {
    if (sig.actor === 'EM') {
      emRawSteps += sig.steps;
      emImpactScore += sig.steps * sig.weight;
    } else {
      rivalRawSteps += sig.steps;
      rivalImpactScore += sig.steps * sig.weight;
    }
  }

  emImpactScore = Number(emImpactScore.toFixed(1));
  rivalImpactScore = Number(rivalImpactScore.toFixed(1));

  const isRedFlag =
    phase === 'DATING_NO_LOVE' && emImpactScore < rivalImpactScore;

  const totalImpact = emImpactScore + rivalImpactScore;
  const emotionalRoiPercent =
    totalImpact > 0 ? Math.round((emImpactScore / totalImpact) * 100) : 50;

  let diagnosticMessage =
    'Trạng thái ổn định. Chưa phát hiện bất đối xứng tình cảm.';
  if (phase === 'GHOSTED_EXIT') {
    diagnosticMessage =
      'Đã dừng lại (GHOSTED_EXIT): Toàn bộ bộ đếm chờ tin nhắn và tiến trình ngầm đã được dọn sạch khỏi bộ nhớ.';
  } else if (isRedFlag) {
    diagnosticMessage = `CẢNH BÁO RED-FLAG: Em cố ${emRawSteps} bước (${emImpactScore} điểm) vẫn nhỏ hơn Ai đó ${rivalRawSteps} bước (${rivalImpactScore} điểm) — “Em cố trăm lần chẳng bằng ai đó một phần!”`;
  } else if (phase === 'OFFICIAL_LOVE') {
    diagnosticMessage =
      'Cam kết chính thức (OFFICIAL_LOVE): Mối quan hệ có danh phận rõ ràng và được trân trọng.';
  }

  return {
    emRawSteps,
    rivalRawSteps,
    emImpactScore,
    rivalImpactScore,
    isRedFlag,
    emotionalRoiPercent,
    diagnosticMessage,
  };
}
