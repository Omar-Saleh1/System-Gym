'use client';

import React, { useState } from 'react';
import api from '../../lib/axios';

const todayStr = () => new Date().toISOString().split('T')[0];

const Reports = () => {
  const [to, setTo] = useState(todayStr());
  const [report, setReport] = useState<any>(null);

  const runReport = async () => {
    const { data } = await api.get('/reports/daily-financial', { params: { date: to } });
    setReport(data);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div />
        <h1>التقارير</h1>
      </div>

      <div className="form-card">
        <div className="form-row">
          <div><label>تاريخ التقرير</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={runReport}>عرض التقرير</button>
          </div>
        </div>
      </div>

      {report && (
        <div className="cards-grid">
          <div className="stat-card">
            <div className="stat-icon"><span style={{ fontSize: '28px' }}>🏋️</span></div>
            <div className="stat-label">إيراد الاشتراكات</div>
            <div className="stat-value">{report.subscriptionsRevenue} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ج.م</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><span style={{ fontSize: '28px' }}>📅</span></div>
            <div className="stat-label">إيراد الحصص</div>
            <div className="stat-value">{report.sessionsRevenue} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ج.م</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><span style={{ fontSize: '28px' }}>🍹</span></div>
            <div className="stat-label">إيراد المبيعات</div>
            <div className="stat-value">{report.salesRevenue} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ج.م</span></div>
          </div>
          <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
            <div className="stat-icon"><span style={{ fontSize: '28px' }}>💰</span></div>
            <div className="stat-label">الإجمالي لليوم</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{report.totalRevenue} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ج.م</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
