"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../../../lib/axios';

const PublicMemberQR = () => {
  const params = useParams();
  const token = params?.token;
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.get(`/members/public/qr/${token}`)
      .then((res) => {
        setMember(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'كود الـ QR غير صالح أو العضو غير نشط');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#161618',
        color: '#fff',
        fontFamily: 'Cairo, sans-serif'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <p>جاري تحميل البيانات...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#161618',
        color: '#fff',
        fontFamily: 'Cairo, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>خطأ في الوصول</h2>
        <p style={{ color: '#a1a1aa', fontSize: '14px', maxWidth: '300px' }}>{error}</p>
      </div>
    );
  }

  const handleRefresh = () => {
    setLoading(true);
    api.get(`/members/public/qr/${token}`)
      .then((res) => {
        setMember(res.data);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'كود الـ QR غير صالح أو العضو غير نشط');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getStatusBadge = () => {
    const status = member?.membershipStatus;
    if (status === 'Active') {
      return {
        text: 'نشط / Active ✅',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.2)'
      };
    } else if (status === 'Frozen') {
      return {
        text: 'مجمد / Frozen ❄️',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.2)'
      };
    } else {
      return {
        text: 'منتهي / Expired ❌',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      };
    }
  };

  const badge = getStatusBadge();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#161618',
      color: '#fff',
      fontFamily: 'Cairo, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: '#1c1c1e',
        border: '1px solid #2a2a2c',
        borderRadius: '16px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '340px',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <img src="/logo.png" alt="VACUUM GYM" style={{ height: '40px', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>{member.name}</h2>
          
          <div style={{
            display: 'inline-block',
            marginTop: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: badge.color,
            background: badge.bg,
            border: badge.border
          }}>
            {badge.text}
          </div>
        </div>

        <div style={{
          position: 'relative',
          display: 'inline-block',
          padding: '16px',
          background: '#ffffff',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '1px solid #3a3a3c',
          boxShadow: '0 0 20px rgba(255,255,255,0.1)'
        }}>
          {/* Corner highlights */}
          <span style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', borderTop: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', borderRadius: '0 0 0 0' }} />
          <span style={{ position: 'absolute', top: 0, left: 0, width: '18px', height: '18px', borderTop: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', borderRadius: '0 0 0 0' }} />
          <span style={{ position: 'absolute', bottom: 0, right: 0, width: '18px', height: '18px', borderBottom: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', borderRadius: '0 0 0 0' }} />
          <span style={{ position: 'absolute', bottom: 0, left: 0, width: '18px', height: '18px', borderBottom: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', borderRadius: '0 0 0 0' }} />

          <QRCodeCanvas
            value={member.qrToken}
            size={280}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        {/* Token Text */}
        <p style={{
          fontSize: '11px',
          color: '#666',
          letterSpacing: '1.5px',
          fontFamily: 'monospace',
          marginBottom: '16px'
        }}>{member.qrToken}</p>

        {/* Expiry date info */}
        {member.endDate && (
          <div style={{
            fontSize: '13px',
            color: '#a1a1aa',
            marginBottom: '20px'
          }}>
            تاريخ انتهاء الاشتراك:<br />
            <strong style={{ color: '#fff' }}>
              {new Date(member.endDate).toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </strong>
          </div>
        )}

        {/* Refresh button */}
        <button 
          onClick={handleRefresh}
          style={{
            width: '100%',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '700',
            fontFamily: 'Cairo, sans-serif',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          🔄 تحديث الكود / Refresh QR
        </button>

        {/* Info Box */}
        <div style={{
          background: 'rgba(255, 87, 70, 0.05)',
          border: '1px dashed rgba(255, 87, 70, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '13px',
          color: '#ff8c80',
          lineHeight: '1.8',
          textAlign: 'right'
        }}>
          💡 <strong>تعليمات الاستخدام:</strong><br />
          ١- ارفع إضاءة الشاشة لأقصى درجة<br />
          ٢- وجّه الـ QR نحو جهاز السكانر<br />
          ٣- ابعد الموبايل مسافة ١٠-٢٠ سم عن الجهاز
        </div>
      </div>
    </div>
  );
};

export default PublicMemberQR;
