import api from '../api/client';

export const telegramService = {
  test: (data: any) =>
    api.post('/api/telegram/test', data).then((r) => r.data),
  testTelegram: (data: any) =>
    api.post('/api/telegram/test', data).then((r) => r.data),
  getSettings: (shopId: number | string) =>
    api.get('/api/telegram/settings', { params: { shop_id: shopId } }).then((r) => r.data),
  getTelegramSettings: (shopId: number | string) =>
    api.get('/api/telegram/settings', { params: { shop_id: shopId } }).then((r) => r.data),
  setWebhook: (shopId: number | string) =>
    api.post('/api/telegram/setwebhook', null, { params: { shop_id: shopId } }).then((r) => r.data),
  setTelegramWebhook: (shopId: number | string) =>
    api.post('/api/telegram/setwebhook', null, { params: { shop_id: shopId } }).then((r) => r.data),
};

export default telegramService;
