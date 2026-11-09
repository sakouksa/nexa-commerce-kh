import api from '../api/client';

export const backupService = {
  create: (shopId: number | string, format = '') =>
    api.post(`/api/backup/shop/${shopId}/create`, null, { params: { format } }).then((r) => r.data),
  createShopBackup: (shopId: number | string, format = '') =>
    api.post(`/api/backup/shop/${shopId}/create`, null, { params: { format } }).then((r) => r.data),
  export: (shopId: number | string, format = 'xlsx') =>
    api.get(`/api/backup/shop/${shopId}/export`, {
      params: { export_format: format },
      responseType: 'blob',
    }).then((r) => r.data),
  exportShopBackup: (shopId: number | string, format = 'xlsx') =>
    api.get(`/api/backup/shop/${shopId}/export`, {
      params: { export_format: format },
      responseType: 'blob',
    }).then((r) => r.data),
  import: (shopId: number | string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/api/backup/shop/${shopId}/import`, fd).then((r) => r.data);
  },
  importShopBackup: (shopId: number | string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/api/backup/shop/${shopId}/import`, fd).then((r) => r.data);
  },
  history: (shopId: number | string) =>
    api.get('/api/backup/history', { params: { shop_id: shopId } }).then((r) => r.data),
  backupHistory: (shopId: number | string) =>
    api.get('/api/backup/history', { params: { shop_id: shopId } }).then((r) => r.data),
  download: (filename: string) =>
    api.get('/api/backup/download', { params: { filename } }).then((r) => r.data),
  getBackupDownload: (filename: string) =>
    api.get('/api/backup/download', { params: { filename } }).then((r) => r.data),
};

export default backupService;
