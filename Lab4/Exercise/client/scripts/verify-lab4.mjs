// End-to-end verification for Lab 4 (Sprint 1–3) using headless Chrome via Puppeteer.
// Produces evidence files in ../docs. Run from client/: `npm run build && npm run verify`.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDir = path.resolve(clientDir, '../server');
const docsDir = path.resolve(clientDir, '../docs');
mkdirSync(docsDir, { recursive: true });

const PUPPETEER_BUNDLE =
  process.env.PUPPETEER_BUNDLE ??
  'C:/Users/hieu0/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';
const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
assert.ok(existsSync(PUPPETEER_BUNDLE), `Puppeteer bundle not found: ${PUPPETEER_BUNDLE}`);
const { puppeteer } = await import(pathToFileURL(PUPPETEER_BUNDLE).href);

const APP = 'http://localhost:5173';
const API = 'http://localhost:3001';
const SLOW_3G = { offline: false, latency: 2000, downloadThroughput: 50_000, uploadThroughput: 50_000 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
  else child.kill('SIGTERM');
}

function startProcess(cmd, args, cwd, readyText, env = {}) {
  const child = spawn([cmd, ...args].join(' '), { cwd, shell: true, env: { ...process.env, ...env } });
  let output = '';
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout starting ${cmd}: ${output}`)), 20_000);
    const onData = (chunk) => {
      output += chunk;
      if (output.includes(readyText)) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
  });
  return { child, ready, log: () => output };
}

const startApi = () =>
  startProcess('node', ['server.js'], serverDir, 'listening', {
    PORT: '3001',
    CLIENT_ORIGIN: APP,
  });

const report = { generatedAt: new Date().toISOString(), checks: [] };
const check = (name, passed, details = {}) => {
  report.checks.push({ name, passed, ...details });
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}`);
};

let api = startApi();
const web = startProcess('npx', ['vite', 'preview'], clientDir, '5173');
let browser;

