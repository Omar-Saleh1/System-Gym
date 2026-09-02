"use client";
import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import ConfirmModal from '../../components/ConfirmModal';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    memberId: '',
    planId: '',
    pricePaid: '',
    paidAmount: '',
    paymentMethod: 'CASH',
    notes: ''
  });

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    durationInDays: '',
    sessionsLimit: '',
    subscriptionType: 'days',
    shiftType: 'BOTH',
    price: '',
    description: ''
  });

  const [editSub, setEditSub] = useState<any>(null);
  const [editForm, setEditForm] = useState({ endDate: '', sessionsLimit: '', sessionsUsed: '', status: '' });

  const [errorMessage, setErrorMessage] = useState('');

  const loadAll = async () => {
    const [subsRes, plansRes, membersRes] = await Promise.all([
      api.get('/subscriptions'),
      api.get('/subscriptions/plans'),
      api.get('/members'),
    ]);
    setSubscriptions(subsRes.data);
    setPlans(plansRes.data);
    setMembers(membersRes.data);
  };

  useEffect(() => { loadAll(); }, []);

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p._id === planId);
    setForm({ ...form, planId, pricePaid: plan ? String(plan.price) : '', paidAmount: plan ? String(plan.price) : '' });
  };

  const handleSubscribeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    if (!form.memberId || !form.planId || !form.pricePaid || !form.paidAmount) { setErrorMessage('جميع الحقول الرئيسية مطلوبة'); return; }
    setConfirmOpen(true);
  };

  const executeSubscribe = async () => {
    setConfirmOpen(false);
    try {
      await api.post('/subscriptions', { memberId: form.memberId, planId: form.planId, pricePaid: Number(form.pricePaid), paidAmount: Number(form.paidAmount), paymentMethod: form.paymentMethod, notes: form.notes });
      setForm({ memberId: '', planId: '', pricePaid: '', paidAmount: '', paymentMethod: 'CASH', notes: '' });
      setShowForm(false);
      loadAll();
    } catch (err: any) { setErrorMessage(err.response?.data?.message || 'حدث خطأ أثناء الاشتراك'); }
  };

  const handleAddPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const payload: any = {
        name: planForm.name,
        subscriptionType: planForm.subscriptionType,
        shiftType: planForm.shiftType,
        price: Number(planForm.price),
        description: planForm.description
      };
      if (planForm.subscriptionType === 'sessions') { payload.sessionsLimit = Number(planForm.sessionsLimit); payload.durationInDays = 30; }
      else { payload.durationInDays = Number(planForm.durationInDays); payload.sessionsLimit = 0; }
      await api.post('/subscriptions/plans', payload);
      setPlanForm({ name: '', durationInDays: '', sessionsLimit: '', subscriptionType: 'days', shiftType: 'BOTH', price: '', description: '' });
      loadAll();
    } catch (err: any) { setErrorMessage(err.response?.data?.message || 'حدث خطأ أثناء حفظ الخطة'); }
  };

  const [modalConfig, setModalConfig] = useState<{
    open: boolean;
    type?: 'danger' | 'success' | 'warning' | 'info';
    title: string;
    message: string;
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

  const closeModal = () => setModalConfig(prev => ({ ...prev, open: false }));

  const showModalAlert = (title: string, message: string, type: 'danger' | 'success' | 'warning' | 'info' = 'danger') => {
    setModalConfig({
      open: true,
      type,
      title,
      message,
      confirmText: 'حسناً',
      cancelText: null,
      onConfirm: closeModal,
    });
  };

  const handleDeletePlan = (id: string, name: string) => {
    setModalConfig({
      open: true,
      type: 'danger',
      title: 'تأكيد حذف الخطة',
      message: `هل أنت متأكد من حذف الخطة "${name}"؟`,
      confirmText: 'حذف الخطة',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/subscriptions/plans/${id}`);
          loadAll();
        } catch (err: any) {
          showModalAlert('فشل الحذف', err.response?.data?.message || 'فشل حذف الخطة');
        }
      },
      onCancel: closeModal,
    });
  };

  const handleDeleteSubscription = (id: string, memberName?: string) => {
    setModalConfig({
      open: true,
      type: 'danger',
      title: 'تأكيد حذف الاشتراك',
      message: `هل أنت متأكد من حذف اشتراك العضو "${memberName || ''}" نهائياً وتصفية بياناته المالية؟`,
      confirmText: 'نعم، حذف الاشتراك',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/subscriptions/${id}`);
          loadAll();
        } catch (err: any) {
          showModalAlert('فشل الحذف', err.response?.data?.message || 'فشل حذف الاشتراك');
        }
      },
      onCancel: closeModal,
    });
  };

  const openEditModal = (s: any) => {
    setEditSub(s);
    const endDateLocal = s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '';
    setEditForm({ endDate: endDateLocal, sessionsLimit: String(s.sessionsLimit ?? ''), sessionsUsed: String(s.sessionsUsed ?? ''), status: s.status });
  };

  const handleEditSave = async () => {
    if (!editSub) return;
    try {
      const payload: any = { status: editForm.status, endDate: editForm.endDate ? new Date(editForm.endDate) : undefined };
      if (editSub.subscriptionType === 'sessions') { payload.sessionsLimit = Number(editForm.sessionsLimit); payload.sessionsUsed = Number(editForm.sessionsUsed); }
      await api.put(`/subscriptions/${editSub._id}`, payload);
      setEditSub(null);
      loadAll();
    } catch (err: any) { showModalAlert('فشل التعديل', err.response?.data?.message || 'فشل التعديل'); }
  };

  const isExpired = (s: any) => s.status === 'expired' || new Date(s.endDate) < new Date() || (s.subscriptionType === 'sessions' && s.sessionsLimit > 0 && s.sessionsUsed >= s.sessionsLimit);
  const handleFreeze = async (id: string) => { try { await api.post(`/subscriptions/${id}/freeze`); loadAll(); } catch (err: any) { showModalAlert('فشل التجميد', err.response?.data?.message || 'فشل التجميد'); } };
  const handleUnfreeze = async (id: string) => { try { await api.post(`/subscriptions/${id}/unfreeze`); loadAll(); } catch (err: any) { showModalAlert('فشل إلغاء التجميد', err.response?.data?.message || 'فشل إلغاء التجميد'); } };

  const selectedPlan = plans.find(p => p._id === form.planId);

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setShowPlanForm(!showPlanForm); setErrorMessage(''); }} className="btn-secondary">{showPlanForm ? 'إغلاق إدارة الخطط' : '📋 إدارة الخطط'}</button>
          <button onClick={() => { setShowForm(!showForm); setErrorMessage(''); }}>{showForm ? 'إلغاء' : '+ اشتراك جديد'}</button>
        </div>
        <div>
          <h1>الاشتراكات</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-16px' }}>إدارة وتتبع خطط عضوية الرياضيين النشطة.</div>
        </div>
      </div>

      {showPlanForm && (
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleAddPlan}>
            {errorMessage && <div style={{ padding: '12px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', textAlign: 'right', fontWeight: 'bold' }}>{errorMessage}</div>}
            <h3>إضافة خطة اشتراك جديدة</h3>
            <div className="form-row">
              <div><label>اسم الخطة</label><input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required /></div>
              <div>
                <label>نوع الاشتراك</label>
                <select value={planForm.subscriptionType} onChange={(e) => setPlanForm({ ...planForm, subscriptionType: e.target.value })}>
                  <option value="days">بالأيام</option>
                  <option value="sessions">بالحصص</option>
                </select>
              </div>
              <div>
                <label>المخصص لـ (الشفت)</label>
                <select value={planForm.shiftType} onChange={(e) => setPlanForm({ ...planForm, shiftType: e.target.value })}>
                  <option value="BOTH">🌐 كل الشفتات (بنات وشباب)</option>
                  <option value="GIRLS">🌸 شفت البنات فقط</option>
                  <option value="BOYS">🏋️‍♂️ شفت الشباب فقط</option>
                </select>
              </div>
              {planForm.subscriptionType === 'days'
                ? <div><label>المدة (أيام)</label><input type="number" value={planForm.durationInDays} onChange={(e) => setPlanForm({ ...planForm, durationInDays: e.target.value })} required min="1" /></div>
                : <div><label>عدد الحصص</label><input type="number" value={planForm.sessionsLimit} onChange={(e) => setPlanForm({ ...planForm, sessionsLimit: e.target.value })} required min="1" placeholder="مثال: 12" /></div>
              }
              <div><label>السعر (ج.م)</label><input type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} required min="0" /></div>
            </div>
            {planForm.subscriptionType === 'sessions' && (
              <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', color: '#60a5fa', textAlign: 'right' }}>
                اشتراك الحصص: تاريخ الانتهاء سيكون <strong>30 يوم</strong> من تاريخ الاشتراك، وينتهي تلقائياً عند استهلاك كل الحصص.
              </div>
            )}
            <button type="submit">حفظ الخطة الجديدة</button>
          </form>

          {/* List of existing plans with Delete button */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '14px', color: '#fff' }}>📋 الخطط الحالية المتاحة ({plans.length})</h4>
            {plans.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>لا توجد خطط حتى الآن</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>اسم الخطة</th>
                      <th>الشفت المخصص</th>
                      <th>النوع</th>
                      <th>المدة / الحصص</th>
                      <th>السعر</th>
                      <th style={{ textAlign: 'center' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                        <td>
                          {p.shiftType === 'GIRLS' ? (
                            <span className="badge badge-secondary" style={{ color: '#ec4899', borderColor: '#fbcfe8', background: 'rgba(236,72,153,0.1)' }}>🌸 شفت البنات</span>
                          ) : p.shiftType === 'BOYS' ? (
                            <span className="badge badge-secondary" style={{ color: '#3b82f6', borderColor: '#bfdbfe', background: 'rgba(59,130,246,0.1)' }}>🏋️‍♂️ شفت الشباب</span>
                          ) : (
                            <span className="badge badge-secondary">🌐 كل الشفتات</span>
                          )}
                        </td>
                        <td>{p.subscriptionType === 'sessions' ? '🏋️ حصص' : '📅 أيام'}</td>
                        <td>{p.subscriptionType === 'sessions' ? `${p.sessionsLimit || 0} حصة` : `${p.durationInDays || 0} يوم`}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>{p.price} ج.م</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="btn-3d btn-3d-delete" onClick={() => handleDeletePlan(p._id, p.name)}>
                            🗑️ حذف الخطة
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <form className="form-card" onSubmit={handleSubscribeSubmit}>
          {errorMessage && <div style={{ padding: '12px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', textAlign: 'right', fontWeight: 'bold' }}>{errorMessage}</div>}
          <h3>اشتراك جديد</h3>
          <div className="form-row">
            <div>
              <label>العضو</label>
              <select value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} required>
                <option value="">اختر عضو</option>
                {members.map((m) => <option key={m._id} value={m._id}>{m.name} - {m.phone}</option>)}
              </select>
            </div>
            <div>
              <label>الخطة</label>
              <select value={form.planId} onChange={(e) => handlePlanChange(e.target.value)} required>
                <option value="">اختر خطة</option>
                {plans.map((p) => <option key={p._id} value={p._id}>{p.name} — {p.price} ج.م {p.subscriptionType === 'sessions' ? `(${p.sessionsLimit} حصة)` : `(${p.durationInDays} يوم)`}</option>)}
              </select>
            </div>
          </div>
          {selectedPlan?.subscriptionType === 'sessions' && (
            <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', color: '#60a5fa', textAlign: 'right' }}>
              هذا الاشتراك بالحصص: <strong>{selectedPlan.sessionsLimit} حصة</strong> على مدار 30 يوم — ينتهي عند استهلاك كل الحصص.
            </div>
          )}
          <div className="form-row">
            <div><label>المبلغ المطلوب (ج.م)</label><input type="number" value={form.pricePaid} onChange={(e) => setForm({ ...form, pricePaid: e.target.value })} required min="0" /></div>
            <div><label>المبلغ المدفوع (ج.م)</label><input type="number" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} required min="0" /></div>
            <div>
              <label>طريقة الدفع</label>
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                <option value="CASH">كاش</option><option value="CARD">بطاقة</option><option value="BANK_TRANSFER">تحويل بنكي</option><option value="ONLINE">اونلاين</option><option value="OTHER">أخرى</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div style={{ flex: 2 }}><label>ملاحظات</label><input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="اكتب أي ملاحظات هنا..." /></div>
          </div>
          <button type="submit">تأكيد الاشتراك</button>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>العضو</th><th>الخطة</th><th>النوع</th><th>الحصص / المدة</th><th>البداية</th><th>الانتهاء</th><th>المدفوع</th><th>الحالة</th><th style={{ textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => {
              const isSessions = s.subscriptionType === 'sessions';
              const sessionsLeft = isSessions ? Math.max(0, (s.sessionsLimit || 0) - (s.sessionsUsed || 0)) : null;
              const expired = isExpired(s);
              return (
                <tr key={s._id}>
                  <td>{s.member?.name}</td>
                  <td>{s.plan?.name}</td>
                  <td>
                    {isSessions
                      ? <span className="badge badge-secondary" style={{ color: '#60a5fa', borderColor: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}>حصص</span>
                      : <span className="badge badge-secondary">أيام</span>}
                  </td>
                  <td>
                    {isSessions
                      ? <span style={{ fontWeight: 'bold', color: sessionsLeft === 0 ? 'var(--danger)' : sessionsLeft !== null && sessionsLeft <= 2 ? 'var(--warning)' : 'var(--success)' }}>
                          {s.sessionsUsed || 0}/{s.sessionsLimit || 0} حصة
                          {sessionsLeft !== null && sessionsLeft > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px' }}>({sessionsLeft} متبقي)</span>}
                        </span>
                      : `${s.plan?.durationInDays || '—'} يوم`}
                  </td>
                  <td>{new Date(s.startDate).toLocaleDateString('ar-EG')}</td>
                  <td>{new Date(s.endDate).toLocaleDateString('ar-EG')}</td>
                  <td>{s.pricePaid} ج.م</td>
                  <td>
                    <span className={'badge ' + (s.status === 'frozen' ? 'badge-warning' : (expired || s.status === 'expired') ? 'badge-danger' : s.status === 'cancelled' ? 'badge-secondary' : 'badge-success')}>
                      {s.status === 'frozen' ? 'مجمد' : s.status === 'cancelled' ? 'ملغي' : (expired || s.status === 'expired') ? 'منتهي' : 'نشط'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button className="btn-3d btn-3d-edit" onClick={() => openEditModal(s)}>✏️ تعديل</button>
                      {s.status === 'active' && !expired && <button className="btn-3d btn-3d-freeze" onClick={() => handleFreeze(s._id)}>❄️ تجميد</button>}
                      {s.status === 'frozen' && <button className="btn-3d btn-3d-unfreeze" onClick={() => handleUnfreeze(s._id)}>🔥 تشغيل</button>}
                      <button className="btn-3d btn-3d-delete" onClick={() => handleDeleteSubscription(s._id, s.member?.name)}>🗑️ حذف</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {subscriptions.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center' }}>مفيش اشتراكات لسه</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmModal open={confirmOpen} type="info" title="تأكيد تسجيل الاشتراك"
        message={<span>هل أنت متأكد من تسجيل الاشتراك بقيمة إجمالية <strong className="confirm-highlight">{form.pricePaid} ج.م</strong> ومدفوع <strong className="confirm-highlight">{form.paidAmount} ج.م</strong>؟</span>}
        confirmText="تأكيد الاشتراك" cancelText="إلغاء" onConfirm={executeSubscribe} onCancel={() => setConfirmOpen(false)}
      />

      {editSub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', direction: 'rtl' }}>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>تعديل الاشتراك — {editSub.member?.name}</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>الحالة</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }}>
                <option value="active">نشط</option><option value="expired">منتهي</option><option value="cancelled">ملغي</option><option value="frozen">مجمد</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>تاريخ الانتهاء</label>
              <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>
            {editSub.subscriptionType === 'sessions' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>إجمالي الحصص المسموح بها</label>
                  <input type="number" min="0" value={editForm.sessionsLimit} onChange={(e) => setEditForm({ ...editForm, sessionsLimit: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>الحصص المستهلكة حتى الآن</label>
                  <input type="number" min="0" value={editForm.sessionsUsed} onChange={(e) => setEditForm({ ...editForm, sessionsUsed: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff' }} />
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={handleEditSave} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>حفظ التعديلات</button>
              <button onClick={() => setEditSub(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modalConfig.open}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </div>
  );
};

export default Subscriptions;