import test from 'node:test';
import assert from 'node:assert/strict';
import { Inventory, canTransition } from '../src/inventory.ts';

const product = { id: 'headphones', name: 'Tai nghe', price: 299000, totalStock: 5 };
const config = { startsAt: 1000, endsAt: 10000, holdMs: 2000 };

test('whitespace cannot bypass one reservation per buyer', () => {
  const inventory = new Inventory(product, config);
  inventory.reserve('you', 1000);
  assert.throws(() => inventory.reserve(' you ', 1001));
  assert.equal(inventory.snapshot(1001).held, 1);
});

test('checkout is single-submit and idempotent; sold inventory is never released', () => {
  const inventory = new Inventory(product, config);
  const hold = inventory.reserve('you', 1000);
  inventory.beginCheckout(hold.id, 1001);
  assert.throws(() => inventory.beginCheckout(hold.id, 1002));
  const order = inventory.finishCheckout(hold.id, true, 1100);
  assert.deepEqual(inventory.finishCheckout(hold.id, true, 1101), order);
  inventory.release(hold.id, 5000);
  const snapshot = inventory.snapshot(5000);
  assert.equal(snapshot.sold, 1);
  assert.equal(snapshot.held, 0);
  assert.equal(snapshot.available, 4);
});

test('failure permits retry while exact-deadline checkout expires', () => {
  const inventory = new Inventory(product, config);
  const hold = inventory.reserve('you', 1000);
  inventory.beginCheckout(hold.id, 1001);
  assert.throws(() => inventory.finishCheckout(hold.id, false, 1500), /thất bại/);
  inventory.beginCheckout(hold.id, 1501);
  assert.throws(() => inventory.finishCheckout(hold.id, true, 3000), /hết hạn/);
  assert.equal(inventory.snapshot(3000).available, 5);
  assert.equal(inventory.snapshot(3000).sold, 0);
});

test('expiry releases stock exactly once at the deadline without relying on RAF', () => {
  const inventory = new Inventory({ ...product, totalStock: 1 }, config);
  const first = inventory.reserve('you', 1000);
  assert.equal(inventory.snapshot(2999).available, 0);
  assert.equal(inventory.snapshot(3000).available, 1);
  assert.equal(inventory.expire(3000), false);
  inventory.release(first.id, 3000);
  const second = inventory.reserve('other', 3000);
  inventory.release(second.id, 3001);
  inventory.release(second.id, 3001);
  assert.equal(inventory.snapshot(3001).available, 1);
});

test('reservation takes one unit immediately and prevents duplicate or excess holds', () => {
  const inventory = new Inventory({ ...product, totalStock: 1 }, config);
  const hold = inventory.reserve('you', 9500);
  assert.equal(hold.expiresAt, 10000);
  assert.equal(inventory.snapshot(9500).available, 0);
  assert.throws(() => inventory.reserve('you', 9500));
  assert.throws(() => inventory.reserve('other', 9500));
  hold.status = 'EXPIRED';
  assert.equal(inventory.snapshot(9500).held, 1);
  assert.throws(() => new Inventory(product, config).reserve('you', 999));
});

test('state transitions forbid reopening terminal reservations', () => {
  assert.equal(canTransition('RESERVED', 'CHECKING_OUT'), true);
  assert.equal(canTransition('CHECKING_OUT', 'RESERVED'), true);
  for (const state of ['EXPIRED', 'RELEASED', 'CHECKED_OUT']) {
    assert.equal(canTransition(state, 'RESERVED'), false);
    assert.equal(canTransition(state, 'CHECKED_OUT'), false);
  }
});

test('sale boundaries and initial stock are exact; caller data cannot mutate configuration', () => {
  const input = { ...product };
  const inventory = new Inventory(input, config);
  input.totalStock = 99;
  assert.equal(inventory.phase(999), 'UPCOMING');
  assert.equal(inventory.phase(1000), 'OPEN');
  assert.equal(inventory.phase(10000), 'ENDED');
  assert.equal(inventory.snapshot().available, 5);
  assert.throws(() => new Inventory({ ...product, totalStock: -1 }, config));
});
