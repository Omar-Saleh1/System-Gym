"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/axios';

const MemberProfile = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/members/${id}/profile`)
      .then(r => setProfile(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page">جاري التحميل...</div>;
  if (!profile?.member) return <div className="page">العضو غير موجود</div>;

  const { member, subscription, attendance, payments, workoutPlan, dietPlan } = profile;

  const cardStyle = { background: 'var(--bg-card)', borderRadius: '12px', padding: '20px', marginBottom: '16px' };
  const labelStyle = { color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' };
  const valueStyle = { fontSize: '16px', fontWeight: 'bold' };

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => router.push('/members')} style={{ fontSize: '14px' }}>← رجوع للأعضاء</button>
        <h1>ملف العضو</h1>
      </div>

      {/* Member Info */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>👤 بيانات العضو</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
          <div><div style={labelStyle}>الاسم</div><div style={valueStyle}>{member.name}</div></div>
          <div><div style={labelStyle}>الموبايل</div><div style={valueStyle}>{member.phone}</div></div>
          <div><div style={labelStyle}>النوع</div><div style={valueStyle}>{member.gender === 'male' ? 'ذكر' : 'أنثى'}</div></div>
          <div><div style={labelStyle}>الإيميل</div><div style={valueStyle}>{member.email || '-'}</div></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Subscription */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>📋 الاشتراك</h3>
          {subscription ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={valueStyle}>{subscription.plan?.name || 'اشتراك'}</span>
                <span className={'badge ' + (subscription.status === 'active' ? 'badge-success' : subscription.status === 'frozen' ? 'badge-warning' : 'badge-danger')}>
                  {subscription.status === 'active' ? 'نشط' : subscription.status === 'frozen' ? 'مجمد' : 'منتهي'}
                </span>
              </div>
              <div style={labelStyle}>من: {new Date(subscription.startDate).toLocaleDateString('ar-EG')} — إلى: {new Date(subscription.endDate).toLocaleDateString('ar-EG')}</div>
            </div>
          ) : <div style={{ color: 'var(--text-muted)' }}>لا يوجد اشتراك نشط</div>}
        </div>

        {/* Attendance */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>✅ الحضور</h3>
          <div style={{ ...valueStyle, fontSize: '32px', color: 'var(--success)', marginBottom: '8px' }}>{attendance?.thisMonth || 0} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>يوم هذا الشهر</span></div>
        </div>
      </div>

      {/* Attendance History */}
      {attendance?.recent?.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '12px' }}>آخر 10 حضور</h3>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>التاريخ</th><th>الدخول</th><th>الخروج</th><th>الطريقة</th></tr></thead>
              <tbody>
                {attendance.recent.map((a: any) => (
                  <tr key={a._id}>
                    <td>{a.date}</td>
                    <td>{new Date(a.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{a.method || 'QR'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Payments */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>💰 المدفوعات</h3>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            <div><div style={labelStyle}>إجمالي المدفوع</div><div style={{ ...valueStyle, color: 'var(--success)' }}>{payments?.totalPaid?.toLocaleString() || 0} ج.م</div></div>
            <div><div style={labelStyle}>المتبقي</div><div style={{ ...valueStyle, color: payments?.totalRemaining > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{payments?.totalRemaining?.toLocaleString() || 0} ج.م</div></div>
          </div>
          {payments?.history?.length > 0 && (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>المبلغ</th><th>المدفوع</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                <tbody>
                  {payments.history.slice(0, 5).map((p: any) => (
                    <tr key={p._id}>
                      <td>{p.amount?.toLocaleString()} ج.م</td>
                      <td>{p.paidAmount?.toLocaleString()} ج.م</td>
                      <td><span className={'badge ' + (p.status === 'PAID' ? 'badge-success' : p.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger')}>{p.status}</span></td>
                      <td>{new Date(p.paymentDate).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(!payments?.history || payments.history.length === 0) && <div style={{ color: 'var(--text-muted)' }}>لا توجد مدفوعات</div>}
        </div>

        {/* Workout & Diet */}
        <div>
          <div style={{ ...cardStyle, marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>💪 جدول التمرين</h3>
            {workoutPlan ? (
              <div>
                <div style={valueStyle}>{workoutPlan.planName}</div>
                <div style={labelStyle}>الهدف: {workoutPlan.goal || '-'} | المدة: {workoutPlan.duration || '-'} | الأيام: {workoutPlan.days?.length || 0}</div>
                <span className={'badge ' + (workoutPlan.status === 'ACTIVE' ? 'badge-success' : 'badge-warning')} style={{ marginTop: '8px', display: 'inline-block' }}>{workoutPlan.status}</span>
              </div>
            ) : <div style={{ color: 'var(--text-muted)' }}>لا يوجد جدول تمرين نشط</div>}
          </div>
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>🥗 النظام الغذائي</h3>
            {dietPlan ? (
              <div>
                <div style={valueStyle}>{dietPlan.planName}</div>
                <div style={labelStyle}>الهدف: {dietPlan.goal || '-'} | السعرات: {dietPlan.calories || '-'}</div>
                <div style={{ ...labelStyle, marginTop: '8px' }}>بروتين: {dietPlan.protein || '-'} | كربوهيدرات: {dietPlan.carbs || '-'} | دهون: {dietPlan.fats || '-'}</div>
                <span className={'badge ' + (dietPlan.status === 'ACTIVE' ? 'badge-success' : 'badge-warning')} style={{ marginTop: '8px', display: 'inline-block' }}>{dietPlan.status}</span>
              </div>
            ) : <div style={{ color: 'var(--text-muted)' }}>لا يوجد نظام غذائي نشط</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
