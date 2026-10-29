import type { Inventory } from './inventory.ts';

export async function simulateBuyers(inventory: Inventory, count = 20): Promise<{ accepted: number; rejected: number }> {
  const results = await Promise.allSettled(Array.from({ length: count }, (_, i) =>
    Promise.resolve().then(() => inventory.reserve(`buyer-${i + 1}`))));
  const accepted = results.filter((result) => result.status === 'fulfilled').length;
  return { accepted, rejected: count - accepted };
}
