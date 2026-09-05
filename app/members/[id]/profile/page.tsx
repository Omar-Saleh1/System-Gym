"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/axios';
import ConfirmModal from '../../../../components/ConfirmModal';

const MemberProfile = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pay remaining modal state
  const [payTarget, setPayTarget] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fetchProfile = () => {
    if (!id) return;
    setLoading(true);
    api.get(`/members/${id}/profile`)
      .then(r => setProfile(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleOpenPayRemaining = (p: any) => {
    setPayTarget(p);
    setPayAmount(String(p.remainingAmount || ''));
    setPayMethod('CASH');
  };

  const handleConfirmPay = async () => {
    if (!payTarget) return;
    const amt = Number(payAmount);
    if (isNaN(amt) || amt <= 0 || amt > payTarget.remainingAmount) {
      setAlertMessage('يرجى إدخال مبلغ صحيح لا يتجاوز المتبقي');
      return;
    }

    setConfirmOpen(true);
  };

  const executePay = async () => {
    setConfirmOpen(false);
    if (!payTarget) return;
    try {
      await api.post(`/payments/${payTarget._id}/pay-remaining`, {
        amountPaid: Number(payAmount),
        paymentMethod: payMethod,
      });
      setPayTarget(null);
      fetchProfile();
    } catch (err: any) {
      setAlertMessage(err.response?.data?.message || 'فشل السداد');
    }
  };

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
              {subscription.status === 'expired' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', padding: '10px', marginBottom: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                  ⚠️ تنبيه: الاشتراك منتهي، الـ QR الخاص بالعضو غير صالح للدخول.
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={valueStyle}>{subscription.plan?.name || 'اشتراك'}</span>
                <span className={'badge ' + (subscription.status === 'active' ? 'badge-success' : subscription.status === 'frozen' ? 'badge-warning' : 'badge-danger')}>
                  {subscription.status === 'active' ? 'نشط' : subscription.status === 'frozen' ? 'مجمد' : 'منتهي'}
                </span>
              </div>
              <div style={labelStyle}>من: {new Date(subscription.startDate).toLocaleDateString('ar-EG')} — إلى: {new Date(subscription.endDate).toLocaleDateString('ar-EG')}</div>
              {subscription.subscriptionType === 'sessions' && (
                <div style={{ marginTop: '10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 'bold' }}>🏋️ رصيد الحصص:</span>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#60a5fa' }}>
                      {subscription.sessionsUsed || 0} / {subscription.sessionsLimit || 0} حصة
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '6px' }}>
                        ({Math.max(0, (subscription.sessionsLimit || 0) - (subscription.sessionsUsed || 0))} متبقي)
                      </span>
                    </span>
                  </div>
                </div>
              )}
              {profile.subscriptionPayment && (
                <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={labelStyle}>إجمالي سعر الاشتراك:</span>
                    <span style={valueStyle}>{profile.subscriptionPayment.amount} ج.م</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={labelStyle}>المبلغ المدفوع:</span>
                    <span style={{ ...valueStyle, color: 'var(--success)' }}>{profile.subscriptionPayment.paidAmount} ج.م</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={labelStyle}>المبلغ المتبقي:</span>
                    <span style={{ ...valueStyle, color: profile.subscriptionPayment.remainingAmount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {profile.subscriptionPayment.remainingAmount} ج.م
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginTop: '6px' }}>
                    <span style={labelStyle}>حالة الدفع:</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={'badge ' + (profile.subscriptionPayment.status === 'PAID' ? 'badge-success' : profile.subscriptionPayment.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger')}>
                        {profile.subscriptionPayment.status === 'PAID' ? 'مدفوع بالكامل' : profile.subscriptionPayment.status === 'PARTIAL' ? 'مدفوع جزئياً' : 'معلق'}
                      </span>
                      {(profile.subscriptionPayment.remainingAmount > 0 || profile.subscriptionPayment.status === 'PARTIAL' || profile.subscriptionPayment.status === 'PENDING') && (
                        <button className="btn-small" onClick={() => handleOpenPayRemaining(profile.subscriptionPayment)}>
                          💵 سداد المتبقي
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                <thead><tr><th>المبلغ</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>إجراء</th></tr></thead>
                <tbody>
                  {payments.history.slice(0, 5).map((p: any) => (
                    <tr key={p._id}>
                      <td>{p.amount?.toLocaleString()} ج.م</td>
                      <td>{p.paidAmount?.toLocaleString()} ج.م</td>
                      <td style={{ color: p.remainingAmount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{p.remainingAmount?.toLocaleString()} ج.م</td>
                      <td><span className={'badge ' + (p.status === 'PAID' ? 'badge-success' : p.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger')}>{p.status === 'PAID' ? 'مكتمل' : 'جزئي'}</span></td>
                      <td>
                        {p.remainingAmount > 0 || p.status === 'PARTIAL' || p.status === 'PENDING' ? (
                          <button className="btn-small" onClick={() => handleOpenPayRemaining(p)}>💵 سداد</button>
                        ) : <span style={{ color: 'var(--success)', fontSize: '12px' }}>✓</span>}
                      </td>
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

      {/* Pay Remaining Modal */}
      {payTarget && (
        <ConfirmModal
          open={true}
          type="info"
          title="سداد المبلغ المتبقي"
          message={`المبلغ المتبقي المستحق: ${payTarget.remainingAmount} ج.م`}
          confirmText="متابعة السداد"
          cancelText="إلغاء"
          onConfirm={handleConfirmPay}
          onCancel={() => setPayTarget(null)}
        >
          <div style={{ textAlign: 'right', marginTop: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>المبلغ المراد سداده (ج.م)</label>
            <input
              type="number"
              min="1"
              max={payTarget.remainingAmount}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', marginBottom: '12px' }}
            />
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>طريقة الدفع</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }}
            >
              <option value="CASH">كاش</option>
              <option value="CARD">بطاقة</option>
              <option value="BANK_TRANSFER">تحويل بنكي</option>
              <option value="ONLINE">أونلاين</option>
              <option value="OTHER">أخرى</option>
            </select>
          </div>
        </ConfirmModal>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        type="success"
        title="تأكيد عملية السداد"
        message={<span>هل أنت متأكد من سداد مبلغ بقيمة <strong className="confirm-highlight">{payAmount} ج.م</strong> لـ <strong className="confirm-highlight">{member?.name}</strong>؟</span>}
        confirmText="تأكيد ونقل المبلغ"
        cancelText="إلغاء"
        onConfirm={executePay}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Alert Error Modal */}
      <ConfirmModal
        open={!!alertMessage}
        type="warning"
        title="تنبيه"
        message={alertMessage || ''}
        confirmText="حسناً"
        cancelText={null}
        onConfirm={() => setAlertMessage(null)}
      />
    </div>
  );
};

export default MemberProfile;
