import api from '../api/client';

export const stockService = {
  getReport: (shopId: number | string, low = 5, high = 50) =>
    api.get('/api/reports/stock', { params: { shop_id: shopId, low, high } }).then((r) => r.data),
  getStockReport: (shopId: number | string, low = 5, high = 50) =>
    api.get('/api/reports/stock', { params: { shop_id: shopId, low, high } }).then((r) => r.data),
  update: (id: number | string, quantity: number, mode = 'set') =>
    api.post(`/api/products/${id}/stock`, { quantity, mode }).then((r) => r.data),
  updateStock: (id: number | string, quantity: number, mode = 'set') =>
    api.post(`/api/products/${id}/stock`, { quantity, mode }).then((r) => r.data),
  sendAlert: (shopId: number | string) =>
    api.post('/api/telegram/stock-alert', null, { params: { shop_id: shopId } }).then((r) => r.data),
  sendStockAlert: (shopId: number | string) =>
    api.post('/api/telegram/stock-alert', null, { params: { shop_id: shopId } }).then((r) => r.data),
};

export default stockService;
