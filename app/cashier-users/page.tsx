'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import ConfirmModal from '../../components/ConfirmModal';
import { UserPlusIcon, KeyIcon, UserGroupIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const CashierUsersPage = () => {
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'cashier',
  });

  // Modal State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState<any>(null);
  const [actionType, setActionType] = useState<'create' | 'toggleActive' | 'resetPassword'>('create');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const loadCashiers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/cashiers');
      setCashiers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'فشل في جلب قائمة الحسابات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashiers();
  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) {
      alert('جميع الحقول مطلوبة');
      return;
    }
    setActionType('create');
    setConfirmOpen(true);
  };

  const handleToggleActive = (cashier: any) => {
    setSelectedCashier(cashier);
    setActionType('toggleActive');
    setConfirmOpen(true);
  };

  const handlePromptResetPassword = (cashier: any) => {
    const pwd = window.prompt(`أدخل كلمة المرور الجديدة لـ (${cashier.name}):`);
    if (!pwd || pwd.trim().length === 0) return;
    setNewPasswordInput(pwd.trim());
    setSelectedCashier(cashier);
    setActionType('resetPassword');
    setConfirmOpen(true);
  };

  const executeConfirmedAction = async () => {
    setConfirmOpen(false);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (actionType === 'create') {
        await api.post('/auth/register', form);
        setSuccessMessage(`✅ تم إنشاء حساب الكاشير (${form.name}) بنجاح!`);
        setForm({ name: '', username: '', password: '', role: 'cashier' });
        await loadCashiers();
      } else if (actionType === 'toggleActive' && selectedCashier) {
        const nextActiveState = !selectedCashier.active;
        await api.put(`/auth/cashiers/${selectedCashier._id}`, { active: nextActiveState });
        setSuccessMessage(`✅ تم ${nextActiveState ? 'تفعيل' : 'تعطيل'} حساب (${selectedCashier.name}) بنجاح`);
        await loadCashiers();
      } else if (actionType === 'resetPassword' && selectedCashier) {
        await api.put(`/auth/cashiers/${selectedCashier._id}`, { password: newPasswordInput });
        setSuccessMessage(`✅ تم تغيير كلمة المرور للحساب (${selectedCashier.name}) بنجاح`);
        setNewPasswordInput('');
        await loadCashiers();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'حدث خطأ أثناء تنفيذ العملية');
    }
  };

  if (loading) return <div className="page">جاري التحميل...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheckIcon style={{ width: '28px', height: '28px', color: 'var(--primary)' }} />
          <h1>إدارة حسابات الكاشير والموظفين</h1>
        </div>
      </div>

      {successMessage && (
        <div className="message" style={{ marginBottom: '20px' }}>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-msg" style={{ marginBottom: '20px' }}>
          {errorMessage}
        </div>
      )}

      {/* ── Form: Create Cashier ── */}
      <form className="form-card" onSubmit={handleCreateSubmit} style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          <UserPlusIcon style={{ width: '20px' }} />
          إنشاء حساب كاشير جديد
        </h3>

        <div className="form-row">
          <div>
            <label>اسم الموظف / الكاشير (ثلاثي)</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: أحمد محمد علي"
              required
            />
          </div>
          <div>
            <label>اسم المستخدم (اليوزرنيم)</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="مثال: ahmed12"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>كلمة المرور (الباسورد)</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="أدخل كلمة مرور قوية"
              required
            />
          </div>
          <div>
            <label>الصلاحية</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="cashier">كاشير (صلاحيات عادية)</option>
              <option value="admin">أدمن (صلاحيات كاملة)</option>
            </select>
          </div>
        </div>

        <button type="submit" style={{ marginTop: '8px' }}>
          ＋ حفظ وإضافة الكاشير
        </button>
      </form>

      {/* ── Table: Registered Cashiers ── */}
      <div className="form-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserGroupIcon style={{ width: '20px' }} />
          قائمة الكاشيرية المسجلين بالنظام ({cashiers.length})
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>اسم المستخدم</th>
                <th>الصلاحية</th>
                <th>الحالة</th>
                <th>تاريخ الإنشاء</th>
                <th style={{ textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cashiers.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                  <td style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{c.username}</td>
                  <td>
                    <span className={`badge ${c.role === 'admin' ? 'badge-warning' : 'badge-secondary'}`}>
                      {c.role === 'admin' ? '👑 أدمن' : '👤 كاشير'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.active !== false ? 'badge-success' : 'badge-danger'}`}>
                      {c.active !== false ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td>{new Date(c.createdAt || Date.now()).toLocaleDateString('ar-EG')}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => handlePromptResetPassword(c)}
                        title="تغيير الباسورد"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <KeyIcon style={{ width: '14px' }} />
                        كلمة السر
                      </button>
                      <button
                        className={`btn-small ${c.active !== false ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => handleToggleActive(c)}
                      >
                        {c.active !== false ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {cashiers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    لا يوجد حسابات كاشير مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        open={confirmOpen}
        type={actionType === 'toggleActive' && selectedCashier?.active !== false ? 'danger' : 'info'}
        title={
          actionType === 'create'
            ? 'تأكيد إضافة الكاشير'
            : actionType === 'toggleActive'
            ? `تأكيد ${selectedCashier?.active !== false ? 'تعطيل' : 'تفعيل'} الحساب`
            : 'تأكيد تغيير كلمة المرور'
        }
        message={
          actionType === 'create' ? (
            <span>
              هل أنت متأكد من إنشاء حساب جديد لـ <strong className="confirm-highlight">{form.name}</strong> باسم مستخدم (<strong className="confirm-highlight">{form.username}</strong>)؟
            </span>
          ) : actionType === 'toggleActive' ? (
            <span>
              هل أنت متأكد من تغيير حالة حساب <strong className="confirm-highlight">{selectedCashier?.name}</strong> إلى (<strong className="confirm-highlight">{selectedCashier?.active !== false ? 'معطل' : 'نشط'}</strong>)؟
            </span>
          ) : (
            <span>
              هل أنت متأكد من تغيير كلمة المرور لحساب <strong className="confirm-highlight">{selectedCashier?.name}</strong>؟
            </span>
          )
        }
        confirmText="نعم، تأكيد"
        cancelText="إلغاء"
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default CashierUsersPage;
