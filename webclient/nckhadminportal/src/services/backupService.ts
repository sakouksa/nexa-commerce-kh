import { AxiosProgressEvent } from 'axios';
import api from '../api/client';

export const backupService = {
  createSystemBackup: (format = '') =>
    api.post('/api/backup/system', null, { params: { format } }).then((r) => r.data),

  exportSystemBackup: (format = 'xlsx', onProgress?: (e: AxiosProgressEvent) => void) =>
    api.get(`/api/backup/export?format=${format}`, {
      responseType: 'blob',
      onDownloadProgress: onProgress,
    }).then((r) => r.data),

  exportShopBackup: (shopId: number | string, format = 'xlsx', onProgress?: (e: AxiosProgressEvent) => void) =>
    api.get(`/api/backup/export?shop_id=${shopId}&format=${format}`, {
      responseType: 'blob',
      onDownloadProgress: onProgress,
    }).then((r) => r.data),

  importSystemBackup: (file: File, onProgress?: (e: AxiosProgressEvent) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/backup/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then((r) => r.data);
  },

  backupHistory: () => api.get('/api/backup/history').then((r) => r.data),
  getBackupDownload: (filename: string) =>
    api.get(`/api/backup/download/${filename}`, { responseType: 'blob' }).then((r) => r.data),
};
