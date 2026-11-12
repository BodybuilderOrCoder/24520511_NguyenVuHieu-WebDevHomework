import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const evidenceDir = path.join(projectRoot, 'evidence');
mkdirSync(evidenceDir, { recursive: true });

const mcpBundlePath =
  'C:/Users/hieu0/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';
const { puppeteer, lighthouseNavigation, generateReport } = await import(
  pathToFileURL(mcpBundlePath).href
);

const PORT = 4173;
const URL = `http://127.0.0.1:${PORT}/`;

const previewProc = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
  { cwd: projectRoot, stdio: 'pipe', shell: true }
);

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Preview server timeout')), 15000);
  previewProc.stdout.on('data', (chunk) => {
    if (String(chunk).includes(String(PORT))) {
      clearTimeout(timeout);
      resolve();
    }
  });
});

let browser;
try {
  browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  // 1. Kiểm tra Mobile 375px, VND Formatter, Semantic <time> & Zero <div>-soup
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const mobileAudit = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    divCountInsideMain: document.querySelector('main')?.querySelectorAll('div').length ?? -1,
    vipPriceText: document.querySelector('[data-price-vnd="drop-pvs-vip-pass"]')?.textContent || '',
    timeElementsCount: document.querySelectorAll('time[data-remaining-ms]').length,
    topSquadRow: document.querySelector('tbody tr')?.getAttribute('data-squad-row') || '',
    teTotalPoints: document.querySelector('[data-total-pts="te"]')?.textContent || '',
  }));

  assert.equal(mobileAudit.scrollWidth <= mobileAudit.innerWidth, true, '375px must not overflow horizontally');
  assert.equal(mobileAudit.divCountInsideMain, 0, 'Zero <div> inside <main>');
  assert.equal(mobileAudit.vipPriceText.includes('1.500.000'), true, 'VND formatter must format 1.500.000 ₫');
  assert.equal(mobileAudit.timeElementsCount, 3, 'Must render 3 semantic <time> countdowns');
  assert.equal(mobileAudit.topSquadRow, 'te', 'The Expendables (190 pts) must rank #1 by default');
  assert.equal(mobileAudit.teTotalPoints, '190', 'Derived totalPoints for TE = 72 + 118 = 190');

  await page.screenshot({
    path: path.join(evidenceDir, 'mobile-375px.png'),
    fullPage: true,
  });

  // 2. Kiểm tra Desktop 1440px, Optimistic UI Claim, Double-Click Idempotency, 409 Conflict Rollback & visibilitychange
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const arenaAudit = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // 2.1 Kiểm tra Optimistic UI + Idempotent Double-Click trên 'drop-pvs-vip-pass' (tồn kho ban đầu = 4)
    const vipBtn = document.querySelector('[data-claim-btn="drop-pvs-vip-pass"]');
    vipBtn.click();
    vipBtn.click(); // Double-click idempotency check
    await wait(30);
    const optimisticVipStock = document.querySelector('[data-stock-for="drop-pvs-vip-pass"]')?.textContent || '';

    await wait(420);
    const settledVipStock = document.querySelector('[data-stock-for="drop-pvs-vip-pass"]')?.textContent || '';

    // 2.2 Kiểm tra Optimistic Deduction + Atomic HTTP 409 Conflict Rollback trên 'drop-awm-contraband' (tồn kho = 1)
    const awmBtn = document.querySelector('[data-claim-btn="drop-awm-contraband"]');
    awmBtn.click();
    await wait(30);
    const optimisticAwmStock = document.querySelector('[data-stock-for="drop-awm-contraband"]')?.textContent || '';

    await wait(420);
    const rolledBackAwmStock = document.querySelector('[data-stock-for="drop-awm-contraband"]')?.textContent || '';
    const awmPhaseAfter409 = document.querySelector('[data-phase-badge="drop-awm-contraband"]')?.textContent || '';
    const alertBannerText = document.querySelector('#conflict-alert-banner')?.textContent || '';

    // 2.3 Kiểm tra sự kiện visibilitychange resync trên đồng hồ Airdrop
    document.dispatchEvent(new Event('visibilitychange'));
    await wait(20);
    const remainingMsAfterWake = Number(
      document.querySelector('time[data-remaining-ms]')?.getAttribute('data-remaining-ms') || 0
    );

    return {
      optimisticVipStock,
      settledVipStock,
      optimisticAwmStock,
      rolledBackAwmStock,
      awmPhaseAfter409,
      alertBannerText,
      remainingMsAfterWake,
    };
  });

  assert.equal(arenaAudit.optimisticVipStock, '3 suất', 'Optimistic deduction immediately drops 4 -> 3 (ignoring duplicate click)');
  assert.equal(arenaAudit.settledVipStock, '3 suất', '200 OK keeps stock at 3');
  assert.equal(arenaAudit.optimisticAwmStock, '0 suất', 'AWM crate optimistically drops 1 -> 0');
  assert.equal(arenaAudit.rolledBackAwmStock, '1 suất', 'HTTP 409 Conflict atomically rolls back stock 0 -> 1');
  assert.equal(arenaAudit.awmPhaseAfter409, 'LOOTED_OUT', 'HTTP 409 transitions drop phase to LOOTED_OUT');
  assert.equal(arenaAudit.alertBannerText.includes('409'), true, 'Accessible role="alert" banner announces 409 Conflict');
  assert.equal(arenaAudit.remainingMsAfterWake > 0, true, 'Timer remains synchronized on visibilitychange');

  await page.screenshot({
    path: path.join(evidenceDir, 'desktop-1440px.png'),
    fullPage: true,
  });

  // 3. Chạy Lighthouse Audit chính thức & chụp ảnh báo cáo Lighthouse
  const lhResult = await lighthouseNavigation(page, URL, {
    onlyCategories: ['accessibility', 'best-practices', 'seo'],
    output: ['json', 'html'],
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  });

  const lhr = lhResult.lhr;
  const jsonReport = await generateReport(lhr, 'json');
  const htmlReport = await generateReport(lhr, 'html');

  const jsonPath = path.join(evidenceDir, 'lighthouse.json');
  const htmlPath = path.join(evidenceDir, 'lighthouse.html');
  writeFileSync(jsonPath, jsonReport);
  writeFileSync(htmlPath, htmlReport);

  const reportPage = await browser.newPage();
  await reportPage.setViewport({ width: 1280, height: 960, deviceScaleFactor: 1.5 });
  await reportPage.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
  await reportPage.screenshot({
    path: path.join(evidenceDir, 'lighthouse-testing.png'),
    fullPage: true,
  });

  const scores = {
    accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
    seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
  };

  assert.equal(scores.accessibility, 100, 'Lighthouse Accessibility must be 100');
  assert.equal(consoleErrors.length, 0, 'Must have 0 console errors');

  const summary = {
    homework: 'Homework 3 — KRAFTON x PUBG Vietnam Championship & Airdrop Arena',
    verifiedAt: new Date().toISOString(),
    scores,
    mobileAudit,
    arenaAudit,
    consoleErrors,
    evidenceFiles: [
      'evidence/lighthouse-testing.png',
      'evidence/lighthouse.html',
      'evidence/lighthouse.json',
      'evidence/mobile-375px.png',
      'evidence/desktop-1440px.png',
    ],
  };

  writeFileSync(
    path.join(evidenceDir, 'browser-verification.json'),
    JSON.stringify(summary, null, 2) + '\n'
  );
  console.log(JSON.stringify(summary, null, 2));
} finally {
  if (browser) await browser.close();
  previewProc.kill();
  process.exit(0);
}
