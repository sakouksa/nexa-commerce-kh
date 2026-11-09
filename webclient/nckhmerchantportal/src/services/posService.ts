import api from '../api/client';

export const posService = {
  createOrder: (data: any) =>
    api.post('/api/orders/pos', data).then((r) => r.data),
};

export default posService;
