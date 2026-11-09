export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  full_name?: string;
  phone?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  setAuth: (token: string, userData: User) => void;
  logout: () => void;
}

export interface Shop {
  id: number;
  shop_name: string;
  username: string;
  status?: string;
  created_at?: string;
  plan?: string;
  total_orders?: number;
  total_sales?: number;
  [key: string]: any;
}

export interface Commission {
  id: number;
  shop_name?: string;
  amount: number;
  rate?: number;
  status?: string;
  created_at?: string;
  paid_at?: string;
  [key: string]: any;
}

export interface PromoCode {
  id?: number;
  code: string;
  discount_percent?: number;
  discount_type?: string;
  max_uses?: number;
  used_count?: number;
  is_active?: boolean;
  [key: string]: any;
}

export interface ResellerDashboardData {
  reseller?: {
    id: number;
    username: string;
    commission_rate?: number;
    total_commission?: number;
    unpaid_commission?: number;
    [key: string]: any;
  };
  stats?: {
    total_shops?: number;
    active_shops?: number;
    total_commission?: number;
    pending_commission?: number;
    [key: string]: any;
  };
  shops?: Shop[];
  commissions?: Commission[];
  promo_codes?: PromoCode[];
  [key: string]: any;
}
