import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

// Test-only CDP client. Requires dev server :5176 and isolated Chrome debugger :9334.
const tabs = await (await fetch('http://127.0.0.1:9334/json/list')).json();
const socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(JSON.stringify(message.error)));
  else request.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out: ${expression}`);
}
async function click(selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); }
async function press(key, code, number, text = '') {
  for (const type of ['keyDown', 'keyUp']) {
    await send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: number, text });
  }
}
async function openSale() {
  await evaluate('clockOffset += 6000');
  await waitFor(`document.querySelector('main').dataset.phase === 'OPEN'`);
}

try {
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.clockOffset = 0;
    const realNow = Date.now;
    Date.now = () => realNow() + clockOffset;
    window.audit = { errors: [], raf: new Set(), maximumRaf: 0 };
    addEventListener('error', e => audit.errors.push(e.message));
    addEventListener('unhandledrejection', e => audit.errors.push(String(e.reason)));
    const raf = requestAnimationFrame;
    const cancel = cancelAnimationFrame;
    window.requestAnimationFrame = callback => {
      const id = raf(time => { audit.raf.delete(id); callback(time); });
      audit.raf.add(id); audit.maximumRaf = Math.max(audit.maximumRaf, audit.raf.size); return id;
    };
    window.cancelAnimationFrame = id => { audit.raf.delete(id); cancel(id); };
  ` });
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5176/' });
  await waitFor(`document.querySelector('main')?.dataset.phase === 'UPCOMING'`);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate('document.activeElement.className'), 'skip-link');
  await press('Enter', 'Enter', 13, '\r');
  assert.equal(await evaluate('document.activeElement.id'), 'main-content');
  await openSale();
  await evaluate(`document.querySelector('#reserve').focus()`);
  await press('Enter', 'Enter', 13, '\r');
  assert.equal(await evaluate(`document.querySelector('#held').textContent`), '1');
  await evaluate(`document.querySelector('#release').focus()`);
  await press(' ', 'Space', 32);
  assert.equal(await evaluate(`document.querySelector('#held').textContent`), '0');
  await click('#reserve');
  assert.equal(await evaluate(`document.querySelector('#available').textContent`), '4');
  await evaluate('clockOffset += 15001');
  await waitFor(`document.querySelector('#held').textContent === '0'`);
  assert.equal(await evaluate(`document.querySelector('main').dataset.state`), 'ERROR');
  assert.match(await evaluate(`document.querySelector('#error').textContent`), /đã hết hạn/i);
  await click('#reserve');
  await click('#fail-next');
  await click('#checkout');
  await waitFor(`document.querySelector('main').dataset.state === 'ERROR'`);
  assert.equal(await evaluate(`document.querySelector('#retry').hidden`), false);
  await click('#retry');
  await waitFor(`document.querySelector('#sold').textContent === '1'`);
  assert.equal(await evaluate(`document.querySelector('#available').textContent`), '4');
  await click('#burst');
  await waitFor(`document.querySelector('#held').textContent === '4'`);
  assert.match(await evaluate(`document.querySelector('#burst-result').textContent`), /4 giữ thành công · 16/);
  await evaluate(`window.changes = 0; window.observer = new MutationObserver(records=>changes += records.length); observer.observe(document.querySelector('#reservations'), {subtree:true,childList:true,characterData:true})`);
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.equal(await evaluate('observer.disconnect(); changes'), 0);
  mkdirSync(new URL('../evidence/', import.meta.url), { recursive: true });
  await evaluate('document.activeElement.blur()');
  const mobile = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(new URL('../evidence/mobile.png', import.meta.url), Buffer.from(mobile.data, 'base64'));
  await click('[data-action="reset"]');
  await openSale();
  await click('#reserve');
  await click('#checkout');
  await evaluate('clockOffset += 15001');
  await waitFor(`document.querySelector('main').dataset.state === 'ERROR'`);
  assert.equal(await evaluate(`document.querySelector('#sold').textContent`), '0');
  await click('#reserve');
  await click('#checkout');
  await click('[data-action="reset"]');
  await new Promise(resolve => setTimeout(resolve, 900));
  assert.equal(await evaluate(`document.querySelector('#sold').textContent`), '0');
  assert.equal(await evaluate(`document.querySelector('main').dataset.state`), 'IDLE');
  await openSale();
  // Exercise actual error rendering with malicious-looking text.
  await evaluate(`(async () => { window.Engine = (await import('/src/inventory.ts')).Inventory; window.savedReserve = Engine.prototype.reserve; Engine.prototype.reserve = () => { throw new Error('<script>alert(1)</script><img onerror=alert(1)>'); }; })()`);
  await click('#reserve');
  assert.equal(await evaluate(`document.querySelector('#error').children.length`), 0);
  assert.match(await evaluate(`document.querySelector('#error').textContent`), /<script>/);
  await evaluate('Engine.prototype.reserve = savedReserve');
  await click('#reserve');
  await click('#checkout');
  await evaluate(`dispatchEvent(new PageTransitionEvent('pagehide'))`);
  assert.equal(await evaluate('audit.raf.size'), 0);
  await evaluate(`dispatchEvent(new PageTransitionEvent('pageshow', {persisted:true}))`);
  await openSale();
  await evaluate('clockOffset += 100000');
  await waitFor(`document.querySelector('main').dataset.phase === 'ENDED'`);
  assert.equal(await evaluate('audit.raf.size'), 0);
  const previousAudit = await evaluate('({errors:audit.errors, maximumRaf:audit.maximumRaf})');
  await send('Page.reload');
  await waitFor(`document.querySelector('main')?.dataset.phase === 'UPCOMING'`);
  assert.equal(await evaluate(`document.querySelector('#available').textContent`), '5');
  assert.equal(await evaluate(`document.querySelector('#sold').textContent`), '0');
  const results = await evaluate(`({ errors:audit.errors, maximumRaf:audit.maximumRaf, width:innerWidth, scrollWidth:document.documentElement.scrollWidth })`);
  results.errors.push(...previousAudit.errors);
  results.maximumRaf = Math.max(results.maximumRaf, previousAudit.maximumRaf);
  assert.deepEqual(results.errors, []);
  assert.equal(results.maximumRaf, 1);
  results.note = 'Chrome CDP; Date.now offset simulates throttling/deadline jumps. Page lifecycle events dispatched; reload is real. One-tab inventory only.';
  results.contrast = {};
  for (const scheme of ['dark', 'light']) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    const ratios = await evaluate(`(() => {
      const style = getComputedStyle(document.documentElement);
      const luminance = name => {
        const hex = style.getPropertyValue(name).trim().slice(1);
        const rgb = [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
        return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
      };
      const ratio = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
      return {text:ratio('--text','--surface'), muted:ratio('--muted','--surface'), page:ratio('--muted','--background'), button:ratio('--on-accent','--accent'), error:ratio('--error','--surface'), soft:ratio('--muted','--soft')};
    })()`);
    assert.ok(Object.values(ratios).every(value=>value>=4.5));
    results.contrast[scheme] = ratios;
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  const desktop = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(new URL('../evidence/desktop.png', import.meta.url), Buffer.from(desktop.data, 'base64'));
  writeFileSync(new URL('../evidence/browser-results.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
  console.log(results);
} finally { socket.close(); }
