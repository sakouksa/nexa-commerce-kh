import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ownerLogin as apiOwnerLogin } from '../api';

export interface OwnerSession {
  token: string;
  user: any;
}

export interface OwnerContextType {
  owner: any;
  token: string | null;
  isLoggedIn: boolean;
  login: (username: string, password?: string) => Promise<OwnerSession>;
  setFromRegistration: (res: any) => OwnerSession;
  logout: () => void;
}

// Shop-owner session for the storefront (Frontend_User).
// When a shop owner registers a shop they are auto-logged-in here so they can
// see the "ផ្ទាំងគ្រប់គ្រង" (Dashboard) button on their own shop page only.
const OwnerContext = createContext<OwnerContextType | null>(null);

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<OwnerSession | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('ms_owner_session') || 'null') || null;
    } catch {
      return null;
    }
  });

  const saveSession = (res: any): OwnerSession => {
    const data: OwnerSession = { token: res.access_token, user: res.user };
    localStorage.setItem('ms_owner_session', JSON.stringify(data));
    setSession(data);
    return data;
  };

  const login = async (username: string, password?: string): Promise<OwnerSession> => {
    const res = await apiOwnerLogin({ username, password });
    return saveSession(res);
  };

  // Used right after /api/plans/register — the response already contains a
  // valid access token for the newly created owner account.
  const setFromRegistration = (res: any): OwnerSession => saveSession(res);

  const logout = () => {
    localStorage.removeItem('ms_owner_session');
    setSession(null);
  };

  return (
    <OwnerContext.Provider
      value={{
        owner: session?.user || null,
        token: session?.token || null,
        isLoggedIn: !!session?.token,
        login,
        setFromRegistration,
        logout,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
}

export const useOwner = (): OwnerContextType => {
  const ctx = useContext(OwnerContext);
  if (!ctx) {
    throw new Error('useOwner must be used within an OwnerProvider');
  }
  return ctx;
};
