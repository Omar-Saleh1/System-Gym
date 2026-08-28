'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../../../lib/axios';
import { LOGO_BASE64 } from '../../../../lib/logoData';

const PublicMemberQR = () => {
  const params = useParams();
  const token = params?.token;
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMemberQR = () => {
    if (!token) return;
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

  useEffect(() => {
    fetchMemberQR();
  }, [token]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #070709 0%, #150d14 35%, #220b10 70%, #0a080c 100%)',
        color: '#fff',
        fontFamily: 'Cairo, sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255,87,70,0.2)',
          borderTop: '4px solid #ff5746',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>جاري تحميل كود الـ QR...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
        background: 'linear-gradient(135deg, #070709 0%, #150d14 35%, #220b10 70%, #0a080c 100%)',
        color: '#fff',
        fontFamily: 'Cairo, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '24px',
          padding: '36px 28px',
          maxWidth: '360px',
          width: '100%'
        }}>
          <div style={{ fontSize: '54px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#ef4444' }}>الاشتراك غير صالح</h2>
          <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6' }}>{error}</p>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    const status = member?.membershipStatus;
    if (status === 'Active') {
      return {
        text: 'نشط / Active ✅',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.15)',
        border: '1px solid rgba(34, 197, 94, 0.3)'
      };
    } else if (status === 'Frozen') {
      return {
        text: 'مجمد / Frozen ❄️',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.3)'
      };
    } else {
      return {
        text: 'منتهي / Expired ❌',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #070709 0%, #150d14 35%, #220b10 70%, #0a080c 100%)',
      color: '#fff',
      fontFamily: 'Cairo, sans-serif',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Orbs */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,87,70,0.2) 0%, rgba(255,87,70,0) 70%)',
        top: '-80px',
        right: '-80px',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,87,70,0.15) 0%, rgba(255,87,70,0) 70%)',
        bottom: '-60px',
        left: '-60px',
        pointerEvents: 'none'
      }} />

      {/* Main Glassmorphism Card */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(28,28,34,0.92) 0%, rgba(18,18,22,0.95) 100%)',
        border: '1px solid rgba(255, 87, 70, 0.25)',
        borderRadius: '24px',
        padding: '36px 28px',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 30px 90px rgba(0,0,0,0.8), 0 0 50px rgba(255,87,70,0.12)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Logo & Name */}
        <div style={{ marginBottom: '20px' }}>
          <img
            src={LOGO_BASE64}
            alt="VACUUM GYM"
            style={{ height: '52px', margin: '0 auto 12px', display: 'block', filter: 'drop-shadow(0 4px 12px rgba(255,87,70,0.4))' }}
          />
          <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>{member.name}</h2>
          
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '800',
            color: statusInfo.color,
            background: statusInfo.bg,
            border: statusInfo.border
          }}>
            {statusInfo.text}
          </div>
        </div>

        {/* QR Scanner Frame with Laser Line animation */}
        <div style={{
          position: 'relative',
          display: 'inline-block',
          padding: '16px',
          background: '#ffffff',
          borderRadius: '16px',
          marginBottom: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          {/* Laser Scan Line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, #ff5746 50%, transparent 100%)',
            boxShadow: '0 0 10px #ff5746, 0 0 20px #ff5746',
            zIndex: 10,
            animation: 'laserScan 2.2s ease-in-out infinite'
          }} />

          {/* Corner highlights */}
          <span style={{ position: 'absolute', top: 0, right: 0, width: '22px', height: '22px', borderTop: '4px solid #ff5746', borderRight: '4px solid #ff5746', borderRadius: '0 12px 0 0' }} />
          <span style={{ position: 'absolute', top: 0, left: 0, width: '22px', height: '22px', borderTop: '4px solid #ff5746', borderLeft: '4px solid #ff5746', borderRadius: '12px 0 0 0' }} />
          <span style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderBottom: '4px solid #ff5746', borderRight: '4px solid #ff5746', borderRadius: '0 0 12px 0' }} />
          <span style={{ position: 'absolute', bottom: 0, left: 0, width: '22px', height: '22px', borderBottom: '4px solid #ff5746', borderLeft: '4px solid #ff5746', borderRadius: '0 0 0 12px' }} />

          <QRCodeCanvas
            value={member.qrToken}
            size={240}
            level="H"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        {/* Token string */}
        <p style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '1px',
          fontFamily: 'monospace',
          marginBottom: '16px',
          wordBreak: 'break-all'
        }}>
          {member.qrToken}
        </p>

        {/* Subscription Expiry date */}
        {member.endDate && (
          <div style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '20px',
            background: 'rgba(255,255,255,0.03)',
            padding: '10px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            تاريخ انتهاء الاشتراك:<br />
            <strong style={{ color: '#fff', fontSize: '14px' }}>
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
          onClick={fetchMemberQR}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ff5746 0%, #e04b3c 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '13px',
            fontSize: '14px',
            fontWeight: '800',
            fontFamily: 'Cairo, sans-serif',
            cursor: 'pointer',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(255,87,70,0.35)',
            transition: 'all 0.2s'
          }}
        >
          🔄 تحديث الكود / Refresh QR
        </button>

        {/* Usage Instructions Box */}
        <div style={{
          background: 'rgba(255, 87, 70, 0.06)',
          border: '1px dashed rgba(255, 87, 70, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '12px',
          color: '#ffa89e',
          lineHeight: '1.8',
          textAlign: 'right'
        }}>
          💡 <strong>تعليمات الاستخدام:</strong><br />
          ١- ارفع إضاءة الشاشة لأقصى درجة<br />
          ٢- وجّه الـ QR نحو جهاز السكانر<br />
          ٣- ابعد الموبايل مسافة ١٠-٢٠ سم عن الجهاز
        </div>
      </div>

      <style>{`
        @keyframes laserScan {
          0%   { top: 5%; opacity: 0.2; }
          50%  { top: 90%; opacity: 1; }
          100% { top: 5%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default PublicMemberQR;
