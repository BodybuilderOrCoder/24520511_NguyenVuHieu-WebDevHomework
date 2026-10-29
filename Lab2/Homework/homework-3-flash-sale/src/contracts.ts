export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly totalStock: number;
}

export type ReservationStatus = 'RESERVED' | 'CHECKING_OUT' | 'EXPIRED' | 'RELEASED' | 'CHECKED_OUT';
export type SalePhase = 'UPCOMING' | 'OPEN' | 'ENDED';

export interface Reservation {
  readonly id: string;
  readonly buyerId: string;
  readonly expiresAt: number;
  status: ReservationStatus;
}

export interface Order {
  readonly id: string;
  readonly reservationId: string;
  readonly buyerId: string;
  readonly total: number;
}

export interface InventorySnapshot {
  readonly available: number;
  readonly held: number;
  readonly sold: number;
  readonly phase: SalePhase;
  readonly reservations: readonly Readonly<Reservation>[];
  readonly orders: readonly Order[];
}

export interface SaleConfig {
  readonly startsAt: number;
  readonly endsAt: number;
  readonly holdMs: number;
}

export type ViewState =
  | { status: 'IDLE' }
  | { status: 'LOADING' }
  | { status: 'SUCCESS'; message: string }
  | { status: 'ERROR'; message: string };
