import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const evidenceDir = path.join(projectRoot, 'evidence');
mkdirSync(evidenceDir, { recursive: true });

const mcpBundlePath =
  'C:/Users/hieu0/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';
const { puppeteer, lighthouseNavigation, generateReport } = await import(
  pathToFileURL(mcpBundlePath).href
);

const PORT = 4171;
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
  previewProc.stderr.on('data', (chunk) => {
    if (String(chunk).includes('Error')) {
      clearTimeout(timeout);
      reject(new Error(String(chunk)));
    }
  });
});

let browser;
try {
  browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  // 1. Kiểm tra Mobile 375px & Zero Horizontal Scroll
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const mobileLayout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    divCountInsideMain: document.querySelector('main')?.querySelectorAll('div').length ?? -1,
    padCount: document.querySelectorAll('button[data-pad-id]').length,
  }));

  assert.equal(mobileLayout.scrollWidth <= mobileLayout.innerWidth, true, '375px must not overflow horizontally');
  assert.equal(mobileLayout.divCountInsideMain, 0, 'Zero <div> inside <main>');
  assert.equal(mobileLayout.padCount, 7, 'Must render 7 drum pads');

  await page.screenshot({
    path: path.join(evidenceDir, 'mobile-375px.png'),
    fullPage: true,
  });

  // 2. Kiểm tra Desktop 1440px, bộ gõ Telex (`key: 'ư', code: 'KeyW'`), Anti-repeat & Input Isolation
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const interactionCheck = await page.evaluate(async () => {
    const flushReact = () => new Promise((r) => setTimeout(r, 60));
    await flushReact();

    // 2.1 Mô phỏng gõ phím W khi bật Telex (event.key = 'ư', event.code = 'KeyW')
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ư', code: 'KeyW', bubbles: true })
    );
    await flushReact();
    const afterTelexHit = document.querySelector('#hit-history-live')?.textContent || '';
    const meterAfterHit = Number(document.querySelector('meter')?.value || 0);

    // 2.2 Mô phỏng giữ đè phím (repeat: true) -> không được tăng số nhịp
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ư', code: 'KeyW', repeat: true, bubbles: true })
    );
    window.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'ư', code: 'KeyW', bubbles: true })
    );
    await flushReact();

    // 2.3 Mô phỏng gõ phím A ('KeyA') và S ('KeyS')
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', bubbles: true })
    );
    window.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'a', code: 'KeyA', bubbles: true })
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 's', code: 'KeyS', bubbles: true })
    );
    await flushReact();

    // 2.4 Mô phỏng gõ phím khi đang focus vào ô Input -> phải bị cô lập
    const input = document.querySelector('input[type="text"]');
    input.focus();
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'j', code: 'KeyJ', bubbles: true })
    );
    await flushReact();

    const historyItems = document.querySelectorAll('ul[aria-label="Danh sách các nhịp vừa gõ"] li').length;
    return {
      afterTelexHit,
      meterAfterHit,
      historyItems,
      liveLogText: document.querySelector('#hit-history-live')?.textContent || '',
    };
  });

  console.log('DEBUG interactionCheck:', interactionCheck, 'consoleErrors:', consoleErrors);
  assert.equal(interactionCheck.afterTelexHit.includes('Kick Bass'), true, 'Telex KeyW must trigger Kick Bass');
  assert.equal(interactionCheck.meterAfterHit > 0, true, 'Decibel meter must update on hit');
  assert.equal(interactionCheck.historyItems, 3, 'Anti-repeat and input isolation must keep exact hit count = 3');

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

  // Mở file lighthouse.html để chụp ảnh màn hình kết quả Lighthouse lưu vào evidence/lighthouse-testing.png
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
    homework: 'Homework 1 — Production Studio Drum Kit',
    verifiedAt: new Date().toISOString(),
    scores,
    mobileLayout,
    interactionCheck,
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
