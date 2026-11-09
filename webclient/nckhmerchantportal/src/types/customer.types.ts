export interface Customer {
  id: number;
  name?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  total_orders?: number;
  total_spent?: number;
  [key: string]: any;
}
