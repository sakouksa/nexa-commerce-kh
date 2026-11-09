import { create } from 'zustand';
import {
  RestaurantTable,
  KitchenOrder,
  Reservation,
  TableStatus,
  KitchenOrderStatus,
  ReservationStatus,
} from '../types/restaurant';

// Initial 18 Tables matching Screenshot 1 (Floor Plan)
export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 'T-01', number: 1, seats: 2, section: 'Main Dining', status: 'available' },
  { id: 'T-02', number: 2, seats: 2, section: 'Main Dining', status: 'occupied', currentOrderId: '#1001' },
  { id: 'T-03', number: 3, seats: 4, section: 'Main Dining', status: 'available' },
  {
    id: 'T-04',
    number: 4,
    seats: 4,
    section: 'Main Dining',
    status: 'reserved',
    reservedFor: 'Bennett Family',
    reservationTime: '19:30',
  },
  { id: 'T-05', number: 5, seats: 4, section: 'Main Dining', status: 'occupied', currentOrderId: '#1002' },
  { id: 'T-06', number: 6, seats: 6, section: 'Main Dining', status: 'available' },
  { id: 'T-07', number: 7, seats: 6, section: 'Main Dining', status: 'cleaning' },
  {
    id: 'T-08',
    number: 8,
    seats: 8,
    section: 'Main Dining',
    status: 'reserved',
    reservedFor: 'William Thornton',
    reservationTime: '20:30',
  },
  { id: 'T-09', number: 9, seats: 6, section: 'Private Room', status: 'available' },
  { id: 'T-10', number: 10, seats: 8, section: 'Private Room', status: 'occupied', currentOrderId: '#1003' },
  {
    id: 'T-11',
    number: 11,
    seats: 10,
    section: 'Private Room',
    status: 'reserved',
    reservedFor: 'Hartley Birthday',
    reservationTime: '20:00',
  },
  { id: 'T-12', number: 12, seats: 12, section: 'Private Room', status: 'available' },
  { id: 'T-13', number: 13, seats: 2, section: 'Outdoor', status: 'available' },
  { id: 'T-14', number: 14, seats: 2, section: 'Outdoor', status: 'occupied', currentOrderId: '#1004' },
  { id: 'T-15', number: 15, seats: 4, section: 'Outdoor', status: 'available' },
  { id: 'T-16', number: 16, seats: 4, section: 'Outdoor', status: 'available' },
  { id: 'T-17', number: 17, seats: 4, section: 'Outdoor', status: 'available' },
  { id: 'T-18', number: 18, seats: 6, section: 'Outdoor', status: 'available' },
];


