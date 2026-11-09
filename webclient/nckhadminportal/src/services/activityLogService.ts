import api from '../api/client';
import { ActivityLog } from '../types';

export const activityLogService = {
  getActivity: (params: any = {}): Promise<ActivityLog[]> => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/activity${q ? `?${q}` : ''}`).then((r) => r.data);
  },
};
