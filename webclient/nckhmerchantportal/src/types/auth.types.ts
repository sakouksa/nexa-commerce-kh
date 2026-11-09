export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  shop_id?: number;
  full_name?: string;
  phone?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

export type AuthUser = User;

export interface AuthContextType {
  user: User | null;
  shop: any | null;
  setAuth: (token: string, userData: any) => void;
  setShop: (shopData: any) => void;
  logout: () => void;
}
