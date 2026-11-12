import { memo } from 'react';
import styles from './DrumKit.module.css';

/**
 * Component nút trống đơn lẻ tuân thủ WCAG 2.2 AA (Rule 2.5.3 Label in Name) & Zero <div>-soup.
 * Memoized để khi 1 phím được kích hoạt, 6 phím còn lại không re-render thừa.
 */
export const DrumPad = memo(function DrumPad({
  pad,
  isActive = false,
  onTrigger,
  onRelease,
}) {
  const handlePointerDown = (event) => {
    event.preventDefault();
    onTrigger(pad.id, 'POINTER');
  };

  const handlePointerUp = () => {
    onRelease(pad.id);
  };

  const handleKeyDown = (event) => {
    if (event.repeat) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTrigger(pad.id, 'BUTTON_KEY');
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onRelease(pad.id);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.drumPad} ${isActive ? styles.drumPadActive : ''}`}
      style={{ '--pad-accent': `var(${pad.colorToken})` }}
      aria-pressed={isActive}
      aria-label={`${pad.name} (Phím ${pad.keyLabel})`}
      data-pad-id={pad.id}
      data-key-code={pad.code}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <kbd className={styles.keyCap} aria-hidden="true">
        {pad.keyLabel}
      </kbd>
      <strong className={styles.padTitle}>{pad.name}</strong>
      <small className={styles.padRole} aria-hidden="true">
        {pad.vietnameseRole}
      </small>
      <span className={styles.padMeta} aria-hidden="true">
        {pad.freq} Hz
      </span>
    </button>
  );
});
