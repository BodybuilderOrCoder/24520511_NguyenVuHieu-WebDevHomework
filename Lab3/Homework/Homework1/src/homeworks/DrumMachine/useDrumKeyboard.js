import { useEffect } from 'react';
import { padByCodeMap } from './data/drumPads.js';

const IGNORED_TAG_NAMES = ['INPUT', 'TEXTAREA', 'SELECT'];

/**
 * Custom Hook lắng nghe sự kiện bàn phím vật lý qua W3C `event.code`
 * - Giải quyết triệt để lỗi bộ gõ tiếng Việt Telex/VNI (W -> ư, A+W -> ă, S -> dấu sắc)
 * - Ngăn giữ đè phím spam âm thanh (`if (event.repeat) return;`)
 * - Cô lập sự kiện khi con trỏ đang nằm trong ô nhập liệu (`INPUT`, `TEXTAREA`, `SELECT`)
 * - Dọn dẹp triệt để listener khi unmount (Rule 6: EFFECT CLEANUP)
 *
 * @param {object} options
 * @param {boolean} options.enabled
 * @param {(padId: string, source: string, code: string) => void} options.onTrigger
 * @param {(padId: string, code: string) => void} options.onRelease
 */
export function useDrumKeyboard({ enabled = true, onTrigger, onRelease }) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined;
    }

    const isEditableTarget = (target) => {
      if (!target || typeof target.tagName !== 'string') return false;
      if (IGNORED_TAG_NAMES.includes(target.tagName.toUpperCase())) {
        return true;
      }
      return Boolean(target.isContentEditable);
    };

    const handleKeyDown = (event) => {
      // HW1-03.3: Anti-Repeat Guard
      if (event.repeat) return;

      // HW1-03.4: Input Focus Isolation
      if (isEditableTarget(event.target)) return;

      // HW1-03.2: W3C physical key code lookup O(1)
      const matchedPad = padByCodeMap.get(event.code);
      if (!matchedPad) return;

      event.preventDefault();
      onTrigger(matchedPad.id, 'KEYBOARD', event.code);
    };

    const handleKeyUp = (event) => {
      if (isEditableTarget(event.target)) return;

      const matchedPad = padByCodeMap.get(event.code);
      if (!matchedPad) return;

      onRelease(matchedPad.id, event.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // HW1-03.5: Cleanup khi unmount hoặc khi thay đổi trạng thái enabled
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, onTrigger, onRelease]);
}
