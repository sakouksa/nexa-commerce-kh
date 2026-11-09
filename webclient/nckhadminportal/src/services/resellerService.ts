import api from '../api/client';
import { Reseller } from '../types';

export const resellerService = {
  listResellers: (): Promise<Reseller[]> => api.get('/api/plans/resellers').then((r) => r.data),
  createReseller: (data: any): Promise<Reseller> => api.post('/api/plans/resellers', data).then((r) => r.data),
  updateReseller: (id: number | string, data: any): Promise<Reseller> =>
    api.put(`/api/plans/resellers/${id}`, data).then((r) => r.data),
  deleteReseller: (id: number | string) => api.delete(`/api/plans/resellers/${id}`).then((r) => r.data),
  resellerCustomers: (id: number | string) =>
    api.get(`/api/plans/resellers/${id}/customers`).then((r) => r.data),
  getReseller: (id: number | string): Promise<Reseller> =>
    api.get(`/api/plans/resellers/${id}`).then((r) => r.data),
};
