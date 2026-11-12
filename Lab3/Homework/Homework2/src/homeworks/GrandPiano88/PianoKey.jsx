import { memo } from 'react';
import styles from './GrandPiano88.module.css';

/**
 * Phím đàn đơn lẻ (1 trong 88 phím) được bọc trong `React.memo`.
 * - Tuân thủ nghiêm ngặt quy tắc Pure Render của React 19 Compiler (không đọc/ghi ref trong render).
 * - Nhận `isPressed` dạng boolean nguyên thủy và `onNoteOn`/`onNoteOff` có tham chiếu ổn định (`useCallback`).
 */
export const PianoKey = memo(function PianoKey({
  midi,
  noteName,
  isBlack,
  shortcutLabel,
  isPressed,
  onNoteOn,
  onNoteOff,
}) {
  const handlePointerDown = (event) => {
    event.preventDefault();
    onNoteOn(midi);
  };

  const handlePointerUp = () => {
    if (isPressed) {
      onNoteOff(midi);
    }
  };

  const handleKeyDown = (event) => {
    if (event.repeat) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onNoteOn(midi);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onNoteOff(midi);
    }
  };

  const keyClassName = [
    styles.pianoKey,
    isBlack ? styles.blackKey : styles.whiteKey,
    isPressed ? styles.keyPressed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={keyClassName}
      aria-pressed={isPressed}
      aria-label={noteName}
      data-midi={midi}
      data-note={noteName}
      data-is-black={isBlack}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {shortcutLabel ? (
        <kbd className={styles.shortcutBadge} aria-hidden="true">
          {shortcutLabel}
        </kbd>
      ) : null}
      <span className={styles.noteCaption}>{noteName}</span>
    </button>
  );
});
