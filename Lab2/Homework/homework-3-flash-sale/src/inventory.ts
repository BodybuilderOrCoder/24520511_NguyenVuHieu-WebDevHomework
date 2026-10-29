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
  private nextId = 1;

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

  reserve(buyerId: string, now = Date.now()): Readonly<Reservation> {
    this.expire(now);
    if (!buyerId.trim()) throw new Error('Người mua không hợp lệ.');
    if (this.phase(now) !== 'OPEN') throw new Error('Flash sale chưa mở hoặc đã kết thúc.');
    const previous = this.reservations.get(buyerId);
    if (previous && ['RESERVED', 'CHECKING_OUT', 'CHECKED_OUT'].includes(previous.status)) {
      throw new Error('Mỗi người chỉ được giữ hoặc mua một sản phẩm.');
    }
    if (this.snapshot(now).available < 1) throw new Error('Hết hàng có thể giữ.');
    const reservation: Reservation = {
      id: `hold-${this.nextId++}`, buyerId, status: 'RESERVED',
      expiresAt: Math.min(now + this.config.holdMs, this.config.endsAt),
    };
    this.reservations.set(buyerId, reservation);
    return { ...reservation };
  }

  expire(now = Date.now()): boolean {
    let changed = false;
    for (const reservation of this.reservations.values()) {
      if (['RESERVED', 'CHECKING_OUT'].includes(reservation.status) && now >= reservation.expiresAt) {
        reservation.status = 'EXPIRED';
        changed = true;
      }
    }
    return changed;
  }

  release(id: string, now = Date.now()): void {
    this.expire(now);
    const reservation = [...this.reservations.values()].find((item) => item.id === id);
    if (reservation?.status === 'RESERVED') reservation.status = 'RELEASED';
  }

  private find(id: string): Reservation {
    const reservation = [...this.reservations.values()].find((item) => item.id === id);
    if (!reservation) throw new Error('Không tìm thấy lượt giữ hàng.');
    return reservation;
  }

  private transition(reservation: Reservation, to: ReservationStatus): void {
    if (!canTransition(reservation.status, to)) throw new Error('Trạng thái giữ hàng không hợp lệ.');
    reservation.status = to;
  }

  beginCheckout(id: string, now = Date.now()): void {
    this.expire(now);
    this.transition(this.find(id), 'CHECKING_OUT');
  }

  finishCheckout(id: string, succeeded: boolean, now = Date.now()): Readonly<Order> {
    this.expire(now);
    const existing = this.orders.find((order) => order.reservationId === id);
    if (existing) return { ...existing };
    const reservation = this.find(id);
    if (reservation.status !== 'CHECKING_OUT') throw new Error('Giữ hàng đã hết hạn hoặc chưa bắt đầu thanh toán.');
    if (!succeeded) {
      this.transition(reservation, 'RESERVED');
      throw new Error('Thanh toán mô phỏng thất bại. Bạn có thể thử lại khi còn hạn giữ hàng.');
    }
    const order: Order = {
      id: `order-${id}`, reservationId: id, buyerId: reservation.buyerId, total: this.product.price,
    };
    this.transition(reservation, 'CHECKED_OUT');
    this.orders.push(order);
    return { ...order };
  }

  snapshot(now = Date.now()): InventorySnapshot {
    this.expire(now);
    const reservations = [...this.reservations.values()].map((item) => ({ ...item }));
    const held = reservations.filter((item) => ['RESERVED', 'CHECKING_OUT'].includes(item.status)).length;
    const sold = this.orders.length;
    return {
      available: this.product.totalStock - held - sold, held, sold, phase: this.phase(now),
      reservations, orders: this.orders.map((order) => ({ ...order })),
    };
  }
}
