export interface Shop {
  id: number;
  shop_name: string;
  username: string;
  currency?: string;
  logo?: string;
  banner?: string;
  bio?: string;
  description?: string;
  contact?: string;
  theme?: Record<string, any>;
  social_media?: Record<string, any>;
  payment_methods?: Record<string, any>;
  plan?: string;
  status?: string;
  [key: string]: any;
}
