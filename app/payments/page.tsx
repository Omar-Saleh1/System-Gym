'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import ConfirmModal from '../../components/ConfirmModal';

const Payments = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Tab 1: Financial Dashboard State
  const [dateRange, setDateRange] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Transaction Filters
  const [txFilters, setTxFilters] = useState({
    type: '',
    category: '',
    method: '',
    memberId: '',
    coachId: ''
  });
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);

  // Tab 2: Payments State
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [memberSubs, setMemberSubs] = useState<any[]>([]);
  const [form, setForm] = useState({
    memberId: '',
    subscriptionId: '',
    amount: '',
    paidAmount: '',
    paymentMethod: 'CASH',
    notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch members and coaches for dropdowns
      const [memRes, coachRes, payRes] = await Promise.all([
        api.get('/members'),
        api.get('/coaches').catch(() => ({ data: { data: [] } })),
        api.get('/payments')
      ]);

      setMembers(memRes.data.filter((m: any) => m.active));
      setCoaches(coachRes.data.data || []);
      setPayments(payRes.data.data || []);

      // Fetch dashboard stats
      await fetchDashboardStats(dateRange, customFrom, customTo);
      // Fetch filtered transactions
      await fetchTransactions();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (range: string, fromStr?: string, toStr?: string) => {
    try {
      const params: any = { dateRange: range };
      if (range === 'custom') {
        if (fromStr) params.from = fromStr;
        if (toStr) params.to = toStr;
      }
      const { data } = await api.get('/transactions/dashboard', { params });
      setDashboardStats(data.data.rangeStats);
      setRecentTransactions(data.data.recent || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params: any = {};
      if (txFilters.type) params.type = txFilters.type;
      if (txFilters.category) params.category = txFilters.category;
      if (txFilters.method) params.method = txFilters.method;
      if (txFilters.memberId) params.memberId = txFilters.memberId;
      if (txFilters.coachId) params.coachId = txFilters.coachId;
      
      // Fetch filtered list
      const { data } = await api.get('/transactions', { params });
      setFilteredTransactions(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [txFilters]);

  const handleRangeChange = async (range: string) => {
    setDateRange(range);
    if (range !== 'custom') {
      await fetchDashboardStats(range);
    }
  };

  const handleCustomRangeSubmit = async (e: any) => {
    e.preventDefault();
    await fetchDashboardStats('custom', customFrom, customTo);
  };

  const handleMemberChange = async (memberId: string) => {
    setForm({ ...form, memberId, subscriptionId: '' });
    if (memberId) {
      try {
        const { data } = await api.get('/subscriptions', { params: { memberId } });
        setMemberSubs(Array.isArray(data) ? data : (data.data || []));
      } catch {
        setMemberSubs([]);
      }
    } else {
      setMemberSubs([]);
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: React.ReactNode;
    type?: 'danger' | 'success' | 'warning' | 'info';
    action: () => void;
  }>({ title: '', message: '', action: () => {} });

  const handleSubmitPayment = (e: any) => {
    e.preventDefault();
    const totalAmount = Number(form.amount);
    const paidAmount = Number(form.paidAmount);

    if (totalAmount < 0 || paidAmount < 0) {
      alert('المبالغ المالية لا يمكن أن تكون سالبة');
      return;
    }

    if (paidAmount > totalAmount) {
      alert('المبلغ المدفوع لا يمكن أن يكون أكبر من إجمالي المبلغ');
      return;
    }

    setConfirmConfig({
      title: 'تأكيد تسجيل الدفعة',
      type: 'info',
      message: (
        <span>
          هل أنت متأكد من تسجيل دفعة مالية بقيمة <strong className="confirm-highlight">{paidAmount} ج.م</strong> من أصل <strong className="confirm-highlight">{totalAmount} ج.م</strong>؟
        </span>
      ),
      action: async () => {
        try {
          await api.post('/payments', {
            memberId: form.memberId,
            subscriptionId: form.subscriptionId || undefined,
            amount: totalAmount,
            paidAmount,
            paymentMethod: form.paymentMethod,
            notes: form.notes,
          });
          setMessage('✅ تم تسجيل الدفعة بنجاح');
          setForm({ memberId: '', subscriptionId: '', amount: '', paidAmount: '', paymentMethod: 'CASH', notes: '' });
          setMemberSubs([]);
          await loadData();
          setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
          alert('❌ ' + (err.response?.data?.message || 'حدث خطأ'));
        }
      }
    });
    setConfirmOpen(true);
  };

  const handlePayRemaining = async (payment: any) => {
    const amountStr = window.prompt(`المبلغ المتبقي: ${payment.remainingAmount} ج.م\nأدخل المبلغ المراد سداده:`, String(payment.remainingAmount));
    if (!amountStr) return;
    const amount = Number(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      alert("مبلغ غير صالح!");
      return;
    }

    if (amount > payment.remainingAmount) {
      alert("المبلغ المدفوع أكبر من المتبقي!");
      return;
    }

    const method = window.prompt("أدخل طريقة الدفع (CASH, CARD, BANK_TRANSFER, ONLINE, OTHER):", "CASH");
    if (method === null) return;

    setConfirmConfig({
      title: 'تأكيد سداد المبلغ المتبقي',
      type: 'success',
      message: (
        <span>
          هل أنت متأكد من سداد مبلغ بقيمة <strong className="confirm-highlight">{amount} ج.م</strong> بطريقة <strong className="confirm-highlight">{method.toUpperCase()}</strong>؟
        </span>
      ),
      action: async () => {
        try {
          await api.post(`/payments/${payment._id}/pay-remaining`, {
            amountPaid: amount,
            paymentMethod: method.toUpperCase(),
          });
          setMessage("✅ تم سداد المبلغ بنجاح!");
          await loadData();
          setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
          alert("❌ فشل السداد: " + (err.response?.data?.message || err.message));
        }
      }
    });
    setConfirmOpen(true);
  };

  const remaining = (Number(form.amount) || 0) - (Number(form.paidAmount) || 0);

  const methodLabels: any = {
    CASH: 'كاش',
    CARD: 'بطاقة',
    BANK_TRANSFER: 'تحويل بنكي',
    ONLINE: 'أونلاين',
    OTHER: 'أخرى'
  };

  const categoryLabels: any = {
    subscription: 'اشتراك عضو',
    renewal: 'تجديد اشتراك',
    coach_salary: 'راتب كابتن',
    rent: 'إيجار',
    equipment: 'معدات الجيم',
    electricity: 'كهرباء',
    water: 'مياه',
    maintenance: 'صيانة',
    other: 'أخرى'
  };

  const statusBadge = (s: string) => s === 'PAID' ? 'badge-success' : s === 'PARTIAL' ? 'badge-warning' : 'badge-danger';
  const statusLabel = (s: string) => s === 'PAID' ? 'مدفوع' : s === 'PARTIAL' ? 'جزئي' : s === 'PENDING' ? 'معلق' : 'مرتجع';

  if (loading) return <div className="page">جاري التحميل...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setActiveTab('dashboard')}
          >
            📊 لوحة التحكم المالية
          </button>
          <button 
            className={activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setActiveTab('payments')}
          >
            💰 تسجيل وإدارة المقبوضات
          </button>
        </div>
        <h1>إدارة المالية والمدفوعات</h1>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          {/* Range filter selector */}
          <div className="form-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '12px' }}>تحديد النطاق الزمني</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {['today', 'yesterday', 'week', 'month', 'custom'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleRangeChange(range)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: dateRange === range ? 'none' : '1px solid var(--border-color)',
                    background: dateRange === range ? 'var(--primary)' : 'transparent',
                    color: dateRange === range ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {range === 'today' ? 'اليوم' : range === 'yesterday' ? 'أمس' : range === 'week' ? 'هذا الأسبوع' : range === 'month' ? 'هذا الشهر' : 'فترة مخصصة'}
                </button>
              ))}
            </div>

            {dateRange === 'custom' && (
              <form onSubmit={handleCustomRangeSubmit} style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label>من تاريخ</label>
                  <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} required />
                </div>
                <div>
                  <label>إلى تاريخ</label>
                  <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} required />
                </div>
                <button type="submit" style={{ height: '42px' }}>تطبيق</button>
              </form>
            )}
          </div>

          {/* Stats Cards */}
          {dashboardStats && (
            <div className="cards-grid" style={{ marginBottom: '24px' }}>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--success)' }}>
                  {dashboardStats.income?.toLocaleString() || 0} <span style={{ fontSize: '14px' }}>ج.م</span>
                </div>
                <div className="stat-label">إجمالي المقبوضات (Income)</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--danger)' }}>
                  {dashboardStats.expense?.toLocaleString() || 0} <span style={{ fontSize: '14px' }}>ج.م</span>
                </div>
                <div className="stat-label">إجمالي المصروفات (Expenses)</div>
              </div>
              <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
                <div className="stat-value" style={{ color: dashboardStats.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {dashboardStats.netProfit?.toLocaleString() || 0} <span style={{ fontSize: '14px' }}>ج.م</span>
                </div>
                <div className="stat-label">صافي الأرباح (Net Profit)</div>
              </div>
            </div>
          )}

          {/* Filter Transactions Section */}
          <div className="form-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '12px' }}>🔍 فلترة المعاملات</h3>
            <div className="form-row">
              <div>
                <label>النوع</label>
                <select value={txFilters.type} onChange={e => setTxFilters({ ...txFilters, type: e.target.value })}>
                  <option value="">الكل</option>
                  <option value="income">مقبوضات (Income)</option>
                  <option value="expense">مصروفات (Expense)</option>
                </select>
              </div>
              <div>
                <label>التصنيف</label>
                <select value={txFilters.category} onChange={e => setTxFilters({ ...txFilters, category: e.target.value })}>
                  <option value="">الكل</option>
                  <option value="subscription">اشتراكات</option>
                  <option value="coach_salary">رواتب كباتن</option>
                  <option value="rent">إيجارات</option>
                  <option value="equipment">معدات</option>
                  <option value="electricity">كهرباء</option>
                  <option value="water">مياه</option>
                  <option value="maintenance">صيانة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label>العضو</label>
                <select value={txFilters.memberId} onChange={e => setTxFilters({ ...txFilters, memberId: e.target.value })}>
                  <option value="">الكل</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label>الكابتن</label>
                <select value={txFilters.coachId} onChange={e => setTxFilters({ ...txFilters, coachId: e.target.value })}>
                  <option value="">الكل</option>
                  {coaches.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Filtered Transactions List */}
          <h3>📋 سجل المعاملات المالية</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>النوع</th>
                  <th>التصنيف</th>
                  <th>المستفيد / العضو</th>
                  <th>المبلغ</th>
                  <th>طريقة الدفع</th>
                  <th>الوصف / ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.date).toLocaleDateString('ar-EG')}</td>
                    <td style={{ fontWeight: 'bold', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.type === 'income' ? '📥 إيراد' : '📤 مصروف'}
                    </td>
                    <td>{categoryLabels[tx.category] || tx.category}</td>
                    <td>{tx.memberId?.name || tx.coachId?.name || '-'}</td>
                    <td style={{ fontWeight: 'bold', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.amount?.toLocaleString()} ج.م
                    </td>
                    <td>{methodLabels[tx.paymentMethod] || tx.paymentMethod}</td>
                    <td>{tx.description || tx.notes || '-'}</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد معاملات مطابقة للفلترة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          {/* Add Payment Form */}
          <form className="form-card" onSubmit={handleSubmitPayment} style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>تسجيل مقبوضات جديدة</h3>
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

          {/* Payments Table */}
          <h3>📋 المقبوضات المسجلة للعملاء</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>العضو</th>
                  <th>المبلغ الإجمالي</th>
                  <th>المدفوع</th>
                  <th>المتبقي</th>
                  <th>الطريقة</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 'bold' }}>{p.member?.name || '-'}</td>
                    <td>{p.amount?.toLocaleString()} ج.م</td>
                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{p.paidAmount?.toLocaleString()} ج.م</td>
                    <td style={{ color: p.remainingAmount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{p.remainingAmount?.toLocaleString()} ج.م</td>
                    <td>{methodLabels[p.paymentMethod] || p.paymentMethod}</td>
                    <td><span className={'badge ' + statusBadge(p.status)}>{statusLabel(p.status)}</span></td>
                    <td>{new Date(p.paymentDate).toLocaleDateString('ar-EG')}</td>
                    <td style={{ textAlign: 'center' }}>
                      {p.remainingAmount > 0 ? (
                        <button className="btn-small" onClick={() => handlePayRemaining(p)}>
                          💵 سداد المتبقي
                        </button>
                      ) : (
                        <span style={{ color: 'var(--success)', fontSize: '13px' }}>✓ مكتمل</span>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد مدفوعات مسجلة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        type={confirmConfig.type || 'info'}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="تأكيد"
        cancelText="إلغاء"
        onConfirm={() => {
          setConfirmOpen(false);
          confirmConfig.action();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default Payments;
