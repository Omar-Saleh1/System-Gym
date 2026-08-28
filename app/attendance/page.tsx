'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '../../lib/axios';
import CameraQRScanner from '../../components/CameraQRScanner';

const Attendance = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const [scanValue, setScanValue] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanFocused, setIsScanFocused] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const focusScanInput = () => {
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  };

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [recRes, memRes] = await Promise.all([
        api.get('/attendance', { params: { date: today } }),
        api.get('/members'),
      ]);
      setRecords(recRes.data || []);
      setMembers((memRes.data || []).filter((m: any) => m.active));
    } catch (err) {
      console.error('Failed to load attendance data:', err);
      setRecords([]);
      setMembers([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keep scan input always focused — scanner acts as keyboard
  useEffect(() => {
    focusScanInput();
    // Refocus whenever anything on the page is clicked
    const handleWindowClick = (e: any) => {
      // Don't steal focus from search input or select/button elements
      const tag = e.target.tagName;
      if (tag === 'INPUT' && e.target !== scanInputRef.current) return;
      if (tag === 'SELECT' || tag === 'BUTTON') return;
      focusScanInput();
    };
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const handleManualCheckin = async () => {
    if (!selectedMember) return;
    await api.post('/attendance/checkin', { memberId: selectedMember });
    setMessage('✅ تم تسجيل الحضور');
    setSelectedMember('');
    loadData();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCheckout = async (memberId: string) => {
    await api.put(`/attendance/checkout/${memberId}`);
    loadData();
  };

  // بيتنادى تلقائي لما جهاز السكانر "يكتب" الكود ويعمل Enter
  const handleScanSubmit = async (e: any) => {
    e.preventDefault();
    const code = scanValue.trim();
    setScanValue('');
    if (!code) return;

    try {
      const { data } = await api.post('/attendance/scan', { qrToken: code });
      setScanResult({
        type: 'checkin',
        text: `✅ ${data.member?.name || data.member}\nChecked In Successfully\n${new Date(data.attendance?.checkIn || new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      });
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || '❌ Invalid QR Code';
      if (msg.includes('⚠️') || msg.includes('Already Checked In') || msg.includes('مسجل')) {
        setScanResult({ type: 'checkout', text: msg });
      } else {
        setScanResult({ type: 'error', text: msg });
      }
    }
    setTimeout(() => setScanResult(null), 5000);
  };

  const handleCameraScan = async (decodedText: string) => {
    setShowCamera(false);
    const code = decodedText.trim();
    if (!code) return;
    try {
      const { data } = await api.post('/attendance/scan', { qrToken: code });
      setScanResult({
        type: 'checkin',
        text: `✅ ${data.member.name}\nChecked In Successfully\n${new Date(data.member.checkInTime || new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      });
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || '❌ Invalid QR Code';
      setScanResult({ type: msg.includes('⚠️') ? 'checkout' : 'error', text: msg });
    }
    setTimeout(() => setScanResult(null), 5000);
  };

  const filteredRecords = records.filter(r =>
    r.member?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page">
      {showCamera && (
        <CameraQRScanner
          onScan={handleCameraScan}
          onClose={() => setShowCamera(false)}
        />
      )}
      <div className="page-header">
        <div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>قم بمسح رمز الاستجابة السريعة (QR Code) لتسجيل الحضور.</div>
        </div>
        <h1>الحضور والانصراف (Attendance)</h1>
      </div>

      {/* Stats row */}
      <div className="cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value">{records.length}</div>
          <div className="stat-label">إجمالي حضور اليوم (Today's Check-ins)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>
            {records.filter(r => r.member?.membershipStatus === 'Active').length}
          </div>
          <div className="stat-label">أعضاء نشطين حاضرين (Active Members)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {records.filter(r => r.member && r.member.membershipStatus !== 'Active').length}
          </div>
          <div className="stat-label">عضويات منتهية/أخرى (Expired/Other Members)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        {/* Attendance Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold' }}>سجل الحضور اليوم</span>
            <input 
              type="text" 
              placeholder="🔍 ابحث بالاسم في حضور اليوم..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '250px', marginBottom: 0, padding: '8px 12px' }}
            />
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>العضو</th>
                  <th>حالة العضوية</th>
                  <th>وقت الدخول</th>
                  <th>وقت الخروج</th>
                  <th style={{ textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 'bold' }}>{r.member?.name || 'عضو محذوف'}</td>
                    <td>
                      <span className={'badge ' + (
                        r.member?.membershipStatus === 'Active' ? 'badge-success' :
                        r.member?.membershipStatus === 'Frozen' ? 'badge-warning' : 'badge-danger'
                      )}>
                        {r.member?.membershipStatus === 'Active' ? 'نشط / Active' :
                         r.member?.membershipStatus === 'Frozen' ? 'مجمد / Frozen' : 'منتهي / Expired'}
                      </span>
                    </td>
                    <td>{formatTime(r.checkInTime)}</td>
                    <td>{formatTime(r.checkOutTime)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {!r.checkOutTime && r.member && (
                        <button className="btn-small" onClick={() => handleCheckout(r.member._id)}>تسجيل انصراف</button>
                      )}
                      {r.checkOutTime && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>مكتمل</span>}
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      {searchQuery ? 'لا توجد نتائج بحث مطابقة' : 'لا يوجد حضور مسجل اليوم بعد'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Scanner */}
        <div>
          <div className="scan-box" style={{ marginBottom: '20px' }}>

            {/* Camera button */}
            <button
              onClick={() => setShowCamera(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                fontFamily: 'Cairo, sans-serif',
                cursor: 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              📷 سكان QR بالكاميرا (موبايل / لاب)
            </button>
            {/* Focus status indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              fontSize: '13px',
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isScanFocused ? '#22c55e' : '#ef4444',
                display: 'inline-block',
                boxShadow: isScanFocused ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
              }} />
              <span style={{ color: isScanFocused ? '#22c55e' : '#ef4444' }}>
                {isScanFocused ? '🟢 جاهز للسكان — سكن الـ QR الآن' : '🔴 اضغط هنا أولاً لتفعيل السكان'}
              </span>
            </div>

            <div
              onClick={focusScanInput}
              style={{
                border: `2px solid ${isScanFocused ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: '4px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: isScanFocused ? 'rgba(255,87,70,0.05)' : 'rgba(0,0,0,0.3)',
                marginBottom: '16px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {/* QR corner frames */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', borderTop: '3px solid var(--primary)', borderRight: '3px solid var(--primary)' }} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '30px', height: '30px', borderTop: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '30px', height: '30px', borderBottom: '3px solid var(--primary)', borderRight: '3px solid var(--primary)' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '30px', height: '30px', borderBottom: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)' }} />
              <form onSubmit={handleScanSubmit}>
                <input
                  ref={scanInputRef}
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  onFocus={() => setIsScanFocused(true)}
                  onBlur={() => setIsScanFocused(false)}
                  placeholder={isScanFocused ? '⚡ جاهز... سكن الـ QR' : 'اضغط هنا أولاً'}
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'center',
                    width: '220px',
                    fontSize: '14px',
                    color: 'var(--primary)',
                    marginBottom: 0,
                    outline: 'none',
                  }}
                />
              </form>
              {!isScanFocused && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  👆 اضغط على هذه المنطقة لتفعيل السكان
                </div>
              )}
            </div>
            {scanResult && <div className={`scan-result ${scanResult.type}`}>{scanResult.text}</div>}
          </div>

          {/* Manual check-in */}
          <div className="form-card">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'right' }}>أو اختر العضو يدوياً</div>
            <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
              <option value="">اختر عضو</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name} - {m.phone}</option>)}
            </select>
            <button onClick={handleManualCheckin} style={{ width: '100%' }}>تسجيل حضور</button>
            {message && <div className="message" style={{ marginTop: '12px' }}>{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
