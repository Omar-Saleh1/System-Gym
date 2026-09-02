"use client";
import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import MemberQRModal from '../../components/MemberQRModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { name: '', phone: '', email: '', gender: 'male', address: '', notes: '', shiftType: 'GIRLS' };

const Members = () => {
  const { cashier } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [qrMember, setQrMember] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const loadMembers = async (q = '') => {
    const { data } = await api.get('/members', { params: q ? { search: q } : {} });
    setMembers(data);
  };

  useEffect(() => { loadMembers(); }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    loadMembers(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    if (form.name.trim().length < 3) {
      setErrorMessage('الاسم يجب أن يكون مكون من 3 حروف على الأقل');
      return;
    }

    const phoneRegex = /^01[0125]\d{8}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      setErrorMessage('رقم الموبايل غير صحيح. يجب أن يكون رقم مصري مكون من 11 رقم يبدأ بـ 01');
      return;
    }

    if (form.email && form.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        setErrorMessage('البريد الإلكتروني غير صحيح');
        return;
      }
    }

    try {
      if (editingId) {
        await api.put(`/members/${editingId}`, form);
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        loadMembers(search);
      } else {
        const { data } = await api.post('/members', form);
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        loadMembers(search);
        setQrMember(data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleEdit = (m: any) => {
    setForm({
      name: m.name,
      phone: m.phone,
      email: m.email || '',
      gender: m.gender,
      address: m.address || '',
      notes: m.notes || '',
      shiftType: m.shiftType || 'GIRLS',
    });
    setEditingId(m._id);
    setErrorMessage('');
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/members/${deleteTarget.id}`);
    setDeleteTarget(null);
    loadMembers(search);
  };

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setErrorMessage(''); }}>
          {showForm ? 'إلغاء' : '+ عضو جديد'}
        </button>
        <h1>الأعضاء</h1>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          {errorMessage && (
            <div style={{ padding: '12px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', textAlign: 'right', fontWeight: 'bold' }}>
              {errorMessage}
            </div>
          )}
          <div className="form-row">
            <div>
              <label>الاسم</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label>رقم الموبايل</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>الإيميل</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label>النوع</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            {cashier?.role === 'admin' && (
              <div>
                <label>الشفت (Admin Only)</label>
                <select value={form.shiftType} onChange={(e) => setForm({ ...form, shiftType: e.target.value })}>
                  <option value="GIRLS">🌸 شفت البنات (GIRLS)</option>
                  <option value="BOYS">🏋️‍♂️ شفت الشباب (BOYS)</option>
                </select>
              </div>
            )}
          </div>
          <label>العنوان</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <label>ملاحظات</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit">{editingId ? 'حفظ التعديل' : 'إضافة العضو'}</button>
        </form>
      )}

      <div className="search-box">
        <MagnifyingGlassIcon className="search-icon" />
        <input placeholder="ابحث بالاسم أو رقم الموبايل..." value={search} onChange={handleSearch} />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الموبايل</th>
              <th>النوع</th>
              <th>الشفت</th>
              <th>تاريخ الانضمام</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id}>
                <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                <td>
                  {m.shiftType === 'GIRLS' ? (
                    <span className="badge badge-secondary" style={{ color: '#ec4899', borderColor: '#fbcfe8', background: 'rgba(236,72,153,0.1)' }}>🌸 بنات</span>
                  ) : m.shiftType === 'BOYS' ? (
                    <span className="badge badge-secondary" style={{ color: '#3b82f6', borderColor: '#bfdbfe', background: 'rgba(59,130,246,0.1)' }}>🏋️‍♂️ شباب</span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '10px' }}>⚠️ غير محدد</span>
                  )}
                </td>
                <td>{new Date(m.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="btn-3d btn-3d-profile" onClick={() => router.push(`/members/${m._id}/profile`)}>👤 البروفايل</button>
                    <button className="btn-3d btn-3d-qr" onClick={() => setQrMember(m)}>📱 QR</button>
                    <button className="btn-3d btn-3d-edit" onClick={() => handleEdit(m)}>✏️ تعديل</button>
                    <button
                      className="btn-3d btn-3d-delete"
                      onClick={() => setDeleteTarget({ id: m._id, name: m.name })}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>مفيش أعضاء لسه</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {qrMember && <MemberQRModal member={qrMember} onClose={() => setQrMember(null)} />}

      {deleteTarget && (
        <DeleteConfirmModal
          memberName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Members;
