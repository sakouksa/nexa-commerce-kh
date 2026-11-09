export interface ShopTheme {
  primary?: string;
  secondary?: string;
  [key: string]: string | undefined;
}

export interface ShopMini {
  welcome_km?: string;
  welcome_en?: string;
  [key: string]: string | undefined;
}

export interface Shop {
  id: number;
  shop_name: string;
  username: string;
  currency?: string;
  banner?: string;
  logo?: string;
  theme?: ShopTheme;
  mini?: ShopMini;
  telegram_bot_username?: string;
  bio?: string;
  description?: string;
  contact?: string;
  social_media?: Record<string, string>;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string;
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
  category_id?: number;
  images?: string[];
  description?: string;
  variations?: ProductVariation[];
  custom_attributes?: CustomAttribute[];
}

export interface CartItem {
  key: string;
  product: Product;
  qty: number;
  variations?: Record<string, string>;
}

export interface Customer {
  id?: number;
  name?: string;
  phone?: string;
  telegram?: string;
  username?: string;
}

export interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface Order {
  id: number | string;
  order_number?: string;
  total: number;
  status?: string;
  [key: string]: any;
}

export interface PaymentResult {
  qr_code_url?: string;
  qr_image?: string;
  qr?: string;
  checkout_url?: string;
  payment_url?: string;
  [key: string]: any;
}

export interface ActiveOrderResult {
  order: Order;
  pay: PaymentResult;
  verified?: any;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
}
