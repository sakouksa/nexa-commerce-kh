export interface Customer {
  id: number;
  name?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  city?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  total_orders?: number;
  order_count?: number;
  total_spent?: number;
  [key: string]: any;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  telegram: string;
  email: string;
  city: string;
  address: string;
  notes: string;
}

export interface CustomerFiltersState {
  search: string;
  filterType: string;
  pageSize: number;
  currentPage: number;
  sortAsc: boolean;
  sortField: 'index' | 'name' | 'orders' | 'spent' | 'date';
}
