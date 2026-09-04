"use client";
import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import MemberQRModal from '../../components/MemberQRModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import SingleVisitModal from '../../components/SingleVisitModal';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  UserPlusIcon, 
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TrashIcon,
  PencilSquareIcon,
  QrCodeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { name: '', phone: '', email: '', gender: 'male', address: '', notes: '', shiftType: 'GIRLS' };

const Members = () => {
  const { cashier } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSingleVisitModal, setShowSingleVisitModal] = useState(false);
  const [qrMember, setQrMember] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const loadMembers = async (q = '') => {
    const { data } = await api.get('/members', { params: { search: q } });
    setMembers(data);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    loadMembers(e.target.value);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      shiftType: cashier?.role === 'admin' ? 'BOYS' : (cashier?.shiftType || 'BOYS'),
    });
    setErrorMessage('');
    setShowMemberModal(true);
  };

  const handleCloseModal = () => {
    setShowMemberModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.name || form.name.trim().length < 2) {
      setErrorMessage('الاسم مطلوب ويجب أن يكون حرفين على الأقل');
      return;
    }

    const phoneRegex = /^01[0125]\d{8}$/;
    if (!form.phone || !phoneRegex.test(form.phone.trim())) {
      setErrorMessage('رقم الموبايل غير صحيح (11 رقم يبدأ بـ 01)');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/members/${editingId}`, form);
      } else {
        await api.post('/members', form);
      }
      handleCloseModal();
      loadMembers(search);
    } catch (err: any) {
      const msg = err.response?.data?.message || (editingId ? 'حدث خطأ أثناء تعديل العضو' : 'حدث خطأ أثناء إضافة العضو');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
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
    setShowMemberModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/members/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadMembers(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل حذف العضو');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowSingleVisitModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              padding: '10px 18px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <SparklesIcon style={{ width: '18px', height: '18px' }} />
            ⚡ + حصة فردية (Single Visit)
          </button>
          <button 
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold'
            }}
          >
            <UserPlusIcon style={{ width: '18px', height: '18px' }} />
            + عضو جديد
          </button>
        </div>
        <h1>الأعضاء</h1>
      </div>

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
                    <button className="btn-3d btn-3d-profile" onClick={() => router.push(`/members/${m._id}/profile`)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <IdentificationIcon style={{ width: '14px', height: '14px' }} /> البروفايل
                    </button>
                    <button className="btn-3d btn-3d-qr" onClick={() => setQrMember(m)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <QrCodeIcon style={{ width: '14px', height: '14px' }} /> QR
                    </button>
                    <button className="btn-3d btn-3d-edit" onClick={() => handleEdit(m)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <PencilSquareIcon style={{ width: '14px', height: '14px' }} /> تعديل
                    </button>
                    <button
                      className="btn-3d btn-3d-delete"
                      onClick={() => setDeleteTarget({ id: m._id, name: m.name })}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <TrashIcon style={{ width: '14px', height: '14px' }} /> حذف
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

      {/* ─── Member Add/Edit Popup Modal ─── */}
      {showMemberModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          direction: 'rtl'
        }}>
          <div style={{
            background: 'var(--bg-card, #1a1a24)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: editingId ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  {editingId ? <UserIcon style={{ width: '22px', height: '22px' }} /> : <UserPlusIcon style={{ width: '22px', height: '22px' }} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                    {editingId ? 'تعديل بيانات العضو ✏️' : 'إضافة عضو جديد 👤'}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted, #9ca3af)', marginTop: '2px' }}>
                    {editingId ? 'تحديث البيانات الأساسية للعضو' : 'تسجيل عضو جديد بالنظام وإصدار QR كود'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #9ca3af)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px'
                }}
              >
                <XMarkIcon style={{ width: '22px', height: '22px' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {errorMessage && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textAlign: 'right'
                }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <UserIcon style={{ width: '16px' }} />
                    الاسم <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="اسم العضو ثلاثي"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-input, #252533)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <PhoneIcon style={{ width: '16px' }} />
                    رقم الموبايل <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-input, #252533)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: cashier?.role === 'admin' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <EnvelopeIcon style={{ width: '16px' }} />
                    الإيميل <span style={{ fontSize: '11px', color: '#6b7280' }}>(اختياري)</span>
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@gmail.com"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-input, #252533)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>النوع</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-input, #252533)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                {cashier?.role === 'admin' && (
                  <div>
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>الشفت (Admin)</label>
                    <select
                      value={form.shiftType}
                      onChange={(e) => setForm({ ...form, shiftType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-input, #252533)',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="BOYS">🏋️‍♂️ شباب (BOYS)</option>
                      <option value="GIRLS">🌸 بنات (GIRLS)</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <MapPinIcon style={{ width: '16px' }} />
                  العنوان <span style={{ fontSize: '11px', color: '#6b7280' }}>(اختياري)</span>
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="العنوان أو المنطقة"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-input, #252533)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  ملاحظات <span style={{ fontSize: '11px', color: '#6b7280' }}>(اختياري)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="أي ملاحظات صحية أو إضافية عن العضو..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-input, #252533)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '12px',
                    background: editingId ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'جاري الحفظ...' : (editingId ? '💾 حفظ التعديل' : '➕ إضافة العضو')}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-input, #252533)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                    color: 'var(--text-muted, #9ca3af)',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrMember && <MemberQRModal member={qrMember} onClose={() => setQrMember(null)} />}

      {deleteTarget && (
        <DeleteConfirmModal
          memberName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <SingleVisitModal
        open={showSingleVisitModal}
        onClose={() => setShowSingleVisitModal(false)}
      />
    </div>
  );
};

export default Members;
