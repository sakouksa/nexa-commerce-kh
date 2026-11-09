export interface Reseller {
  id: number | string;
  name: string;
  code?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  commission_rate?: number;
  balance?: number;
  status?: string;
  customers_count?: number;
  total_sales?: number;
  total_commission?: number;
  created_at?: string;
  [key: string]: any;
}
