import api from '../api/client';
import { PlatformStats } from '../types';

export const dashboardService = {
  getStats: (): Promise<PlatformStats> => api.get('/api/settings/stats').then((r) => r.data),
  getPlatformCharts: () => api.get('/api/plans/charts').then((r) => r.data),
};
