import { CrateDropCard } from './CrateDropCard.jsx';
import styles from './KraftonPubgVnArena.module.css';
import { PvsLeaderboard } from './PvsLeaderboard.jsx';
import { useOptimisticClaim } from './useOptimisticClaim.js';

/**
 * Giao diện chính KRAFTON x PUBG Vietnam Championship & Airdrop Arena (Homework 3)
 * - Đếm ngược Airdrop không trôi (Zero-Drift Timer + `visibilitychange` resync)
 * - Optimistic UI Claim + Atomic HTTP 409 Conflict Rollback (`<section role="alert">`, cấm `window.alert`)
 * - Bảng xếp hạng PVS Derived State thuần khiết (`.filter()` + `.toSorted()`, Zero `useEffect`)
 * - Zero `<div>`-soup & Responsive 375px–1440px.
 */
export function KraftonPubgVnArena() {
  const {
    drops,
    inFlightIds,
    alertMessage,
    statusLog,
    claimCrate,
    dismissAlert,
    resetArenaDrops,
  } = useOptimisticClaim();

  return (
    <main className={styles.arenaLayout}>
      <header className={styles.arenaHeader}>
        <section className={styles.brandBlock} aria-label="Thông tin giải đấu KRAFTON PUBG VN">
          <span className={styles.badgePill}>KRAFTON x PUBG Vietnam Series</span>
          <h1 className={styles.arenaTitle}>
            PVS Championship &amp; Contraband Airdrop Arena
          </h1>
          <p className={styles.arenaSubtitle}>
            Zero-Drift Wall-Clock Timer • Optimistic Claim &amp; 409 Conflict Rollback • Pure Derived Leaderboard
          </p>
        </section>

        <button
          type="button"
          id="btn-reset-drops"
          className={styles.resetBtn}
          onClick={resetArenaDrops}
        >
          Làm mới Airdrop (Reset Stock)
        </button>
      </header>

      {alertMessage ? (
        <section
          id="conflict-alert-banner"
          className={styles.conflictAlert}
          role="alert"
          aria-live="assertive"
        >
          <p className={styles.alertText}>
            <strong>Cảnh báo tranh chấp (HTTP {alertMessage.status}):</strong>{' '}
            {alertMessage.message}
          </p>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={dismissAlert}
          >
            Đã hiểu
          </button>
        </section>
      ) : null}

      <section
        className={styles.airdropSection}
        aria-labelledby="airdrop-crates-heading"
      >
        <header className={styles.sectionHeader}>
          <h2 id="airdrop-crates-heading" className={styles.sectionTitle}>
            Săn Hòm Thính Airdrop &amp; Vé VIP Chung Kết PVS (Optimistic Inventory)
          </h2>
        </header>

        <output
          id="claim-status-output"
          className={styles.liveCountOutput}
          role="status"
          aria-live="polite"
        >
          {statusLog}
        </output>

        <section className={styles.dropsGrid} aria-label="Danh sách hòm thính Airdrop">
          {drops.map((drop) => (
            <CrateDropCard
              key={drop.id}
              drop={drop}
              isPending={inFlightIds.has(drop.id)}
              onClaim={claimCrate}
            />
          ))}
        </section>
      </section>

      <PvsLeaderboard />
    </main>
  );
}
