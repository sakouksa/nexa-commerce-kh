export interface ShopTheme {
  primary?: string;
  secondary?: string;
  font?: string;
  [key: string]: any;
}

export interface Shop {
  id: number;
  username: string;
  shop_name: string;
  currency?: string;
  logo?: string;
  banner?: string;
  bio?: string;
  description?: string;
  theme?: ShopTheme;
  social_media?: Record<string, string>;
  contact?: string;
  payment_methods?: Record<string, any>;
  plan?: string;
  status?: string;
  [key: string]: any;
}

export interface ProductVariation {
  id?: number;
  attrs: Record<string, string>;
  price?: number | null;
  quantity?: number | null;
  sku?: string;
}

export interface CustomAttribute {
  name: string;
  label?: string;
  value?: string;
  type?: string;
  options?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  quantity: number;
  images?: string[];
  description?: string;
  category_id?: number;
  category_name?: string;
  variations?: ProductVariation[];
  custom_attributes?: CustomAttribute[];
  is_featured?: boolean;
  [key: string]: any;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variations?: Record<string, any>;
  selectedAttrs?: Record<string, any>;
  [key: string]: any;
}

export interface Customer {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  address?: string;
  city?: string;
  [key: string]: any;
}

export interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  variations?: Record<string, any>;
  image?: string;
}

export interface Order {
  id: number | string;
  order_number: string;
  total: number;
  status: string;
  currency?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  created_at?: string;
  items?: OrderItem[];
  payment_method?: string;
  payment_status?: string;
  [key: string]: any;
}
