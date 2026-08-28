'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';

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

  return (
    <div className="page">
      <div className="page-header">
        <div><div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>تسجيل رواتب ومسحوبات الموظفين وأي مصروفات أخرى</div></div>
        <h1>المصروفات (Expenses)</h1>
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
