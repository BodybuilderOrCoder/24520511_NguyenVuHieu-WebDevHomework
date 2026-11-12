import { memo } from 'react';
import { AirdropCountdown } from './AirdropCountdown.jsx';
import { formatVnd } from './data/pubgVnDataset.js';
import styles from './KraftonPubgVnArena.module.css';

/**
 * Thẻ hiển thị từng hòm thính Airdrop / Vé VIP PVS Finals
 * - Sử dụng HTML5 Semantic `<article>`, `<header>`, `<dl>/<dt>/<dd>` chuẩn W3C (Zero `<div>`-soup).
 * - Hiển thị giá VNĐ định dạng qua `Intl.NumberFormat('vi-VN')`.
 */
export const CrateDropCard = memo(function CrateDropCard({
  drop,
  isPending,
  serverOffsetMs = 0,
  onClaim,
}) {
  const isLootedOut = drop.phase === 'LOOTED_OUT' || drop.remainingStock <= 0;

  const buttonText = isPending
    ? 'Đang xác thực KRAFTON...'
    : isLootedOut
      ? 'LOOTED OUT (Đã hết lượt)'
      : drop.tier === 'VIP_PASS'
        ? 'Claim VIP Pass'
        : 'Claim Contraband Crate';

  return (
    <article
      className={`${styles.dropCard} ${isLootedOut ? styles.dropCardLooted : ''}`}
      data-drop-id={drop.id}
      data-drop-phase={drop.phase}
      aria-labelledby={`title-${drop.id}`}
    >
      <header className={styles.cardHeader}>
        <span className={styles.tierBadge}>
          {drop.tier === 'VIP_PASS' ? 'PVS VIP PASS' : 'CONTRABAND AIRDROP'}
        </span>
        <span className={styles.phaseTag} data-phase-badge={drop.id}>
          {drop.phase}
        </span>
      </header>

      <h3 id={`title-${drop.id}`} className={styles.dropTitle}>
        {drop.title}
      </h3>

      <dl className={styles.dropMetaList}>
        <dt className={styles.metaTerm}>Giá niêm yết (VNĐ)</dt>
        <dd className={styles.metaValue} data-price-vnd={drop.id}>
          {formatVnd(drop.priceVnd)}
        </dd>

        <dt className={styles.metaTerm}>Tồn kho khả dụng</dt>
        <dd className={styles.metaValue} data-stock-for={drop.id}>
          {drop.remainingStock} suất
        </dd>

        <dt className={styles.metaTerm}>Thời gian đóng hòm</dt>
        <dd className={styles.metaValue}>
          <AirdropCountdown
            targetEpochMs={drop.dropEpochMs}
            serverOffsetMs={serverOffsetMs}
            className={styles.timerValue}
          />
        </dd>
      </dl>

      <button
        type="button"
        className={styles.claimBtn}
        data-claim-btn={drop.id}
        disabled={isPending || isLootedOut}
        aria-busy={isPending}
        onClick={() => onClaim(drop.id)}
      >
        {buttonText}
      </button>
    </article>
  );
});
