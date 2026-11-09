export type PeriodType = 'daily' | 'weekly' | 'monthly';
export type ReportTabType = 'sales' | 'products' | 'stock' | 'customers';

export interface SalesRow {
  date: string;
  orders: number;
  revenue: number;
  [key: string]: any;
}

export interface ProductRow {
  name: string;
  units: number;
  revenue: number;
  [key: string]: any;
}

export interface CustomerRow {
  id?: number | string;
  name: string;
  phone: string;
  order_count: number;
  total_spent: number;
  [key: string]: any;
}

export interface StockProductRow {
  id: number | string;
  name: string;
  quantity: number;
  price?: number;
  sku?: string;
  status: 'out_of_stock' | 'low_stock' | 'normal_stock' | 'high_stock';
}
