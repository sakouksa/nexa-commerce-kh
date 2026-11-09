import api from '../api/client';

export const authService = {
  login: (data: any) => api.post('/api/auth/login', data).then((r) => r.data),
  changePassword: (data: any) => api.post('/api/auth/change-password', data).then((r) => r.data),
};

export default authService;
