export interface Order {
  id: number | string;
  shop_id: number | string;
  order_number: string;
  total: number;
  items?: any[];
  status: string;
  customer_name?: string;
  customer_phone?: string;
  payment_method?: string;
  payment_status?: string;
  created_at?: string;
  [key: string]: any;
}

export interface Customer {
  id: number | string;
  shop_id?: number | string;
  name: string;
  phone?: string;
  telegram_id?: string;
  orders_count?: number;
  total_spent?: number;
  created_at?: string;
  [key: string]: any;
}
