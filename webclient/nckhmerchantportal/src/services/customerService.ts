import api from '../api/client';
import { Customer } from '../types';

export const customerService = {
  list: (shopId: number | string, search?: string): Promise<Customer[]> =>
    api.get('/api/customers', { params: { shop_id: shopId, search } }).then((r) => r.data),
  listCustomers: (shopId: number | string, search?: string): Promise<Customer[]> =>
    api.get('/api/customers', { params: { shop_id: shopId, search } }).then((r) => r.data),
  get: (id: number | string): Promise<Customer> =>
    api.get(`/api/customers/${id}`).then((r) => r.data),
  getCustomer: (id: number | string): Promise<Customer> =>
    api.get(`/api/customers/${id}`).then((r) => r.data),
  create: (data: Partial<Customer> & { shop_id: number | string }): Promise<Customer> =>
    api.post('/api/customers', data).then((r) => r.data),
  update: (id: number | string, data: Partial<Customer>): Promise<Customer> =>
    api.put(`/api/customers/${id}`, data).then((r) => r.data),
  delete: (id: number | string): Promise<{ ok: boolean }> =>
    api.delete(`/api/customers/${id}`).then((r) => r.data),
};

export default customerService;
