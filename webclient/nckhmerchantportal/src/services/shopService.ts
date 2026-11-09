import api from '../api/client';

export const shopService = {
  getDetail: (shopId: number | string) =>
    api.get(`/api/shops/${shopId}/detail`).then((r) => r.data),
  getShopDetail: (shopId: number | string) =>
    api.get(`/api/shops/${shopId}/detail`).then((r) => r.data),
  update: (shopId: number | string, data: any) =>
    api.put(`/api/shops/${shopId}/update`, data).then((r) => r.data),
  updateShop: (shopId: number | string, data: any) =>
    api.put(`/api/shops/${shopId}/update`, data).then((r) => r.data),
};

export default shopService;
