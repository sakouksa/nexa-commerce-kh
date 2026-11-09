import { User } from './user.types';

export interface ActivityLog {
  id: number | string;
  user_id?: number | string;
  action: string;
  target_type?: string;
  target_id?: string | number;
  details?: any;
  ip_address?: string;
  created_at?: string;
  user?: User;
  [key: string]: any;
}
