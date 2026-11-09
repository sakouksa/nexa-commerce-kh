export interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
  product_count?: number;
  [key: string]: any;
}

export interface CategoryFormData {
  name: string;
  emoji: string;
  description: string;
  sort_order: number;
  status: 'active' | 'inactive';
}

export interface CategoryFiltersState {
  search: string;
  statusFilter: string;
  pageSize: number;
  currentPage: number;
  sortAsc: boolean;
}

export * from './categoryUtils';
