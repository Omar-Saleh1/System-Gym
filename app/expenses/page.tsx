'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  ReceiptRefundIcon, 
  BanknotesIcon, 
  PlusCircleIcon,
  TagIcon,
  TrashIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Expenses = () => {
  const { cashier } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [shiftFilter, setShiftFilter] = useState(cashier?.shiftType || '');
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Expenses form state
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'SALARIES',
    paymentMethod: 'CASH',
    notes: ''
  });

  const categories: Record<string, string> = {
    SALARIES: 'رواتب / مسحوبات',
    RENT: 'إيجار',
    EQUIPMENT: 'معدات وأدوات',
    MAINTENANCE: 'صيانة وإصلاحات',
    ELECTRICITY: 'كهرباء',
    WATER: 'مياه',
    MARKETING: 'تسويق وإعلانات',
    OTHER: 'أخرى'
  };

  const paymentMethods: Record<string, string> = {
    CASH: '💵 نقدي (كاش)',
    CARD: '💳 فيزا / بطاقة',
    BANK_TRANSFER: '🏦 تحويل بنكي / محفظة',
    OTHER: '✨ أخرى'
  };

  const loadExpenses = async (sFilter?: string) => {
    try {
      setLoading(true);
      const targetShift = sFilter !== undefined ? sFilter : shiftFilter;
      const params: any = {};
      if (targetShift) params.shiftType = targetShift;
      const res = await api.get('/expenses', { params });
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses(shiftFilter);
  }, [shiftFilter]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    try {
      setSubmitting(true);
      await api.post('/expenses', {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        shiftType: cashier?.shiftType || (shiftFilter ? shiftFilter : undefined)
      });
      setMessage('✅ تم تسجيل المصروف وخصمه من الحسابات بنجاح');
      setForm({ title: '', amount: '', category: 'SALARIES', paymentMethod: 'CASH', notes: '' });
      loadExpenses(shiftFilter);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'حدث خطأ أثناء التسجيل'));
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    const id = expenseToDelete._id;
    setDeletingId(id);
    setExpenseToDelete(null);
    try {
      await api.delete(`/expenses/${id}`);
      setMessage('✅ تم حذف المصروف بنجاح');
      loadExpenses(shiftFilter);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'حدث خطأ أثناء الحذف'));
    } finally {
      setDeletingId(null);
    }
  };

  const totalExpensesAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>تسجيل رواتب ومسحوبات الموظفين وأي مصروفات تشغيلية لكافة الشفتات</div>
          <h1 style={{ margin: 0 }}>المصروفات والمسحوبات</h1>
        </div>

        {/* Shift selector for admin or shift indicator for cashier */}
        {cashier?.role === 'admin' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 'bold' }}>فلترة الشفت:</span>
            <select
              value={shiftFilter}
              onChange={(e) => {
                setShiftFilter(e.target.value);
                loadExpenses(e.target.value);
              }}
              style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontWeight: 'bold' }}
            >
              <option value="">🌐 جميع الشفتات</option>
              <option value="GIRLS">🌸 شفت البنات</option>
              <option value="BOYS">🏋️‍♂️ شفت الشباب</option>
            </select>
          </div>
        ) : (
          <div style={{ padding: '8px 14px', borderRadius: 10, background: cashier?.shiftType === 'GIRLS' ? 'rgba(236,72,153,0.15)' : 'rgba(59,130,246,0.15)', border: '1px solid var(--border-color)', color: cashier?.shiftType === 'GIRLS' ? '#f472b6' : '#60a5fa', fontWeight: 'bold', fontSize: 13 }}>
            {cashier?.shiftType === 'GIRLS' ? '🌸 شفت البنات' : '🏋️‍♂️ شفت الشباب'}
          </div>
        )}
      </div>

      {/* Stats row */}
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
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="stat-label" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              إجمالي المصروفات المسجلة
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              boxShadow: '0 4px 14px rgba(239,68,68,0.2)'
            }}>
              <ReceiptRefundIcon style={{ width: '22px', height: '22px' }} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#ef4444', fontSize: '26px', fontWeight: 'bold' }}>
            {totalExpensesAmount.toLocaleString()} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'normal' }}>ج.م</span>
          </div>
        </div>

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
            border: '1px solid rgba(245, 158, 11, 0.25)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="stat-label" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              عدد بنود المصروفات
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              boxShadow: '0 4px 14px rgba(245,158,11,0.2)'
            }}>
              <TagIcon style={{ width: '22px', height: '22px' }} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f59e0b', fontSize: '26px', fontWeight: 'bold' }}>
            {expenses.length}
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlusCircleIcon style={{ width: 22, height: 22, color: 'var(--primary)' }} />
          تسجيل مصروف أو مسحوبات جديدة
        </h3>
        <div className="form-row">
          <div>
            <label>البند / الوصف (مثل: مسحوبات كابتن محمد / إيجار / أدوات نظافة)</label>
            <input 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              required 
              placeholder="اكتب اسم المصروف أو سبب السحب..." 
            />
          </div>
          <div>
            <label>المبلغ (ج.م)</label>
            <input 
              type="number" 
              value={form.amount} 
              onChange={e => setForm({...form, amount: e.target.value})} 
              required 
              min="1" 
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>التصنيف</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {Object.entries(categories).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label>طريقة الدفع / السحب</label>
            <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
              {Object.entries(paymentMethods).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label>ملاحظات إضافية</label>
            <input 
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})} 
              placeholder="أي تفاصيل أخرى..." 
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} style={{ marginTop: 8 }}>
          {submitting ? 'جاري التسجيل...' : '💸 تسجيل المصروف'}
        </button>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            marginTop: 14,
            background: message.startsWith('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: message.startsWith('✅') ? '#4ade80' : '#f87171',
            border: message.startsWith('✅') ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)'
          }}>
            {message}
          </div>
        )}
      </form>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>جاري تحميل المصروفات...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>البند</th>
                <th>المبلغ</th>
                <th>التصنيف</th>
                <th>طريقة السحب</th>
                <th>الشفت</th>
                <th>المسؤول</th>
                <th>التاريخ والوقت</th>
                <th>ملاحظات</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e._id}>
                  <td style={{ fontWeight: 'bold' }}>{e.title}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {e.amount?.toLocaleString()} ج.م
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      {categories[e.category] || e.category}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {paymentMethods[e.paymentMethod] || e.paymentMethod || '💵 نقدي'}
                  </td>
                  <td>
                    {e.shiftType ? (
                      <span className="badge badge-secondary" style={{
                        color: e.shiftType === 'GIRLS' ? '#ec4899' : '#3b82f6',
                        background: e.shiftType === 'GIRLS' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)'
                      }}>
                        {e.shiftType === 'GIRLS' ? '🌸 بنات' : '🏋️‍♂️ شباب'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>عام</span>
                    )}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {e.createdBy?.name || '-'}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(e.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {e.notes || '-'}
                  </td>
                  <td>
                    <button
                      onClick={() => setExpenseToDelete(e)}
                      disabled={deletingId === e._id}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171',
                        borderRadius: 8,
                        padding: '5px 10px',
                        cursor: deletingId === e._id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontFamily: 'Cairo, sans-serif',
                        fontWeight: 700,
                        opacity: deletingId === e._id ? 0.5 : 1,
                      }}
                    >
                      <TrashIcon style={{ width: 13, height: 13 }} />
                      {deletingId === e._id ? '...' : 'حذف'}
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    لا توجد مصروفات مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!expenseToDelete}
        type="danger"
        title="تأكيد حذف المصروف"
        message={
          <span>
            هل أنت متأكد من حذف بند المصروف{' '}
            <strong style={{ color: '#fff' }}>"{expenseToDelete?.title}"</strong> بمبلغ{' '}
            <strong style={{ color: '#ef4444' }}>{expenseToDelete?.amount?.toLocaleString()} ج.م</strong>؟
            <br />
            <span style={{ fontSize: '13px', opacity: 0.85, color: '#f87171', display: 'block', marginTop: '6px' }}>
              سيتم إرجاع المبلغ لحساب الإيرادات وصافي الأرباح.
            </span>
          </span>
        }
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};

export default Expenses;
