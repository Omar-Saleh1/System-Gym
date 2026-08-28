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
  const [planForm, setPlanForm] = useState({ name: '', durationInDays: '', price: '', description: '' });
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

  useEffect(() => {
    loadAll();
  }, []);

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p._id === planId);
    setForm({
      ...form,
      planId,
      pricePaid: plan ? String(plan.price) : '',
      paidAmount: plan ? String(plan.price) : ''
    });
  };

  const handleSubscribeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    if (!form.memberId || !form.planId || !form.pricePaid || !form.paidAmount) {
      setErrorMessage('جميع الحقول الرئيسية مطلوبة');
      return;
    }
    setConfirmOpen(true);
  };

  const executeSubscribe = async () => {
    setConfirmOpen(false);
    try {
      await api.post('/subscriptions', {
        memberId: form.memberId,
        planId: form.planId,
        pricePaid: Number(form.pricePaid),
        paidAmount: Number(form.paidAmount),
        paymentMethod: form.paymentMethod,
        notes: form.notes
      });
      setForm({
        memberId: '',
        planId: '',
        pricePaid: '',
        paidAmount: '',
        paymentMethod: 'CASH',
        notes: ''
      });
      setShowForm(false);
      loadAll();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'حدث خطأ أثناء الاشتراك');
    }
  };

  const handleAddPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await api.post('/subscriptions/plans', planForm);
      setPlanForm({ name: '', durationInDays: '', price: '', description: '' });
      setShowPlanForm(false);
      loadAll();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'حدث خطأ أثناء حفظ الخطة');
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  const handleFreeze = async (id: string) => {
    try {
      await api.post(`/subscriptions/${id}/freeze`);
      loadAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل التجميد');
    }
  };

  const handleUnfreeze = async (id: string) => {
    try {
      await api.post(`/subscriptions/${id}/unfreeze`);
      loadAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل إلغاء التجميد');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setShowPlanForm(!showPlanForm); setErrorMessage(''); }} className="btn-secondary">
            {showPlanForm ? 'إلغاء' : '+ خطة جديدة'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setErrorMessage(''); }}>{showForm ? 'إلغاء' : '+ اشتراك جديد'}</button>
        </div>
        <div>
          <h1>الاشتراكات</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-16px' }}>إدارة وتتبع خطط عضوية الرياضيين النشطة.</div>
        </div>
      </div>

      {showPlanForm && (
        <form className="form-card" onSubmit={handleAddPlan}>
          {errorMessage && (
            <div style={{ padding: '12px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', textAlign: 'right', fontWeight: 'bold' }}>
              {errorMessage}
            </div>
          )}
          <h3>خطة اشتراك جديدة</h3>
          <div className="form-row">
            <div>
              <label>اسم الخطة</label>
              <input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required />
            </div>
            <div>
              <label>المدة (أيام)</label>
              <input type="number" value={planForm.durationInDays} onChange={(e) => setPlanForm({ ...planForm, durationInDays: e.target.value })} required />
            </div>
            <div>
              <label>السعر</label>
              <input type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} required />
            </div>
          </div>
          <button type="submit">حفظ الخطة</button>
        </form>
      )}

      {showForm && (
        <form className="form-card" onSubmit={handleSubscribeSubmit}>
          {errorMessage && (
            <div style={{ padding: '12px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', textAlign: 'right', fontWeight: 'bold' }}>
              {errorMessage}
            </div>
          )}
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
                {plans.map((p) => <option key={p._id} value={p._id}>{p.name} - {p.price} ج.م ({p.durationInDays} يوم)</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>المبلغ المطلوب (ج.م)</label>
              <input type="number" value={form.pricePaid} onChange={(e) => setForm({ ...form, pricePaid: e.target.value })} required min="0" />
            </div>
            <div>
              <label>المبلغ المدفوع (ج.م)</label>
              <input type="number" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} required min="0" />
            </div>
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
          </div>
          <div className="form-row">
            <div style={{ flex: 2 }}>
              <label>ملاحظات (مثال: دفع فيزا)</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="اكتب أي ملاحظات هنا..." className="form-control" />
            </div>
          </div>
          <button type="submit">تأكيد الاشتراك</button>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>العضو</th>
              <th>الخطة</th>
              <th>البداية</th>
              <th>النهاية</th>
              <th>المدفوع</th>
              <th>الحالة</th>
              <th style={{ textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s._id}>
                <td>{s.member?.name}</td>
                <td>{s.plan?.name}</td>
                <td>{new Date(s.startDate).toLocaleDateString('ar-EG')}</td>
                <td>{new Date(s.endDate).toLocaleDateString('ar-EG')}</td>
                <td>{s.pricePaid} ج.م</td>
                <td>
                  <span className={'badge ' + (
                    s.status === 'frozen' ? 'badge-warning' :
                    (isExpired(s.endDate) || s.status === 'expired') ? 'badge-danger' : 
                    s.status === 'cancelled' ? 'badge-secondary' : 'badge-success'
                  )}>
                    {s.status === 'frozen' ? 'مجمد ❄️' :
                     s.status === 'cancelled' ? 'ملغي' :
                     (isExpired(s.endDate) || s.status === 'expired') ? 'منتهي' : 'نشط'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {s.status === 'active' && !isExpired(s.endDate) && (
                    <button className="btn-small" onClick={() => handleFreeze(s._id)} style={{ background: '#3b82f6', color: '#fff' }}>
                      ❄️ تجميد
                    </button>
                  )}
                  {s.status === 'frozen' && (
                    <button className="btn-small" onClick={() => handleUnfreeze(s._id)} style={{ background: '#22c55e', color: '#fff' }}>
                      🔥 تشغيل
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>مفيش اشتراكات لسه</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmOpen}
        type="info"
        title="تأكيد تسجيل الاشتراك"
        message={
          <span>
            هل أنت متأكد من تسجيل الاشتراك بقيمة إجمالية <strong className="confirm-highlight">{form.pricePaid} ج.م</strong> ومدفوع <strong className="confirm-highlight">{form.paidAmount} ج.م</strong>؟
          </span>
        }
        confirmText="تأكيد الاشتراك"
        cancelText="إلغاء"
        onConfirm={executeSubscribe}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default Subscriptions;
