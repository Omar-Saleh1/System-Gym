'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import ConfirmModal from '../../components/ConfirmModal';

const Plans = () => {
  const [tab, setTab] = useState('workout');
  const [members, setMembers] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  // Modal State
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

  // Workout state
  const [wForm, setWForm] = useState({ memberId: '', planName: '', goal: '', duration: '', notes: '', days: [{ dayName: '', exercises: [{ name: '', muscleGroup: '', sets: '', reps: '', rest: '' }] }] });
  const [wViewMember, setWViewMember] = useState('');
  const [wPlans, setWPlans] = useState<any[]>([]);

  // Diet state
  const [dForm, setDForm] = useState({ memberId: '', planName: '', goal: '', calories: '', protein: '', carbs: '', fats: '', notes: '', meals: [{ name: '', foods: [{ name: '', quantity: '', unit: '' }] }] });
  const [dViewMember, setDViewMember] = useState('');
  const [dPlans, setDPlans] = useState<any[]>([]);

  useEffect(() => { api.get('/members').then(r => setMembers(r.data.filter((m: any) => m.active))); }, []);

  const showMsg = (m: string) => { setMessage(m); setTimeout(() => setMessage(''), 3000); };
  const statusBadge = (s: string) => s === 'ACTIVE' ? 'badge-success' : s === 'COMPLETED' ? 'badge-warning' : 'badge-danger';

  // ─── Workout ───
  const addDay = () => setWForm({ ...wForm, days: [...wForm.days, { dayName: '', exercises: [{ name: '', muscleGroup: '', sets: '', reps: '', rest: '' }] }] });
  const addExercise = (di: number) => { const days = [...wForm.days]; days[di].exercises.push({ name: '', muscleGroup: '', sets: '', reps: '', rest: '' }); setWForm({ ...wForm, days }); };
  const updateDay = (di: number, field: string, val: string) => { const days: any = [...wForm.days]; days[di][field] = val; setWForm({ ...wForm, days }); };
  const updateExercise = (di: number, ei: number, field: string, val: string) => { const days: any = [...wForm.days]; days[di].exercises[ei][field] = val; setWForm({ ...wForm, days }); };
  const removeDay = (di: number) => { const days = wForm.days.filter((_, i) => i !== di); setWForm({ ...wForm, days: days.length ? days : [{ dayName: '', exercises: [{ name: '', muscleGroup: '', sets: '', reps: '', rest: '' }] }] }); };

  const submitWorkout = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/workout-plans', { memberId: wForm.memberId, planName: wForm.planName, goal: wForm.goal, duration: wForm.duration, days: wForm.days, notes: wForm.notes });
      showMsg('✅ تم إنشاء جدول التمرين');
      setWForm({ memberId: '', planName: '', goal: '', duration: '', notes: '', days: [{ dayName: '', exercises: [{ name: '', muscleGroup: '', sets: '', reps: '', rest: '' }] }] });
      if (wViewMember) loadWorkoutPlans(wViewMember);
    } catch (err: any) { showMsg('❌ ' + (err.response?.data?.message || 'خطأ')); }
  };

  const loadWorkoutPlans = async (mid: string) => {
    setWViewMember(mid);
    if (!mid) { setWPlans([]); return; }
    try { const { data } = await api.get(`/workout-plans/member/${mid}`); setWPlans(data.data || []); } catch { setWPlans([]); }
  };

  const completeWorkout = async (id: string) => {
    await api.post(`/workout-plans/${id}/complete`);
    loadWorkoutPlans(wViewMember);
  };

  const deleteWorkout = (id: string, planName?: string) => {
    setConfirmConfig({
      open: true,
      type: 'danger',
      title: 'تأكيد حذف جدول التمرين',
      message: <span>هل أنت متأكد من حذف جدول التمرين <strong className="confirm-highlight">"{planName || ''}"</strong>؟</span>,
      confirmText: 'نعم، احذف الخطة',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/workout-plans/${id}`);
          loadWorkoutPlans(wViewMember);
        } catch (err: any) {
          showMsg('❌ فشل الحذف');
        }
      },
      onCancel: closeModal,
    });
  };

  // ─── Diet ───
  const addMeal = () => setDForm({ ...dForm, meals: [...dForm.meals, { name: '', foods: [{ name: '', quantity: '', unit: '' }] }] });
  const addFood = (mi: number) => { const meals = [...dForm.meals]; meals[mi].foods.push({ name: '', quantity: '', unit: '' }); setDForm({ ...dForm, meals }); };
  const updateMeal = (mi: number, field: string, val: string) => { const meals: any = [...dForm.meals]; meals[mi][field] = val; setDForm({ ...dForm, meals }); };
  const updateFood = (mi: number, fi: number, field: string, val: string) => { const meals: any = [...dForm.meals]; meals[mi].foods[fi][field] = val; setDForm({ ...dForm, meals }); };
  const removeMeal = (mi: number) => { const meals = dForm.meals.filter((_, i) => i !== mi); setDForm({ ...dForm, meals: meals.length ? meals : [{ name: '', foods: [{ name: '', quantity: '', unit: '' }] }] }); };

  const submitDiet = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/diet-plans', { memberId: dForm.memberId, planName: dForm.planName, goal: dForm.goal, calories: Number(dForm.calories) || undefined, protein: dForm.protein, carbs: dForm.carbs, fats: dForm.fats, meals: dForm.meals, notes: dForm.notes });
      showMsg('✅ تم إنشاء النظام الغذائي');
      setDForm({ memberId: '', planName: '', goal: '', calories: '', protein: '', carbs: '', fats: '', notes: '', meals: [{ name: '', foods: [{ name: '', quantity: '', unit: '' }] }] });
      if (dViewMember) loadDietPlans(dViewMember);
    } catch (err: any) { showMsg('❌ ' + (err.response?.data?.message || 'خطأ')); }
  };

  const loadDietPlans = async (mid: string) => {
    setDViewMember(mid);
    if (!mid) { setDPlans([]); return; }
    try { const { data } = await api.get(`/diet-plans/member/${mid}`); setDPlans(data.data || []); } catch { setDPlans([]); }
  };

  const deleteDiet = (id: string, planName?: string) => {
    setConfirmConfig({
      open: true,
      type: 'danger',
      title: 'تأكيد حذف النظام الغذائي',
      message: <span>هل أنت متأكد من حذف النظام الغذائي <strong className="confirm-highlight">"{planName || ''}"</strong>؟</span>,
      confirmText: 'نعم، احذف الخطة',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        closeModal();
        try {
          await api.delete(`/diet-plans/${id}`);
          loadDietPlans(dViewMember);
        } catch (err: any) {
          showMsg('❌ فشل الحذف');
        }
      },
      onCancel: closeModal,
    });
  };

  const tabStyle = (t: string) => ({
    padding: '10px 24px', cursor: 'pointer', border: 'none', borderRadius: '8px 8px 0 0', fontFamily: 'Cairo, sans-serif', fontWeight: '700', fontSize: '15px',
    background: tab === t ? 'var(--primary)' : 'var(--bg-card)', color: tab === t ? '#fff' : 'var(--text-muted)',
  });

  return (
    <div className="page">
      <div className="page-header">
        <div><div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>جداول التمرين والأنظمة الغذائية</div></div>
        <h1>الخطط التدريبية (Plans)</h1>
      </div>

      {message && <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '4px', marginBottom: 0 }}>
        <button style={tabStyle('workout') as any} onClick={() => setTab('workout')}>💪 جداول التمرين</button>
        <button style={tabStyle('diet') as any} onClick={() => setTab('diet')}>🥗 الأنظمة الغذائية</button>
      </div>

      {/* ─── Workout Tab ─── */}
      {tab === 'workout' && (
        <div>
          <form className="form-card" onSubmit={submitWorkout} style={{ borderTopLeftRadius: 0 }}>
            <h3 style={{ marginBottom: '16px' }}>إنشاء جدول تمرين جديد</h3>
            <div className="form-row">
              <div><label>العضو</label><select value={wForm.memberId} onChange={e => setWForm({ ...wForm, memberId: e.target.value })} required><option value="">اختر عضو</option>{members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}</select></div>
              <div><label>اسم الخطة</label><input value={wForm.planName} onChange={e => setWForm({ ...wForm, planName: e.target.value })} required placeholder="مثال: Fat Loss Program" /></div>
            </div>
            <div className="form-row">
              <div><label>الهدف</label><input value={wForm.goal} onChange={e => setWForm({ ...wForm, goal: e.target.value })} placeholder="مثال: فقدان الدهون" /></div>
              <div><label>المدة</label><input value={wForm.duration} onChange={e => setWForm({ ...wForm, duration: e.target.value })} placeholder="مثال: 12 أسبوع" /></div>
            </div>

            {wForm.days.map((day, di) => (
              <div key={di} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '12px', background: 'var(--bg-input)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <input value={day.dayName} onChange={e => updateDay(di, 'dayName', e.target.value)} placeholder={`اليوم ${di + 1}: مثال Chest + Triceps`} style={{ flex: 1, marginBottom: 0 }} />
                  <button type="button" onClick={() => removeDay(di)} style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', marginRight: '8px', fontSize: '12px' }}>حذف اليوم</button>
                </div>
                {day.exercises.map((ex, ei) => (
                  <div key={ei} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.5fr 0.5fr 0.5fr', gap: '8px', marginBottom: '8px' }}>
                    <input value={ex.name} onChange={e => updateExercise(di, ei, 'name', e.target.value)} placeholder="التمرين" style={{ marginBottom: 0 }} />
                    <input value={ex.muscleGroup} onChange={e => updateExercise(di, ei, 'muscleGroup', e.target.value)} placeholder="العضلة" style={{ marginBottom: 0 }} />
                    <input value={ex.sets} onChange={e => updateExercise(di, ei, 'sets', e.target.value)} placeholder="Sets" style={{ marginBottom: 0 }} />
                    <input value={ex.reps} onChange={e => updateExercise(di, ei, 'reps', e.target.value)} placeholder="Reps" style={{ marginBottom: 0 }} />
                    <input value={ex.rest} onChange={e => updateExercise(di, ei, 'rest', e.target.value)} placeholder="Rest" style={{ marginBottom: 0 }} />
                  </div>
                ))}
                <button type="button" onClick={() => addExercise(di)} style={{ background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>+ إضافة تمرين</button>
              </div>
            ))}
            <button type="button" onClick={addDay} style={{ background: 'transparent', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '12px', width: '100%' }}>+ إضافة يوم جديد</button>
            <label>ملاحظات</label>
            <textarea value={wForm.notes} onChange={e => setWForm({ ...wForm, notes: e.target.value })} />
            <button type="submit">إنشاء جدول التمرين</button>
          </form>

          {/* View Plans */}
          <div className="form-card" style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>عرض خطط عضو</h3>
            <select value={wViewMember} onChange={e => loadWorkoutPlans(e.target.value)}>
              <option value="">اختر عضو</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            {wPlans.length > 0 && (
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>الخطة</th><th>الهدف</th><th>المدة</th><th>الأيام</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {wPlans.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 'bold' }}>{p.planName}</td>
                        <td>{p.goal || '-'}</td>
                        <td>{p.duration || '-'}</td>
                        <td>{p.days?.length || 0} أيام</td>
                        <td><span className={'badge ' + statusBadge(p.status)}>{p.status}</span></td>
                        <td>
                          {p.status === 'ACTIVE' && <button className="btn-small" onClick={() => completeWorkout(p._id)}>إكمال</button>}
                          <button className="btn-small btn-danger" onClick={() => deleteWorkout(p._id, p.planName)} style={{ marginRight: '4px' }}>حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {wViewMember && wPlans.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>لا توجد خطط لهذا العضو</div>}
          </div>
        </div>
      )}

      {/* ─── Diet Tab ─── */}
      {tab === 'diet' && (
        <div>
          <form className="form-card" onSubmit={submitDiet} style={{ borderTopLeftRadius: 0 }}>
            <h3 style={{ marginBottom: '16px' }}>إنشاء نظام غذائي جديد</h3>
            <div className="form-row">
              <div><label>العضو</label><select value={dForm.memberId} onChange={e => setDForm({ ...dForm, memberId: e.target.value })} required><option value="">اختر عضو</option>{members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}</select></div>
              <div><label>اسم الخطة</label><input value={dForm.planName} onChange={e => setDForm({ ...dForm, planName: e.target.value })} required placeholder="مثال: Fat Loss Diet" /></div>
            </div>
            <div className="form-row">
              <div><label>الهدف</label><input value={dForm.goal} onChange={e => setDForm({ ...dForm, goal: e.target.value })} placeholder="فقدان وزن / تضخيم" /></div>
              <div><label>السعرات (Calories)</label><input type="number" value={dForm.calories} onChange={e => setDForm({ ...dForm, calories: e.target.value })} placeholder="2200" /></div>
            </div>
            <div className="form-row">
              <div><label>بروتين</label><input value={dForm.protein} onChange={e => setDForm({ ...dForm, protein: e.target.value })} placeholder="180g" /></div>
              <div><label>كربوهيدرات</label><input value={dForm.carbs} onChange={e => setDForm({ ...dForm, carbs: e.target.value })} placeholder="200g" /></div>
              <div><label>دهون</label><input value={dForm.fats} onChange={e => setDForm({ ...dForm, fats: e.target.value })} placeholder="70g" /></div>
            </div>

            {dForm.meals.map((meal, mi) => (
              <div key={mi} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '12px', background: 'var(--bg-input)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <input value={meal.name} onChange={e => updateMeal(mi, 'name', e.target.value)} placeholder={`الوجبة ${mi + 1}: مثال Breakfast`} style={{ flex: 1, marginBottom: 0 }} />
                  <button type="button" onClick={() => removeMeal(mi)} style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', marginRight: '8px', fontSize: '12px' }}>حذف</button>
                </div>
                {meal.foods.map((food, fi) => (
                  <div key={fi} style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 0.5fr', gap: '8px', marginBottom: '8px' }}>
                    <input value={food.name} onChange={e => updateFood(mi, fi, 'name', e.target.value)} placeholder="اسم الطعام" style={{ marginBottom: 0 }} />
                    <input value={food.quantity} onChange={e => updateFood(mi, fi, 'quantity', e.target.value)} placeholder="الكمية" style={{ marginBottom: 0 }} />
                    <input value={food.unit} onChange={e => updateFood(mi, fi, 'unit', e.target.value)} placeholder="الوحدة (جم/حبة)" style={{ marginBottom: 0 }} />
                  </div>
                ))}
                <button type="button" onClick={() => addFood(mi)} style={{ background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>+ إضافة طعام</button>
              </div>
            ))}
            <button type="button" onClick={addMeal} style={{ background: 'transparent', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '12px', width: '100%' }}>+ إضافة وجبة جديدة</button>
            <label>ملاحظات</label>
            <textarea value={dForm.notes} onChange={e => setDForm({ ...dForm, notes: e.target.value })} />
            <button type="submit">إنشاء النظام الغذائي</button>
          </form>

          {/* View Diet Plans */}
          <div className="form-card" style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>عرض أنظمة عضو</h3>
            <select value={dViewMember} onChange={e => loadDietPlans(e.target.value)}>
              <option value="">اختر عضو</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            {dPlans.length > 0 && (
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>الخطة</th><th>الهدف</th><th>السعرات</th><th>البروتين</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {dPlans.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 'bold' }}>{p.planName}</td>
                        <td>{p.goal || '-'}</td>
                        <td>{p.calories || '-'}</td>
                        <td>{p.protein || '-'}</td>
                        <td><span className={'badge ' + statusBadge(p.status)}>{p.status}</span></td>
                        <td><button className="btn-small btn-danger" onClick={() => deleteDiet(p._id, p.planName)}>حذف</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {dViewMember && dPlans.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>لا توجد أنظمة غذائية لهذا العضو</div>}
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

export default Plans;
