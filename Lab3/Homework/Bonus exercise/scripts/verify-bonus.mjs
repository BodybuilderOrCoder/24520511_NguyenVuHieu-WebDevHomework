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

const PORT = 4174;
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

  // 1. Kiểm tra Mobile 375px, Asymmetric Effort Score (100 bước = 10đ < 1 bước = 50đ) & Zero <div>-soup
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const mobileAudit = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    divCountInsideMain: document.querySelector('main')?.querySelectorAll('div').length ?? -1,
    initialPhase: document.querySelector('main')?.getAttribute('data-current-phase'),
    emImpactText: document.querySelector('#em-impact-score')?.textContent || '',
    rivalImpactText: document.querySelector('#rival-impact-score')?.textContent || '',
    isRedFlagAttr: document.querySelector('#diagnostic-live-output')?.getAttribute('data-red-flag'),
  }));

  assert.equal(mobileAudit.scrollWidth <= mobileAudit.innerWidth, true, '375px must not overflow horizontally');
  assert.equal(mobileAudit.divCountInsideMain, 0, 'Zero <div> inside <main>');
  assert.equal(mobileAudit.initialPhase, 'DATING_NO_LOVE', 'Starts in DATING_NO_LOVE');
  assert.equal(mobileAudit.emImpactText.includes('10 điểm'), true, '100 steps * 0.1 = 10 points');
  assert.equal(mobileAudit.rivalImpactText.includes('50 điểm'), true, '1 step * 50.0 = 50 points');
  assert.equal(mobileAudit.isRedFlagAttr, 'true', 'isRedFlag must be true when 10 < 50 in DATING_NO_LOVE');

  await page.screenshot({
    path: path.join(evidenceDir, 'mobile-375px.png'),
    fullPage: true,
  });

  // 2. Kiểm tra Desktop 1440px, Ping AbortController & Unbind & Free Memory
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const fsmAudit = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // Gửi ping (khởi tạo tiến trình bất đồng bộ WAITING_READ_RECEIPT)
    document.querySelector('#btn-ping-message')?.click();
    await wait(50);
    const timerWhilePing = document.querySelector('#ghosting-timer-value')?.textContent || '';

    // Bấm "Dừng Lại (Unbind & Free Memory)" ở giữa chừng để kiểm tra AbortController & clearTimeout
    document.querySelector('#btn-phase-exit')?.click();
    await wait(60);
    const phaseAfterExit = document.querySelector('main')?.getAttribute('data-current-phase');
    const timerAfterExit = document.querySelector('#ghosting-timer-value')?.textContent || '';
    const diagnosticAfterExit = document.querySelector('#diagnostic-live-output')?.textContent || '';

    // Chuyển lại sang DATING_NO_LOVE để chụp ảnh giao diện đầy đủ
    document.querySelector('#btn-phase-friends')?.click();
    await wait(30);
    document.querySelector('#btn-phase-dating')?.click();
    await wait(30);

    return {
      timerWhilePing,
      phaseAfterExit,
      timerAfterExit,
      diagnosticAfterExit,
    };
  });

  assert.equal(fsmAudit.phaseAfterExit, 'GHOSTED_EXIT', 'Transition to GHOSTED_EXIT succeeds');
  assert.equal(fsmAudit.timerAfterExit.includes('ABORTED_CLEAN'), true, 'Pending ping is cleanly aborted via AbortController');
  assert.equal(fsmAudit.diagnosticAfterExit.includes('GHOSTED_EXIT'), true, 'Diagnostic output announces memory unbind');

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
    homework: "Bonus Exercise — 'Hẹn Hò Nhưng Không Yêu' State Machine",
    verifiedAt: new Date().toISOString(),
    scores,
    mobileAudit,
    fsmAudit,
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
} catch (err) {
  console.error('VERIFY ERROR:', err);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  previewProc.kill();
  process.exit(process.exitCode || 0);
}
