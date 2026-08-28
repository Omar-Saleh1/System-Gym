"use client";
import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ClipboardDocumentCheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [attStats, setAttStats] = useState<any>(null);
  const [payStats, setPayStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard').catch(() => ({ data: {} })),
      api.get('/attendance/stats').catch(() => ({ data: { stats: {} } })),
      api.get('/payments/dashboard').catch(() => ({ data: { data: {} } }))
    ]).then(([res1, res2, res3]) => {
      setStats(res1.data);
      setAttStats(res2.data.stats);
      setPayStats(res3.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">جاري التحميل...</div>;

  const topCards = [
    { label: 'إيراد النهاردة', value: `${stats?.todayRevenue || 0}`, sub: 'ج.م', icon: <CurrencyDollarIcon /> },
    { label: 'عمليات بيع النهاردة', value: stats?.todaySalesCount || 0, sub: '', icon: <DocumentTextIcon /> },
    { label: 'إجمالي الأعضاء', value: stats?.totalMembers || 0, sub: '', icon: <UserGroupIcon /> },
    { label: 'اشتراكات نشطة', value: stats?.activeSubscriptions || 0, sub: '', icon: <CheckCircleIcon /> },
    { label: 'هتنتهي خلال أسبوع', value: stats?.expiringSoon || 0, sub: '', icon: <ClockIcon /> },
  ];

  return (
    <div className="page">
      <h1 style={{ textAlign: 'right' }}>لوحة التحكم</h1>
      
      <div className="cards-grid">
        {topCards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">
              {c.value} {c.sub && <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{c.sub}</span>}
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

    </div>
  );
};

export default Dashboard;
