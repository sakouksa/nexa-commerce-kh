import React, { createContext, useContext, useState, ReactNode } from 'react';
import { customerSignin, customerSignup, verifyTelegramCode } from '../api';
import { Customer } from '../types';

export interface CustomerContextType {
  customer: Customer | null;
  token: string | null;
  isLoggedIn: boolean;
  signin: (shopId: number, identifier: string, password?: string) => Promise<Customer>;
  signup: (shopId: number, data: any) => Promise<Customer>;
  loginWithCode: (shopId: number, telegramId: number, code: string) => Promise<Customer>;
  setSession: (res: any) => Customer;
  logout: () => void;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const stored = localStorage.getItem('ms_customer');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('ms_customer_token'),
  );

  const setSession = (res: any): Customer => {
    localStorage.setItem('ms_customer_token', res.access_token);
    localStorage.setItem('ms_customer', JSON.stringify(res.customer));
    setToken(res.access_token);
    setCustomer(res.customer);
    return res.customer;
  };

  const signin = async (shopId: number, identifier: string, password?: string): Promise<Customer> => {
    const res = await customerSignin({ shop_id: shopId, identifier, password });
    return setSession(res);
  };

  const signup = async (shopId: number, data: any): Promise<Customer> => {
    const res = await customerSignup({ shop_id: shopId, ...data });
    return setSession(res);
  };

  const loginWithCode = async (shopId: number, telegramId: number, code: string): Promise<Customer> => {
    const res = await verifyTelegramCode({ shop_id: shopId, telegram_id: telegramId, code });
    return setSession(res);
  };

  const logout = () => {
    localStorage.removeItem('ms_customer_token');
    localStorage.removeItem('ms_customer');
    setToken(null);
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        token,
        isLoggedIn: !!token,
        signin,
        signup,
        loginWithCode,
        setSession,
        logout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = (): CustomerContextType => {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return ctx;
};
