import api from '../api/client';
import { Category } from '../types';

export const categoryService = {
  list: (shopId: number | string): Promise<Category[]> =>
    api.get('/api/categories', { params: { shop_id: shopId } }).then((r) => r.data),
  listCategories: (shopId: number | string): Promise<Category[]> =>
    api.get('/api/categories', { params: { shop_id: shopId } }).then((r) => r.data),
  create: (data: any): Promise<Category> =>
    api.post('/api/categories', data).then((r) => r.data),
  createCategory: (data: any): Promise<Category> =>
    api.post('/api/categories', data).then((r) => r.data),
  update: (id: number | string, data: any): Promise<Category> =>
    api.put(`/api/categories/${id}`, data).then((r) => r.data),
  updateCategory: (id: number | string, data: any): Promise<Category> =>
    api.put(`/api/categories/${id}`, data).then((r) => r.data),
  delete: (id: number | string) =>
    api.delete(`/api/categories/${id}`).then((r) => r.data),
  deleteCategory: (id: number | string) =>
    api.delete(`/api/categories/${id}`).then((r) => r.data),
};

export default categoryService;
