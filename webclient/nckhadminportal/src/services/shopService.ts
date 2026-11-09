import api from '../api/client';
import { Category, Order, Product, Shop } from '../types';

export const shopService = {
  listShops: (): Promise<Shop[]> => api.get('/api/shops').then((r) => r.data),
  createShop: (data: any): Promise<Shop> => api.post('/api/shops', data).then((r) => r.data),
  updateShopStatus: (id: number | string, status: string) =>
    api.put(`/api/shops/${id}/status`, { status }).then((r) => r.data),
  deleteShop: (id: number | string) => api.delete(`/api/shops/${id}`).then((r) => r.data),
  getShopDetail: (id: number | string): Promise<Shop> =>
    api.get(`/api/shops/${id}`).then((r) => r.data),
  setShopExpiry: (id: number | string, days: number | string) =>
    api.put(`/api/shops/${id}/expiry`, { days }).then((r) => r.data),
  setShopLimits: (id: number | string, data: any) =>
    api.put(`/api/shops/${id}/limits`, data).then((r) => r.data),

  // Shop sub-resources
  listProducts: (shopId: number | string): Promise<Product[]> =>
    api.get(`/api/products?shop_id=${shopId}`).then((r) => r.data),
  createProduct: (data: any): Promise<Product> => api.post('/api/products', data).then((r) => r.data),
  updateProduct: (id: number | string, data: any): Promise<Product> =>
    api.put(`/api/products/${id}`, data).then((r) => r.data),
  deleteProduct: (id: number | string) => api.delete(`/api/products/${id}`).then((r) => r.data),

  listCategories: (shopId: number | string): Promise<Category[]> =>
    api.get(`/api/categories?shop_id=${shopId}`).then((r) => r.data),
  createCategory: (data: any): Promise<Category> => api.post('/api/categories', data).then((r) => r.data),
  updateCategory: (id: number | string, data: any): Promise<Category> =>
    api.put(`/api/categories/${id}`, data).then((r) => r.data),
  deleteCategory: (id: number | string) => api.delete(`/api/categories/${id}`).then((r) => r.data),

  listOrders: (shopId: number | string): Promise<Order[]> =>
    api.get(`/api/orders?shop_id=${shopId}`).then((r) => r.data),
  getOrder: (id: number | string): Promise<Order> => api.get(`/api/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id: number | string, data: any) =>
    api.put(`/api/orders/${id}/status`, data).then((r) => r.data),
  deleteOrder: (id: number | string) => api.delete(`/api/orders/${id}`).then((r) => r.data),

  listCustomers: (shopId: number | string, search?: string) =>
    api.get(`/api/customers?shop_id=${shopId}${search ? `&search=${search}` : ''}`).then((r) => r.data),
  deleteCustomer: (id: number | string) => api.delete(`/api/customers/${id}`).then((r) => r.data),
};
