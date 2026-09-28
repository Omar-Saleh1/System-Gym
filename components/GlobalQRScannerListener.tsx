'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../lib/axios';
import { invalidateData } from '../lib/swr';
import { cleanScanCode } from '../lib/qrUtils';
import { CheckCircleIcon, ExclamationCircleIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';

// Web Audio API chimes (instant & offline, no files needed)
const playSound = (type: 'success' | 'warning' | 'error') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      // 2-tone cheerful chime
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);
    } else if (type === 'warning') {
      // Notification tone
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(349.23, now + 0.09); // F4

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      // Error buzz
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(164.81, now + 0.12); // E3

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // AudioContext autoplay restrictions or disabled
  }
};

interface ScanNotification {
  type: 'success' | 'checkout' | 'error';
  title: string;
  subtitle?: string;
  time?: string;
}

export default function GlobalQRScannerListener() {
  const [notification, setNotification] = useState<ScanNotification | null>(null);
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  const lastScanTimestampRef = useRef<number>(0);

  const processScan = useCallback(async (scannedText: string) => {
    const cleanToken = cleanScanCode(scannedText);
    const now = Date.now();
    
    // Ignore empty/short or duplicate scans within 3 seconds
    if (!cleanToken || cleanToken.length < 4 || isProcessingRef.current) return;
    if (now - lastScanTimestampRef.current < 3000) return;

    lastScanTimestampRef.current = now;
    isProcessingRef.current = true;

    try {
      const { data } = await api.post('/attendance/scan', { qrToken: cleanToken });
      
      const memberName = data.member?.name || (typeof data.member === 'string' ? data.member : 'عضو');
      const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const actionType = data.action === 'checkout' || data.type === 'checkout' ? 'checkout' : 'success';

      if (actionType === 'checkout') {
        playSound('warning');
        setNotification({
          type: 'checkout',
          title: `تم تسجيل انصراف: ${memberName}`,
          subtitle: `وقت الانصراف: ${timeStr}`,
          time: timeStr
        });
      } else {
        playSound('success');
        setNotification({
          type: 'success',
          title: `تم تسجيل حضور: ${memberName}`,
          subtitle: `وقت الدخول: ${timeStr}`,
          time: timeStr
        });
      }

      // Refresh attendance lists in real-time
      invalidateData(/^\/attendance/);
    } catch (err: any) {
      playSound('error');
      const msg = err.response?.data?.message || 'كود الـ QR غير صالح أو العضو غير موجود';
      setNotification({
        type: 'error',
        title: msg,
        subtitle: 'يرجى مراجعة حالة الاشتراك أو المحاولة مجدداً'
      });
    } finally {
      isProcessingRef.current = false;
      setTimeout(() => {
        setNotification(null);
      }, 4500);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Ignore standard modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }

      // Barcode scanners send keys very rapidly (< 50ms interval)
      if (timeDiff > 250) {
        // Human pause or new input sequence -> reset buffer
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const buffered = bufferRef.current.trim();
        bufferRef.current = '';
        if (buffered.length >= 6) {
          e.preventDefault();
          processScan(buffered);
        }
        return;
      }

      // Collect printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [processScan]);

  if (!notification) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        minWidth: '340px',
        maxWidth: '480px',
        padding: '14px 20px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        direction: 'rtl',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 30px ' + (
          notification.type === 'success' ? 'rgba(34,197,94,0.3)' :
          notification.type === 'checkout' ? 'rgba(59,130,246,0.3)' :
          'rgba(239,68,68,0.3)'
        ),
        background: 'linear-gradient(135deg, rgba(24,24,30,0.96) 0%, rgba(15,15,20,0.98) 100%)',
        border: '1.5px solid ' + (
          notification.type === 'success' ? 'rgba(34,197,94,0.6)' :
          notification.type === 'checkout' ? 'rgba(59,130,246,0.6)' :
          'rgba(239,68,68,0.6)'
        ),
        backdropFilter: 'blur(16px)',
        animation: 'scanToastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: notification.type === 'success'
            ? 'rgba(34,197,94,0.18)'
            : notification.type === 'checkout'
            ? 'rgba(59,130,246,0.18)'
            : 'rgba(239,68,68,0.18)',
          color: notification.type === 'success' ? '#4ade80' : notification.type === 'checkout' ? '#60a5fa' : '#f87171',
        }}
      >
        {notification.type === 'success' && <CheckCircleIcon style={{ width: '26px', height: '26px' }} />}
        {notification.type === 'checkout' && <ArrowRightEndOnRectangleIcon style={{ width: '26px', height: '26px' }} />}
        {notification.type === 'error' && <ExclamationCircleIcon style={{ width: '26px', height: '26px' }} />}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: notification.type === 'success' ? '#4ade80' : notification.type === 'checkout' ? '#60a5fa' : '#f87171',
            marginBottom: '2px',
          }}
        >
          {notification.title}
        </div>
        {notification.subtitle && (
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{notification.subtitle}</div>
        )}
      </div>

      <style>{`
        @keyframes scanToastSlideDown {
          0% { transform: translate(-50%, -30px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
