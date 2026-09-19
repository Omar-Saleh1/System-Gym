'use client';
import React, { useState } from 'react';
import api from '../../lib/axios';
import { useFastQuery } from '../../lib/swr';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const ExpiringSoon = () => {
  const [days, setDays] = useState<number | string>(7);
  const { data: res, isLoading } = useFastQuery(`/subscriptions/expiring-soon?days=${days}`);
  const subscriptions: any[] = res?.data || [];
  const [errorMessage, setErrorMessage] = useState('');


  const getRemainingDays = (endDate: string) => {
    const diffTime = new Date(endDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>أيام المتبقية:</span>
          <input 
            type="number" 
            value={days} 
            onChange={(e) => setDays(e.target.value)} 
            style={{ width: '80px', marginBottom: 0, padding: '8px 12px', textAlign: 'center' }}
            min="1"
          />
        </div>
        <div>
          <h1>اشتراكات أوشكت على الانتهاء</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' }}>
            قائمة الأعضاء الذين تقترب اشتراكاتهم من تاريخ النهاية لمتابعة التجديد.
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="cards-grid" style={{ marginBottom: '24px' }}>
        <div 
          className="stat-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            borderRadius: '16px',
            background: 'var(--bg-card)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="stat-label" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              اشتراكات تنتهي خلال {days} أيام
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(244,63,94,0.25), rgba(244,63,94,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f43f5e',
              boxShadow: '0 4px 14px rgba(244,63,94,0.2)'
            }}>
              <ClockIcon style={{ width: '22px', height: '22px' }} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f43f5e', fontSize: '26px', fontWeight: 'bold' }}>
            {subscriptions.length} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'normal' }}>عضو</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div style={{ padding: '12px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '20px', textAlign: 'right', fontWeight: 'bold' }}>
          {errorMessage}
        </div>
      )}

      {isLoading && subscriptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>جاري التحميل...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>العضو</th>
                <th>الموبايل</th>
                <th>الخطة</th>
                <th>تاريخ الانتهاء</th>
                <th>الأيام المتبقية</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 'bold' }}>{s.member?.name || 'عضو غير معروف'}</td>
                  <td>{s.member?.phone || '-'}</td>
                  <td>{s.plan?.name || '-'}</td>
                  <td>{new Date(s.endDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                    {getRemainingDays(s.endDate)} يوم
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                    لا توجد اشتراكات تنتهي خلال الفترة المحددة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpiringSoon;
