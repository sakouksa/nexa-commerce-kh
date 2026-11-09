import { KitchenOrder, OrderType, KitchenOrderStatus } from '../../types/restaurant';

export interface OrderItem {
  id?: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  variations?: Record<string, any>;
  image?: string;
  [key: string]: any;
}

export interface Order {
  id: number | string;
  order_number?: string;
  total: number;
  status: string;
  currency?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  created_at?: string;
  items?: OrderItem[];
  payment_method?: string;
  payment_status?: string;
  [key: string]: any;
}

export type { KitchenOrder, OrderType, KitchenOrderStatus };

export interface OrderFiltersState {
  search: string;
  statusFilter: string;
  typeFilter: string;
  pageSize: number;
  currentPage: number;
}
