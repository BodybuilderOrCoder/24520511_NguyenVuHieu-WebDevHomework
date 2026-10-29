import { Inventory } from './inventory.ts';
import { formatTime, remainingMs, startCountdown } from './countdown.ts';
import { simulateBuyers } from './simulate-buyers.ts';
import { delay } from './delay.ts';
import type { ReservationStatus, ViewState } from './contracts.ts';

const root = document.querySelector<HTMLElement>('#main-content')!;
const saleClock = document.querySelector<HTMLElement>('#sale-clock')!;
const holdClock = document.querySelector<HTMLElement>('#hold-clock')!;
const phaseLabel = document.querySelector<HTMLElement>('#phase')!;
const statusLabel = document.querySelector<HTMLElement>('#status')!;
const errorLabel = document.querySelector<HTMLElement>('#error')!;
const tableBody = document.querySelector<HTMLTableSectionElement>('#reservations')!;
const failNext = document.querySelector<HTMLInputElement>('#fail-next')!;
const labels: Record<ReservationStatus, string> = {
  RESERVED: 'Đang giữ', CHECKING_OUT: 'Đang thanh toán', EXPIRED: 'Hết hạn',
  RELEASED: 'Đã hủy', CHECKED_OUT: 'Đã mua',
};
let inventory: Inventory;
let view: ViewState = { status: 'IDLE' };
let stopClock = () => {};
let controller: AbortController | null = null;
let generation = 0;
let mounted = true;
let simulating = false;

function button(id: string): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>(`#${id}`)!;
}

function render(): void {
  const state = inventory.snapshot();
  const mine = state.reservations.find((hold) => hold.buyerId === 'you');
  root.dataset.phase = state.phase;
  root.dataset.state = view.status;
  phaseLabel.textContent = state.phase === 'UPCOMING' ? 'Sale bắt đầu sau'
    : state.phase === 'OPEN' ? 'Sale đang mở · kết thúc sau' : 'Flash sale đã kết thúc';
  for (const key of ['available', 'held', 'sold'] as const) {
    document.querySelector(`#${key}`)!.textContent = String(state[key]);
  }
  const active = mine && ['RESERVED', 'CHECKING_OUT', 'CHECKED_OUT'].includes(mine.status);
  button('reserve').disabled = state.phase !== 'OPEN' || state.available === 0 || Boolean(active);
  button('release').disabled = mine?.status !== 'RESERVED';
  button('checkout').disabled = mine?.status !== 'RESERVED' || view.status === 'LOADING';
  button('retry').hidden = view.status !== 'ERROR' || mine?.status !== 'RESERVED';
  button('burst').disabled = state.phase !== 'OPEN' || simulating;
  document.querySelector('#my-hold')!.textContent = mine
    ? `${mine.id}: ${labels[mine.status]}` : 'Bạn chưa giữ sản phẩm nào.';
  document.querySelector<HTMLElement>('#loading')!.hidden = view.status !== 'LOADING';
  errorLabel.hidden = view.status !== 'ERROR';
  errorLabel.textContent = view.status === 'ERROR' ? view.message : '';
  statusLabel.textContent = view.status === 'IDLE' ? 'Sẵn sàng.'
    : view.status === 'LOADING' ? 'Đang xử lý. Vui lòng chờ…'
      : view.status === 'SUCCESS' ? view.message : 'Thao tác chưa thành công.';
  const rows = state.reservations.map((hold) => {
    const row = document.createElement('tr');
    for (const text of [hold.buyerId === 'you' ? 'Bạn' : hold.buyerId, hold.id, labels[hold.status]]) {
      const cell = document.createElement('td');
      cell.textContent = text;
      row.append(cell);
    }
    return row;
  });
  tableBody.replaceChildren(...rows);
}

