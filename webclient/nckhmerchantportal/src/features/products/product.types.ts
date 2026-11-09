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

export interface ProductFiltersState {
  search: string;
  statusFilter: string;
  categoryFilter: string;
  pageSize: number;
  currentPage: number;
  sortAsc: boolean;
  sortField: 'index' | 'name' | 'price' | 'stock';
}
