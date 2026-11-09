import api from '../api/client';

export const settingsService = {
  getPlatformSettings: () => api.get('/api/settings/platform').then((r) => r.data),
};
