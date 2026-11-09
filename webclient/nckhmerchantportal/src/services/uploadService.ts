import api from '../api/client';

export const uploadService = {
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/uploads', fd).then((r) => r.data);
  },
  uploadImages: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return api.post('/api/uploads/product', fd).then((r) => r.data);
  },
};

export default uploadService;
