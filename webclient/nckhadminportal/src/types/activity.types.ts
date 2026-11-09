import { User } from './user.types';

export interface ActivityLog {
  id: number | string;
  shop_id?: number | null;
  user_id?: number | string | null;
  username?: string;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  method?: string;
  url?: string;
  status?: 'success' | 'failed' | string;
  properties?: Record<string, any> | null;
  created_at?: string;
  user?: User;
  [key: string]: any;
}
