'use client';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { cashier, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = pathname === '/login' || pathname?.startsWith('/member/qr/');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isPublicRoute) {
        router.replace('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.replace('/');
      }
    }
  }, [loading, isAuthenticated, isPublicRoute, pathname, router]);

  if (loading && !isPublicRoute) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0e10', color: '#fff', gap: '12px' }}>
        <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,87,70,0.3)', borderTopColor: '#ff5746', borderRadius: '50%', animation: 'spinRing 0.8s linear infinite' }} />
        <span style={{ fontSize: '15px', color: '#a0a0b0' }}>جاري التحقق من الجلسة...</span>
      </div>
    );
  }

  if (!loading && !isAuthenticated && !isPublicRoute) {
    return null;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <div className="app-content">{children}</div>
      {cashier && <Sidebar />}
    </div>
  );
}

