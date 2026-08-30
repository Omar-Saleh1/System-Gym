'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import { Cashier } from '../types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  cashier: Cashier | null;
  login: (username: string, password: string) => Promise<Cashier>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [cashier, setCashier] = useState<Cashier | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('cashier');
    if (saved) {
      setCashier(JSON.parse(saved));
    }
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
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setCashier(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ cashier, login, logout }}>
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
