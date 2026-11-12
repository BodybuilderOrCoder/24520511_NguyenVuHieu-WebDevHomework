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

const PORT = 4172;
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
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  // 1. Kiểm tra Mobile 375px, 88 phím (52 trắng + 36 đen) & Zero <div>-soup
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const mobileAudit = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    divCountInsideMain: document.querySelector('main')?.querySelectorAll('div').length ?? -1,
    totalKeys: document.querySelectorAll('button[data-midi]').length,
    whiteKeys: document.querySelectorAll('button[data-is-black="false"]').length,
    blackKeys: document.querySelectorAll('button[data-is-black="true"]').length,
  }));

  assert.equal(mobileAudit.scrollWidth <= mobileAudit.innerWidth, true, '375px must not overflow page horizontally');
  assert.equal(mobileAudit.divCountInsideMain, 0, 'Zero <div> inside <main>');
  assert.equal(mobileAudit.totalKeys, 88, 'Must algorithmically render 88 keys');
  assert.equal(mobileAudit.whiteKeys, 52, 'Must have 52 white keys');
  assert.equal(mobileAudit.blackKeys, 36, 'Must have 36 black keys');

  await page.screenshot({
    path: path.join(evidenceDir, 'mobile-375px.png'),
    fullPage: true,
  });

  // 2. Kiểm tra Desktop 1440px, React.memo Single-Key Render Isolation, 8-Voice FIFO Stealing & Sequencer Abort
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const engineAudit = await page.evaluate(async () => {
    const flush = (ms = 50) => new Promise((r) => setTimeout(r, ms));
    await flush();

    // 2.1 Kiểm tra React.memo isolation khi nhấn 1 phím C4 (MIDI 60, KeyA)
    const mutatedButtons = new Set();
    const rack = document.querySelector('section[aria-label="Dãy 88 phím đàn"]');
    const observer = new MutationObserver((records) => {
      for (const rec of records) {
        const btn = rec.target.closest?.('button[data-midi]');
        if (btn) mutatedButtons.add(btn.getAttribute('data-midi'));
      }
    });
    observer.observe(rack, { subtree: true, attributes: true });

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', bubbles: true })
    );
    await flush();
    observer.disconnect();
    const singleKeyMutatedCount = mutatedButtons.size;

    document.body.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'a', code: 'KeyA', bubbles: true })
    );
    await flush();

    // 2.2 Kiểm tra 8-Voice Polyphony & FIFO Voice Stealing (nhấn 9 phím liên tiếp 60..68)
    const codes9 = ['KeyA', 'KeyW', 'KeyS', 'KeyE', 'KeyD', 'KeyF', 'KeyT', 'KeyG', 'KeyY'];
    for (const code of codes9) {
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'x', code, bubbles: true })
      );
    }
    await flush();
    const activeVoiceTextAfter9 = document.querySelector('#active-voice-count')?.textContent || '';
    const stolenVoiceTextAfter9 = document.querySelector('#stolen-voice-summary')?.textContent || '';
    const c4PressedAfterSteal = document
      .querySelector('button[data-midi="60"]')
      ?.getAttribute('aria-pressed');

    // 2.3 Kiểm tra FIFO Sequencer & AbortController Stop Sequence
    document.querySelector('#btn-demo-seq')?.click();
    await flush();
    document.querySelector('#btn-play-seq')?.click();
    await flush(80);
    const stateWhilePlaying = document
      .querySelector('#sequencer-live-status')
      ?.getAttribute('data-sequencer-state');

    document.querySelector('#btn-stop-seq')?.click();
    await flush(60);
    const stateAfterStop = document
      .querySelector('#sequencer-live-status')
      ?.getAttribute('data-sequencer-state');
    const activeVoiceTextAfterStop = document.querySelector('#active-voice-count')?.textContent || '';

    return {
      singleKeyMutatedCount,
      activeVoiceTextAfter9,
      stolenVoiceTextAfter9,
      c4PressedAfterSteal,
      stateWhilePlaying,
      stateAfterStop,
      activeVoiceTextAfterStop,
    };
  });

  assert.equal(engineAudit.singleKeyMutatedCount, 1, 'Pressing 1 key must only update 1 PianoKey button');
  assert.equal(engineAudit.activeVoiceTextAfter9.includes('8 / 8'), true, 'Max voices capped at 8');
  assert.equal(engineAudit.stolenVoiceTextAfter9.includes('C4'), true, 'Oldest voice C4 must be stolen via FIFO');
  assert.equal(engineAudit.c4PressedAfterSteal, 'false', 'Stolen key C4 must release pressed state');
  assert.equal(engineAudit.stateWhilePlaying, 'PLAYING', 'Sequencer transitions to PLAYING');
  assert.equal(engineAudit.stateAfterStop, 'IDLE', 'Stop Sequence aborts immediately to IDLE');
  assert.equal(engineAudit.activeVoiceTextAfterStop.includes('0 / 8'), true, 'Panic stop silences all voices');

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
    homework: 'Homework 2 — 88-Key Polyphonic Piano & Concurrent FIFO Sequencer',
    verifiedAt: new Date().toISOString(),
    scores,
    mobileAudit,
    engineAudit,
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
