'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { cashier } = useAuth();
  const pathname = usePathname();
  const hideNav = pathname === '/login' || pathname?.startsWith('/member/qr/');
  
  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <div className="app-content">{children}</div>
      {cashier && <Sidebar />}
    </div>
  );
}
