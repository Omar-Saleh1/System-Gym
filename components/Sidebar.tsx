'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LOGO_BASE64 } from '../lib/logoData';
import {
  Squares2X2Icon,
  UsersIcon,
  TicketIcon,
  QrCodeIcon,
  ShoppingCartIcon,
  ChartBarSquareIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  AcademicCapIcon,
  ReceiptRefundIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { cashier, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/',              icon: <Squares2X2Icon />,          label: 'الرئيسية',      emoji: '🏠' },
    { href: '/members',       icon: <UsersIcon />,               label: 'الأعضاء',       emoji: '👥' },
    { href: '/subscriptions', icon: <TicketIcon />,              label: 'الاشتراكات',    emoji: '🎫' },
    { href: '/expiring-soon', icon: <ClockIcon style={{ color: 'var(--warning)' }} />, label: 'تنتهي قريباً', emoji: '⏰' },
    { href: '/attendance',    icon: <QrCodeIcon />,              label: 'الحضور / QR',   emoji: '📱' },
    { href: '/payments',      icon: <BanknotesIcon />,           label: 'المالية',       emoji: '💰' },
    { href: '/expenses',      icon: <ReceiptRefundIcon style={{ color: 'var(--danger)' }} />, label: 'المصروفات', emoji: '💸' },
    { href: '/coaches',       icon: <AcademicCapIcon style={{ color: 'var(--primary)' }} />, label: 'الكباتن',   emoji: '🏅' },
    { href: '/plans',         icon: <ClipboardDocumentListIcon />, label: 'الخطط',       emoji: '📋' },
    { href: '/cashier',       icon: <ShoppingCartIcon />,        label: 'المتجر والكاشير', emoji: '🛍️' },
    { href: '/cashier-users', icon: <UserPlusIcon style={{ color: 'var(--primary)' }} />, label: 'حسابات الكاشير', emoji: '🔑' },
    { href: '/reports',       icon: <ChartBarSquareIcon />,      label: 'التقارير',     emoji: '📊' },
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src={LOGO_BASE64}
          alt="VACUUM GYM"
          style={{
            width: '80px',
            height: 'auto',
            display: 'block',
            margin: '0 auto 8px',
            filter: 'drop-shadow(0 4px 12px rgba(255,87,70,0.4))'
          }}
        />
        <div className="sidebar-gym-name">VACUUM GYM</div>
        <div className="sidebar-gym-tagline">Management System</div>
        
        {cashier && (
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{cashier.name}</div>
            <div style={{ marginTop: '4px' }}>
              {cashier.role === 'admin' ? (
                <span className="badge badge-warning" style={{ fontSize: '10px' }}>👑 أدمن (كل الشفتات)</span>
              ) : cashier.shiftType === 'GIRLS' ? (
                <span className="badge badge-secondary" style={{ fontSize: '10px', color: '#ec4899', borderColor: '#fbcfe8', background: 'rgba(236,72,153,0.1)' }}>🌸 شفت البنات</span>
              ) : cashier.shiftType === 'BOYS' ? (
                <span className="badge badge-secondary" style={{ fontSize: '10px', color: '#3b82f6', borderColor: '#bfdbfe', background: 'rgba(59,130,246,0.1)' }}>🏋️‍♂️ شفت الشباب</span>
              ) : (
                <span className="badge badge-secondary" style={{ fontSize: '10px' }}>كاشير</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="sidebar-links">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'nav-link active' : 'nav-link'}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="btn-add-member" onClick={() => router.push('/members')} style={{ marginBottom: '10px' }}>
          ＋ إضافة عضو جديد
        </button>
        <button className="btn-logout" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '10px' }}>
          <ArrowRightOnRectangleIcon style={{ width: '16px', height: '16px' }} />
          تسجيل خروج
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
