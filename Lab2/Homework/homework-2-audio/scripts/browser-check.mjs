import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

// Run with an isolated Chrome --headless=new --remote-debugging-port=9333.
const tabs = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const socket = new WebSocket(tabs.find((tab) => tab.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const requests = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  const request = requests.get(message.id);
  if (!request) return;
  requests.delete(message.id);
  if (message.error) request.reject(new Error(JSON.stringify(message.error)));
  else request.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    requests.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression) {
  for (let i = 0; i < 200; i++) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out: ${expression}`);
}

try {
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.audit = { contexts: [], sources: 0, maxSources: 0, raf: new Set(), maxRaf: 0, errors: [], downloads: [] };
    addEventListener('error', e => audit.errors.push(e.message));
    addEventListener('unhandledrejection', e => audit.errors.push(String(e.reason)));
    const NativeContext = window.AudioContext;
    window.AudioContext = class extends NativeContext {
      constructor(...args) { super(...args); audit.contexts.push(this); }
      createBufferSource() {
        const source = super.createBufferSource();
        const connect = source.connect.bind(source);
        const disconnect = source.disconnect.bind(source);
        let connected = false;
        source.connect = (...args) => {
          if (!connected) { connected = true; audit.sources++; audit.maxSources = Math.max(audit.maxSources, audit.sources); }
          return connect(...args);
        };
        source.disconnect = (...args) => { if (connected) { connected = false; audit.sources--; } return disconnect(...args); };
        return source;
      }
    };
    const raf = requestAnimationFrame;
    const cancel = cancelAnimationFrame;
    window.requestAnimationFrame = callback => {
      const id = raf(time => { audit.raf.delete(id); callback(time); });
      audit.raf.add(id); audit.maxRaf = Math.max(audit.maxRaf, audit.raf.size); return id;
    };
    window.cancelAnimationFrame = id => { audit.raf.delete(id); cancel(id); };
    window.sampleFrames = count => new Promise(resolve => {
      const times = [];
      const tick = time => { times.push(time); if (times.length < count) raf(tick); else resolve(times); };
      raf(tick);
    });
    const nativeFetch = fetch;
    window.fetch = async (url, options) => {
      if (String(url).includes('/audio/')) {
        audit.downloads.push(String(url));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return nativeFetch(url, options);
    };
  ` });
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5174/' });
  await waitFor(`document.querySelector('#main-content')?.dataset.state === 'IDLE'`);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate('document.activeElement.textContent'), 'Skip to content');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  assert.equal(await evaluate('document.activeElement.id'), 'main-content');
  // A failed canvas initialization must close the context and allow another attempt.
  await evaluate(`window.originalGetContext = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = () => null; document.querySelector('#enqueue').click(); HTMLCanvasElement.prototype.getContext = originalGetContext;`);
  await waitFor(`audit.contexts.length === 1 && audit.contexts[0].state === 'closed'`);
  await evaluate(`document.querySelector('#enqueue').click(); document.querySelector('#track').value='mid'; document.querySelector('#enqueue').click(); document.querySelector('#track').value='high'; document.querySelector('#enqueue').click();`);
  await waitFor(`document.querySelectorAll('[data-action="play"]:not(:disabled)').length === 1`);
  assert.equal(await evaluate(`document.querySelector('#main-content').dataset.state`), 'LOADING');
  await waitFor(`document.querySelectorAll('[data-action="play"]:not(:disabled)').length === 3`);
  assert.deepEqual(await evaluate('audit.downloads'), ['/audio/low.wav', '/audio/mid.wav', '/audio/high.wav']);
  await evaluate(`document.querySelector('[data-action="play"]').click()`);
  await waitFor(`!document.querySelector('#stop').disabled`);
  await evaluate(`window.domChanges = 0; window.observer = new MutationObserver(records => domChanges += records.length); observer.observe(document.querySelector('main'), {subtree:true, attributes:true, childList:true, characterData:true}); document.activeElement.blur()`);
  const frameTimes = await evaluate('sampleFrames(121)');
  const fps = 120000 / (frameTimes.at(-1) - frameTimes[0]);
  const domChanges = await evaluate('observer.disconnect(); domChanges');
  assert.equal(domChanges, 0);
  assert.equal(await evaluate(`document.querySelector('#spectrum').getContext('2d').getImageData(0,0,960,280).data.some(value=>value>0)`), true);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  mkdirSync(new URL('../evidence/', import.meta.url), { recursive: true });
  const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(new URL('../evidence/mobile.png', import.meta.url), Buffer.from(screenshot.data, 'base64'));
  await waitFor(`document.querySelector('#stop').disabled`);
  assert.equal(await evaluate('audit.sources + audit.raf.size'), 0);
  for (let i = 0; i < 12; i++) {
    await evaluate(`document.querySelectorAll('[data-action="play"]')[${i % 3}].click()`);
    await waitFor(`!document.querySelector('#stop').disabled`);
    await evaluate(`document.querySelector('#stop').click()`);
  }
  await evaluate(`document.querySelector('#track').value='invalid'; document.querySelector('#enqueue').click()`);
  await waitFor(`!document.querySelector('[data-action="retry"]:not([hidden])')?.hidden`);
  await waitFor(`document.querySelector('#main-content').dataset.state === 'ERROR'`);
  await evaluate(`document.querySelector('[data-action="retry"]:not([hidden])').click()`);
  await waitFor(`document.querySelectorAll('[data-action="retry"]:not([hidden])').length === 2`);
  await evaluate(`document.querySelector('#track').value='low'; document.querySelector('#enqueue').click(); document.querySelector('#enqueue').click(); document.querySelector('#cancel-all').click()`);
  await waitFor(`Array.from(document.querySelectorAll('#queue li p')).filter(p=>p.textContent.includes('cancelled')).length === 2`);
  await evaluate(`document.querySelector('#enqueue').click()`);
  await waitFor(`document.querySelectorAll('[data-action="play"]:not(:disabled)').length === 4`);
  // Error text must remain literal text, never become executable markup.
  await evaluate(`window.savedFetch = fetch; window.fetch = async () => { throw new Error('<script>alert(1)</script><img onerror=alert(1)>'); }; document.querySelector('#enqueue').click()`);
  await waitFor(`document.querySelector('#error').textContent.includes('<script>')`);
  assert.equal(await evaluate(`document.querySelector('#error').children.length`), 0);
  await evaluate('window.fetch = savedFetch');
  // Native Enter and Space activate the same delegated controls.
  await evaluate(`document.querySelector('[data-action="play"]').focus()`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await waitFor(`!document.querySelector('#stop').disabled`);
  await evaluate(`document.querySelector('#stop').focus()`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await waitFor(`document.querySelector('#stop').disabled`);
  // Leave with both active playback and pending work.
  await evaluate(`document.querySelector('[data-action="play"]').click(); document.querySelector('#enqueue').click(); document.querySelector('#enqueue').click()`);
  await waitFor(`!document.querySelector('#stop').disabled`);
  // Real browser decoding and analyser data were exercised above. Check exit cleanup.
  await evaluate(`dispatchEvent(new PageTransitionEvent('pagehide'));`);
  await waitFor(`audit.contexts.every(context => context.state === 'closed')`);
  assert.equal(await evaluate('audit.sources + audit.raf.size'), 0);
  await evaluate(`dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); document.querySelector('#enqueue').click()`);
  await waitFor(`document.querySelectorAll('[data-action="play"]:not(:disabled)').length === 1`);
  const result = await evaluate(`({ errors: audit.errors, maxSources: audit.maxSources, maxRaf: audit.maxRaf, width: innerWidth, scrollWidth: document.documentElement.scrollWidth })`);
  assert.deepEqual(result.errors, []);
  assert.equal(result.maxSources, 1);
  assert.equal(result.maxRaf, 1);
  result.domChangesDuringPlayback = domChanges;
  result.contrast = {};
  for (const scheme of ['light', 'dark']) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    const ratios = await evaluate(`(() => {
      const style = getComputedStyle(document.documentElement);
      const lum = name => {
        const color = style.getPropertyValue(name).trim().slice(1);
        const rgb = [0,2,4].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
        return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
      };
      const ratio = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
      return { text:ratio('--text','--surface'), muted:ratio('--muted','--surface'), page:ratio('--muted','--background'), button:ratio('--on-accent','--accent'), error:ratio('--error','--surface'), skeleton:ratio('--muted','--skeleton') };
    })()`);
    assert.ok(Object.values(ratios).every(ratio => ratio >= 4.5));
    result.contrast[scheme] = ratios;
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  const desktop = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(new URL('../evidence/desktop.png', import.meta.url), Buffer.from(desktop.data, 'base64'));
  result.fps = Number(fps.toFixed(2));
  result.note = 'Headless Chrome; 121 frame timestamps. Not a guarantee on other hardware. Page lifecycle events dispatched for deterministic cleanup checks.';
  writeFileSync(new URL('../evidence/browser-results.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  socket.close();
}
