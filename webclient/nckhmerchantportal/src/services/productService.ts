import api from '../api/client';
import { Product } from '../types';

export const productService = {
  list: (shopId: number | string): Promise<Product[]> =>
    api.get('/api/products', { params: { shop_id: shopId } }).then((r) => r.data),
  listProducts: (shopId: number | string): Promise<Product[]> =>
    api.get('/api/products', { params: { shop_id: shopId } }).then((r) => r.data),
  get: (id: number | string): Promise<Product> =>
    api.get(`/api/products/${id}`).then((r) => r.data),
  getProduct: (id: number | string): Promise<Product> =>
    api.get(`/api/products/${id}`).then((r) => r.data),
  create: (data: any): Promise<Product> =>
    api.post('/api/products', data).then((r) => r.data),
  createProduct: (data: any): Promise<Product> =>
    api.post('/api/products', data).then((r) => r.data),
  update: (id: number | string, data: any): Promise<Product> =>
    api.put(`/api/products/${id}`, data).then((r) => r.data),
  updateProduct: (id: number | string, data: any): Promise<Product> =>
    api.put(`/api/products/${id}`, data).then((r) => r.data),
  delete: (id: number | string) =>
    api.delete(`/api/products/${id}`).then((r) => r.data),
  deleteProduct: (id: number | string) =>
    api.delete(`/api/products/${id}`).then((r) => r.data),
};

export default productService;
