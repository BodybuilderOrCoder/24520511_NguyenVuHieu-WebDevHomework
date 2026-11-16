// Captures report evidence per sprint: desktop 1440px, mobile 375px and a Lighthouse audit.
// Output: ../docs/evidence/<sprint>/. Run from client/: `npm run build && node scripts/evidence-lab4.mjs`.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDir = path.resolve(clientDir, '../server');
const outDir = path.resolve(clientDir, '../docs/evidence');

const PUPPETEER_BUNDLE =
  process.env.PUPPETEER_BUNDLE ??
  'C:/Users/hieu0/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';
const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const { puppeteer, lighthouseNavigation, generateReport } = await import(pathToFileURL(PUPPETEER_BUNDLE).href);

const APP = 'http://localhost:5173';

function start(command, cwd, readyText, env = {}) {
  const child = spawn(command, { cwd, shell: true, env: { ...process.env, ...env } });
  const ready = new Promise((resolve, reject) => {
    let out = '';
    const timer = setTimeout(() => reject(new Error(`Timeout: ${command}\n${out}`)), 20_000);
    const onData = (chunk) => {
      out += chunk;
      if (out.includes(readyText)) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
  });
  return { child, ready };
}
const kill = (child) => spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);

const sprints = [
  {
    id: 'sprint1-router',
    route: '/people/2',
    async prepare(page) {
      await page.waitForSelector('.person-details');
    },
  },
  {
    id: 'sprint2-form',
    route: '/form',
    async prepare(page, mobile) {
      if (mobile) {
        // Mobile shot shows the live validation state.
        await page.type('input[name="name"]', 'Ada Lovelace');
        await page.type('input[name="email"]', 'ada@');
        await page.type('input[name="age"]', '17');
        return;
      }
      await page.type('input[name="name"]', 'Ada Lovelace');
      await page.type('input[name="email"]', 'ada@example.com');
      await page.type('input[name="age"]', '36');
      await page.click('button[type="submit"]');
      await page.waitForSelector('.json-inspector');
    },
  },
  {
    id: 'sprint3-forum',
    route: '/forum',
    async prepare(page, mobile) {
      await page.waitForSelector('.messages dd');
      if (!mobile) {
        const [btn] = await page.$$('xpath/.//nav[@aria-label="Channels"]//button[normalize-space()="Esports Tribunal"]');
        await btn.click();
        await page.waitForFunction(() => document.querySelector('.channel-status')?.textContent.includes('in #Esports Tribunal'));
      }
    },
  },
];

const api = start('node server.js', serverDir, 'listening', { PORT: '3001', CLIENT_ORIGIN: APP });
const web = start('npx vite preview', clientDir, '5173');
let browser;
const summary = [];

try {
  await Promise.all([api.ready, web.ready]);
  browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });

  for (const sprint of sprints) {
    const dir = path.join(outDir, sprint.id);
    mkdirSync(dir, { recursive: true });

    for (const [name, viewport, mobile] of [
      ['desktop-1440px.png', { width: 1440, height: 900 }, false],
      ['mobile-375px.png', { width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, true],
    ]) {
      const page = await browser.newPage();
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
      await page.setViewport(viewport);
      await page.goto(APP + sprint.route, { waitUntil: 'networkidle0' });
      await sprint.prepare(page, mobile);
      await page.screenshot({ path: path.join(dir, name), fullPage: true });
      await page.close();
    }

    const lhPage = await browser.newPage();
    const { lhr } = await lighthouseNavigation(lhPage, APP + sprint.route, {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      output: ['json', 'html'],
      formFactor: 'desktop',
      screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      throttlingMethod: 'provided',
    });
    await lhPage.close();
    writeFileSync(path.join(dir, 'lighthouse.json'), await generateReport(lhr, 'json'));
    const htmlPath = path.join(tmpdir(), `lab4-${sprint.id}-lighthouse.html`);
    writeFileSync(htmlPath, await generateReport(lhr, 'html'));
    const reportPage = await browser.newPage();
    await reportPage.setViewport({ width: 1280, height: 960, deviceScaleFactor: 1 });
    await reportPage.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
    await reportPage.screenshot({ path: path.join(dir, 'lighthouse-testing.png'), fullPage: true });
    await reportPage.close();

    const score = (key) => Math.round((lhr.categories[key]?.score ?? 0) * 100);
    const row = {
      sprint: sprint.id,
      route: sprint.route,
      performance: score('performance'),
      accessibility: score('accessibility'),
      bestPractices: score('best-practices'),
      seo: score('seo'),
      cls: lhr.audits['cumulative-layout-shift']?.numericValue,
    };
    summary.push(row);
    console.log(JSON.stringify(row));
  }
  writeFileSync(path.join(outDir, 'lighthouse-summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), summary }, null, 2));
} finally {
  await browser?.close();
  kill(api.child);
  kill(web.child);
}
