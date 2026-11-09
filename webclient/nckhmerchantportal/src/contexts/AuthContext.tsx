import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Shop } from '../types';
import { shopService } from '../services/shopService';

export interface AuthContextType {
  user: User | null;
  shop: Shop | null;
  setAuth: (token: string, userData: any) => void;
  setShop: (shopData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('ms_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [shop, setShop] = useState<Shop | null>(() => {
    try {
      const stored = localStorage.getItem('ms_shop');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setAuth = (token: string, userData: any) => {
    localStorage.setItem('ms_token', token);
    localStorage.setItem('ms_user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateShop = (shopData: any) => {
    localStorage.setItem('ms_shop', JSON.stringify(shopData));
    setShop(shopData);
  };

  const logout = () => {
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
    localStorage.removeItem('ms_shop');
    setUser(null);
    setShop(null);
  };

  // Automatically fetch shop details if logged in and shop info is not yet fully cached
  useEffect(() => {
    if (user?.shop_id && (!shop || !shop.shop_name)) {
      shopService
        .getDetail(user.shop_id)
        .then((data) => {
          if (data) {
            updateShop(data);
          }
        })
        .catch(() => {
          if (user?.username) {
            fetch(`http://localhost:8003/api/shops/${user.username}`)
              .then((r) => r.json())
              .then((pub) => {
                if (pub && pub.shop_name) {
                  updateShop(pub);
                }
              })
              .catch(() => {});
          }
        });
    }
  }, [user?.shop_id, user?.username]);

  return (
    <AuthContext.Provider value={{ user, shop, setAuth, setShop: updateShop, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