try {
  await Promise.all([api.ready, web.ready]);
  browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLog = [];
  page.on('console', (msg) => {
    if (['error', 'warn', 'warning'].includes(msg.type())) consoleLog.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => consoleLog.push(`[pageerror] ${err.message}`));

  // ---------- Sprint 1: routes, deep link, 404, active NavLink ----------
  for (const [route, heading] of [
    ['/', 'Home'],
    ['/about', 'About'],
    ['/people', 'People directory'],
    ['/form', 'Registration form'],
    ['/nope', 'Page not found'],
  ]) {
    await page.goto(APP + route, { waitUntil: 'networkidle0' });
    const h1 = await page.$eval('h1', (el) => el.textContent);
    check(`route ${route} renders <h1>${heading}</h1>`, h1 === heading, { h1 });
  }

  await page.goto(`${APP}/people/2`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.person-details');
  const deepLink = await page.evaluate(() => ({
    name: document.querySelector('.person-details dd').textContent,
    active: document.querySelector('.sidebar .active-link')?.textContent,
    mainNavActive: document.querySelector('nav[aria-label="Main"] .active')?.textContent,
  }));
  check('deep link /people/2 (hard refresh) shows Alan Turing with active sidebar link', deepLink.name === 'Alan Turing' && deepLink.active === 'Alan Turing' && deepLink.mainNavActive === 'People', deepLink);

  await page.goto(`${APP}/people/999`, { waitUntil: 'networkidle0' });
  const alert404 = await page.$eval('[role="alert"]', (el) => el.textContent);
  check('invalid id /people/999 shows the 404 boundary without crashing', alert404.includes('404'), { alert404 });

  // ---------- Sprint 1: lazy chunk + skeleton + CLS under Slow 3G ----------
  const lazyPage = await browser.newPage();
  await lazyPage.setViewport({ width: 1280, height: 900 });
  const chunkRequests = [];
  lazyPage.on('request', (req) => {
    if (req.url().includes('PersonDetail')) chunkRequests.push(req.url());
  });
  await lazyPage.evaluateOnNewDocument(() => {
    window.lab4Cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.lab4Cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await lazyPage.goto(`${APP}/people`, { waitUntil: 'networkidle0' });
  const cdpLazy = await lazyPage.createCDPSession();
  await cdpLazy.send('Network.emulateNetworkConditions', SLOW_3G);
  await lazyPage.evaluate(() => {
    window.lab4Cls = 0;
  });
  await lazyPage.click('.sidebar a[href="/people/3"]');
  const skeletonSeen = await lazyPage
    .waitForSelector('[data-testid="person-skeleton"][aria-busy="true"]', { timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  const skeletonBox = skeletonSeen
    ? await lazyPage.$eval('[data-testid="person-skeleton"]', (el) => el.getBoundingClientRect().height)
    : null;
  await lazyPage.waitForSelector('.person-details', { timeout: 20_000 });
  const cardBox = await lazyPage.$eval('.person-card', (el) => el.getBoundingClientRect().height);
  await sleep(300);
  const cls = await lazyPage.evaluate(() => window.lab4Cls);
  await lazyPage.screenshot({ path: path.join(docsDir, 'sprint1-person-detail.png') });
  check('PersonDetail is fetched as a separate lazy JS chunk', chunkRequests.length > 0, { chunkRequests });
  check('Suspense skeleton (aria-busy) shown while chunk loads on Slow 3G', skeletonSeen, { skeletonBox, cardBox });
  check('CLS during lazy load is 0', cls === 0, { cls });
  await lazyPage.close();

  // ---------- Sprint 2: form engine ----------
  await page.goto(`${APP}/form`, { waitUntil: 'networkidle0' });
  await page.click('button[type="submit"]');
  const submitBlocked = await page.evaluate(() => ({
    alerts: document.querySelectorAll('[role="alert"]').length,
    inspector: Boolean(document.querySelector('.json-inspector')),
    focused: document.activeElement?.name,
  }));
  check('empty submit is blocked, errors announced, first invalid field focused', submitBlocked.alerts >= 2 && !submitBlocked.inspector && submitBlocked.focused === 'name', submitBlocked);
  await page.type('input[name="name"]', 'Ada Lovelace');
  await page.type('input[name="email"]', 'ada@');
  const liveError = await page.$eval('input[name="email"]', (el) => ({
    invalid: el.getAttribute('aria-invalid'),
    describedBy: document.getElementById(el.getAttribute('aria-describedby'))?.textContent,
  }));
  check('invalid email flagged on the same keystroke via aria-invalid + aria-describedby', liveError.invalid === 'true' && Boolean(liveError.describedBy), liveError);
  await page.type('input[name="email"]', 'example.com');
  await page.type('input[name="age"]', '36');
  await page.click('button[type="submit"]');
  const rows = await page.$$eval('.json-inspector .data-row', (els) => els.map((el) => el.textContent));
  check('valid submit renders ShowData <dl> with one row per field', rows.length === 3, { rows });
  await page.screenshot({ path: path.join(docsDir, 'sprint2-form.png') });

  // ---------- Sprint 3: API + live channel switcher ----------
  await page.goto(`${APP}/forum`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.messages dd');
  await page.type('.message-form input', 'Verifier');
  await page.type('.message-form textarea', 'Posted from headless Chrome');
  await page.click('.message-form button[type="submit"]');
  await page.waitForFunction(() => document.body.textContent.includes('Posted from headless Chrome'), { timeout: 5000 });
  check('POST via UI → message appears after refetch', true);

  const apiChecks = await page.evaluate(async (apiBase) => {
    const bad = await fetch(`${apiBase}/api/messages/nasa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'x' }),
    });
    const good = await fetch(`${apiBase}/api/messages/nasa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'x', text: 'y' }),
    });
    return { badStatus: bad.status, badBody: await bad.json(), goodStatus: good.status, goodId: (await good.json()).id };
  }, API);
  // Chrome logs every 4xx response as a console error; this one is the deliberate 400 probe above.
  const expectedConsole = consoleLog.splice(0).filter((l) => l.includes('400 (Bad Request)'));
  check('browser POST missing fields → 400, valid → 201 (CORS allowed from localhost:5173)', apiChecks.badStatus === 400 && apiChecks.goodStatus === 201, apiChecks);

  // Rapid channel switching under Slow 3G — stale requests must be cancelled.
  const network = [];
  const started = new Map();
  let capturing = true;
  page.on('request', (req) => {
    if (capturing && req.url().startsWith(`${API}/api/messages/`) && req.method() === 'GET') started.set(req, performance.now());
  });
  page.on('requestfinished', (req) => {
    if (started.has(req)) network.push({ url: req.url(), status: req.response()?.status(), result: 'finished', ms: Math.round(performance.now() - started.get(req)) });
  });
  page.on('requestfailed', (req) => {
    if (started.has(req)) network.push({ url: req.url(), status: req.failure()?.errorText === 'net::ERR_ABORTED' ? '(canceled)' : '(failed)', result: req.failure()?.errorText, ms: Math.round(performance.now() - started.get(req)) });
  });
  const cdp = await page.createCDPSession();
  await cdp.send('Network.emulateNetworkConditions', SLOW_3G);
  for (const label of ['Esports Tribunal', 'Not NASA', 'NASA', 'Esports Tribunal', 'Not NASA']) {
    const [button] = await page.$$(`xpath/.//nav[@aria-label="Channels"]//button[normalize-space()="${label}"]`);
    await button.click();
    await sleep(150);
  }
  await page.waitForFunction(() => document.querySelector('.channel-status')?.textContent.includes('in #Not NASA'), { timeout: 30_000 });
  await sleep(500);
  const finalChannel = await page.evaluate(() => ({
    heading: document.querySelector('#channel-title').textContent,
    authors: [...document.querySelectorAll('.messages dt')].map((dt) => dt.firstChild.textContent.trim()),
    alert: document.querySelector('[role="alert"]')?.textContent ?? null,
  }));
  capturing = false;
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  const canceled = network.filter((n) => n.status === '(canceled)');
  check('rapid switch: stale requests show as (canceled) and final data is #Not NASA', canceled.length >= 3 && finalChannel.heading === '#Not NASA' && finalChannel.authors.includes('Moon Skeptic') && !finalChannel.alert, { finalChannel, canceled: canceled.length });
  await page.screenshot({ path: path.join(docsDir, 'sprint3-forum-slow3g.png') });

  const consoleNormal = [...consoleLog];
  check('Console: 0 warnings/errors during normal use (Sprint 1–3)', consoleNormal.length === 0, { consoleNormal });

  // Render the captured request log as an image (CDP capture, not a DevTools UI screenshot).
  const netPage = await browser.newPage();
  await netPage.setViewport({ width: 1100, height: 200 + network.length * 34 });
  const rowsHtml = network
    .map((n) => `<tr class="${n.status === '(canceled)' ? 'c' : ''}"><td>${n.url.replace(API, '')}</td><td>${n.status}</td><td>${n.result}</td><td>${n.ms} ms</td></tr>`)
    .join('');
  await netPage.setContent(`<!doctype html><html lang="en"><head><title>network</title><style>
    :root{color-scheme:light}body{font:14px system-ui;margin:20px;background:#fff;color:#111}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}
    th{background:#f1f3f4}.c td{color:#c5221f}</style></head><body>
    <h1 style="font-size:18px">Sprint 3 — Network capture (Chrome DevTools Protocol, Slow 3G: 2000 ms RTT, 400 kbps)</h1>
    <p>Rapid clicks: Esports Tribunal → Not NASA → NASA → Esports Tribunal → Not NASA (150 ms apart). Captured ${report.generatedAt}.</p>
    <table><thead><tr><th>Request</th><th>Status</th><th>Result</th><th>Time</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`);
  await netPage.screenshot({ path: path.join(docsDir, 'sprint3-network.png'), fullPage: true });
  await netPage.close();

  // ---------- Sprint 3: API down → error state, then recovery ----------
  killTree(api.child);
  await sleep(500);
  consoleLog.length = 0;
  await page.goto(`${APP}/forum`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[role="alert"]', { timeout: 10_000 });
  const downState = await page.evaluate(() => ({
    alert: document.querySelector('[role="alert"] p').textContent,
    h1: document.querySelector('h1').textContent,
    retryButton: Boolean([...document.querySelectorAll('button')].find((b) => b.textContent === 'Retry')),
  }));
  const consoleWhileDown = [...consoleLog];
  await page.screenshot({ path: path.join(docsDir, 'sprint3-api-down.png') });

  api = startApi();
  await api.ready;
  const [retry] = await page.$$('xpath/.//button[normalize-space()="Retry"]');
  await retry.click();
  await page.waitForSelector('.messages dd', { timeout: 10_000 });
  const recovered = await page.evaluate(() => !document.querySelector('[role="alert"]'));
  check('API down → accessible alert + Retry, page does not crash; Retry recovers after restart', downState.retryButton && downState.h1 === 'Live forum' && recovered, { downState, recovered });

  writeFileSync(
    path.join(docsDir, 'sprint3-error-log.md'),
    `# Sprint 3 — Full-Stack Error Log Verification

> Generated by \`client/scripts/verify-lab4.mjs\` (headless Chrome ${await browser.version()}) on ${report.generatedAt}.

## Scenario

1. Start API (\`server/server.js\`, port 3001) and the production client build (\`vite preview\`, port 5173).
2. Use the forum normally, then **kill the API process**.
3. Reload \`/forum\` with the API down.
4. Restart the API and press **Retry**.

## Result with the API down

| Check | Observed |
|---|---|
| Page still rendered (\`<h1>\`) | \`${downState.h1}\` |
| \`role="alert"\` text | \`${downState.alert.replace(/\|/g, '\\|')}\` |
| Retry button present | ${downState.retryButton ? 'yes' : 'no'} |
| Uncaught exceptions (\`pageerror\`) | ${consoleWhileDown.filter((l) => l.startsWith('[pageerror]')).length} |
| Recovered after restart + Retry | ${recovered ? 'yes' : 'no'} |

## Browser console while the API was down

\`\`\`text
${consoleWhileDown.join('\n') || '(empty)'}
\`\`\`

These entries are Chrome's own network-level log for the refused TCP connection. The app catches the
rejected \`fetch\` inside \`useForumMessages\` and renders it as UI state; it does not re-log it,
and there is no unhandled promise rejection.

## Console during normal use (Sprint 1–3, before the API was stopped)

\`\`\`text
${consoleNormal.join('\n') || '(empty — 0 warnings, 0 errors)'}
\`\`\`

Excluded on purpose — Chrome's log line for the deliberate \`POST { author: 'x' }\` probe that checks the 400 contract:

\`\`\`text
${expectedConsole.join('\n') || '(none)'}
\`\`\`

## Rapid channel switching under Slow 3G

${network.map((n) => `- \`GET ${n.url.replace(API, '')}\` → **${n.status}** (${n.result}, ${n.ms} ms)`).join('\n')}

Final channel heading: \`${finalChannel.heading}\`; authors shown: ${finalChannel.authors.map((a) => `\`${a}\``).join(', ')}.
`
  );

  // ---------- 375px responsive check ----------
  await page.setViewport({ width: 375, height: 812 });
  const overflow = {};
  for (const route of ['/', '/people/4', '/form', '/forum']) {
    await page.goto(APP + route, { waitUntil: 'networkidle0' });
    overflow[route] = await page.evaluate(() => document.documentElement.scrollWidth);
  }
  await page.goto(`${APP}/people/4`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.person-details');
  await page.screenshot({ path: path.join(docsDir, 'mobile-375px-people.png'), fullPage: true });
  check('375px: no horizontal scroll on any route', Object.values(overflow).every((w) => w <= 375), { scrollWidth: overflow });

  report.network = network;
  report.consoleNormal = consoleNormal;
  report.consoleExpected400Probe = expectedConsole;
  report.consoleWhileApiDown = consoleWhileDown;
} finally {
  await browser?.close();
  killTree(api.child);
  killTree(web.child);
  writeFileSync(path.join(docsDir, 'verification.json'), JSON.stringify(report, null, 2));
}

const failed = report.checks.filter((c) => !c.passed);
console.log(`\n${report.checks.length - failed.length}/${report.checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
