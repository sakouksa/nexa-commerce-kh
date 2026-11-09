export type TableSection = 'Main Dining' | 'Private Room' | 'Outdoor';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface RestaurantTable {
  id: string; // e.g. 'T-01'
  number: number; // 1, 2, ... 18
  seats: number; // 2, 4, 6, 8, 10, 12
  section: TableSection;
  status: TableStatus;
  currentOrderId?: string; // e.g. '#1001'
  reservedFor?: string; // e.g. 'Bennett Family'
  reservationTime?: string; // e.g. '19:30'
  reservationDate?: string; // e.g. '2026-10-02'
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export type KitchenOrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface KitchenOrderItem {
  name: string;
  quantity: number;
  options?: string[]; // e.g. ['Pizza Size: XL 14"', 'Crust Type: Cheese Stuffed']
  price: number;
}

export interface KitchenOrder {
  id: string; // e.g. '#1001'
  type: OrderType;
  status: KitchenOrderStatus;
  tableNumber?: string; // e.g. 'T-02'
  customerName?: string; // e.g. 'William Thornton'
  covers?: number; // e.g. 2
  elapsedMinutes: number; // e.g. 176
  placedAt: string; // e.g. '2 Oct, 6:39 PM'
  total: number;
  items: KitchenOrderItem[];
}

export type ReservationStatus = 'seated' | 'upcoming' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  guestName: string; // e.g. 'James Hartley'
  phone: string; // e.g. '+44 7700 900001'
  dateTime: string; // e.g. '02 Oct 2026, 1:00 PM'
  date: string; // e.g. '2026-10-02'
  time: string; // e.g. '13:00'
  partySize: number; // e.g. 4
  tableId: string; // e.g. 'Table 5'
  durationMinutes: number; // e.g. 90
  status: ReservationStatus;
  notes?: string;
}
