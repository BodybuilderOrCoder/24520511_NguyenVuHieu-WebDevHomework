import test from 'node:test';
import assert from 'node:assert/strict';
import { Inventory, canTransition } from '../src/inventory.ts';

const product = { id: 'headphones', name: 'Tai nghe', price: 299000, totalStock: 5 };
const config = { startsAt: 1000, endsAt: 10000, holdMs: 2000 };

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
