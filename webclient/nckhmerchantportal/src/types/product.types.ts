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
  category_id?: number;
  category_name?: string;
  description?: string;
  variations?: ProductVariation[];
  custom_attributes?: CustomAttribute[];
  sku?: string;
  barcode?: string;
  is_active?: boolean;
  [key: string]: any;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  product_count?: number;
  [key: string]: any;
}
