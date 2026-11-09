import api from '../api/client';

export const paymentService = {
  test: (shopId: number | string) =>
    api.post('/api/payments/aba/test', null, { params: { shop_id: shopId } }).then((r) => r.data),
  testPayment: (shopId: number | string) =>
    api.post('/api/payments/aba/test', null, { params: { shop_id: shopId } }).then((r) => r.data),
  create: (data: any) =>
    api.post('/api/payments/aba/create', data).then((r) => r.data),
  createPayment: (data: any) =>
    api.post('/api/payments/aba/create', data).then((r) => r.data),
  verify: (payload: any) =>
    api.post('/api/payments/aba/verify', payload).then((r) => r.data),
  verifyPayment: (payload: any) =>
    api.post('/api/payments/aba/verify', payload).then((r) => r.data),
  getPlans: () =>
    api.get('/api/plans').then((r) => r.data),
  upgradePlan: (payload: any) =>
    api.post('/api/plans/upgrade', payload).then((r) => r.data),
  confirmPlan: (payload: any) =>
    api.post('/api/plans/confirm', payload).then((r) => r.data),
};

export default paymentService;
