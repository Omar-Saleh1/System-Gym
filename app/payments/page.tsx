'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';

const Payments = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ memberId: '', subscriptionId: '', amount: '', paidAmount: '', paymentMethod: 'CASH', notes: '' });
  const [memberSubs, setMemberSubs] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [dashRes, payRes, memRes, sumRes] = await Promise.all([
        api.get('/payments/dashboard'),
        api.get('/payments'),
        api.get('/members'),
        api.get('/expenses/summary'),
      ]);
      setDashboard(dashRes.data.data);
      setPayments(payRes.data.data || []);
      setMembers(memRes.data.filter((m: any) => m.active));
      setSummary(sumRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleMemberChange = async (memberId: string) => {
    setForm({ ...form, memberId, subscriptionId: '' });
    if (memberId) {
      try {
        const { data } = await api.get('/subscriptions', { params: { memberId } });
        setMemberSubs(Array.isArray(data) ? data : (data.data || []));
      } catch { setMemberSubs([]); }
    } else {
      setMemberSubs([]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        memberId: form.memberId,
        subscriptionId: form.subscriptionId || undefined,
        amount: Number(form.amount),
        paidAmount: Number(form.paidAmount),
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });
      setMessage('✅ تم تسجيل الدفعة بنجاح');
      setForm({ memberId: '', subscriptionId: '', amount: '', paidAmount: '', paymentMethod: 'CASH', notes: '' });
      setMemberSubs([]);
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'حدث خطأ'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const remaining = (Number(form.amount) || 0) - (Number(form.paidAmount) || 0);
  const methodLabels: any = { CASH: 'كاش', CARD: 'بطاقة', BANK_TRANSFER: 'تحويل بنكي', ONLINE: 'أونلاين', OTHER: 'أخرى' };
  const statusBadge = (s: string) => s === 'PAID' ? 'badge-success' : s === 'PARTIAL' ? 'badge-warning' : 'badge-danger';
  const statusLabel = (s: string) => s === 'PAID' ? 'مدفوع' : s === 'PARTIAL' ? 'جزئي' : s === 'PENDING' ? 'معلق' : 'مرتجع';

  if (loading) return <div className="page">جاري التحميل...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>إدارة المدفوعات والإيرادات</div></div>
        <h1>المدفوعات (Payments)</h1>
      </div>

      {/* Stats */}
      <div className="cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value">{dashboard?.todayRevenue?.toLocaleString() || 0} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ج.م</span></div>
          <div className="stat-label">إيراد النهاردة</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{dashboard?.thisMonthRevenue?.toLocaleString() || 0} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ج.م</span></div>
          <div className="stat-label">إيراد الشهر</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{dashboard?.outstandingAmount?.toLocaleString() || 0} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ج.م</span></div>
          <div className="stat-label">مبالغ معلقة</div>
        </div>
      </div>

      {/* Add Payment Form */}
      <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>تسجيل دفعة جديدة</h3>
        <div className="form-row">
          <div>
            <label>العضو</label>
            <select value={form.memberId} onChange={(e) => handleMemberChange(e.target.value)} required>
              <option value="">اختر عضو</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} - {m.phone}</option>)}
            </select>
          </div>
          <div>
            <label>الاشتراك (اختياري)</label>
            <select value={form.subscriptionId} onChange={(e) => setForm({ ...form, subscriptionId: e.target.value })}>
              <option value="">بدون اشتراك</option>
              {memberSubs.map(s => <option key={s._id} value={s._id}>{s.plan?.name || 'اشتراك'} - {s.status}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>المبلغ الإجمالي</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" />
          </div>
          <div>
            <label>المبلغ المدفوع</label>
            <input type="number" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} required min="0" />
          </div>
        </div>
        {form.amount && form.paidAmount && (
          <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '12px', textAlign: 'center' }}>
            المتبقي: <strong style={{ color: remaining > 0 ? 'var(--warning)' : 'var(--success)' }}>{remaining} ج.م</strong>
          </div>
        )}
        <div className="form-row">
          <div>
            <label>طريقة الدفع</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="CASH">كاش</option>
              <option value="CARD">بطاقة</option>
              <option value="BANK_TRANSFER">تحويل بنكي</option>
              <option value="ONLINE">أونلاين</option>
              <option value="OTHER">أخرى</option>
            </select>
          </div>
          <div>
            <label>ملاحظات</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <button type="submit">تسجيل الدفعة</button>
        {message && <div className="message" style={{ marginTop: '12px' }}>{message}</div>}
      </form>

      {/* Net Profit Summary */}
      {summary && (
        <div className="cards-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--success)' }}>{summary.totalRevenue?.toLocaleString() || 0} <span style={{ fontSize: '14px' }}>ج.م</span></div>
            <div className="stat-label">إجمالي الإيرادات</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{summary.totalExpenses?.toLocaleString() || 0} <span style={{ fontSize: '14px' }}>ج.م</span></div>
            <div className="stat-label">إجمالي المصروفات</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: summary.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>{summary.netProfit?.toLocaleString() || 0} <span style={{ fontSize: '14px' }}>ج.م</span></div>
            <div className="stat-label">صافي الربح (Net Profit)</div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>العضو</th>
              <th>المبلغ</th>
              <th>المدفوع</th>
              <th>المتبقي</th>
              <th>الطريقة</th>
              <th>الحالة</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p._id}>
                <td style={{ fontWeight: 'bold' }}>{p.member?.name || '-'}</td>
                <td>{p.amount?.toLocaleString()} ج.م</td>
                <td style={{ color: 'var(--success)' }}>{p.paidAmount?.toLocaleString()} ج.م</td>
                <td style={{ color: p.remainingAmount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{p.remainingAmount?.toLocaleString()} ج.م</td>
                <td>{methodLabels[p.paymentMethod] || p.paymentMethod}</td>
                <td><span className={'badge ' + statusBadge(p.status)}>{statusLabel(p.status)}</span></td>
                <td>{new Date(p.paymentDate).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد مدفوعات مسجلة</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
