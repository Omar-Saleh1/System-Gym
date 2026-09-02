'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import ConfirmModal from '../../components/ConfirmModal';

const CoachesAndSalaries = () => {
  const [activeTab, setActiveTab] = useState<'coaches' | 'salaries'>('coaches');
  const [coaches, setCoaches] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    type?: 'danger' | 'success' | 'warning' | 'info';
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string | null;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const closeModal = () => setConfirmConfig(prev => ({ ...prev, open: false }));

  const showAlertModal = (title: string, msg: string, type: 'danger' | 'success' | 'warning' | 'info' = 'warning') => {
    setConfirmConfig({
      open: true,
      type,
      title,
      message: msg,
      confirmText: 'حسناً',
      cancelText: null,
      onConfirm: closeModal,
    });
  };

  // Coach form state
  const [coachForm, setCoachForm] = useState({ name: '', salary: '' });
  // Salary form state
  const [salaryForm, setSalaryForm] = useState({
    coachId: '',
    month: new Date().toISOString().substring(0, 7), // "YYYY-MM"
    salaryAmount: '',
    paidAmount: '',
    paymentMethod: 'CASH',
    notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [coachRes, salaryRes] = await Promise.all([
        api.get('/coaches'),
        api.get('/coaches/salaries')
      ]);
      setCoaches(coachRes.data.data || []);
      setSalaries(salaryRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCoachSubmit = async (e: any) => {
    e.preventDefault();
    const salary = Number(coachForm.salary);
    if (salary < 0) {
      showAlertModal('تنبيـه', 'الراتب لا يمكن أن يكون سالباً', 'warning');
      return;
    }

    try {
      await api.post('/coaches', {
        name: coachForm.name,
        salary
      });
      setMessage('✅ تم إضافة الكابتن بنجاح');
      setCoachForm({ name: '', salary: '' });
      await loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      showAlertModal('خطأ', err.response?.data?.message || 'حدث خطأ أثناء إضافة الكابتن', 'danger');
    }
  };

  const handleCoachSelect = (coachId: string) => {
    const coach = coaches.find(c => c._id === coachId);
    setSalaryForm({
      ...salaryForm,
      coachId,
      salaryAmount: coach ? String(coach.salary) : '',
      paidAmount: coach ? String(coach.salary) : ''
    });
  };

  const handleSalarySubmit = async (e: any) => {
    e.preventDefault();
    const totalSalary = Number(salaryForm.salaryAmount);
    const paidAmount = Number(salaryForm.paidAmount);

    if (totalSalary < 0 || paidAmount < 0) {
      showAlertModal('تنبيـه', 'المبالغ المالية لا يمكن أن تكون سالبة', 'warning');
      return;
    }

    if (paidAmount > totalSalary) {
      showAlertModal('تنبيـه', 'المبلغ المدفوع لا يمكن أن يتجاوز الراتب الكلي', 'warning');
      return;
    }

    setConfirmConfig({
      open: true,
      type: 'info',
      title: 'تأكيد صرف الراتب',
      message: <span>تأكيد صرف راتب بقيمة <strong className="confirm-highlight">{paidAmount} ج.م</strong> للكابتن المحدد؟</span>,
      confirmText: 'نعم، صرف الراتب',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        closeModal();
        try {
          await api.post('/coaches/salaries', {
            coachId: salaryForm.coachId,
            month: salaryForm.month,
            salaryAmount: totalSalary,
            paidAmount,
            paymentMethod: salaryForm.paymentMethod,
            notes: salaryForm.notes
          });
          setMessage('✅ تم تسجيل صرف الراتب بنجاح');
          setSalaryForm({
            coachId: '',
            month: new Date().toISOString().substring(0, 7),
            salaryAmount: '',
            paidAmount: '',
            paymentMethod: 'CASH',
            notes: ''
          });
          await loadData();
          setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
          showAlertModal('خطأ', err.response?.data?.message || 'حدث خطأ أثناء تسجيل صرف الراتب', 'danger');
        }
      },
      onCancel: closeModal,
    });
  };

  const handleDeleteCoach = (id: string, name?: string) => {
    setConfirmConfig({
      open: true,
      type: 'danger',
      title: 'تأكيد تعطيل/حذف الكابتن',
      message: <span>هل أنت متأكد من تعطيل/حذف الكابتن <strong className="confirm-highlight">"{name || ''}"</strong>؟</span>,
      confirmText: 'نعم، تعطيل الحساب',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/coaches/${id}`);
          showAlertModal('تم التعطيل', 'تم تعطيل الكابتن بنجاح', 'success');
          await loadData();
        } catch (err: any) {
          showAlertModal('فشل التعطيل', err.response?.data?.message || err.message, 'danger');
        }
      },
      onCancel: closeModal,
    });
  };

  const methodLabels: any = {
    CASH: 'كاش',
    CARD: 'بطاقة',
    BANK_TRANSFER: 'تحويل بنكي',
    ONLINE: 'أونلاين',
    OTHER: 'أخرى'
  };

  const statusBadge = (s: string) => s === 'PAID' ? 'badge-success' : s === 'PARTIAL' ? 'badge-warning' : 'badge-danger';
  const statusLabel = (s: string) => s === 'PAID' ? 'مدفوع بالكامل' : s === 'PARTIAL' ? 'مدفوع جزئياً' : 'غير مدفوع';

  if (loading) return <div className="page">جاري التحميل...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={activeTab === 'coaches' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setActiveTab('coaches')}
          >
            👤 إدارة الكباتن
          </button>
          <button 
            className={activeTab === 'salaries' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setActiveTab('salaries')}
          >
            💵 رواتب الكباتن
          </button>
        </div>
        <h1>إدارة الكباتن والرواتب</h1>
      </div>

      {activeTab === 'coaches' && (
        <div>
          {/* Add Coach Form */}
          <form className="form-card" onSubmit={handleCoachSubmit} style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>إضافة كابتن جديد</h3>
            <div className="form-row">
              <div>
                <label>اسم الكابتن</label>
                <input value={coachForm.name} onChange={e => setCoachForm({ ...coachForm, name: e.target.value })} required placeholder="الاسم ثلاثي" />
              </div>
              <div>
                <label>الراتب الشهري الأساسي (ج.م)</label>
                <input type="number" value={coachForm.salary} onChange={e => setCoachForm({ ...coachForm, salary: e.target.value })} required min="0" />
              </div>
            </div>
            <button type="submit">إضافة كابتن</button>
            {message && <div className="message" style={{ marginTop: '12px' }}>{message}</div>}
          </form>

          {/* Coaches Table */}
          <h3>📋 قائمة الكباتن الحالية</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الراتب الأساسي</th>
                  <th>تاريخ الإضافة</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                    <td>{c.salary?.toLocaleString()} ج.م</td>
                    <td>{new Date(c.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-small btn-danger" onClick={() => handleDeleteCoach(c._id, c.name)}>
                        حذف / تعطيل
                      </button>
                    </td>
                  </tr>
                ))}
                {coaches.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا يوجد كباتن مسجلين لسه</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'salaries' && (
        <div>
          {/* Pay Salary Form */}
          <form className="form-card" onSubmit={handleSalarySubmit} style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>تسجيل صرف راتب</h3>
            <div className="form-row">
              <div>
                <label>الكابتن</label>
                <select value={salaryForm.coachId} onChange={e => handleCoachSelect(e.target.value)} required>
                  <option value="">اختر كابتن</option>
                  {coaches.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label>الشهر</label>
                <input type="month" value={salaryForm.month} onChange={e => setSalaryForm({ ...salaryForm, month: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>الراتب المستحق</label>
                <input type="number" value={salaryForm.salaryAmount} onChange={e => setSalaryForm({ ...salaryForm, salaryAmount: e.target.value })} required min="0" />
              </div>
              <div>
                <label>المبلغ المدفوع</label>
                <input type="number" value={salaryForm.paidAmount} onChange={e => setSalaryForm({ ...salaryForm, paidAmount: e.target.value })} required min="0" />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>طريقة الدفع</label>
                <select value={salaryForm.paymentMethod} onChange={e => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value })}>
                  <option value="CASH">كاش</option>
                  <option value="CARD">بطاقة</option>
                  <option value="BANK_TRANSFER">تحويل بنكي</option>
                  <option value="ONLINE">أونلاين</option>
                  <option value="OTHER">أخرى</option>
                </select>
              </div>
              <div>
                <label>ملاحظات</label>
                <input value={salaryForm.notes} onChange={e => setSalaryForm({ ...salaryForm, notes: e.target.value })} placeholder="مكافآت أو خصومات..." />
              </div>
            </div>
            <button type="submit">تسجيل صرف الراتب</button>
            {message && <div className="message" style={{ marginTop: '12px' }}>{message}</div>}
          </form>

          {/* Salary List Table */}
          <h3>📋 سجل صرف الرواتب للمدربين</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الكابتن</th>
                  <th>الشهر</th>
                  <th>الراتب الكلي</th>
                  <th>المدفوع</th>
                  <th>المتبقي</th>
                  <th>الحالة</th>
                  <th>طريقة الدفع</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 'bold' }}>{s.coach?.name || '-'}</td>
                    <td>{s.month}</td>
                    <td>{s.salaryAmount?.toLocaleString()} ج.م</td>
                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{s.paidAmount?.toLocaleString()} ج.م</td>
                    <td style={{ color: s.remainingAmount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{s.remainingAmount?.toLocaleString()} ج.م</td>
                    <td><span className={'badge ' + statusBadge(s.status)}>{statusLabel(s.status)}</span></td>
                    <td>{methodLabels[s.paymentMethod] || s.paymentMethod || '-'}</td>
                    <td>{s.paymentDate ? new Date(s.paymentDate).toLocaleDateString('ar-EG') : '-'}</td>
                  </tr>
                ))}
                {salaries.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد رواتب مسجلة لسه</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmConfig.open}
        type={confirmConfig.type || 'danger'}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        onConfirm={confirmConfig.onConfirm}
        onCancel={confirmConfig.onCancel}
      />
    </div>
  );
};

export default CoachesAndSalaries;

