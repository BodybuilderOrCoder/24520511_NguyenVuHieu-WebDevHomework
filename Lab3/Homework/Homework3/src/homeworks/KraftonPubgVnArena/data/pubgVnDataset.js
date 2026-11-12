/**
 * @file pubgVnDataset.js
 * @description Bộ dữ liệu bất biến cho giải đấu KRAFTON x PUBG Vietnam Series (PVS)
 * và sự kiện săn Airdrop VIP Ticket / Contraband G-Coin Crate.
 */

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

/**
 * Định dạng tiền tệ VNĐ thuần khiết qua `Intl.NumberFormat('vi-VN')`
 * @param {number} amount
 * @returns {string}
 */
export function formatVnd(amount) {
  return vndFormatter.format(amount);
}

/**
 * Tạo danh sách hòm thính Airdrop & Vé VIP PVS Finals với mốc thời gian tương đối
 * so với thời điểm khởi tạo trang để dễ dàng kiểm thử đếm ngược thực tế.
 */
export function createInitialCrateDrops(baseNowMs = Date.now()) {
  return Object.freeze([
    Object.freeze({
      id: 'drop-pvs-vip-pass',
      title: 'PVS Finals VIP Pass + 5,000 G-Coin',
      tier: 'VIP_PASS',
      priceVnd: 1500000,
      remainingStock: 4,
      dropEpochMs: baseNowMs + 180_000, // 03:00.0 đếm ngược
      phase: 'AIRDROP_LIVE',
      forceConflict409: false,
    }),
    Object.freeze({
      id: 'drop-awm-contraband',
      title: 'Contraband Mythic AWM Crate + 10,000 G-Coin',
      tier: 'CONTRABAND_CRATE',
      priceVnd: 2450000,
      remainingStock: 1, // Hòm thính hiếm cuối cùng -> Mô phỏng HTTP 409 Conflict khi tranh chấp
      dropEpochMs: baseNowMs + 95_000,
      phase: 'AIRDROP_LIVE',
      forceConflict409: true,
    }),
    Object.freeze({
      id: 'drop-ces-champion-bundle',
      title: 'Cerberus PGC Champion Edition + 2,500 G-Coin',
      tier: 'CONTRABAND_CRATE',
      priceVnd: 890000,
      remainingStock: 6,
      dropEpochMs: baseNowMs + 300_000,
      phase: 'AIRDROP_LIVE',
      forceConflict409: false,
    }),
  ]);
}

export const INITIAL_CRATE_DROPS = createInitialCrateDrops();

/**
 * Bảng xếp hạng các đội tuyển PUBG Vietnam Series (PVS)
 * Lưu ý (Rule 5): Không lưu `totalPoints` trong state nguồn; tính dẫn xuất `placementPts + killPts` trong lúc render!
 */
export const PUBG_VN_SQUADS = Object.freeze([
  Object.freeze({
    squadId: 'ces',
    squadName: 'Cerberus Esports',
    regionTag: 'VN-SOUTH',
    wwcdCount: 6,
    placementPts: 64,
    killPts: 112,
  }),
  Object.freeze({
    squadId: 'te',
    squadName: 'The Expendables',
    regionTag: 'VN-SOUTH',
    wwcdCount: 7,
    placementPts: 72,
    killPts: 118,
  }),
  Object.freeze({
    squadId: 'ge',
    squadName: 'Genius Esports',
    regionTag: 'VN-NORTH',
    wwcdCount: 4,
    placementPts: 51,
    killPts: 89,
  }),
  Object.freeze({
    squadId: 'roy',
    squadName: 'Roy Esports',
    regionTag: 'VN-NORTH',
    wwcdCount: 3,
    placementPts: 45,
    killPts: 78,
  }),
  Object.freeze({
    squadId: 'agg',
    squadName: 'All Gamers Global VN',
    regionTag: 'VN-SOUTH',
    wwcdCount: 4,
    placementPts: 49,
    killPts: 84,
  }),
]);
