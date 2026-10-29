import type { InventorySnapshot, Order, Product, Reservation, ReservationStatus, SaleConfig, SalePhase } from './contracts.ts';

const transitions: Record<ReservationStatus, readonly ReservationStatus[]> = {
  RESERVED: ['CHECKING_OUT', 'EXPIRED', 'RELEASED'],
  CHECKING_OUT: ['CHECKED_OUT', 'EXPIRED', 'RESERVED'],
  EXPIRED: [], RELEASED: [], CHECKED_OUT: [],
};

export function canTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  return transitions[from].includes(to);
}

export class Inventory {
  readonly product: Readonly<Product>;
  readonly config: Readonly<SaleConfig>;
  private reservations = new Map<string, Reservation>();
  private orders: Order[] = [];

  constructor(product: Product, config: SaleConfig) {
    if (!Number.isInteger(product.totalStock) || product.totalStock < 1) throw new Error('Invalid stock');
    if (!Number.isFinite(product.price) || product.price < 0) throw new Error('Invalid price');
    if (![config.startsAt, config.endsAt, config.holdMs].every(Number.isFinite)
      || config.endsAt <= config.startsAt || config.holdMs <= 0) throw new Error('Invalid sale timing');
    this.product = Object.freeze({ ...product });
    this.config = Object.freeze({ ...config });
  }

  phase(now = Date.now()): SalePhase {
    if (now < this.config.startsAt) return 'UPCOMING';
    return now < this.config.endsAt ? 'OPEN' : 'ENDED';
  }

  snapshot(now = Date.now()): InventorySnapshot {
    const reservations = [...this.reservations.values()].map((item) => ({ ...item }));
    const held = reservations.filter((item) => ['RESERVED', 'CHECKING_OUT'].includes(item.status)).length;
    const sold = this.orders.length;
    return {
      available: this.product.totalStock - held - sold, held, sold, phase: this.phase(now),
      reservations, orders: this.orders.map((order) => ({ ...order })),
    };
  }
}
