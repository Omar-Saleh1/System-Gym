'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
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
  const { logout } = useAuth();
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
    { href: '/cashier',       icon: <ShoppingCartIcon />,        label: 'الكاشير',      emoji: '🛒' },
    { href: '/reports',       icon: <ChartBarSquareIcon />,      label: 'التقارير',     emoji: '📊' },
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src="/logo.png"
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
