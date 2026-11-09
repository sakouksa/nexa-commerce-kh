export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type DietaryFilter = 'All' | 'Veg' | 'Non-Veg' | 'Egg';

export interface CartItem {
  id: string;
  productId?: number | null;
  name: string;
  name_kh?: string;
  name_en?: string;
  price: number;
  quantity: number;
  image: string;
  dietary?: string;
  stock?: number;
  category?: string;
}

export interface POSProduct {
  id: string;
  productId?: number | null;
  name: string;
  name_kh?: string;
  name_en?: string;
  category: string;
  price: number;
  dietary: string;
  image: string;
  stock: number;
  barcode?: string;
}

export interface PaymentModalState {
  isOpen: boolean;
  tab: 'cash' | 'khqr';
  cashReceived: string;
  qrData?: any;
  isGeneratingQr?: boolean;
}

export interface OrderSuccessState {
  orderNumber: string;
  total: number;
  method: string;
  table?: string;
  items?: CartItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  customerName?: string;
  createdAt?: string;
}