// Initial Kitchen & Restaurant Orders matching Screenshots 2 & 3
export const INITIAL_ORDERS: KitchenOrder[] = [
  {
    id: '#1001',
    type: 'dine-in',
    status: 'preparing',
    tableNumber: 'T-02',
    covers: 2,
    elapsedMinutes: 189,
    placedAt: '2 Oct, 6:39 PM',
    total: 13.06,
    items: [
      {
        name: 'Margherita Pizza',
        quantity: 1,
        price: 7.5,
        options: ['Pizza Size: Large 12"', 'Crust Type: Hand-Tossed', 'Extra Toppings: Extra Cheese'],
      },
      {
        name: 'Garden Fresh Salad',
        quantity: 2,
        price: 2.5,
        options: ['Dressing: Honey Mustard'],
      },
      {
        name: 'Coca Cola',
        quantity: 2,
        price: 1.5,
        options: ['Size: Large 600ml'],
      },
    ],
  },
  {
    id: '#1002',
    type: 'dine-in',
    status: 'new',
    tableNumber: 'T-05',
    covers: 4,
    elapsedMinutes: 176,
    placedAt: '2 Oct, 6:52 PM',
    total: 20.19,
    items: [
      {
        name: 'BBQ Chicken Pizza',
        quantity: 1,
        price: 9.25,
        options: ['Pizza Size: XL 14"', 'Crust Type: Cheese Stuffed', 'Extra Toppings: Mushrooms, Jalapeños'],
      },
      {
        name: 'Crispy Chicken Burger',
        quantity: 2,
        price: 3.99,
        options: ['Burger Add-ons: Extra Cheese Slice, Double Patty'],
      },
      {
        name: 'Iced Tea',
        quantity: 2,
        price: 1.48,
        options: ['Size: Large 600ml'],
      },
    ],
  },
  {
    id: '#1003',
    type: 'dine-in',
    status: 'ready',
    tableNumber: 'T-10',
    covers: 6,
    elapsedMinutes: 203,
    placedAt: '2 Oct, 6:25 PM',
    total: 34.88,
    items: [
      {
        name: 'Pepperoni Pizza',
        quantity: 2,
        price: 8.5,
        options: ['Pizza Size: Regular 10"', 'Crust Type: Hand-Tossed', 'Extra Toppings: Extra Cheese, Black Olives'],
      },
      {
        name: 'Classic Beef Burger',
        quantity: 2,
        price: 4.25,
        options: ['Burger Add-ons: Double Patty, Bacon Strips'],
      },
      {
        name: 'NY Cheesecake',
        quantity: 2,
        price: 3.2,
      },
      {
        name: 'Mango Smoothie',
        quantity: 4,
        price: 2.15,
        options: ['Size: Large 600ml'],
      },
    ],
  },
  {
    id: '#1004',
    type: 'dine-in',
    status: 'preparing',
    tableNumber: 'T-14',
    covers: 2,
    elapsedMinutes: 193,
    placedAt: '2 Oct, 6:35 PM',
    total: 9.56,
    items: [
      {
        name: 'Caesar Salad',
        quantity: 1,
        price: 3.25,
        options: ['Dressing: Caesar'],
      },
      {
        name: 'Tomato Basil Soup',
        quantity: 2,
        price: 2.1,
        options: ['Bowl Size: Large'],
      },
      {
        name: 'Fresh Lemonade',
        quantity: 2,
        price: 1.05,
        options: ['Size: Regular 450ml'],
      },
    ],
  },
  {
    id: '#1005',
    type: 'takeaway',
    status: 'ready',
    customerName: 'William Thornton',
    elapsedMinutes: 183,
    placedAt: '2 Oct, 6:45 PM',
    total: 14.17,
    items: [
      {
        name: 'Pepperoni Pizza',
        quantity: 1,
        price: 8.25,
        options: ['Pizza Size: Large 12"', 'Crust Type: Thin Crust', 'Extra Toppings: Extra Cheese, Sweet Corn, Bell Peppers'],
      },
      {
        name: 'Double Smash Burger',
        quantity: 1,
        price: 4.5,
        options: ['Burger Add-ons: Extra Cheese Slice, Caramelized Onions'],
      },
      {
        name: 'Coca Cola',
        quantity: 2,
        price: 1.42,
        options: ['Size: Large 600ml'],
      },
    ],
  },
  {
    id: '#1006',
    type: 'delivery',
    status: 'preparing',
    customerName: 'Sophie Bennett',
    elapsedMinutes: 180,
    placedAt: '2 Oct, 6:48 PM',
    total: 24.42,
    items: [
      {
        name: 'BBQ Chicken Pizza',
        quantity: 1,
        price: 8.95,
        options: ['Pizza Size: Regular 10"', 'Crust Type: Whole Wheat', 'Extra Toppings: Bell Peppers'],
      },
      {
        name: 'Classic Beef Burger',
        quantity: 2,
        price: 4.5,
        options: ['Burger Add-ons: Extra Cheese Slice, Avocado'],
      },
      {
        name: 'Fresh Lemonade',
        quantity: 4,
        price: 1.61,
      },
    ],
  },
  {
    id: '#1007',
    type: 'dine-in',
    status: 'served',
    tableNumber: 'T-07',
    covers: 3,
    elapsedMinutes: 223,
    placedAt: '2 Oct, 6:05 PM',
    total: 17.82,
    items: [
      {
        name: 'Veggie Supreme',
        quantity: 1,
        price: 7.9,
        options: ['Pizza Size: Regular 10"', 'Crust Type: Thin Crust', 'Extra Toppings: Black Olives'],
      },
      {
        name: 'Greek Salad',
        quantity: 2,
        price: 2.8,
        options: ['Dressing: Honey Mustard'],
      },
      {
        name: 'Chocolate Brownie',
        quantity: 3,
        price: 1.44,
      },
      {
        name: 'Fresh Lemonade',
        quantity: 3,
        price: 1.0,
        options: ['Size: Regular 450ml'],
      },
    ],
  },
  {
    id: '#1008',
    type: 'takeaway',
    status: 'new',
    customerName: 'Andrew Clifton',
    elapsedMinutes: 174,
    placedAt: '2 Oct, 6:54 PM',
    total: 10.81,
    items: [
      {
        name: 'Garden Veggie Burger',
        quantity: 2,
        price: 3.5,
        options: ['Burger Add-ons: Extra Cheese Slice, Avocado'],
      },
      {
        name: 'Tomato Basil Soup',
        quantity: 1,
        price: 2.2,
        options: ['Bowl Size: Large'],
      },
      {
        name: 'Coca Cola',
        quantity: 2,
        price: 1.61,
        options: ['Size: Regular 450ml'],
      },
    ],
  },
  {
    id: '#1009',
    type: 'dine-in',
    status: 'cancelled',
    tableNumber: 'T-01',
    covers: 1,
    elapsedMinutes: 213,
    placedAt: '2 Oct, 6:15 PM',
    total: 4.35,
    items: [
      { name: 'Caesar Salad', quantity: 1, price: 3.1 },
      { name: 'Fresh Lemonade', quantity: 1, price: 1.25 },
    ],
  },
  {
    id: '#1010',
    type: 'delivery',
    status: 'preparing',
    customerName: 'Rebecca Lawson',
    elapsedMinutes: 186,
    placedAt: '2 Oct, 6:42 PM',
    total: 22.65,
    items: [
      { name: 'BBQ Chicken Pizza', quantity: 1, price: 8.9 },
      { name: 'Crispy Chicken Burger', quantity: 2, price: 4.5 },
      { name: 'Strawberry Shake', quantity: 3, price: 1.58 },
    ],
  },
  {
    id: '#1011',
    type: 'dine-in',
    status: 'new',
    tableNumber: 'T-12',
    covers: 4,
    elapsedMinutes: 173,
    placedAt: '2 Oct, 6:55 PM',
    total: 38.9,
    items: [
      {
        name: 'Double Smash Burger',
        quantity: 2,
        price: 5.2,
        options: ['Burger Add-ons: Extra Cheese Slice, Double Patty, Bacon Strips'],
      },
      {
        name: 'Caesar Salad',
        quantity: 2,
        price: 3.5,
      },
      {
        name: 'Pepperoni Pizza',
        quantity: 2,
        price: 8.5,
      },
      {
        name: 'Iced Coffee',
        quantity: 4,
        price: 2.3,
      },
    ],
  },
  {
    id: '#1012',
    type: 'takeaway',
    status: 'ready',
    customerName: 'William Thornton',
    elapsedMinutes: 199,
    placedAt: '2 Oct, 6:30 PM',
    total: 16.5,
    items: [
      { name: 'Pepperoni Pizza', quantity: 1, price: 8.5 },
      { name: 'Crispy Chicken Burger', quantity: 1, price: 4.2 },
      { name: 'Coca Cola', quantity: 2, price: 1.9 },
    ],
  },
  {
    id: '#1013',
    type: 'takeaway',
    status: 'served',
    customerName: 'Catherine Douglas',
    elapsedMinutes: 236,
    placedAt: '2 Oct, 6:00 PM',
    total: 29.75,
    items: [
      { name: 'Veggie Supreme', quantity: 2, price: 7.5 },
      { name: 'Garden Fresh Salad', quantity: 2, price: 2.8 },
      { name: 'Cream of Mushroom', quantity: 2, price: 2.5 },
      { name: 'Mango Smoothie', quantity: 2, price: 2.07 },
    ],
  },
  {
    id: '#1014',
    type: 'dine-in',
    status: 'served',
    tableNumber: 'T-03',
    covers: 2,
    elapsedMinutes: 245,
    placedAt: '2 Oct, 5:45 PM',
    total: 15.2,
    items: [
      { name: 'Classic Beef Burger', quantity: 2, price: 4.5 },
      { name: 'Vanilla Ice Cream', quantity: 2, price: 3.1 },
    ],
  },
  {
    id: '#1015',
    type: 'delivery',
    status: 'served',
    customerName: 'David Miller',
    elapsedMinutes: 260,
    placedAt: '2 Oct, 5:30 PM',
    total: 26.8,
    items: [
      { name: 'Margherita Pizza', quantity: 2, price: 8.0 },
      { name: 'Tiramisu', quantity: 2, price: 3.5 },
      { name: 'Iced Coffee', quantity: 2, price: 1.9 },
    ],
  },
];

