import { memo, useId, useState } from 'react';
import { PUBG_VN_SQUADS } from './data/pubgVnDataset.js';
import styles from './KraftonPubgVnArena.module.css';

/**
 * Bảng xếp hạng trực tiếp PUBG Vietnam Series (PVS Leaderboard & Derived Explorer)
 * - Tính toán dẫn xuất thuần khiết (`totalPoints = placementPts + killPts`, `.filter()`, `.toSorted()`)
 *   ngay trong thân render (Rule 5: STATE HYGIENE — Tuyệt đối không dùng `useEffect` để đồng bộ state lọc/sắp xếp).
 * - Liên kết nhãn `<label htmlFor={id}>` với React 19 `useId()`.
 */
export const PvsLeaderboard = memo(function PvsLeaderboard({
  initialSquads = PUBG_VN_SQUADS,
}) {
  const searchInputId = useId();
  const regionSelectId = useId();
  const sortSelectId = useId();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('totalPoints'); // 'totalPoints' | 'wwcdCount' | 'killPts'

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // HW3-04.1: Pure Derived Pipeline in render body (Zero useEffect)
  const visibleSquads = initialSquads
    .map((squad) => ({
      ...squad,
      totalPoints: squad.placementPts + squad.killPts,
    }))
    .filter((squad) => {
      const matchesName =
        normalizedQuery === '' ||
        squad.squadName.toLowerCase().includes(normalizedQuery) ||
        squad.squadId.toLowerCase().includes(normalizedQuery);
      const matchesRegion =
        regionFilter === 'ALL' || squad.regionTag === regionFilter;
      return matchesName && matchesRegion;
    })
    .toSorted((a, b) => {
      if (sortBy === 'wwcdCount') {
        return b.wwcdCount - a.wwcdCount || b.totalPoints - a.totalPoints;
      }
      if (sortBy === 'killPts') {
        return b.killPts - a.killPts || b.totalPoints - a.totalPoints;
      }
      return b.totalPoints - a.totalPoints || b.killPts - a.killPts;
    });

  return (
    <section
      className={styles.leaderboardSection}
      aria-labelledby="pvs-leaderboard-heading"
    >
      <header className={styles.sectionHeader}>
        <h2 id="pvs-leaderboard-heading" className={styles.sectionTitle}>
          Bảng Xếp Hạng PUBG Vietnam Series (PVS Live Standings)
        </h2>

        <form
          className={styles.filterForm}
          aria-label="Bộ lọc và sắp xếp đội tuyển PVS"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor={searchInputId} className={styles.filterLabel}>
            <span>Tìm đội tuyển:</span>
            <input
              id={searchInputId}
              type="search"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="VD: Cerberus, Expendables..."
            />
          </label>

          <label htmlFor={regionSelectId} className={styles.filterLabel}>
            <span>Khu vực:</span>
            <select
              id={regionSelectId}
              className={styles.selectInput}
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="ALL">Toàn quốc (VN)</option>
              <option value="VN-SOUTH">Miền Nam (VN-SOUTH)</option>
              <option value="VN-NORTH">Miền Bắc (VN-NORTH)</option>
            </select>
          </label>

          <label htmlFor={sortSelectId} className={styles.filterLabel}>
            <span>Sắp xếp theo:</span>
            <select
              id={sortSelectId}
              className={styles.selectInput}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="totalPoints">Tổng điểm (Total Points)</option>
              <option value="wwcdCount">Số trận Top 1 (WWCD)</option>
              <option value="killPts">Điểm hạ gục (Kill Points)</option>
            </select>
          </label>
        </form>
      </header>

      <output
        id="leaderboard-live-count"
        className={styles.liveCountOutput}
        role="status"
        aria-live="polite"
      >
        Đang hiển thị {visibleSquads.length} / {initialSquads.length} đội tuyển PVS
        (Sắp xếp: {sortBy}).
      </output>

      <table className={styles.standingsTable}>
        <caption className={styles.tableCaption}>
          Bảng điểm tổng hợp Placement Points + Kill Points giải đấu PVS
        </caption>
        <thead>
          <tr>
            <th scope="col">Hạng</th>
            <th scope="col">Đội tuyển (Squad)</th>
            <th scope="col">Khu vực</th>
            <th scope="col">WWCD</th>
            <th scope="col">Placement Pts</th>
            <th scope="col">Kill Pts</th>
            <th scope="col">Total Points</th>
          </tr>
        </thead>
        <tbody>
          {visibleSquads.map((squad, idx) => (
            <tr key={squad.squadId} data-squad-row={squad.squadId}>
              <td data-label="Hạng">#{idx + 1}</td>
              <th scope="row" data-label="Đội tuyển">
                {squad.squadName} ({squad.squadId.toUpperCase()})
              </th>
              <td data-label="Khu vực">{squad.regionTag}</td>
              <td data-label="WWCD">{squad.wwcdCount}</td>
              <td data-label="Placement Pts">{squad.placementPts}</td>
              <td data-label="Kill Pts">{squad.killPts}</td>
              <td data-label="Total Points">
                <strong data-total-pts={squad.squadId}>{squad.totalPoints}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
});
