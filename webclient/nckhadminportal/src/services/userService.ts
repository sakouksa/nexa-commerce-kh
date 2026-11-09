import api from '../api/client';
import { User } from '../types';

export const userService = {
  listUsers: (): Promise<User[]> => api.get('/api/auth/users').then((r) => r.data),
  createUser: (data: any): Promise<User> => api.post('/api/auth/register', data).then((r) => r.data),
  updateUser: (id: number | string, data: any): Promise<User> =>
    api.put(`/api/auth/users/${id}`, data).then((r) => r.data),
  deleteUser: (id: number | string) => api.delete(`/api/auth/users/${id}`).then((r) => r.data),
};
export default userService;