function updateClock(): void {
  const now = Date.now();
  const changed = inventory.expire(now);
  const state = inventory.snapshot(now);
  const mine = state.reservations.find((hold) => hold.buyerId === 'you');
  if (changed && mine?.status === 'EXPIRED') {
    view = { status: 'ERROR', message: 'Lượt giữ hàng đã hết hạn. Sản phẩm đã được trả lại kho; bạn có thể giữ lại nếu sale còn mở.' };
  }
  if (changed || root.dataset.phase !== state.phase) render();
  saleClock.textContent = formatTime(remainingMs(
    state.phase === 'UPCOMING' ? inventory.config.startsAt : inventory.config.endsAt, now,
  ));
  holdClock.textContent = formatTime(mine && ['RESERVED', 'CHECKING_OUT'].includes(mine.status)
    ? remainingMs(mine.expiresAt, now) : 0);
}

function runClock(): void {
  stopClock();
  updateClock();
  if (inventory.phase() !== 'ENDED' && !document.hidden) {
    stopClock = startCountdown(inventory.config.endsAt, updateClock);
  }
}

function reset(): void {
  generation++;
  controller?.abort();
  controller = null;
  stopClock();
  const startsAt = Date.now() + 5000;
  inventory = new Inventory(
    { id: 'uit-buds', name: 'UIT Buds', price: 299000, totalStock: 5 },
    { startsAt, endsAt: startsAt + 90000, holdMs: 15000 },
  );
  view = { status: 'IDLE' };
  simulating = false;
  failNext.checked = false;
  document.querySelector('#burst-result')!.textContent = 'Chưa chạy mô phỏng.';
  render();
  runClock();
}

async function checkout(): Promise<void> {
  const mine = inventory.snapshot().reservations.find((hold) => hold.buyerId === 'you');
  if (!mine) throw new Error('Hãy giữ hàng trước khi thanh toán.');
  const currentInventory = inventory;
  const currentGeneration = generation;
  currentInventory.beginCheckout(mine.id);
  const shouldFail = failNext.checked;
  failNext.checked = false;
  const pending = new AbortController();
  controller = pending;
  view = { status: 'LOADING' };
  render();
  try {
    await delay(800, pending.signal);
    if (!mounted || currentGeneration !== generation) return;
    const order = currentInventory.finishCheckout(mine.id, !shouldFail);
    view = { status: 'SUCCESS', message: `Đã tạo ${order.id}. Đây là đơn mô phỏng, không thu tiền.` };
  } catch (error) {
    if (!mounted || currentGeneration !== generation || pending.signal.aborted) return;
    view = { status: 'ERROR', message: error instanceof Error ? error.message : 'Thanh toán thất bại.' };
  } finally {
    if (mounted && currentGeneration === generation) {
      controller = null;
      render();
      updateClock();
    }
  }
}

async function handleClick(event: MouseEvent): Promise<void> {
  const target = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
  if (!target || target.disabled || !root.contains(target)) return;
  try {
    const action = target.dataset.action;
    if (action === 'reset') { reset(); return; }
    if (action === 'reserve') {
      inventory.reserve('you');
      view = { status: 'SUCCESS', message: 'Đã giữ một sản phẩm. Hãy thanh toán trước khi hết hạn.' };
    }
    if (action === 'release') {
      const mine = inventory.snapshot().reservations.find((hold) => hold.buyerId === 'you');
      if (mine) inventory.release(mine.id);
      view = { status: 'SUCCESS', message: 'Đã hủy giữ hàng.' };
    }
    if (action === 'checkout' || action === 'retry') { await checkout(); return; }
    if (action === 'burst') {
      const currentGeneration = generation;
      simulating = true;
      render();
      const result = await simulateBuyers(inventory);
      if (!mounted || currentGeneration !== generation) return;
      simulating = false;
      document.querySelector('#burst-result')!.textContent = `${result.accepted} giữ thành công · ${result.rejected} bị từ chối.`;
    }
  } catch (error) {
    view = { status: 'ERROR', message: error instanceof Error ? error.message : 'Thao tác thất bại.' };
  }
  render();
  updateClock();
}

root.addEventListener('click', handleClick);
window.addEventListener('pagehide', () => {
  mounted = false;
  generation++;
  stopClock();
  controller?.abort();
  root.removeEventListener('click', handleClick);
});
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  mounted = true;
  root.addEventListener('click', handleClick);
  reset();
});
document.addEventListener('visibilitychange', () => {
  if (!mounted) return;
  if (document.hidden) stopClock();
  else runClock();
});
reset();
