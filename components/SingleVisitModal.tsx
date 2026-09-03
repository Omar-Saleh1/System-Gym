"use client";
import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  PrinterIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  UserIcon,
  PhoneIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface SingleVisitModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newVisit?: any) => void;
  defaultAmount?: number;
}

export default function SingleVisitModal({
  open,
  onClose,
  onSuccess,
  defaultAmount = 50,
}: SingleVisitModalProps) {
  const { cashier } = useAuth();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [sessionName, setSessionName] = useState('حديد');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | string>(defaultAmount);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER'>('CASH');
  const [notes, setNotes] = useState('');
  const [adminShift, setAdminShift] = useState<'GIRLS' | 'BOYS'>('BOYS');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  const quickSessions = ['حديد', 'كارديو', 'كلاسات', 'فتنس', 'زومبا', 'شامل', 'حصة عامة'];

  useEffect(() => {
    if (open) {
      setName('');
      setSessionName('حديد');
      setPhone('');
      setAmount(defaultAmount);
      setPaymentMethod('CASH');
      setNotes('');
      setErrorMsg('');
      setSuccessData(null);
      if (cashier?.role === 'admin') {
        setAdminShift('BOYS');
      }
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open, defaultAmount, cashier]);

  if (!open) return null;

  const currentShift = cashier?.role === 'admin' ? adminShift : (cashier?.shiftType || 'BOYS');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('الاسم مطلوب ويجب أن يكون حرفين على الأقل');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('المبلغ يجب أن يكون رقماً أكبر من صفر');
      return;
    }

    if (phone.trim() !== '') {
      const phoneRegex = /^01[0125]\d{8}$/;
      if (!phoneRegex.test(phone.trim())) {
        setErrorMsg('رقم الموبايل غير صحيح (11 رقم يبدأ بـ 01)');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        sessionName: sessionName.trim() || 'حصة عامة',
        phone: phone.trim(),
        amount: numAmount,
        paymentMethod,
        notes: notes.trim(),
      };

      if (cashier?.role === 'admin') {
        payload.shiftType = adminShift;
      }

      const { data } = await api.post('/single-visits', payload);
      setSuccessData(data.data);
      if (onSuccess) {
        onSuccess(data.data);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء تسجيل الحصة الفردية');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
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
        maxWidth: '480px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        position: 'relative',
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
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <SparklesIcon style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                {successData ? 'إيصال الحصة الفردية 🧾' : 'تسجيل حصة فردية / Day Pass'}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #9ca3af)', marginTop: '2px' }}>
                {successData ? 'تم تسجيل الدخول والدفع بنجاح' : 'دخول سريع بدون اشتراك أو QR كود'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
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

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {errorMsg && (
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
              ⚠️ {errorMsg}
            </div>
          )}

          {!successData ? (
            /* Fast Form */
            <form onSubmit={handleSubmit}>
              {/* Shift Badge & Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: currentShift === 'GIRLS' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${currentShift === 'GIRLS' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`,
                borderRadius: '12px',
                marginBottom: '18px'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted, #9ca3af)' }}>
                  الشفت الحالي:
                </span>
                {cashier?.role === 'admin' ? (
                  <select
                    value={adminShift}
                    onChange={(e) => setAdminShift(e.target.value as any)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-input, #252533)',
                      border: '1px solid var(--border-color, #444)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    <option value="BOYS">🏋️‍♂️ شفت الشباب (BOYS)</option>
                    <option value="GIRLS">🌸 شفت البنات (GIRLS)</option>
                  </select>
                ) : (
                  <span style={{
                    fontWeight: 'bold',
                    fontSize: '13px',
                    color: currentShift === 'GIRLS' ? '#ec4899' : '#3b82f6'
                  }}>
                    {currentShift === 'GIRLS' ? '🌸 شفت البنات' : '🏋️‍♂️ شفت الشباب'}
                  </span>
                )}
              </div>

              {/* Name Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted, #9ca3af)', marginBottom: '6px' }}>
                  <UserIcon style={{ width: '16px' }} />
                  الاسم <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسم اللاعب أو الزائر"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
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

              {/* Session / Class Name Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted, #9ca3af)', marginBottom: '6px' }}>
                  <SparklesIcon style={{ width: '16px' }} />
                  اسم / نوع الحصة
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="مثال: حديد، كارديو، كلاسات، زومبا..."
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
                    marginBottom: '8px'
                  }}
                />
                {/* Quick selection pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {quickSessions.map((qs) => (
                    <button
                      key={qs}
                      type="button"
                      onClick={() => setSessionName(qs)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: sessionName === qs ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                        background: sessionName === qs ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: sessionName === qs ? '#f59e0b' : 'var(--text-muted, #9ca3af)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: sessionName === qs ? 'bold' : 'normal'
                      }}
                    >
                      {qs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted, #9ca3af)', marginBottom: '6px' }}>
                  <PhoneIcon style={{ width: '16px' }} />
                  رقم الموبايل <span style={{ fontSize: '11px', color: 'var(--text-muted, #6b7280)' }}>(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx (اختياري)"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
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

              {/* Amount and Payment Method in one row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted, #9ca3af)', marginBottom: '6px' }}>
                    <CurrencyDollarIcon style={{ width: '16px' }} />
                    المبلغ (ج.م) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-input, #252533)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                      color: '#fff',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted, #9ca3af)', marginBottom: '6px' }}>
                    <BanknotesIcon style={{ width: '16px' }} />
                    طريقة الدفع
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-input, #252533)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="CASH">💵 كاش (Cash)</option>
                    <option value="CARD">💳 بطاقة (Card)</option>
                    <option value="ONLINE">🌐 تحويل / أونلاين</option>
                    <option value="OTHER">أخرى</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'جاري التسجيل...' : '⚡ تأكيد الدفع والتسجيل'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '14px',
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
          ) : (
            /* Receipt / Success View */
            <div>
              <div style={{
                textAlign: 'center',
                padding: '16px 0 20px',
                borderBottom: '1px dashed var(--border-color, rgba(255,255,255,0.15))'
              }}>
                <CheckCircleIcon style={{ width: '56px', height: '56px', color: '#22c55e', margin: '0 auto 8px' }} />
                <h4 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 'bold' }}>
                  تم تسجيل الحصة الفردية بنجاح!
                </h4>
                <div style={{ fontSize: '13px', color: 'var(--text-muted, #9ca3af)', marginTop: '4px' }}>
                  سجلت كعملية دخل وحضور مباشر في شفت {successData.shiftType === 'GIRLS' ? 'البنات' : 'الشباب'}
                </div>
              </div>

              {/* Printable Receipt Card */}
              <div id="single-visit-receipt" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                borderRadius: '14px',
                padding: '18px',
                margin: '18px 0',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted, #9ca3af)' }}>العميل / الزائر:</span>
                  <strong style={{ color: '#fff', fontSize: '14px' }}>{successData.name}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted, #9ca3af)' }}>نوع / اسم الحصة:</span>
                  <strong style={{ color: '#f59e0b', fontSize: '14px' }}>{successData.sessionName || 'حصة عامة'}</strong>
                </div>

                {successData.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted, #9ca3af)' }}>الموبايل:</span>
                    <span style={{ color: '#fff' }}>{successData.phone}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted, #9ca3af)' }}>المبلغ المدفوع:</span>
                  <strong style={{ color: '#22c55e', fontSize: '16px' }}>{successData.amount} ج.م</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted, #9ca3af)' }}>طريقة الدفع:</span>
                  <span style={{ color: '#fff' }}>
                    {successData.paymentMethod === 'CASH' ? 'كاش (Cash)' : successData.paymentMethod === 'CARD' ? 'بطاقة (Card)' : successData.paymentMethod}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted, #9ca3af)' }}>الشفت:</span>
                  <span style={{ color: successData.shiftType === 'GIRLS' ? '#ec4899' : '#3b82f6', fontWeight: 'bold' }}>
                    {successData.shiftType === 'GIRLS' ? '🌸 بنات' : '🏋️‍♂️ شباب'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted, #9ca3af)' }}>التوقيت:</span>
                  <span style={{ color: '#fff' }}>
                    {new Date(successData.visitedAt || successData.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted, #9ca3af)' }}>الكاشير:</span>
                  <span style={{ color: '#fff' }}>
                    {successData.createdBy?.name || cashier?.name || 'الكاشير'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input, #252533)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <PrinterIcon style={{ width: '18px' }} />
                  طباعة الإيصال
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'var(--primary, #3b82f6)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  تم الانتهاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
