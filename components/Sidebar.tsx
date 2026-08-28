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
  ChartBarIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ClockIcon
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
    { href: '/', icon: <Squares2X2Icon />, label: 'OVERVIEW' },
    { href: '/members', icon: <UsersIcon />, label: 'MEMBERS' },
    { href: '/subscriptions', icon: <TicketIcon />, label: 'SUBSCRIPTIONS' },
    { href: '/expiring-soon', icon: <ClockIcon style={{ color: 'var(--warning)' }} />, label: 'EXPIRING SOON' },
    { href: '/attendance', icon: <QrCodeIcon />, label: 'CHECK-IN' },
    { href: '/payments', icon: <BanknotesIcon />, label: 'PAYMENTS' },
    { href: '/expenses', icon: <BanknotesIcon style={{ color: 'var(--danger)' }} />, label: 'EXPENSES' },
    { href: '/coaches', icon: <UsersIcon style={{ color: 'var(--primary)' }} />, label: 'COACHES' },
    { href: '/plans', icon: <ClipboardDocumentListIcon />, label: 'PLANS' },
    { href: '/cashier', icon: <ShoppingCartIcon />, label: 'STORE' },
    { href: '/reports', icon: <ChartBarIcon />, label: 'REPORTS' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="VACUUM GYM" style={{ width: '100%', maxWidth: '150px' }} />
      </div>

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

      <div className="sidebar-footer">
        <button className="btn-add-member" onClick={() => router.push('/members')} style={{ marginBottom: '10px' }}>
          ADD MEMBER
        </button>
        <button className="btn-logout" onClick={handleLogout} style={{ width: '100%' }}>
          تسجيل خروج
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
