import test from 'node:test';
import assert from 'node:assert/strict';
import { Inventory } from '../src/inventory.ts';
import { simulateBuyers } from '../src/simulate-buyers.ts';

test('1,000 simultaneous callers cannot oversell five units', async (t) => {
  t.mock.method(Date, 'now', () => 1000);
  const inventory = new Inventory(
    { id: 'test', name: 'Test', price: 1, totalStock: 5 },
    { startsAt: 0, endsAt: 10000, holdMs: 2000 },
  );
  const result = await simulateBuyers(inventory, 1000);
  assert.deepEqual(result, { accepted: 5, rejected: 995 });
  for (const hold of inventory.snapshot().reservations) {
    inventory.beginCheckout(hold.id);
    inventory.finishCheckout(hold.id, true);
    const state = inventory.snapshot();
    assert.equal(state.available + state.held + state.sold, 5);
    assert.ok(state.available >= 0);
  }
  assert.deepEqual(await simulateBuyers(inventory, 1000), { accepted: 0, rejected: 1000 });
  assert.equal(inventory.snapshot().sold, 5);
});
