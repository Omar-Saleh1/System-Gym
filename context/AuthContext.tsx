'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import { Cashier } from '../types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  cashier: Cashier | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<Cashier>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    const payload = JSON.parse(atob(payloadBase64));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [cashier, setCashier] = useState<Cashier | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const clearAuthData = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setCashier(null);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const savedCashier = localStorage.getItem('cashier');

      if (!token || isTokenExpired(token)) {
        clearAuthData();
        setLoading(false);
        return;
      }

      if (savedCashier) {
        try {
          setCashier(JSON.parse(savedCashier));
        } catch {
          // ignore
        }
      }

      try {
        const { data } = await api.get('/auth/me');
        const userObj: Cashier = {
          _id: data._id || data.id,
          name: data.name,
          username: data.username,
          role: data.role,
          shiftType: data.shiftType || undefined,
          active: data.active,
        };
        setCashier(userObj);
        localStorage.setItem('cashier', JSON.stringify(userObj));
      } catch (err: any) {
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('cashier', JSON.stringify(data.cashier));
    document.cookie = `token=${data.token}; path=/; max-age=86400`;
    setCashier(data.cashier);
    return data.cashier;
  };

  const logout = () => {
    clearAuthData();
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        cashier,
        loading,
        isAuthenticated: !!cashier,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

