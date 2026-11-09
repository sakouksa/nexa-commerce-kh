import api from '../api/client';

export const reportService = {
  getOverview: (shopId: number | string) =>
    api.get('/api/reports/overview', { params: { shop_id: shopId } }).then((r) => r.data),
  getSales: (shopId: number | string, period?: string, days?: number) =>
    api.get('/api/reports/sales', { params: { shop_id: shopId, period, days } }).then((r) => r.data),
  getSalesReport: (shopId: number | string, period?: string, days?: number) =>
    api.get('/api/reports/sales', { params: { shop_id: shopId, period, days } }).then((r) => r.data),
  getProducts: (shopId: number | string) =>
    api.get('/api/reports/products', { params: { shop_id: shopId } }).then((r) => r.data),
  getProductReport: (shopId: number | string) =>
    api.get('/api/reports/products', { params: { shop_id: shopId } }).then((r) => r.data),
  getCustomers: (shopId: number | string) =>
    api.get('/api/reports/customers', { params: { shop_id: shopId } }).then((r) => r.data),
  getCustomerReport: (shopId: number | string) =>
    api.get('/api/reports/customers', { params: { shop_id: shopId } }).then((r) => r.data),
  getTelegramSummary: (shopId: number | string, days?: number, lang?: string) =>
    api.get('/api/reports/telegram/summary', { params: { shop_id: shopId, days, lang } }).then((r) => r.data),
  dispatchTelegramReport: (shopId: number | string, days?: number, lang?: string) =>
    api.post('/api/reports/telegram/dispatch', { shop_id: shopId, days, lang }).then((r) => r.data),
};

export default reportService;
