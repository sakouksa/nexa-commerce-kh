import api from '../api/client';
import { Order } from '../types';

export const orderService = {
  list: (shopId: number | string, status?: string): Promise<Order[]> =>
    api.get('/api/orders', { params: { shop_id: shopId, status } }).then((r) => r.data),
  listOrders: (shopId: number | string, status?: string): Promise<Order[]> =>
    api.get('/api/orders', { params: { shop_id: shopId, status } }).then((r) => r.data),
  get: (id: number | string): Promise<Order> =>
    api.get(`/api/orders/${id}`).then((r) => r.data),
  getOrder: (id: number | string): Promise<Order> =>
    api.get(`/api/orders/${id}`).then((r) => r.data),
  updateStatus: (id: number | string, data: any): Promise<Order> =>
    api.put(`/api/orders/${id}/status`, data).then((r) => r.data),
  updateOrderStatus: (id: number | string, data: any): Promise<Order> =>
    api.put(`/api/orders/${id}/status`, data).then((r) => r.data),
  generateReceipt: (id: number | string) =>
    api.get(`/api/orders/${id}/receipt`).then((r) => r.data),
  createPosOrder: (data: any) =>
    api.post('/api/orders/pos', data).then((r) => r.data),
};

export default orderService;
