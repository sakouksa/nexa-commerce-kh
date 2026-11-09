export interface Shop {
  id: number | string;
  shop_name: string;
  username: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  logo?: string;
  banner?: string;
  status: 'active' | 'suspended' | 'expired' | 'pending' | string;
  plan?: string;
  expires_at?: string | null;
  created_at?: string;
  max_products?: number;
  max_categories?: number;
  max_orders?: number;
  storage_limit_mb?: number;
  [key: string]: any;
}

export interface Product {
  id: number | string;
  shop_id: number | string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  quantity: number;
  category_id?: number | string | null;
  images?: string[];
  status?: string;
  featured?: boolean;
  [key: string]: any;
}

export interface Category {
  id: number | string;
  shop_id: number | string;
  name: string;
  slug?: string;
  image?: string;
  sort_order?: number;
  [key: string]: any;
}