// Initial Reservations matching RestroPOS screenshot
export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-oct3-1',
    guestName: 'Emily Ashford',
    phone: '+1 (555) 234-5678',
    dateTime: '03 Oct 2026, 12:30 PM',
    date: '2026-10-03',
    time: '12:30',
    partySize: 2,
    tableId: 'Table 2',
    durationMinutes: 90,
    status: 'upcoming',
    notes: 'Window side requested',
  },
  {
    id: 'res-oct3-2',
    guestName: 'George Pemberton',
    phone: '+1 (555) 876-5432',
    dateTime: '03 Oct 2026, 7:00 PM',
    date: '2026-10-03',
    time: '19:00',
    partySize: 12,
    tableId: 'Table 12',
    durationMinutes: 120,
    status: 'upcoming',
    notes: 'Family gathering, pre-ordered dessert',
  },
  {
    id: 'res-1',
    guestName: 'James Hartley',
    phone: '+44 7700 900001',
    dateTime: '02 Oct 2026, 1:00 PM',
    date: '2026-10-02',
    time: '01:00 PM',
    partySize: 4,
    tableId: 'Table 5',
    durationMinutes: 90,
    status: 'seated',
    notes: 'Anniversary dinner — please arrange flowers on the table',
  },
  {
    id: 'res-2',
    guestName: 'Bennett Family',
    phone: '+44 7700 900002',
    dateTime: '02 Oct 2026, 7:30 PM',
    date: '2026-10-02',
    time: '07:30 PM',
    partySize: 4,
    tableId: 'Table 4',
    durationMinutes: 90,
    status: 'upcoming',
    notes: 'High chair needed for toddler',
  },
  {
    id: 'res-3',
    guestName: 'Hartley Birthday',
    phone: '+44 7700 900003',
    dateTime: '02 Oct 2026, 8:00 PM',
    date: '2026-10-02',
    time: '08:00 PM',
    partySize: 8,
    tableId: 'Table 11',
    durationMinutes: 150,
    status: 'upcoming',
    notes: 'Birthday celebration — arrange cake and decorations',
  },
  {
    id: 'res-4',
    guestName: 'William Thornton',
    phone: '+44 7700 900004',
    dateTime: '02 Oct 2026, 8:30 PM',
    date: '2026-10-02',
    time: '08:30 PM',
    partySize: 6,
    tableId: 'Table 8',
    durationMinutes: 120,
    status: 'upcoming',
    notes: 'Birthday party — need high chair for one child',
  },
];

