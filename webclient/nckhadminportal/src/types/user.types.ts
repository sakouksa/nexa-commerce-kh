export interface User {
  id: number | string;
  username: string;
  email?: string;
  full_name?: string;
  role: 'superadmin' | 'admin' | 'merchant' | 'reseller' | string;
  status?: string;
  shop_id?: number | string | null;
  reseller_id?: number | string | null;
  created_at?: string;
  [key: string]: any;
}
