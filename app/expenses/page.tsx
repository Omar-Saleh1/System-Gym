'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { 
  ReceiptRefundIcon, 
  BanknotesIcon, 
  PlusCircleIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Expenses form state
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'OTHER',
    notes: ''
  });

  const categories: any = {
    RENT: 'إيجار',
    SALARIES: 'رواتب / مسحوبات',
    EQUIPMENT: 'معدات',
    MAINTENANCE: 'صيانة',
    ELECTRICITY: 'كهرباء',
    WATER: 'مياه',
    MARKETING: 'تسويق',
    OTHER: 'أخرى'
  };

  const loadExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        notes: form.notes
      });
      setMessage('✅ تم تسجيل المصروف بنجاح');
      setForm({ title: '', amount: '', category: 'OTHER', notes: '' });
      loadExpenses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'حدث خطأ'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="page">جاري التحميل...</div>;

  const totalExpensesAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div><div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>تسجيل رواتب ومسحوبات الموظفين وأي مصروفات تشغيلية</div></div>
        <h1>المصروفات (Expenses)</h1>
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

      <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>تسجيل مصروف جديد</h3>
        <div className="form-row">
          <div>
            <label>البند (مثل: مسحوبات أحمد)</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="اسم المصروف" />
          </div>
          <div>
            <label>المبلغ (ج.م)</label>
            <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required min="0" />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>التصنيف</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {Object.entries(categories).map(([val, label]: any) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label>ملاحظات إضافية</label>
            <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
        </div>
        <button type="submit">تسجيل المصروف</button>
        {message && <div className="message" style={{ marginTop: '12px' }}>{message}</div>}
      </form>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>البند</th>
              <th>المبلغ</th>
              <th>التصنيف</th>
              <th>ملاحظات</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e._id}>
                <td style={{ fontWeight: 'bold' }}>{e.title}</td>
                <td style={{ color: 'var(--danger)' }}>{e.amount?.toLocaleString()} ج.م</td>
                <td><span className="badge badge-warning">{categories[e.category] || e.category}</span></td>
                <td>{e.notes || '-'}</td>
                <td>{new Date(e.date).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد مصروفات مسجلة</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