interface RestaurantStoreState {
  tables: RestaurantTable[];
  orders: KitchenOrder[];
  reservations: Reservation[];
  selectedDate: string;

  // Table actions
  updateTableStatus: (tableId: string, status: TableStatus, extra?: Partial<RestaurantTable>) => void;
  addTable: (table: Omit<RestaurantTable, 'id'>) => void;
  updateTable: (id: string, table: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;

  // Order actions
  updateOrderStatus: (orderId: string, status: KitchenOrderStatus) => void;
  addOrder: (order: Omit<KitchenOrder, 'id'>) => void;

  // Reservation actions
  addReservation: (res: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, res: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;

  // General
  setSelectedDate: (date: string) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY_TABLES = 'restro_tables_v1';
const STORAGE_KEY_ORDERS = 'restro_orders_v1';
const STORAGE_KEY_RESERVATIONS = 'restro_reservations_v1';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as unknown as T;
    }
  } catch {}
  return fallback;
}

export const useRestaurantStore = create<RestaurantStoreState>((set, get) => ({
  tables: loadStored(STORAGE_KEY_TABLES, INITIAL_TABLES),
  orders: loadStored(STORAGE_KEY_ORDERS, INITIAL_ORDERS),
  reservations: loadStored(STORAGE_KEY_RESERVATIONS, INITIAL_RESERVATIONS),
  selectedDate: '2026-10-03',

  updateTableStatus: (tableId, status, extra = {}) => {
    set((state) => {
      const updated = state.tables.map((t) => {
        if (t.id === tableId || `T-${String(t.number).padStart(2, '0')}` === tableId) {
          return {
            ...t,
            status,
            ...extra,
            ...(status === 'available'
              ? { currentOrderId: undefined, reservedFor: undefined, reservationTime: undefined }
              : {}),
          };
        }
        return t;
      });
      try {
        localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(updated));
      } catch {}
      return { tables: updated };
    });
  },

  addTable: (table) => {
    set((state) => {
      const id = `T-${String(table.number).padStart(2, '0')}`;
      const newTable: RestaurantTable = { ...table, id };
      const updated = [...state.tables, newTable];
      try {
        localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(updated));
      } catch {}
      return { tables: updated };
    });
  },

  updateTable: (id, partial) => {
    set((state) => {
      const updated = state.tables.map((t) => (t.id === id ? { ...t, ...partial } : t));
      try {
        localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(updated));
      } catch {}
      return { tables: updated };
    });
  },

  deleteTable: (id) => {
    set((state) => {
      const updated = state.tables.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(updated));
      } catch {}
      return { tables: updated };
    });
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => {
      const updated = state.orders.map((o) => (o.id === orderId ? { ...o, status } : o));
      try {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
      } catch {}

      // If order is served or cancelled, optionally clear the associated table's currentOrderId
      if (status === 'served' || status === 'cancelled') {
        const order = state.orders.find((o) => o.id === orderId);
        if (order?.tableNumber) {
          const tableNumStr = order.tableNumber.replace(/[^0-9]/g, '');
          const tableNum = Number(tableNumStr);
          if (tableNum) {
            get().updateTableStatus(`T-${String(tableNum).padStart(2, '0')}`, 'cleaning', {
              currentOrderId: undefined,
            });
          }
        }
      }

      return { orders: updated };
    });
  },

  addOrder: (order) => {
    set((state) => {
      const id = `#${1000 + state.orders.length + 1}`;
      const newOrder: KitchenOrder = { ...order, id };
      const updated = [newOrder, ...state.orders];
      try {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
      } catch {}

      // If dine-in, mark table as occupied
      if (order.tableNumber) {
        get().updateTableStatus(order.tableNumber, 'occupied', { currentOrderId: id });
      }

      return { orders: updated };
    });
  },

  addReservation: (res) => {
    set((state) => {
      const id = `res-${Date.now()}`;
      const newRes: Reservation = { ...res, id };
      const updated = [newRes, ...state.reservations];
      try {
        localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(updated));
      } catch {}

      // If reserved for a specific table, reflect on table
      if (res.tableId) {
        const tableNum = Number(res.tableId.replace(/[^0-9]/g, ''));
        if (tableNum) {
          get().updateTableStatus(`T-${String(tableNum).padStart(2, '0')}`, 'reserved', {
            reservedFor: res.guestName,
            reservationTime: res.time,
            reservationDate: res.date,
          });
        }
      }

      return { reservations: updated };
    });
  },

  updateReservation: (id, partial) => {
    set((state) => {
      const updated = state.reservations.map((r) => (r.id === id ? { ...r, ...partial } : r));
      try {
        localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(updated));
      } catch {}
      return { reservations: updated };
    });
  },

  deleteReservation: (id) => {
    set((state) => {
      const resToDelete = state.reservations.find((r) => r.id === id);
      const updated = state.reservations.filter((r) => r.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(updated));
      } catch {}

      // If associated with a table, free up the table if it was reserved
      if (resToDelete?.tableId) {
        const tableNum = Number(resToDelete.tableId.replace(/[^0-9]/g, ''));
        if (tableNum) {
          const targetTable = state.tables.find((t) => t.number === tableNum);
          if (targetTable && targetTable.status === 'reserved') {
            get().updateTableStatus(targetTable.id, 'available');
          }
        }
      }

      return { reservations: updated };
    });
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEY_TABLES);
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    localStorage.removeItem(STORAGE_KEY_RESERVATIONS);
    set({
      tables: INITIAL_TABLES,
      orders: INITIAL_ORDERS,
      reservations: INITIAL_RESERVATIONS,
    });
  },
}));
