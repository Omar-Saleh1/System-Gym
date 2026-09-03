"use client";
import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import SingleVisitModal from '../components/SingleVisitModal';
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [attStats, setAttStats] = useState<any>(null);
  const [payStats, setPayStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSingleVisitModal, setShowSingleVisitModal] = useState(false);

  const loadAll = () => {
    Promise.all([
      api.get('/reports/dashboard').catch(() => ({ data: {} })),
      api.get('/attendance/stats').catch(() => ({ data: { stats: {} } })),
      api.get('/payments/dashboard').catch(() => ({ data: { data: {} } }))
    ]).then(([res1, res2, res3]) => {
      setStats(res1.data);
      setAttStats(res2.data.stats);
      setPayStats(res3.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) return <div className="page">جاري التحميل...</div>;

  const topCards = [
    { 
      label: 'إجمالي إيراد النهاردة', 
      value: `${payStats?.todayRevenue?.toLocaleString() || 0}`, 
      sub: 'ج.م', 
      icon: <BanknotesIcon />,
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))'
    },
    { 
      label: 'حصص فردية النهاردة', 
      value: stats?.todaySingleVisitsCount || 0, 
      sub: `${stats?.todaySingleVisitsRevenue || 0} ج.م`, 
      icon: <SparklesIcon />,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.08))'
    },
    { 
      label: 'عمليات بيع النهاردة', 
      value: stats?.todaySalesCount || 0, 
      sub: '', 
      icon: <DocumentTextIcon />,
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.08))'
    },
    { 
      label: 'إجمالي الأعضاء', 
      value: stats?.totalMembers || 0, 
      sub: '', 
      icon: <UserGroupIcon />,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.08))'
    },
    { 
      label: 'اشتراكات نشطة', 
      value: stats?.activeSubscriptions || 0, 
      sub: '', 
      icon: <CheckCircleIcon />,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.08))'
    },
    { 
      label: 'هتنتهي خلال أسبوع', 
      value: stats?.expiringSoon || 0, 
      sub: '', 
      icon: <ClockIcon />,
      color: '#f43f5e',
      bgGradient: 'linear-gradient(135deg, rgba(244,63,94,0.25), rgba(244,63,94,0.08))'
    },
  ];

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setShowSingleVisitModal(true)}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
            padding: '11px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
            fontSize: '14px',
          }}
        >
          <SparklesIcon style={{ width: '20px', height: '20px' }} />
          ⚡ ➕ حصة فردية (Single Visit)
        </button>
        <h1 style={{ textAlign: 'right', margin: 0 }}>لوحة التحكم</h1>
      </div>
      
      <div className="cards-grid">
        {topCards.map((c) => (
          <div 
            className="stat-card" 
            key={c.label}
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: `1px solid ${c.color}33`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="stat-label" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                {c.label}
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: c.bgGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: c.color,
                boxShadow: `0 4px 14px ${c.color}25`
              }}>
                {React.cloneElement(c.icon as React.ReactElement, { style: { width: '22px', height: '22px' } })}
              </div>
            </div>

            <div className="stat-value" style={{ color: c.color, fontSize: '26px', fontWeight: 'bold' }}>
              {c.value} {c.sub && <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px', fontWeight: 'normal' }}>{c.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Attendance Stats */}
        <div className="form-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardDocumentCheckIcon style={{ width: '24px' }} />
            إحصائيات الحضور
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>حضور النهاردة</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)' }}>{attStats?.today || stats?.todayAttendance || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>هذا الشهر</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{attStats?.thisMonth || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>متوسط يومي</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{attStats?.averageDaily || 0}</div>
            </div>
          </div>
        </div>

        {/* Payment Stats */}
        <div className="form-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BanknotesIcon style={{ width: '24px' }} />
            الماليات
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>إيراد الشهر</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--success)' }}>{payStats?.thisMonthRevenue?.toLocaleString() || 0} <span style={{fontSize: '14px'}}>ج.م</span></div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>مبالغ معلقة</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--warning)' }}>{payStats?.outstandingAmount?.toLocaleString() || 0} <span style={{fontSize: '14px'}}>ج.م</span></div>
            </div>
          </div>
        </div>
      </div>

      <SingleVisitModal
        open={showSingleVisitModal}
        onClose={() => setShowSingleVisitModal(false)}
        onSuccess={() => loadAll()}
      />
    </div>
  );
};

export default Dashboard;
