'use client';

import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { XMarkIcon, PrinterIcon, ArrowPathIcon, NoSymbolIcon, CheckCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface MemberQRModalProps {
  member: {
    _id: string;
    name: string;
    phone: string;
    isQrActive?: boolean;
  };
  onClose: () => void;
}

const MemberQRModal: React.FC<MemberQRModalProps> = ({ member, onClose }) => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isQrActive, setIsQrActive] = useState<boolean>(member.isQrActive !== false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingWa, setSendingWa] = useState<boolean>(false);
  const [waSuccess, setWaSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waFallbackUrl, setWaFallbackUrl] = useState<string | null>(null);

  // بناء رابط WhatsApp Web مباشر كبديل لما السيرفر ما يشتغلش
  const buildWhatsAppFallback = () => {
    const phone = member.phone?.replace(/\D/g, '') || '';
    // تحويل الأرقام المصرية: 01x → 201x
    const intlPhone = phone.startsWith('0') ? '2' + phone : phone.startsWith('20') ? phone : '20' + phone;
    const memberUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/member/qr/${member._id}`
      : '';
    const message = encodeURIComponent(
      `مرحباً ${member.name} 👋\n\nتم تسجيل اشتراكك في الجيم بنجاح ✅\n\nرابط بطاقة الـ QR الخاصة بك:\n${memberUrl}\n\nاستخدمها عند الدخول للجيم 🏋️`
    );
    return `https://wa.me/${intlPhone}?text=${message}`;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const fetchQr = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/members/${member._id}/qr`);
      setQrCodeData(data.qrCode);
      setIsQrActive(true);
    } catch (err: any) {
      if (err.response && err.response.status === 400 && err.response.data.message.includes('معطل')) {
        setIsQrActive(false);
        setQrCodeData(null);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQr();
    // eslint-disable-next-line
  }, [member._id]);

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      const { data } = await api.post(`/members/${member._id}/qr/regenerate`);
      setQrCodeData(data.qrCode);
      setIsQrActive(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);
      await api.patch(`/members/${member._id}/qr`, { isQrActive: !isQrActive });
      if (!isQrActive) {
        await fetchQr();
      } else {
        setIsQrActive(false);
        setQrCodeData(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      setSendingWa(true);
      setWaSuccess(null);
      setError(null);
      setWaFallbackUrl(null);
      const { data } = await api.post(`/members/${member._id}/send-qr-whatsapp`);
      setWaSuccess(data.message || 'تم إرسال رابط الـ QR بالواتساب بنجاح');
      setTimeout(() => setWaSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'تعذر إرسال الرسالة تلقائياً');
      // عند الفشل: ابني رابط واتساب ويب بديل للإرسال اليدوي
      setWaFallbackUrl(buildWhatsAppFallback());
    } finally {
      setSendingWa(false);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById('qr-print-area')?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'width=420,height=580');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>QR - ${member.name}</title>
            <style>
              body { text-align:center; font-family: 'Tahoma', Arial, sans-serif; padding-top: 30px; background:#fff; }
              h2 { margin-bottom: 4px; font-size: 22px; }
              p { color: #666; font-size: 14px; margin-bottom: 16px; }
              img { border: 2px solid #eee; border-radius: 8px; padding: 8px; max-width: 200px; }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    }
  };

  if (!member) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="qr-modal-close" onClick={onClose}>
          <XMarkIcon style={{ width: 20, height: 20 }} />
        </button>

        <div id="qr-print-area">
          <div className="qr-modal-avatar">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="qr-modal-name">{member.name}</h2>
          <p className="qr-modal-phone">{member.phone}</p>

          <div className="qr-modal-code-wrap">
            {loading ? (
              <p>جاري التحميل...</p>
            ) : !isQrActive ? (
              <p style={{ color: 'red' }}>الـ QR معطل لهذا العضو</p>
            ) : qrCodeData ? (
              <img src={qrCodeData} alt="QR Code" style={{ width: 200, height: 200 }} />
            ) : null}
          </div>
        </div>

        {waSuccess && (
          <div style={{ color: '#22c55e', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', marginTop: '10px', textAlign: 'center' }}>
            ✅ {waSuccess}
          </div>
        )}

        {/* خطأ الواتساب + زرار بديل يفتح واتساب ويب */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 14px', marginTop: '12px', textAlign: 'center' }}>
            <div style={{ color: '#f87171', fontSize: '13px', marginBottom: waFallbackUrl ? '10px' : 0 }}>
              ⚠️ {error}
            </div>
            {waFallbackUrl && (
              <a
                href={waFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #25d366, #128c7e)',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(37,211,102,0.35)',
                  marginTop: '4px',
                }}
              >
                <ChatBubbleLeftRightIcon style={{ width: 17, height: 17 }} />
                ابعت يدوي من واتساب ويب
              </a>
            )}
          </div>
        )}

        <div className="qr-modal-actions" style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-small"
              onClick={handleSendWhatsApp}
              disabled={sendingWa || !isQrActive}
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(34,197,94,0.1))',
                color: '#4ade80',
                border: '1px solid rgba(34,197,94,0.4)',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '7px 14px',
                cursor: sendingWa ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ChatBubbleLeftRightIcon style={{ width: 18, height: 18 }} />
              {sendingWa ? 'جاري الإرسال...' : 'إرسال بالواتساب'}
            </button>
            <button className="btn-small" onClick={handlePrint} disabled={!isQrActive || !qrCodeData}>
              <PrinterIcon style={{ width: 18, height: 18, marginRight: 6 }} /> طباعة
            </button>
            <button className="btn-small" onClick={handleRegenerate} disabled={loading}>
              <ArrowPathIcon style={{ width: 18, height: 18, marginRight: 6 }} /> تجديد
            </button>
            <button className="btn-small btn-danger" onClick={handleToggle} disabled={loading}>
              {isQrActive ? <NoSymbolIcon style={{ width: 18, height: 18, marginRight: 6 }} /> : <CheckCircleIcon style={{ width: 18, height: 18, marginRight: 6 }} />}
              {isQrActive ? 'تعطيل' : 'تفعيل'}
            </button>
          </div>
          <button className="qr-close-btn" onClick={onClose} style={{ marginTop: 10 }}>إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export default MemberQRModal;
